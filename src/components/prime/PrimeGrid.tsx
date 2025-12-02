import React from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Movie } from '../../services/api';

const { width } = Dimensions.get('window');
const numColumns = 3;
const gap = 10;
const padding = 20;
const availableWidth = width - (padding * 2) - (gap * (numColumns - 1));
const itemWidth = availableWidth / numColumns;

interface PrimeGridProps {
    movies: Movie[];
    onMoviePress: (movie: Movie) => void;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const PrimeGrid = ({ movies, onMoviePress, ListHeaderComponent }: PrimeGridProps) => {
    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onMoviePress(item)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.poster}
                resizeMode="cover"
            />
            <View style={styles.primeIconOverlay}>
                <Image
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Amazon_Prime_Video_logo_%282024%29.svg/2048px-Amazon_Prime_Video_logo_%282024%29.svg.png' }}
                    style={styles.miniLogo}
                    resizeMode="contain"
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={movies}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.container}
            columnWrapperStyle={styles.columnWrapper}
            ListHeaderComponent={ListHeaderComponent}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: padding,
        paddingBottom: 20,
    },
    columnWrapper: {
        gap: gap,
        marginBottom: gap,
    },
    card: {
        width: itemWidth,
        height: itemWidth * 1.5,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    primeIconOverlay: {
        position: 'absolute',
        top: 5,
        left: 5,
    },
    miniLogo: {
        width: 30,
        height: 15,
        tintColor: '#00A8E1',
    },
});

export default PrimeGrid;
