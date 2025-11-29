import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, BackHandler, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VideoCore from './VideoCore';
import ControlsOverlay from './ControlsOverlay';
import SettingsModal from './SettingsModal';
import { enterFullscreen, exitFullscreen } from './FullscreenHandler';
import { StreamSource, StreamTrack } from '../../services/api';
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
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, cookies, referer, sources, tracks, onClose, onNextEpisode }) => {
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

    useEffect(() => {
        if (!pipEnabled) {
            // Only enter fullscreen if NOT in PiP mode
            enterFullscreen();
            setIsFullscreen(true);
        }
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
        setControlsVisible(true);
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
        setCurrentTime(data.currentTime);
        const now = Date.now();
        if (now - lastSaveTimeRef.current > 5000) {
            saveProgress(data.currentTime);
            lastSaveTimeRef.current = now;
        }
    };

    const handlePlayPause = () => {
        setPaused(!paused);
        resetControlsTimeout();
    };

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.seek(time);
            setCurrentTime(time);
            resetControlsTimeout();
            saveProgress(time);
        }
    };

    const handleSkipForward = () => {
        handleSeek(Math.min(currentTime + 10, duration));
    };

    const handleSkipBackward = () => {
        handleSeek(Math.max(currentTime - 10, 0));
    };

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
        setControlsVisible(!controlsVisible);
        resetControlsTimeout();
    }, [settingsVisible, controlsVisible, resetControlsTimeout]);

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

    const textTracks = localTracks?.filter(t => t.kind !== 'audio').map(track => ({
        title: track.label || 'Unknown',
        language: (track.label || 'en').substring(0, 2).toLowerCase(),
        type: track.kind === 'captions' ? 'application/x-subrip' : 'text/vtt',
        uri: track.file
    }));

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
                    console.log('Video Error:', e);
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
