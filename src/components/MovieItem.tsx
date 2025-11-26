import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { Movie } from '../services/api';

interface MovieItemProps {
    movie: Movie;
    onPress: (movie: Movie) => void;
    isHero?: boolean;
}

const { width } = Dimensions.get('window');

const MovieItem: React.FC<MovieItemProps> = ({ movie, onPress, isHero }) => {
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    if (isHero) {
        return (
            <TouchableOpacity onPress={() => onPress(movie)} style={styles.heroContainer} activeOpacity={0.9}>
                <Image
                    source={{ uri: movie.imageUrl }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableWithoutFeedback
            onPress={() => onPress(movie)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
                <Image
                    source={{ uri: movie.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </Animated.View>
        </TouchableWithoutFeedback>
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
