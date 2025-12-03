import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    Dimensions,
    Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory, HistoryItem, removeFromHistory, clearHistory } from '../services/api';
import { getWatchlist, getWatchlistMovies, getWatchlistSeries, removeFromWatchlist, WatchlistItem, addToWatchlist, isInWatchlist } from '../services/watchlistService';
import { X, MoreVertical, Trash2, Plus, Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 3; // 3 columns with 16px padding each side and gaps

type MainTab = 'history' | 'watchlist';
type WatchlistTab = 'all' | 'movies' | 'series';

const LibraryScreen = ({ navigation }: any) => {
    const [activeMainTab, setActiveMainTab] = useState<MainTab>('history');
    const [activeWatchlistTab, setActiveWatchlistTab] = useState<WatchlistTab>('all');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [menuVisible, setMenuVisible] = useState<string | null>(null);
    const [inWatchlist, setInWatchlist] = useState<{ [key: string]: boolean }>({});

    const loadData = async () => {
        // Load history
        const historyData = await getHistory();
        setHistory(historyData);

        // Load watchlist based on active sub-tab
        let watchlistData: WatchlistItem[] = [];
        if (activeWatchlistTab === 'movies') {
            watchlistData = await getWatchlistMovies();
        } else if (activeWatchlistTab === 'series') {
            watchlistData = await getWatchlistSeries();
        } else {
            watchlistData = await getWatchlist();
        }
        setWatchlist(watchlistData);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [activeWatchlistTab])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleClearHistory = async () => {
        await clearHistory();
        await loadData();
    };

    const handleRemoveFromHistory = async (id: string) => {
        await removeFromHistory(id);
        await loadData();
        setMenuVisible(null);
    };

    const handleToggleWatchlist = async (item: HistoryItem) => {
        const isIn = await isInWatchlist(item.id);
        if (isIn) {
            await removeFromWatchlist(item.id);
        } else {
            await addToWatchlist(item as any, 'movie'); // Default to movie, could be improved
        }
        // Reload watchlist status
        const status = await isInWatchlist(item.id);
        setInWatchlist(prev => ({ ...prev, [item.id]: status }));
        setMenuVisible(null);
    };

    const handleRemoveFromWatchlist = async (id: string) => {
        await removeFromWatchlist(id);
        await loadData();
    };

    const handlePlayItem = (item: HistoryItem | WatchlistItem) => {
        // Navigate to details/player
        if ('seasons' in item && item.seasons) {
            // It's a series
            navigation.navigate('DetailsView', { id: item.id });
        } else {
            navigation.navigate('DetailsView', { id: item.id });
        }
    };

    const renderMainTabs = () => (
        <View style={styles.mainTabsContainer}>
            <TouchableOpacity
                style={[styles.mainTab, activeMainTab === 'history' && styles.activeMainTab]}
                onPress={() => setActiveMainTab('history')}
            >
                <Text style={[styles.mainTabText, activeMainTab === 'history' && styles.activeMainTabText]}>
                    History
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.mainTab, activeMainTab === 'watchlist' && styles.activeMainTab]}
                onPress={() => setActiveMainTab('watchlist')}
            >
                <Text style={[styles.mainTabText, activeMainTab === 'watchlist' && styles.activeMainTabText]}>
                    Watchlist
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderWatchlistSubTabs = () => (
        <View style={styles.subTabsContainer}>
            <TouchableOpacity
                style={[styles.subTab, activeWatchlistTab === 'all' && styles.activeSubTab]}
                onPress={() => setActiveWatchlistTab('all')}
            >
                <Text style={[styles.subTabText, activeWatchlistTab === 'all' && styles.activeSubTabText]}>
                    All
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.subTab, activeWatchlistTab === 'movies' && styles.activeSubTab]}
                onPress={() => setActiveWatchlistTab('movies')}
            >
                <Text style={[styles.subTabText, activeWatchlistTab === 'movies' && styles.activeSubTabText]}>
                    Movies
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.subTab, activeWatchlistTab === 'series' && styles.activeSubTab]}
                onPress={() => setActiveWatchlistTab('series')}
            >
                <Text style={[styles.subTabText, activeWatchlistTab === 'series' && styles.activeSubTabText]}>
                    Series
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderCard = (item: HistoryItem | WatchlistItem, isHistory: boolean) => {
        const progressPercent = isHistory && 'progress' in item && item.progress && item.duration
            ? (item.progress / item.duration) * 100
            : 0;

        const itemInWatchlist = inWatchlist[item.id] || false;

        return (
            <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handlePlayItem(item)}
            >
                <View style={styles.cardImageContainer}>
                    <Image
                        source={{ uri: item.imageUrl || item.image || item.image2 }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                    {!isHistory && (
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveFromWatchlist(item.id)}
                        >
                            <X color="#fff" size={16} />
                        </TouchableOpacity>
                    )}
                    {isHistory && (
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => setMenuVisible(menuVisible === item.id ? null : item.id)}
                        >
                            <MoreVertical color="#fff" size={20} />
                        </TouchableOpacity>
                    )}
                    {isHistory && progressPercent > 0 && progressPercent < 95 && (
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                        </View>
                    )}
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                {isHistory && progressPercent > 0 && progressPercent < 95 && (
                    <Text style={styles.progressText}>{Math.round(progressPercent)}% watched</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderHistory = () => {
        if (history.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No watch history yet</Text>
                    <Text style={styles.emptySubtext}>Start watching to build your history</Text>
                </View>
            );
        }

        return (
            <View style={styles.grid}>
                {history.map(item => renderCard(item, true))}
            </View>
        );
    };

    const renderWatchlist = () => {
        if (watchlist.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Your watchlist is empty</Text>
                    <Text style={styles.emptySubtext}>Add content from details page</Text>
                </View>
            );
        }

        return (
            <View style={styles.grid}>
                {watchlist.map(item => renderCard(item, false))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Library</Text>
                {activeMainTab === 'history' && history.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearHistory}
                    >
                        <Trash2 color="#E50914" size={18} />
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {renderMainTabs()}

            {activeMainTab === 'watchlist' && renderWatchlistSubTabs()}

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E50914" />
                }
            >
                {activeMainTab === 'history' ? renderHistory() : renderWatchlist()}
            </ScrollView>

            {/* Context Menu Modal */}
            <Modal
                visible={!!menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(null)}
                >
                    <View style={styles.menuModalContent}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => menuVisible && handleRemoveFromHistory(menuVisible)}
                        >
                            <Trash2 color="#fff" size={20} />
                            <Text style={styles.menuItemText}>Remove from History</Text>
                        </TouchableOpacity>

                        {menuVisible && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    const item = history.find(h => h.id === menuVisible);
                                    if (item) handleToggleWatchlist(item);
                                }}
                            >
                                {inWatchlist[menuVisible] ? <Check color="#E50914" size={20} /> : <Plus color="#fff" size={20} />}
                                <Text style={[styles.menuItemText, inWatchlist[menuVisible] && { color: '#E50914' }]}>
                                    {inWatchlist[menuVisible] ? 'In Watchlist' : 'Add to Watchlist'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(229,9,20,0.1)',
    },
    clearButtonText: {
        color: '#E50914',
        fontSize: 14,
        fontWeight: '600',
    },
    mainTabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    mainTab: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
    },
    activeMainTab: {
        backgroundColor: '#E50914',
    },
    mainTabText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    activeMainTabText: {
        color: '#fff',
    },
    subTabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    subTab: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#1a1a1a',
    },
    activeSubTab: {
        backgroundColor: '#333',
    },
    subTabText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '500',
    },
    activeSubTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 100,
    },
    card: {
        width: CARD_WIDTH,
        marginBottom: 20,
    },
    cardImageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 2 / 3,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        padding: 4,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#E50914',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
    },
    progressText: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#999',
        fontSize: 14,
    },
    menuButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 20,
        padding: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuModalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 8,
        width: 250,
        borderWidth: 1,
        borderColor: '#333',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    menuItemText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LibraryScreen;
