import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import GrainOverlay from './GrainOverlay';

interface GlassHeaderProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    intensity?: number;
    tint?: 'light' | 'dark' | 'extraDark' | 'regular' | 'prominent';
}

const GlassHeader: React.FC<GlassHeaderProps> = ({
    style,
    children,
    intensity = 50,
    tint = 'dark'
}) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView
                style={StyleSheet.absoluteFill}
                blurType={tint as any}
                blurAmount={intensity}
                reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
            />
            <GrainOverlay opacity={0.03} />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // overflow: 'hidden', // Can cause issues with shadows if needed, but good for blur bounds
    },
    content: {
        zIndex: 1,
    },
});

export default GlassHeader;
