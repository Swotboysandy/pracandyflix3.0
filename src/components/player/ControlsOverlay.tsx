import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { Play, Pause, SkipBack, SkipForward, Settings, Maximize, Minimize, ChevronLeft, Captions, Volume2, Gauge, Monitor } from 'lucide-react-native';

interface ControlsOverlayProps {
    visible: boolean;
    paused: boolean;
    loading: boolean;
    title: string;
    currentTime: number;
    duration: number;
    onPlayPause: () => void;
    onSkipForward: () => void;
    onSkipBackward: () => void;
    onSeek: (value: number) => void;
    onClose: () => void;
    onSettings: () => void;
    onToggleFullscreen: () => void;
    isFullscreen: boolean;
    onToggleResizeMode: () => void;
    resizeMode: 'contain' | 'cover' | 'stretch';
}

const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
    visible,
    paused,
    loading,
    title,
    currentTime,
    duration,
    onPlayPause,
    onSkipForward,
    onSkipBackward,
    onSeek,
    onClose,
    onSettings,
    onToggleFullscreen,
    isFullscreen,
    onToggleResizeMode,
    resizeMode,
}) => {
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!visible) return null;

    return (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.container} pointerEvents="box-none">
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                    <ChevronLeft color="#fff" size={28} />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
                <TouchableOpacity onPress={onSkipBackward} style={styles.skipButton}>
                    <SkipBack color="#fff" size={32} fill="#fff" />
                    <Text style={styles.skipText}>-10</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onPlayPause} style={styles.playPauseButton}>
                    {paused ? (
                        <Play color="#fff" size={48} fill="#fff" style={{ marginLeft: 4 }} />
                    ) : (
                        <Pause color="#fff" size={48} fill="#fff" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onSkipForward} style={styles.skipButton}>
                    <SkipForward color="#fff" size={32} fill="#fff" />
                    <Text style={styles.skipText}>+10</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.sliderContainer}>
                    <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={currentTime}
                        onSlidingComplete={onSeek}
                        minimumTrackTintColor="#E50914"
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbTintColor="#E50914"
                    />
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>

                <View style={styles.bottomControls}>
                    <TouchableOpacity onPress={onToggleResizeMode} style={styles.iconButton}>
                        <Monitor color={resizeMode === 'contain' ? '#fff' : '#E50914'} size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onSettings} style={styles.iconButton}>
                        <Settings color="#fff" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onToggleFullscreen} style={styles.iconButton}>
                        {isFullscreen ? (
                            <Minimize color="#fff" size={24} />
                        ) : (
                            <Maximize color="#fff" size={24} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 100,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 200,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
        backgroundColor: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)', // Note: LinearGradient requires a library, falling back to solid or simple transparency if not available. Using simple transparency for now.
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1,
    },
    centerControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    playPauseButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipButton: {
        alignItems: 'center',
    },
    skipText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold',
    },
    bottomBar: {
        padding: 16,
        paddingBottom: 20,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    timeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    iconButton: {
        padding: 8,
    },
});

export default ControlsOverlay;
