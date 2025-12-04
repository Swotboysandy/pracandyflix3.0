import React, { useEffect, useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    View,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Text,
    Modal,
    TouchableWithoutFeedback,
    FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchHomeData, Section, Movie, fetchMovieDetails, getHistory } from '../services/api';
import { getWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/watchlistService';
import Row from '../components/Row';
import MovieItem from '../components/MovieItem';
import { RootStackParamList } from '../navigation/types';
import { LayoutGrid } from 'lucide-react-native';
import GradientBackground from '../components/GradientBackground';
import FadeInView from '../components/FadeInView';
import GlassHeader from '../components/GlassHeader';
import HomeSkeleton from '../components/HomeSkeleton';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ route }: any) => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [sections, setSections] = useState<Section[]>([]);
    const routeName = route?.name || 'HomeTab';
    const [loading, setLoading] = useState(true);
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [selectedProvider] = useState<string>('Netflix');
    const [isProviderModalVisible, setIsProviderModalVisible] = useState(false);
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
        const history = await getHistory('Netflix');
        if (history.length > 0) {
            setHistorySection({
                title: 'Continue Watching for You',
                movies: history
            });
        } else {
            setHistorySection(null);
        }

        const watchlist = await getWatchlist('Netflix');
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
        const data = await fetchHomeData();
        let filteredData = data;

        if (routeName === 'Movies') {
            filteredData = data.filter(s =>
                s.title.toLowerCase().includes('movie') ||
                s.title.toLowerCase().includes('film') ||
                s.title.toLowerCase().includes('hollywood') ||
                s.title.toLowerCase().includes('bollywood')
            );
        } else if (routeName === 'Series') {
            filteredData = data.filter(s =>
                s.title.toLowerCase().includes('series') ||
                s.title.toLowerCase().includes('tv') ||
                s.title.toLowerCase().includes('show') ||
                s.title.toLowerCase().includes('web')
            );
        }

        const displayData = filteredData.length > 0 ? filteredData : (routeName === 'HomeTab' ? data : []);

        const featuredSection = displayData.find(s => s.title === 'Featured');

        let heroSource = null;
        if (featuredSection && featuredSection.movies.length > 0) {
            heroSource = featuredSection.movies[0];
            setSections(displayData.filter(s => s.title !== 'Featured' && s.title !== 'API'));
        } else if (displayData.length > 0 && displayData[0].movies.length > 0) {
            heroSource = displayData[0].movies[0];
            setSections(displayData.filter(s => s.title !== 'API'));
        }
        if (heroSource) {
            setHeroMovie(heroSource);
            fetchMovieDetails(heroSource.id).then(details => {
                if (details && details.title) {
                    const d = details as any;
                    setHeroMovie({
                        ...heroSource,
                        title: details.title,
                        imageUrl: d.poster || d.image || heroSource.imageUrl || heroSource.originalImageUrl || d.backdrop,
                        tags: d.genre ? d.genre.split(',').slice(0, 3).join(' • ') : '',
                    } as any);
                }
            }).catch(() => { });

            const inList = await isInWatchlist(heroSource.id);
            setHeroInWatchlist(inList);
        } else {
            setHeroMovie(null);
            setSections(displayData.filter(s => s.title !== 'API'));
        }

        setLoading(false);
    };

    const handleMoviePress = (movie: Movie) => {
        navigation.navigate('Details', {
            movieId: movie.id,
            providerId: selectedProvider,
        });
    };

    const toggleProviderModal = () => {
        setIsProviderModalVisible(!isProviderModalVisible);
    };

    const switchProvider = (provider: 'Netflix' | 'Prime') => {
        setIsProviderModalVisible(false);
        if (provider === 'Prime') {
            navigation.navigate('Prime');
        }
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

    const renderItem = React.useCallback(({ item, index }: { item: Section; index: number }) => (
        <FadeInView delay={index * 100} slideUp duration={600}>
            <Row
                section={item}
                onMoviePress={handleMoviePress}
            />
        </FadeInView>
    ), [handleMoviePress]);

    if (loading) {
        return (
            <GradientBackground colors={['#39101E', '#080204']} style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <HomeSkeleton />
            </GradientBackground>
        );
    }

    const getFilteredSections = () => {
        let data = sections;
        if (activeCategory === 'Movies') {
            data = sections.filter(s => s.title.toLowerCase().includes('movie') || s.title.toLowerCase().includes('film'));
        } else if (activeCategory === 'Series') {
            data = sections.filter(s => s.title.toLowerCase().includes('series') || s.title.toLowerCase().includes('tv'));
        }
        return data;
    };

    const filteredSections = getFilteredSections();

    return (
        <GradientBackground colors={['#39101E', '#080204']} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={{ flex: 1 }}>
                <FlatList
                    data={[
                        ...(historySection ? [historySection] : []),
                        ...filteredSections
                    ]}
                    keyExtractor={(item, index) => `${item.title}-${index}`}
                    renderItem={({ item, index }) => (
                        <FadeInView delay={index * 100} slideUp duration={600}>
                            <Row
                                section={item}
                                onMoviePress={handleMoviePress}
                                variant={item.title === 'Continue Watching for You' ? 'continue-watching' : 'standard'}
                            />
                        </FadeInView>
                    )}
                    ListHeaderComponent={
                        heroMovie ? (
                            <FadeInView duration={800} slideUp>
                                <View style={styles.heroWrapper}>
                                    <MovieItem
                                        movie={heroMovie}
                                        onPress={handleMoviePress}
                                        isHero
                                        tags={(heroMovie as any).tags}
                                        inWatchlist={heroInWatchlist}
                                        onToggleWatchlist={handleToggleHeroWatchlist}
                                    />
                                </View>
                            </FadeInView>
                        ) : null
                    }
                    contentContainerStyle={[styles.scrollContent, { paddingTop: 40 + insets.top }]}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={5}
                />

                <GlassHeader
                    style={[styles.topBar, { paddingTop: insets.top + 10, paddingBottom: 10 }]}
                    intensity={80}
                    tint="dark"
                >
                    <View style={styles.headerContent}>
                        {routeName === 'HomeTab' ? (
                            <View style={styles.pillsContainer}>
                                {['All', 'Movies', 'Series'].map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={activeCategory === cat ? styles.activePill : styles.pill}
                                        onPress={() => setActiveCategory(cat)}
                                    >
                                        <Text style={activeCategory === cat ? styles.activePillText : styles.pillText}>
                                            {cat === 'Series' ? 'TV Shows' : cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View />
                        )}

                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/search--v1.png' }} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </GlassHeader>
            </View>

            <Modal
                visible={isProviderModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsProviderModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsProviderModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Provider</Text>

                                <TouchableOpacity
                                    style={[styles.providerOption, styles.activeProvider]}
                                    onPress={() => switchProvider('Netflix')}
                                >
                                    <Text style={[styles.providerText, styles.activeProviderText]}>Netflix</Text>
                                    <Text style={styles.checkmark}>✓</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.providerOption}
                                    onPress={() => switchProvider('Prime')}
                                >
                                    <Text style={styles.providerText}>Prime Video</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    icon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
    pillsContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    activePill: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    activePillText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 14,
    },
    pillText: {
        color: '#aaa',
        fontWeight: 'bold',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    heroWrapper: {
        marginBottom: 20,
        alignItems: 'center',
    },
    rowsContainer: {
        paddingBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 250,
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    providerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    activeProvider: {
        backgroundColor: '#333',
        marginHorizontal: -10,
        paddingHorizontal: 10,
        borderRadius: 5,
        borderBottomWidth: 0,
    },
    providerText: {
        color: '#aaa',
        fontSize: 16,
    },
    activeProviderText: {
        color: 'white',
        fontWeight: 'bold',
    },
    checkmark: {
        color: '#E50914',
        fontWeight: 'bold',
    },
});

export default HomeScreen;
