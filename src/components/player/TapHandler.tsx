import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';

interface TapHandlerProps {
    onSingleTap: () => void;
    onDoubleTapLeft: () => void;
    onDoubleTapRight: () => void;
    style?: any;
}

const { width } = Dimensions.get('window');
const DOUBLE_TAP_DELAY = 300;
const TAP_HIT_SLOP = 20;

const TapHandler: React.FC<TapHandlerProps> = ({
    onSingleTap,
    onDoubleTapLeft,
    onDoubleTapRight,
    style,
}) => {
    const lastTapRef = useRef<number>(0);
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startLocationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleTap = (x: number) => {
        const now = Date.now();
        const delay = now - lastTapRef.current;

        if (delay < DOUBLE_TAP_DELAY) {
            // Double Tap Detected
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
                tapTimeoutRef.current = null;
            }
            lastTapRef.current = 0; // Reset

            if (x < width / 2) {
                onDoubleTapLeft();
            } else {
                onDoubleTapRight();
            }
        } else {
            // Single Tap Detected (wait for potential second tap)
            lastTapRef.current = now;
            tapTimeoutRef.current = setTimeout(() => {
                onSingleTap();
                lastTapRef.current = 0;
            }, DOUBLE_TAP_DELAY);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: (evt) => {
                startLocationRef.current = {
                    x: evt.nativeEvent.locationX,
                    y: evt.nativeEvent.locationY,
                };
            },
            onPanResponderRelease: (evt, gestureState) => {
                const dx = Math.abs(gestureState.dx);
                const dy = Math.abs(gestureState.dy);

                if (dx < TAP_HIT_SLOP && dy < TAP_HIT_SLOP) {
                    handleTap(evt.nativeEvent.locationX);
                }
            },
        })
    ).current;

    return (
        <View style={[styles.container, style]} {...panResponder.panHandlers} />
    );
};

const styles = StyleSheet.create({
    container: {
        // Transparent container
    },
});

export default TapHandler;
