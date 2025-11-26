import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';

interface PlayerGestureHandlerProps {
    children: React.ReactNode;
    onSingleTap: () => void;
    onDoubleTapLeft: () => void;
    onDoubleTapRight: () => void;
}

const { width } = Dimensions.get('window');

const PlayerGestureHandler: React.FC<PlayerGestureHandlerProps> = ({
    children,
    onSingleTap,
    onDoubleTapLeft,
    onDoubleTapRight,
}) => {
    // Animation values for double tap feedback
    const leftOpacity = useSharedValue(0);
    const rightOpacity = useSharedValue(0);

    const showLeftFeedback = () => {
        leftOpacity.value = 1;
        leftOpacity.value = withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(0, { duration: 500 })
        );
    };

    const showRightFeedback = () => {
        rightOpacity.value = 1;
        rightOpacity.value = withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(0, { duration: 500 })
        );
    };

    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .onStart(() => {
            runOnJS(onSingleTap)();
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onStart((e) => {
            if (e.x < width / 2) {
                runOnJS(onDoubleTapLeft)();
                runOnJS(showLeftFeedback)();
            } else {
                runOnJS(onDoubleTapRight)();
                runOnJS(showRightFeedback)();
            }
        });

    // Exclusive gesture handling: wait for double tap failure before triggering single tap
    const composed = Gesture.Exclusive(doubleTap, singleTap);

    const leftStyle = useAnimatedStyle(() => ({
        opacity: leftOpacity.value,
    }));

    const rightStyle = useAnimatedStyle(() => ({
        opacity: rightOpacity.value,
    }));

    return (
        <GestureHandlerRootView style={styles.container}>
            <GestureDetector gesture={composed}>
                <View style={styles.container}>
                    {children}

                    {/* Double Tap Feedback Overlay */}
                    <View style={styles.feedbackContainer} pointerEvents="none">
                        <Animated.View style={[styles.feedbackSide, leftStyle]}>
                            <View style={styles.feedbackIconContainer}>
                                <Animated.Text style={styles.feedbackText}>-10s</Animated.Text>
                            </View>
                        </Animated.View>
                        <Animated.View style={[styles.feedbackSide, rightStyle]}>
                            <View style={styles.feedbackIconContainer}>
                                <Animated.Text style={styles.feedbackText}>+10s</Animated.Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    feedbackContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    feedbackSide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    feedbackIconContainer: {
        padding: 20,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    feedbackText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default PlayerGestureHandler;
