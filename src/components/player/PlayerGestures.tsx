import React, { useRef } from 'react';
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState, StyleSheet, Dimensions } from 'react-native';

interface Props {
    style?: any;
    onSingleTap: () => void;
    onDoubleTapLeft?: () => void;
    onDoubleTapRight?: () => void;
    onVolumeChange: (delta: number) => void;
    onBrightnessChange: (delta: number) => void;
    volume: number;
    brightness: number;
}

const { width } = Dimensions.get('window');
const TAP_DURATION = 180;   // max tap time
const TAP_MOVE_LIMIT = 6;   // max movement for tap
const DOUBLE_TAP_DELAY = 300; // time window for double tap

export default function PlayerGestures({
    style,
    onSingleTap,
    onDoubleTapLeft,
    onDoubleTapRight,
    onVolumeChange,
    onBrightnessChange
}: Props) {

    const touchInfo = useRef({
        time: 0,
        x: 0,
        y: 0
    });

    const lastTapRef = useRef({
        time: 0,
        x: 0
    });

    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => {
            return Math.abs(gesture.dy) > 15;  // only vertical movement enables gesture
        },

        onPanResponderGrant: (evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            touchInfo.current = {
                time: Date.now(),
                x: locationX,
                y: locationY
            };
        },

        onPanResponderMove: (evt, gesture) => {
            const { locationX } = evt.nativeEvent;
            const leftSide = locationX < 200; // left = brightness, right = volume

            if (leftSide) {
                onBrightnessChange(-gesture.dy / 450);
            } else {
                onVolumeChange(-gesture.dy / 450);
            }
        },

        onPanResponderRelease: (evt, gesture) => {
            const now = Date.now();
            const pressTime = now - touchInfo.current.time;
            const moveDistance = Math.abs(gesture.dx) + Math.abs(gesture.dy);

            // TAP DETECTED
            if (pressTime < TAP_DURATION && moveDistance < TAP_MOVE_LIMIT) {
                const tapX = evt.nativeEvent.locationX;
                const timeSinceLastTap = now - lastTapRef.current.time;

                // DOUBLE TAP
                if (timeSinceLastTap < DOUBLE_TAP_DELAY && Math.abs(tapX - lastTapRef.current.x) < 100) {
                    // Clear single tap timeout
                    if (tapTimeoutRef.current) {
                        clearTimeout(tapTimeoutRef.current);
                        tapTimeoutRef.current = null;
                    }

                    // Determine left or right side
                    if (tapX < width / 2) {
                        onDoubleTapLeft?.();
                    } else {
                        onDoubleTapRight?.();
                    }

                    // Reset last tap so triple tap doesn't trigger
                    lastTapRef.current = { time: 0, x: 0 };
                } else {
                    // SINGLE TAP (potentially)
                    lastTapRef.current = { time: now, x: tapX };

                    // Wait to see if double tap comes
                    tapTimeoutRef.current = setTimeout(() => {
                        onSingleTap();
                        tapTimeoutRef.current = null;
                    }, DOUBLE_TAP_DELAY);
                }
                return;
            }
        }
    });

    return (
        <View {...panResponder.panHandlers} style={[styles.full, style]} />
    );
}

const styles = StyleSheet.create({
    full: {
        ...StyleSheet.absoluteFillObject,
    }
});
