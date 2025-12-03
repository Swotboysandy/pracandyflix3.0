import React, { useEffect, useState, useCallback } from 'react';
import {
    StatusBar,
    StyleSheet,
    View,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Text,
    FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchPrimeHomeData, Section, Movie, getHistory } from '../services/api';
import { getWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/watchlistService';
import { RootStackParamList } from '../navigation/types';
import GradientBackground from '../components/GradientBackground';
import FadeInView from '../components/FadeInView';
import PrimeHeader from '../components/prime/PrimeHeader';
import PrimeHero from '../components/prime/PrimeHero';
import PrimeSection from '../components/prime/PrimeSection';

type PrimeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Prime'>;

const PrimeScreen = () => {
    const navigation = useNavigation<PrimeScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [selectedProvider] = useState<string>('Prime');
    const [historySection, setHistorySection] = useState<Section | null>(null);
    const [watchlistSection, setWatchlistSection] = useState<Section | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [heroInWatchlist, setHeroInWatchlist] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        const history = await getHistory('Prime');
        if (history.length > 0) {
            setHistorySection({
                title: 'Keep watching',
                movies: history
            });
        } else {
            setHistorySection(null);
        }

        const watchlist = await getWatchlist('Prime');
        if (watchlist.length > 0) {
            setWatchlistSection({
                title: 'Your Watchlist',
                movies: watchlist
            });
        } else {
            setWatchlistSection(null);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Fetch Prime specific data
        const data = await fetchPrimeHomeData();

        const featuredSection = data.find(s => s.title === 'Featured');
        if (featuredSection && featuredSection.movies.length > 0) {
            const hero = featuredSection.movies[0];
            setHeroMovie(hero);
            setSections(data.filter(s => s.title !== 'Featured'));
            isInWatchlist(hero.id).then(inList => setHeroInWatchlist(inList));
        } else if (data.length > 0 && data[0].movies.length > 0) {
            const hero = data[0].movies[0];
            setHeroMovie(hero);
            setSections(data);
            isInWatchlist(hero.id).then(inList => setHeroInWatchlist(inList));
        } else {
            setSections(data);
            setHeroMovie(null);
        }

        setLoading(false);
    };

    const handleMoviePress = (movie: Movie) => {
        navigation.navigate('Details', {
            movieId: movie.id,
            providerId: selectedProvider,
            title: movie.title,
        });
    };

    const handleSearchPress = () => {
        navigation.navigate('Search', { initialProvider: 'Prime' });
    };

    const handleToggleHeroWatchlist = async () => {
        if (!heroMovie) return;

        if (heroInWatchlist) {
            await removeFromWatchlist(heroMovie.id);
            setHeroInWatchlist(false);
        } else {
            await addToWatchlist({ ...heroMovie, provider: selectedProvider }, 'movie');
            setHeroInWatchlist(true);
        }
    };

    const getFilteredSections = () => {
        if (activeCategory === 'All') return sections;

        return sections.filter(section => {
            const title = section.title.toLowerCase();
            if (activeCategory === 'Movies') {
                return title.includes('movie') || title.includes('film');
            } else if (activeCategory === 'Series') {
                return title.includes('series') || title.includes('tv') || title.includes('show') || title.includes('original');
            }
            return true;
        });
    };

    const filteredSections = getFilteredSections();

    const renderItem = useCallback(({ item, index }: { item: Section; index: number }) => {
        if (item.title === 'Keep watching') {
            return (
                <FadeInView delay={index * 100} slideUp duration={600}>
                    <PrimeSection
                        section={item}
                        onMoviePress={handleMoviePress}
                        variant="keep-watching"
                    />
                </FadeInView>
            );
        }
        return (
            <FadeInView delay={index * 100} slideUp duration={600}>
                <PrimeSection
                    section={item}
                    onMoviePress={handleMoviePress}
                    variant="standard"
                />
            </FadeInView>
        );
    }, [handleMoviePress]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00A8E1" />
            </View>
        );
    }

    return (
        <GradientBackground colors={['#000000', '#00152e', '#000000']} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={{ flex: 1 }}>
                <FlatList
                    data={
                        historySection || watchlistSection
                            ? [
                                ...(historySection ? [historySection] : []),
                                ...(watchlistSection ? [watchlistSection] : []),
                                ...filteredSections
                            ]
                            : filteredSections
                    }
                    keyExtractor={(item, index) => `${item.title}-${index}`}
                    renderItem={renderItem}
                    ListHeaderComponent={
                        heroMovie ? (
                            <FadeInView duration={800} slideUp>
                                <View style={styles.heroWrapper}>
                                    <PrimeHero
                                        movie={heroMovie}
                                        onPress={handleMoviePress}
                                        inWatchlist={heroInWatchlist}
                                        onToggleWatchlist={handleToggleHeroWatchlist}
                                    />
                                </View>
                            </FadeInView>
                        ) : null
                    }
                    contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={5}
                    ListEmptyComponent={
                        !loading && filteredSections.length === 0 ? (
                            <View style={styles.noContentContainer}>
                                <Text style={styles.noContentText}>No content available for {activeCategory}.</Text>
                                <Text style={styles.noContentSubText}>Try checking your internet connection or try again later.</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />

                {/* Header Overlay */}
                <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
                    <PrimeHeader
                        activeCategory={activeCategory}
                        onCategoryPress={setActiveCategory}
                        onSearchPress={handleSearchPress}
                    />
                </View>
            </View>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 100,
        height: 30,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    heroWrapper: {
        marginBottom: 20,
        alignItems: 'center',
    },
    noContentContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noContentText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'sans-serif',
    },
    noContentSubText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'sans-serif',
    },
    retryButton: {
        backgroundColor: '#00A8E1',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'sans-serif',
    },
});

export default PrimeScreen;
