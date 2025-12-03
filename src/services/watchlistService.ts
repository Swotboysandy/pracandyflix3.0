import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from './api';

const WATCHLIST_KEY = 'user_watchlist';

export interface WatchlistItem extends Movie {
    addedAt: number; // timestamp when added
    type: 'movie' | 'series'; // content type
}

/**
 * Add item to watchlist
 */
export const addToWatchlist = async (item: Movie, type: 'movie' | 'series' = 'movie'): Promise<void> => {
    try {
        const watchlist = await getWatchlist();

        // Check if already in watchlist
        if (watchlist.some(w => w.id === item.id)) {
            console.log('Item already in watchlist');
            return;
        }

        const watchlistItem: WatchlistItem = {
            ...item,
            addedAt: Date.now(),
            type
        };

        const updated = [watchlistItem, ...watchlist];
        await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
        console.log('Added to watchlist:', item.title || item.id);
    } catch (error) {
        console.error('Error adding to watchlist:', error);
    }
};

/**
 * Remove item from watchlist
 */
export const removeFromWatchlist = async (id: string): Promise<void> => {
    try {
        const watchlist = await getWatchlist();
        const updated = watchlist.filter(item => item.id !== id);
        await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
        console.log('Removed from watchlist:', id);
    } catch (error) {
        console.error('Error removing from watchlist:', error);
    }
};

/**
 * Get all watchlist items
 */
export const getWatchlist = async (filterProvider?: string): Promise<WatchlistItem[]> => {
    try {
        const json = await AsyncStorage.getItem(WATCHLIST_KEY);
        let watchlist: WatchlistItem[] = json ? JSON.parse(json) : [];

        if (filterProvider) {
            watchlist = watchlist.filter(item => {
                const itemProvider = item.provider || 'Netflix';
                return itemProvider.toLowerCase() === filterProvider.toLowerCase();
            });
        }

        return watchlist;
    } catch (error) {
        console.error('Error getting watchlist:', error);
        return [];
    }
};

/**
 * Get only movies from watchlist
 */
export const getWatchlistMovies = async (): Promise<WatchlistItem[]> => {
    try {
        const watchlist = await getWatchlist();
        return watchlist.filter(item => item.type === 'movie');
    } catch (error) {
        console.error('Error getting watchlist movies:', error);
        return [];
    }
};

/**
 * Get only series from watchlist
 */
export const getWatchlistSeries = async (): Promise<WatchlistItem[]> => {
    try {
        const watchlist = await getWatchlist();
        return watchlist.filter(item => item.type === 'series');
    } catch (error) {
        console.error('Error getting watchlist series:', error);
        return [];
    }
};

/**
 * Check if item is in watchlist
 */
export const isInWatchlist = async (id: string): Promise<boolean> => {
    try {
        const watchlist = await getWatchlist();
        return watchlist.some(item => item.id === id);
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return false;
    }
};

/**
 * Clear entire watchlist
 */
export const clearWatchlist = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(WATCHLIST_KEY);
        console.log('Watchlist cleared');
    } catch (error) {
        console.error('Error clearing watchlist:', error);
    }
};
