
import React, { useEffect } from 'react';
import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';

interface AnimatedTextProps extends TextProps {
    style?: StyleProp<TextStyle>;
    delay?: number;
    duration?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
    children,
    style,
    delay = 0,
    duration = 600,
    ...props
}) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-20);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
        translateX.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.quad) }));
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <Animated.Text style={[style, animatedStyle]} {...props}>
            {children}
        </Animated.Text>
    );
};

export default AnimatedText;
