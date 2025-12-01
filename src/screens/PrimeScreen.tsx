import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Text,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchHomeData, fetchPrimeHomeData, Section, Movie } from '../services/api';
import Row from '../components/Row';
import MovieItem from '../components/MovieItem';
import { RootStackParamList } from '../navigation/types';
import { LayoutGrid } from 'lucide-react-native';
import GradientBackground from '../components/GradientBackground';
import FadeInView from '../components/FadeInView';
import GlassHeader from '../components/GlassHeader';

type PrimeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Prime'>;

const PrimeScreen = () => {
    const navigation = useNavigation<PrimeScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [selectedProvider] = useState<string>('Prime');
    const [isProviderModalVisible, setIsProviderModalVisible] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Fetch Prime specific data
        const data = await fetchPrimeHomeData();

        const featuredSection = data.find(s => s.title === 'Featured');
        if (featuredSection && featuredSection.movies.length > 0) {
            setHeroMovie(featuredSection.movies[0]);
            setSections(data.filter(s => s.title !== 'Featured'));
        } else if (data.length > 0 && data[0].movies.length > 0) {
            setHeroMovie(data[0].movies[0]);
            setSections(data);
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
        });
    };

    const toggleProviderModal = () => {
        setIsProviderModalVisible(!isProviderModalVisible);
    };

    const switchProvider = (provider: 'Netflix' | 'Prime') => {
        setIsProviderModalVisible(false);
        if (provider === 'Netflix') {
            navigation.navigate('Main'); // Navigate back to Home (Netflix)
        }
        // Already on Prime, do nothing
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00A8E1" />
            </View>
        );
    }

    return (
        <GradientBackground colors={['#002b5c', '#00152e', '#000000']} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={{ flex: 1 }}>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingTop: 80 + insets.top }]}
                >
                    {heroMovie && (
                        <FadeInView duration={800} slideUp>
                            <View style={styles.heroWrapper}>
                                <MovieItem movie={heroMovie} onPress={handleMoviePress} isHero />
                            </View>
                        </FadeInView>
                    )}

                    <View style={styles.rowsContainer}>
                        {sections.length === 0 ? (
                            <View style={styles.noContentContainer}>
                                <Text style={styles.noContentText}>No Prime content available.</Text>
                                <Text style={styles.noContentSubText}>Try checking your internet connection or try again later.</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            sections.map((section, index) => (
                                <FadeInView key={`${section.title}-${index}`} delay={index * 100} slideUp duration={600}>
                                    <Row
                                        section={section}
                                        onMoviePress={handleMoviePress}
                                    />
                                </FadeInView>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Glass Header */}
                <GlassHeader
                    style={[styles.topBar, { paddingTop: insets.top + 10, paddingBottom: 10 }]}
                    intensity={80}
                    tint="dark"
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={toggleProviderModal}>
                            <LayoutGrid color="white" size={24} />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png' }}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/search--v1.png' }} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </GlassHeader>
            </View>

            {/* Provider Switcher Modal */}
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
                                    style={styles.providerOption}
                                    onPress={() => switchProvider('Netflix')}
                                >
                                    <Text style={styles.providerText}>Netflix</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.providerOption, styles.activeProvider]}
                                    onPress={() => switchProvider('Prime')}
                                >
                                    <Text style={[styles.providerText, styles.activeProviderText]}>Prime Video</Text>
                                    <Text style={styles.checkmark}>✓</Text>
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
    logo: {
        width: 100,
        height: 30,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: 'white',
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
        fontFamily: 'sans-serif',
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
        fontFamily: 'sans-serif',
    },
    activeProviderText: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
    },
    checkmark: {
        color: '#00A8E1',
        fontWeight: 'bold',
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
