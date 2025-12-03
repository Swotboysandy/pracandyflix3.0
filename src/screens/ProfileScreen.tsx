import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProvider } from '../context/ProviderContext';
import { getHistory, HistoryItem } from '../services/api';
import { getWatchlist, WatchlistItem } from '../services/watchlistService';
import { useFocusEffect } from '@react-navigation/native';
import MovieItem from '../components/MovieItem';

const ProfileScreen = ({ navigation }: any) => {
    const { provider } = useProvider();
    const insets = useSafeAreaInsets();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [provider])
    );

    const loadData = async () => {
        const h = await getHistory(provider);
        const w = await getWatchlist(provider);
        setHistory(h);
        setWatchlist(w);
    };

    const handleMoviePress = (movie: any) => {
        navigation.navigate('Details', {
            movieId: movie.id,
            providerId: provider,
            title: movie.title,
        });
    };

    const renderSection = (title: string, data: any[]) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {data.length === 0 ? (
                <Text style={styles.emptyText}>No items yet.</Text>
            ) : (
                <FlatList
                    data={data}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <MovieItem movie={item} onPress={handleMoviePress} />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' }}
                    style={styles.avatar}
                />
                <Text style={styles.profileName}>My Profile ({provider})</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderSection('My Watchlist', watchlist)}
                {renderSection('Continue Watching', history)}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 15,
    },
    profileName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 10,
    },
    listContent: {
        paddingHorizontal: 15,
    },
    emptyText: {
        color: '#666',
        marginLeft: 20,
        fontStyle: 'italic',
    },
});

export default ProfileScreen;
