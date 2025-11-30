
import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    Easing
} from 'react-native-reanimated';

interface FadeInViewProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    delay?: number;
    duration?: number;
    slideUp?: boolean;
}

const FadeInView: React.FC<FadeInViewProps> = ({
    children,
    style,
    delay = 0,
    duration = 500,
    slideUp = false
}) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(slideUp ? 20 : 0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: duration, easing: Easing.out(Easing.cubic) }));
        if (slideUp) {
            translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 90 }));
        }
    }, [delay, duration, slideUp]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

export default FadeInView;
