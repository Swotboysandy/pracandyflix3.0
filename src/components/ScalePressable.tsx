
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface ScalePressableProps extends PressableProps {
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ScalePressable: React.FC<ScalePressableProps> = ({
    children,
    style,
    scaleTo = 0.95,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = (event: any) => {
        scale.value = withSpring(scaleTo, { damping: 10, stiffness: 300 });
        if (onPressIn) onPressIn(event);
    };

    const handlePressOut = (event: any) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        if (onPressOut) onPressOut(event);
    };

    return (
        <AnimatedPressable
            {...props}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
};

export default ScalePressable;
