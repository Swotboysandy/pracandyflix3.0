import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, PanResponder } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { Play, Pause, SkipBack, SkipForward, Settings, Maximize, Minimize, ChevronLeft, Monitor, Sun, Volume2 } from 'lucide-react-native';

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

const { width, height } = Dimensions.get('window');

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
    const [volume, setVolume] = useState(0.5); // Mock volume state
    const [brightness, setBrightness] = useState(0.5); // Mock brightness state
    const [gestureType, setGestureType] = useState<'volume' | 'brightness' | 'seek' | null>(null);
    const [gestureValue, setGestureValue] = useState(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
            },
            onPanResponderGrant: () => {
                setGestureType(null);
            },
            onPanResponderMove: (_, gestureState) => {
                const { dx, dy, moveX, moveY } = gestureState;
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);

                if (!gestureType) {
                    if (absDx > absDy) {
                        setGestureType('seek');
                    } else {
                        if (moveX < width / 2) {
                            setGestureType('brightness');
                        } else {
                            setGestureType('volume');
                        }
                    }
                }

                if (gestureType === 'seek') {
                    const seekChange = (dx / width) * 90; // 90 seconds max seek
                    setGestureValue(seekChange);
                } else if (gestureType === 'brightness') {
                    const brightnessChange = -dy / 200;
                    setBrightness(prev => Math.max(0, Math.min(1, prev + brightnessChange)));
                    setGestureValue(brightness);
                } else if (gestureType === 'volume') {
                    const volumeChange = -dy / 200;
                    setVolume(prev => Math.max(0, Math.min(1, prev + volumeChange)));
                    setGestureValue(volume);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureType === 'seek') {
                    onSeek(currentTime + (gestureState.dx / width) * 90);
                }
                setGestureType(null);
            },
        })
    ).current;

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

    return (
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
            {/* Gesture Feedback Overlay */}
            {gestureType && (
                <View style={styles.gestureFeedback}>
                    {gestureType === 'volume' && (
                        <>
                            <Volume2 color="#fff" size={40} />
                            <Text style={styles.gestureText}>{Math.round(volume * 100)}%</Text>
                        </>
                    )}
                    {gestureType === 'brightness' && (
                        <>
                            <Sun color="#fff" size={40} />
                            <Text style={styles.gestureText}>{Math.round(brightness * 100)}%</Text>
                        </>
                    )}
                    {gestureType === 'seek' && (
                        <>
                            <Text style={styles.gestureText}>
                                {gestureValue > 0 ? '+' : ''}{Math.round(gestureValue)}s
                            </Text>
                        </>
                    )}
                </View>
            )}

            {visible && (
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
            )}
        </View>
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
    gestureFeedback: {
        position: 'absolute',
        top: '40%',
        left: '40%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
    },
    gestureText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
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
        backgroundColor: 'rgba(0,0,0,0.5)',
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
