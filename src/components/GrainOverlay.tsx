import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Filter, FeTurbulence, Rect } from 'react-native-svg';

interface GrainOverlayProps {
    opacity?: number;
    style?: ViewStyle;
}

const GrainOverlay: React.FC<GrainOverlayProps> = ({ opacity = 0.2, style }) => {
    return (
        <View style={[styles.container, style]} pointerEvents="none">
            <Svg height="100%" width="100%">
                <Defs>
                    <Filter id="noiseFilter">
                        <FeTurbulence
                            type="fractalNoise"
                            baseFrequency="0.65"
                            numOctaves="3"
                            stitchTiles="stitch"
                        />
                    </Filter>
                </Defs>
                <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    filter="url(#noiseFilter)"
                    fill="white"
                    fillOpacity={opacity}
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
});

export default GrainOverlay;
