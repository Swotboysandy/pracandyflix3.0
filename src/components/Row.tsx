import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Section, Movie } from '../services/api';
import MovieItem from './MovieItem';

interface RowProps {
    section: Section;
    onMoviePress: (movie: Movie) => void;
}

const Row: React.FC<RowProps> = ({ section, onMoviePress }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{section.title}</Text>
            <FlatList
                horizontal
                data={section.movies}
                renderItem={({ item }) => <MovieItem movie={item} onPress={onMoviePress} />}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 16,
    },
});

export default Row;
