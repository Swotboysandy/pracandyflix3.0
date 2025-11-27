import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoRef, SelectedTrackType, SelectedVideoTrackType } from 'react-native-video';

import VideoCore from './VideoCore';
import ControlsOverlay from './ControlsOverlay';
import PlayerGestureHandler from './GestureHandler';
import SettingsModal from './SettingsModal';
import { setupOrientationListeners, enterFullscreen, exitFullscreen, toggleFullscreen } from './FullscreenHandler';

interface VideoPlayerProps {
    videoUrl: string;
    title: string;
    cookies: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, cookies, onClose }) => {
    const playerRef = useRef<VideoRef | null>(null);

    // State
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Tracks & Settings
    const [audioTracks, setAudioTracks] = useState<any[]>([]);
    const [textTracks, setTextTracks] = useState<any[]>([]);
    const [videoTracks, setVideoTracks] = useState<any[]>([]);

    const [selectedAudioTrack, setSelectedAudioTrack] = useState(0);
    const [selectedTextTrack, setSelectedTextTrack] = useState(1000); // 1000 = disabled
    const [selectedVideoTrack, setSelectedVideoTrack] = useState<any>({ type: SelectedVideoTrackType.AUTO });
    const [playbackRate, setPlaybackRate] = useState(1.0);

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Orientation & Fullscreen
    useEffect(() => {
        const removeListener = setupOrientationListeners((orientation) => {
            if (orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT') {
                setIsFullscreen(true);
                StatusBar.setHidden(true);
            } else if (orientation === 'PORTRAIT') {
                setIsFullscreen(false);
                StatusBar.setHidden(false);
            }
        });

        // Auto-enter fullscreen on mount
        enterFullscreen();

        return () => {
            removeListener();
            exitFullscreen();
        };
    }, []);

    // Back Handler
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isFullscreen) {
                exitFullscreen();
                return true;
            }
            onClose();
            return true;
        });
        return () => backHandler.remove();
    }, [isFullscreen, onClose]);

    // Controls Visibility
    const showControlsTemporarily = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (!paused) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [paused]);

    useEffect(() => {
        showControlsTemporarily();
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [showControlsTemporarily]);

    // Handlers
    const handleLoad = (data: any) => {
        setDuration(data.duration);
        setLoading(false);
        showControlsTemporarily();
    };

    const handleProgress = (data: any) => {
        setCurrentTime(data.currentTime);
    };

    const handleSkip = (seconds: number) => {
        if (playerRef.current) {
            let newTime = currentTime + seconds;
            if (newTime < 0) newTime = 0;
            if (newTime > duration) newTime = duration;
            playerRef.current.seek(newTime);
            setCurrentTime(newTime);
            showControlsTemporarily();
        }
    };

    const handleSeek = (value: number) => {
        if (playerRef.current) {
            playerRef.current.seek(value);
            setCurrentTime(value);
            showControlsTemporarily();
        }
    };

    const togglePlayPause = () => {
        setPaused(!paused);
        showControlsTemporarily();
    };

    const [resizeMode, setResizeMode] = useState<'contain' | 'cover' | 'stretch'>('contain');

    const toggleResizeMode = () => {
        setResizeMode(prev => {
            if (prev === 'contain') return 'cover';
            if (prev === 'cover') return 'stretch';
            return 'contain';
        });
        showControlsTemporarily();
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar hidden={isFullscreen} />

            <PlayerGestureHandler
                onSingleTap={() => {
                    if (showControls) {
                        setShowControls(false);
                    } else {
                        showControlsTemporarily();
                    }
                }}
                onDoubleTapLeft={() => handleSkip(-10)}
                onDoubleTapRight={() => handleSkip(10)}
            // Ideally we would use a pinch gesture here, but PlayerGestureHandler might need updates.
            // For now, let's add a button in controls or rely on a specific gesture if supported.
            // Let's assume we can add a pinch handler or just expose the function to controls.
            >
                <View style={styles.videoContainer}>
                    <VideoCore
                        ref={playerRef}
                        videoUrl={videoUrl}
                        cookies={cookies}
                        paused={paused}
                        rate={playbackRate}
                        resizeMode={resizeMode}
                        onLoad={handleLoad}
                        onProgress={handleProgress}
                        onAudioTracks={(data) => setAudioTracks(data.audioTracks || [])}
                        onTextTracks={(data) => setTextTracks(data.textTracks || [])}
                        onVideoTracks={(data) => setVideoTracks(data.videoTracks || [])}
                        selectedAudioTrack={{
                            type: SelectedTrackType.INDEX,
                            value: selectedAudioTrack,
                        }}
                        selectedTextTrack={{
                            type: selectedTextTrack === 1000 ? SelectedTrackType.DISABLED : SelectedTrackType.INDEX,
                            value: selectedTextTrack === 1000 ? undefined : selectedTextTrack,
                        }}
                        selectedVideoTrack={selectedVideoTrack}
                    />

                    <ControlsOverlay
                        visible={showControls}
                        paused={paused}
                        loading={loading}
                        title={title}
                        currentTime={currentTime}
                        duration={duration}
                        onPlayPause={togglePlayPause}
                        onSkipForward={() => handleSkip(10)}
                        onSkipBackward={() => handleSkip(-10)}
                        onSeek={handleSeek}
                        onClose={onClose}
                        onSettings={() => {
                            setShowSettings(true);
                            setShowControls(false);
                        }}
                        onToggleFullscreen={() => toggleFullscreen(isFullscreen)}
                        isFullscreen={isFullscreen}
                        onToggleResizeMode={toggleResizeMode}
                        resizeMode={resizeMode}
                    />
                </View>
            </PlayerGestureHandler>

            <SettingsModal
                visible={showSettings}
                onClose={() => {
                    setShowSettings(false);
                    showControlsTemporarily();
                }}
                audioTracks={audioTracks}
                textTracks={textTracks}
                videoTracks={videoTracks}
                selectedAudioTrack={selectedAudioTrack}
                selectedTextTrack={selectedTextTrack}
                selectedVideoTrack={selectedVideoTrack}
                playbackRate={playbackRate}
                onSelectAudioTrack={setSelectedAudioTrack}
                onSelectTextTrack={setSelectedTextTrack}
                onSelectVideoTrack={setSelectedVideoTrack}
                onSelectPlaybackRate={setPlaybackRate}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
});

export default VideoPlayer;
