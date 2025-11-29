import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, PanResponder, Animated } from 'react-native';
import { Sun, Volume2 } from 'lucide-react-native';

interface PlayerGesturesProps {
    onSingleTap: () => void;
    onVolumeChange: (delta: number) => void;
    onBrightnessChange: (delta: number) => void;
    volume: number;
    brightness: number;
    style?: any;
}

const { width } = Dimensions.get('window');

const PlayerGestures: React.FC<PlayerGesturesProps> = ({
    onSingleTap,
    onVolumeChange,
    onBrightnessChange,
    volume,
    brightness,
    style,
}) => {
    const [gestureType, setGestureType] = useState<number>(0); // 0: none, 1: volume, 2: brightness
    const prevYRef = useRef<number>(0);
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
            onPanResponderMove: (evt, gestureState) => {
                const locationX = evt.nativeEvent.locationX;
                const dy = gestureState.dy;

                // Only vertical swipe for volume/brightness
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
                const dx = gestureState.dx;
                const dy = gestureState.dy;

                // Check if it was just a tap (no significant movement)
                if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                    onSingleTap();
                } else {
                    // It was a swipe, clear feedback
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
