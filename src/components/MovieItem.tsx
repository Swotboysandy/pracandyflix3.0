import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Movie } from '../services/api';

interface MovieItemProps {
    movie: Movie;
    onPress: (movie: Movie) => void;
    isHero?: boolean;
}

const { width } = Dimensions.get('window');

import ScalePressable from './ScalePressable';

// ... imports

const MovieItem: React.FC<MovieItemProps> = ({ movie, onPress, isHero }) => {
    if (isHero) {
        return (
            <ScalePressable onPress={() => onPress(movie)} style={styles.heroContainer} scaleTo={0.98}>
                <Image
                    source={{ uri: movie.imageUrl }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </ScalePressable>
        );
    }

    return (
        <ScalePressable onPress={() => onPress(movie)} style={styles.container}>
            <Image
                source={{ uri: movie.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
        </ScalePressable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    image: {
        width: 90,
        height: 135,
        borderRadius: 4,
    },
    heroContainer: {
        width: width,
        height: 450,
        marginBottom: 20,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
});

export default React.memo(MovieItem);
