import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, BackHandler, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VideoCore from './VideoCore';
import ControlsOverlay from './ControlsOverlay';
import SettingsModal from './SettingsModal';
import { enterFullscreen, exitFullscreen } from './FullscreenHandler';
import { StreamSource, StreamTrack } from '../../services/api';

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

    // Local tracks state to merge API tracks and detected tracks
    const [localTracks, setLocalTracks] = useState<StreamTrack[]>(tracks || []);

    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSaveTimeRef = useRef<number>(0);
    const initialSeekDoneRef = useRef(false);

    useEffect(() => {
        if (!pipEnabled) {
            enterFullscreen();
            setIsFullscreen(true);
        }
        return () => {
            exitFullscreen();
        };
    }, [pipEnabled]);

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
            // Try to find the source matching the initial videoUrl, or default to the first one/auto
            const match = sources.find(s => s.file === videoUrl);
            setSelectedSource(match || sources[0]);
        }
        // Initialize local tracks from props
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
                        // We'll seek when onLoad fires or if player is ready
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

        console.log('Video Loaded. Data:', JSON.stringify({
            duration: data.duration,
            audioTracks: data.audioTracks,
            textTracks: data.textTracks
        }, null, 2));

        // Merge detected tracks with API tracks
        let newTracks: StreamTrack[] = [...(tracks || [])];

        // Process Audio Tracks
        if (data.audioTracks && Array.isArray(data.audioTracks)) {
            const detectedAudio = data.audioTracks.map((track: any, index: number) => ({
                file: track.uri || `audio_${index}`, // URI might be empty for embedded tracks
                label: track.title || track.language || `Audio ${index + 1}`,
                kind: 'audio',
                default: track.selected
            }));

            // Avoid duplicates if API already provided them (simple check by label)
            detectedAudio.forEach((dt: StreamTrack) => {
                if (!newTracks.some(t => t.kind === 'audio' && t.label === dt.label)) {
                    newTracks.push(dt);
                }
            });
        }

        // Process Text Tracks
        if (data.textTracks && Array.isArray(data.textTracks)) {
            const detectedSubs = data.textTracks.map((track: any, index: number) => ({
                file: track.uri || `sub_${index}`,
                label: track.title || track.language || `Subtitle ${index + 1}`,
                kind: 'subtitles', // or captions
                default: track.selected
            }));

            detectedSubs.forEach((dt: StreamTrack) => {
                if (!newTracks.some(t => t.kind !== 'audio' && t.label === dt.label)) {
                    newTracks.push(dt);
                }
            });
        }

        // Update state if we found new tracks
        if (newTracks.length > 0) {
            console.log('Updated tracks from stream:', newTracks);
            setLocalTracks(newTracks);
        }

        // Resume playback
        if (!initialSeekDoneRef.current) {
            try {
                const savedTime = await AsyncStorage.getItem(`progress_${videoUrl}`);
                if (savedTime) {
                    const time = parseFloat(savedTime);
                    // Only resume if not near the end (e.g., > 95%)
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

        // Save progress every 5 seconds
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
            saveProgress(time); // Save on seek
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

    const handleScreenTap = () => {
        if (settingsVisible) {
            setSettingsVisible(false);
            return;
        }
        if (controlsVisible) {
            setControlsVisible(false);
        } else {
            resetControlsTimeout();
        }
    };

    const handlePiP = () => {
        setPipEnabled(!pipEnabled);
    };

    const handlePiPStatusChanged = (isActive: boolean) => {
        setPipEnabled(isActive);
    };

    // Settings Handlers
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

    // Map tracks for react-native-video
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
        <View style={styles.container} onTouchEnd={handleScreenTap}>
            <StatusBar hidden={!pipEnabled} />
            <VideoCore
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
                onError={(e: any) => console.log('Video Error:', e)}
                onBuffer={(e: any) => setLoading(e.isBuffering)}
                textTracks={textTracks}
                selectedTextTrack={selectedTextTrackProp}
                selectedAudioTrack={selectedAudioTrackProp}
                pictureInPicture={pipEnabled}
                onPictureInPictureStatusChanged={(data: any) => handlePiPStatusChanged(data.isActive)}
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
                />
            )}

            <SettingsModal
                visible={settingsVisible}
                onClose={() => {
                    setSettingsVisible(false);
                    setControlsVisible(true);
                }}
                sources={sources}
                tracks={localTracks} // Use localTracks here
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
});

export default VideoPlayer;
