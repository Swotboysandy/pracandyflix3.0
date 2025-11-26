import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions
} from 'react-native';
import { searchMovies, Movie } from '../services/api';

interface SearchProps {
    onClose: () => void;
    onMoviePress: (movie: Movie) => void;
}

const { width } = Dimensions.get('window');
const numColumns = 3;
const itemWidth = (width - 40) / numColumns; // 20 padding on each side

const Search: React.FC<SearchProps> = ({ onClose, onMoviePress }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [selectedPlatform, setSelectedPlatform] = useState<'netflix' | 'primevideo' | 'hotstar'>('netflix');

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    const handleSearch = React.useCallback(async (text: string) => {
        setLoading(true);
        const movies = await searchMovies(text, selectedPlatform);
        setResults(movies);
        setLoading(false);
    }, [selectedPlatform]);

    useEffect(() => {
        if (debouncedQuery.trim().length > 2) {
            handleSearch(debouncedQuery);
        } else {
            setResults([]);
        }
    }, [debouncedQuery, handleSearch]);

    // Re-search when platform changes
    useEffect(() => {
        if (debouncedQuery.trim().length > 2) {
            handleSearch(debouncedQuery);
        }
    }, [selectedPlatform, debouncedQuery, handleSearch]);

    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity onPress={() => onMoviePress(item)} style={styles.itemContainer}>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/left.png' }} style={styles.icon} />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/999999/search--v1.png' }} style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search for a show, movie, genre, etc."
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/999999/delete-sign.png' }} style={styles.clearIcon} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, selectedPlatform === 'netflix' && styles.toggleButtonActive]}
                    onPress={() => setSelectedPlatform('netflix')}
                >
                    <Text style={[styles.toggleText, selectedPlatform === 'netflix' && styles.toggleTextActive]}>Netflix</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, selectedPlatform === 'primevideo' && styles.toggleButtonActive]}
                    onPress={() => setSelectedPlatform('primevideo')}
                >
                    <Text style={[styles.toggleText, selectedPlatform === 'primevideo' && styles.toggleTextActive]}>Prime</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, selectedPlatform === 'hotstar' && styles.toggleButtonActive]}
                    onPress={() => setSelectedPlatform('hotstar')}
                >
                    <Text style={[styles.toggleText, selectedPlatform === 'hotstar' && styles.toggleTextActive]}>Hotstar</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#E50914" style={styles.loader} />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        query.length > 2 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Oh darn. We don't have that.</Text>
                                <Text style={styles.emptySubText}>Try searching for another movie, show, actor, or genre.</Text>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 10, // Safe area handled by parent or SafeAreaView
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
        marginRight: 5,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#333',
        borderRadius: 5,
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 40,
        marginLeft: 10,
    },
    searchIcon: {
        width: 18,
        height: 18,
        tintColor: '#999',
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        paddingVertical: 0, // Remove android padding
    },
    clearIcon: {
        width: 16,
        height: 16,
        tintColor: '#999',
    },
    loader: {
        marginTop: 50,
    },
    listContent: {
        paddingHorizontal: 10,
    },
    itemContainer: {
        width: itemWidth,
        marginBottom: 20,
        marginRight: 10, // Gap between columns
    },
    image: {
        width: '100%',
        height: itemWidth * 1.5, // Aspect ratio
        borderRadius: 4,
        backgroundColor: '#222',
    },
    itemTitle: {
        color: '#ccc',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySubText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    toggleContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginBottom: 10,
        gap: 10,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#333',
        borderRadius: 5,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#E50914',
    },
    toggleText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#fff',
    },
});

export default Search;
