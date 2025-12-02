import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, BackHandler, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VideoCore from './VideoCore';
import ControlsOverlay from './ControlsOverlay';
import SettingsModal from './SettingsModal';
import { enterFullscreen, exitFullscreen } from './FullscreenHandler';
import { StreamSource, StreamTrack, addToHistory } from '../../services/api';
import PlayerGestures from './PlayerGestures';

interface VideoPlayerProps {
    videoUrl: string;
    title: string;
    cookies: string;
    referer?: string;
    sources?: StreamSource[];
    tracks?: StreamTrack[];
    onClose: () => void;
    onNextEpisode?: () => void;
    movieId?: string;
    poster?: string;
    provider?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
    const { videoUrl, title, cookies, referer, sources, tracks, onClose, onNextEpisode } = props;

    console.log('VideoPlayer mounted with:', {
        videoUrl,
        referer,
        sourcesCount: sources?.length,
        firstSource: sources?.[0]
    });

    const videoRef = useRef<any>(null);

    // Player State
    const [paused, setPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [resizeMode, setResizeMode] = useState<'contain' | 'cover' | 'stretch'>('contain');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);

    // Settings State
    const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
    const [selectedSource, setSelectedSource] = useState<StreamSource | undefined>(undefined);
    const [selectedTextTrack, setSelectedTextTrack] = useState<StreamTrack | null>(null);
    const [selectedAudioTrack, setSelectedAudioTrack] = useState<StreamTrack | null>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [pipEnabled, setPipEnabled] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [brightness, setBrightness] = useState(1.0);

    // Local tracks state to merge API tracks and detected tracks
    const [localTracks, setLocalTracks] = useState<StreamTrack[]>(tracks || []);

    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSaveTimeRef = useRef<number>(0);
    const initialSeekDoneRef = useRef(false);
    const currentTimeRef = useRef<number>(0); // Track current time without state delay

    useEffect(() => {
        if (!pipEnabled) {
            // Only enter fullscreen if NOT in PiP mode
            enterFullscreen();
            setIsFullscreen(true);
        }

        // Cleanup: exit fullscreen when component unmounts
        return () => {
            exitFullscreen();
        };
    }, []); // Run only once on mount

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (settingsVisible) {
                setSettingsVisible(false);
                return true;
            }
            if (pipEnabled) {
                setPipEnabled(false);
                return true;
            }
            onClose();
            return true;
        });

        return () => {
            backHandler.remove();
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [onClose, settingsVisible, pipEnabled]);

    // Initialize selected source if sources are available
    useEffect(() => {
        if (sources && sources.length > 0) {
            const match = sources.find(s => s.file === videoUrl);
            setSelectedSource(match || sources[0]);
        }
        if (tracks) {
            setLocalTracks(tracks);
        }
    }, [sources, videoUrl, tracks]);

    // Resume Playback Logic
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedTime = await AsyncStorage.getItem(`progress_${videoUrl}`);
                if (savedTime && videoRef.current) {
                    const time = parseFloat(savedTime);
                    if (time > 0) {
                        console.log('Resuming from:', time);
                    }
                }
            } catch (error) {
                console.error('Failed to load progress', error);
            }
        };
        loadProgress();
    }, [videoUrl]);

    const saveProgress = async (time: number) => {
        try {
            await AsyncStorage.setItem(`progress_${videoUrl}`, time.toString());
        } catch (error) {
            console.error('Failed to save progress', error);
        }
    };

    const resetControlsTimeout = useCallback(() => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        // Don't force visibility - let caller decide
        if (!paused && !settingsVisible) {
            controlsTimeoutRef.current = setTimeout(() => {
                setControlsVisible(false);
            }, 4000);
        }
    }, [paused, settingsVisible]);

    useEffect(() => {
        resetControlsTimeout();
    }, [resetControlsTimeout]);

    const handleLoad = async (data: any) => {
        setDuration(data.duration);
        setLoading(false);
        resetControlsTimeout();

        let newTracks: StreamTrack[] = [...(tracks || [])];

        if (data.audioTracks && Array.isArray(data.audioTracks)) {
            const detectedAudio = data.audioTracks.map((track: any, index: number) => ({
                file: track.uri || `audio_${index}`,
                label: track.title || track.language || `Audio ${index + 1}`,
                kind: 'audio',
                default: track.selected
            }));

            detectedAudio.forEach((dt: StreamTrack) => {
                if (!newTracks.some(t => t.kind === 'audio' && t.label === dt.label)) {
                    newTracks.push(dt);
                }
            });
        }

        if (data.textTracks && Array.isArray(data.textTracks)) {
            const detectedSubs = data.textTracks.map((track: any, index: number) => ({
                file: track.uri || `sub_${index}`,
                label: track.title || track.language || `Subtitle ${index + 1}`,
                kind: 'subtitles',
                default: track.selected
            }));

            detectedSubs.forEach((dt: StreamTrack) => {
                if (!newTracks.some(t => t.kind !== 'audio' && t.label === dt.label)) {
                    newTracks.push(dt);
                }
            });
        }

        if (newTracks.length > 0) {
            setLocalTracks(newTracks);
        }

        if (!initialSeekDoneRef.current) {
            try {
                const savedTime = await AsyncStorage.getItem(`progress_${videoUrl}`);
                if (savedTime) {
                    const time = parseFloat(savedTime);
                    if (time < data.duration * 0.95) {
                        videoRef.current?.seek(time);
                    }
                }
            } catch (e) {
                console.log('Error resuming:', e);
            }
            initialSeekDoneRef.current = true;
        }
    };

    const handleProgress = (data: any) => {
        const time = data.currentTime;
        currentTimeRef.current = time; // Update ref immediately
        setCurrentTime(time);
        const now = Date.now();
        if (now - lastSaveTimeRef.current > 5000) {
            saveProgress(time);

            // Save to global history
            if (props.movieId && props.poster) {
                addToHistory({
                    id: props.movieId,
                    title: title,
                    imageUrl: props.poster,
                    progress: time,
                    duration: duration,
                    timestamp: now,
                    provider: props.provider || 'Netflix'
                });
            }

            lastSaveTimeRef.current = now;
        }
    };

    const handlePlayPause = () => {
        setPaused(!paused);
        resetControlsTimeout();
    };

    const handleSeek = useCallback((time: number) => {
        if (videoRef.current) {
            videoRef.current.seek(time);
            currentTimeRef.current = time; // Update ref immediately
            setCurrentTime(time);
            resetControlsTimeout();
            saveProgress(time);
        }
    }, [resetControlsTimeout, videoUrl]);

    const handleSkipForward = useCallback(() => {
        const current = currentTimeRef.current;
        handleSeek(Math.min(current + 10, duration));
    }, [duration, handleSeek]);

    const handleSkipBackward = useCallback(() => {
        const current = currentTimeRef.current;
        handleSeek(Math.max(current - 10, 0));
    }, [handleSeek]);

    const handleToggleResizeMode = () => {
        const modes: ('contain' | 'cover' | 'stretch')[] = ['contain', 'cover', 'stretch'];
        const nextIndex = (modes.indexOf(resizeMode) + 1) % modes.length;
        setResizeMode(modes[nextIndex]);
        resetControlsTimeout();
    };

    const handleToggleFullscreen = () => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

    const handlePiP = () => {
        setPipEnabled(!pipEnabled);
    };

    const handlePiPStatusChanged = (isActive: boolean) => {
        setPipEnabled(isActive);
    };

    const handleSelectSource = (source: StreamSource) => {
        setSelectedSource(source);
        setCurrentVideoUrl(source.file);
    };

    const handleSelectTextTrack = (track: StreamTrack | null) => {
        setSelectedTextTrack(track);
    };

    const handleSelectAudioTrack = (track: StreamTrack | null) => {
        setSelectedAudioTrack(track);
    };

    const handleSelectSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
    };

    const handleSingleTap = useCallback(() => {
        if (settingsVisible) {
            setSettingsVisible(false);
            return;
        }
        // Toggle and only reset timeout if showing controls
        setControlsVisible(prev => {
            const newValue = !prev;
            if (newValue) {
                // Only start auto-hide if showing controls
                setTimeout(() => resetControlsTimeout(), 0);
            }
            return newValue;
        });
    }, [settingsVisible, resetControlsTimeout]);

    const handleDoubleTapLeft = useCallback(() => {
        handleSkipBackward();
    }, [handleSkipBackward]);

    const handleDoubleTapRight = useCallback(() => {
        handleSkipForward();
    }, [handleSkipForward]);

    const handleVolumeGesture = useCallback((delta: number) => {
        setVolume(prev => Math.max(0, Math.min(1, prev + delta)));
    }, []);

    const handleBrightnessGesture = useCallback((delta: number) => {
        setBrightness(prev => Math.max(0, Math.min(1, prev + delta)));
    }, []);

    const textTracks = localTracks?.filter(t => t.kind !== 'audio').map(track => {
        let type = 'text/vtt'; // Default
        if (track.file.endsWith('.srt')) {
            type = 'application/x-subrip';
        } else if (track.file.endsWith('.ttml')) {
            type = 'application/ttml+xml';
        } else if (track.kind === 'captions') {
            type = 'application/x-subrip'; // Fallback for captions if no extension match
        }

        return {
            title: track.label || 'Unknown',
            language: (track.label || 'en').substring(0, 2).toLowerCase(),
            type: type,
            uri: track.file
        };
    });

    const selectedTextTrackProp = selectedTextTrack ? {
        type: 'title',
        value: selectedTextTrack.label || 'Unknown'
    } : {
        type: 'disabled',
        value: ''
    };

    const selectedAudioTrackProp = selectedAudioTrack ? {
        type: 'title',
        value: selectedAudioTrack.label || 'Unknown'
    } : undefined;

    return (
        <View style={styles.container}>
            <StatusBar hidden={!pipEnabled} />

            <VideoCore
                key={currentVideoUrl}
                ref={videoRef}
                videoUrl={currentVideoUrl}
                cookies={cookies}
                referer={referer}
                paused={paused}
                resizeMode={resizeMode}
                rate={playbackSpeed}
                onLoad={handleLoad}
                onProgress={handleProgress}
                onEnd={onClose}
                onError={(e: any) => {
                    console.log('Video Error:', JSON.stringify(e, null, 2));
                    setLoading(false); // Ensure loading is cleared on error
                }}
                onBuffer={(e: any) => setLoading(e.isBuffering)}
                textTracks={textTracks}
                selectedTextTrack={selectedTextTrackProp}
                selectedAudioTrack={selectedAudioTrackProp}
                pictureInPicture={pipEnabled}
                onPictureInPictureStatusChanged={(data: any) => handlePiPStatusChanged(data.isActive)}
                volume={volume}
            />

            <PlayerGestures
                style={StyleSheet.absoluteFill}
                onSingleTap={handleSingleTap}
                onDoubleTapLeft={handleDoubleTapLeft}
                onDoubleTapRight={handleDoubleTapRight}
                onVolumeChange={handleVolumeGesture}
                onBrightnessChange={handleBrightnessGesture}
                volume={volume}
                brightness={brightness}
            />

            {/* Brightness Overlay */}
            <View
                style={[
                    styles.brightnessOverlay,
                    { opacity: 1 - brightness }
                ]}
                pointerEvents="none"
            />

            {!pipEnabled && (
                <ControlsOverlay
                    visible={controlsVisible && !settingsVisible}
                    paused={paused}
                    loading={loading}
                    title={title}
                    currentTime={currentTime}
                    duration={duration}
                    onPlayPause={handlePlayPause}
                    onSkipForward={handleSkipForward}
                    onSkipBackward={handleSkipBackward}
                    onSeek={handleSeek}
                    onClose={onClose}
                    onSettings={() => {
                        setSettingsVisible(true);
                        setControlsVisible(false);
                    }}
                    onToggleFullscreen={handleToggleFullscreen}
                    isFullscreen={isFullscreen}
                    onToggleResizeMode={handleToggleResizeMode}
                    resizeMode={resizeMode}
                    onNextEpisode={onNextEpisode}
                    onPiP={handlePiP}
                    volume={volume}
                    brightness={brightness}
                    onVolumeChange={handleVolumeGesture}
                    onBrightnessChange={handleBrightnessGesture}
                />
            )}

            <SettingsModal
                visible={settingsVisible}
                onClose={() => {
                    setSettingsVisible(false);
                    setControlsVisible(true);
                }}
                sources={sources}
                tracks={localTracks}
                selectedSource={selectedSource}
                selectedTextTrack={selectedTextTrack}
                selectedAudioTrack={selectedAudioTrack}
                playbackSpeed={playbackSpeed}
                onSelectSource={handleSelectSource}
                onSelectTextTrack={handleSelectTextTrack}
                onSelectAudioTrack={handleSelectAudioTrack}
                onSelectSpeed={handleSelectSpeed}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    brightnessOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 900, // Below controls (1000) but above video
        elevation: 900,
    }
});

export default VideoPlayer;
