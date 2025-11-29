import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, PanResponder, Animated } from 'react-native';
import { Sun, Volume2 } from 'lucide-react-native';

interface PlayerGesturesProps {
    onSingleTap: () => void;
    onDoubleTapLeft: () => void;
    onDoubleTapRight: () => void;
    onVolumeChange: (delta: number) => void;
    onBrightnessChange: (delta: number) => void;
    volume: number;
    brightness: number;
    style?: any;
}

const { width } = Dimensions.get('window');

const PlayerGestures: React.FC<PlayerGesturesProps> = ({
    onSingleTap,
    onDoubleTapLeft,
    onDoubleTapRight,
    onVolumeChange,
    onBrightnessChange,
    volume,
    brightness,
    style,
}) => {
    const [gestureType, setGestureType] = useState<number>(0);
    const lastTapRef = useRef<number>(0);
    const lastTapXRef = useRef<number>(0);
    const prevYRef = useRef<number>(0);
    const doubleTapDetected = useRef<boolean>(false);
    const feedbackOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (gestureType !== 0) {
            Animated.timing(feedbackOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(feedbackOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [gestureType, feedbackOpacity]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const now = Date.now();
                const locationX = evt.nativeEvent.locationX;

                // Check for double tap
                if (now - lastTapRef.current < 300 && Math.abs(locationX - lastTapXRef.current) < 50) {
                    doubleTapDetected.current = true;
                    if (locationX < width / 2) {
                        setGestureType(3);
                        onDoubleTapLeft();
                        setTimeout(() => setGestureType(0), 1000);
                    } else {
                        setGestureType(4);
                        onDoubleTapRight();
                        setTimeout(() => setGestureType(0), 1000);
                    }
                    lastTapRef.current = 0;
                } else {
                    doubleTapDetected.current = false;
                    lastTapRef.current = now;
                    lastTapXRef.current = locationX;
                }
                prevYRef.current = 0;
            },
            onPanResponderMove: (evt, gestureState) => {
                const locationX = evt.nativeEvent.locationX;
                const dy = gestureState.dy;

                // Only trigger volume/brightness if there's significant movement
                if (Math.abs(dy) > 10) {
                    const step = dy - prevYRef.current;
                    prevYRef.current = dy;
                    const delta = -step / 300;

                    if (locationX < width / 2) {
                        setGestureType(2);
                        onBrightnessChange(delta);
                    } else {
                        setGestureType(1);
                        onVolumeChange(delta);
                    }
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                // Check if it was just a tap (no significant movement)
                if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
                    // If not part of double tap, schedule single tap
                    if (!doubleTapDetected.current) {
                        setTimeout(() => {
                            if (!doubleTapDetected.current) {
                                onSingleTap();
                            }
                        }, 250);
                    }
                } else {
                    // It was a pan gesture, clear feedback
                    setGestureType(0);
                }
                prevYRef.current = 0;
            },
        })
    ).current;

    return (
        <View style={[styles.container, style]} {...panResponder.panHandlers}>
            <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity }]} pointerEvents="none">
                <View style={styles.feedbackBox}>
                    {gestureType === 1 && (
                        <View style={styles.feedbackItem}>
                            <Volume2 color="#fff" size={32} />
                            <Text style={styles.feedbackText}>{Math.round(volume * 100)}%</Text>
                        </View>
                    )}
                    {gestureType === 2 && (
                        <View style={styles.feedbackItem}>
                            <Sun color="#fff" size={32} />
                            <Text style={styles.feedbackText}>{Math.round(brightness * 100)}%</Text>
                        </View>
                    )}
                    {gestureType === 3 && (
                        <Text style={styles.feedbackText}>-10s</Text>
                    )}
                    {gestureType === 4 && (
                        <Text style={styles.feedbackText}>+10s</Text>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    feedbackContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    feedbackBox: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
        minHeight: 100,
    },
    feedbackText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    feedbackItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PlayerGestures;
