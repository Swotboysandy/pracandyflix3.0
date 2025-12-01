import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Section, Movie } from '../services/api';
import MovieItem from './MovieItem';

interface RowProps {
    section: Section;
    onMoviePress: (movie: Movie) => void;
    variant?: 'standard' | 'continue-watching';
}

import AnimatedText from './AnimatedText';

// ... imports

const Row: React.FC<RowProps> = ({ section, onMoviePress, variant = 'standard' }) => {
    const renderItem = React.useCallback(({ item }: { item: Movie }) => (
        <MovieItem
            movie={item}
            onPress={onMoviePress}
            progress={(item as any).progress ? (item as any).progress / (item as any).duration : undefined}
            progressColor={variant === 'continue-watching' ? '#E50914' : undefined}
        />
    ), [onMoviePress, variant]);

    return (
        <View style={styles.container}>
            <AnimatedText style={styles.title}>{section.title}</AnimatedText>
            <FlatList
                horizontal
                data={section.movies}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={3}
                removeClippedSubviews={true}
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

export default React.memo(Row);
