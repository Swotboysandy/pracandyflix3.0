import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Movie } from '../services/api';

interface MovieItemProps {
    movie: Movie;
    onPress: (movie: Movie) => void;
    isHero?: boolean;
}

const { width } = Dimensions.get('window');

const MovieItem: React.FC<MovieItemProps> = ({ movie, onPress, isHero }) => {
    if (isHero) {
        return (
            <TouchableOpacity onPress={() => onPress(movie)} style={styles.heroContainer}>
                <Image
                    source={{ uri: movie.imageUrl }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={() => onPress(movie)} style={styles.container}>
            <Image
                source={{ uri: movie.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    image: {
        width: 120,
        height: 180,
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

export default MovieItem;
