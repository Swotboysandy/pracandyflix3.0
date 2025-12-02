import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Rect, LinearGradient, Stop } from 'react-native-svg';

interface GradientBackgroundProps {
    colors?: string[];
    style?: ViewStyle;
    children?: React.ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ colors, style, children }) => {
    // Default to pure black as requested by user (removed red/brown tint)
    const defaultColors = ['#000000', '#000000', '#000000'];
    const gradientColors = colors || defaultColors;

    return (
        <View style={[styles.container, style]}>
            <View style={StyleSheet.absoluteFill}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            {gradientColors.map((color, index) => (
                                <Stop
                                    key={index}
                                    offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                                    stopColor={color}
                                    stopOpacity="1"
                                />
                            ))}
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                </Svg>
            </View>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});

export default GradientBackground;
