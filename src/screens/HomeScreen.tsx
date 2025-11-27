import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchHomeData, Section, Movie } from '../services/api';
import Row from '../components/Row';
import MovieItem from '../components/MovieItem';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ route }: any) => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await fetchHomeData();
        let filteredData = data;

        if (route?.name === 'Movies') {
            filteredData = data.filter(s =>
                s.title.toLowerCase().includes('movie') ||
                s.title.toLowerCase().includes('film') ||
                s.title.toLowerCase().includes('hollywood') ||
                s.title.toLowerCase().includes('bollywood')
            );
        } else if (route?.name === 'Series') {
            filteredData = data.filter(s =>
                s.title.toLowerCase().includes('series') ||
                s.title.toLowerCase().includes('tv') ||
                s.title.toLowerCase().includes('show') ||
                s.title.toLowerCase().includes('web')
            );
        }

        // If filtering resulted in empty data, fallback to all data (or handle gracefully)
        // But for now, let's just use what we have. If empty, it will show empty.
        // However, we should probably ensure at least some data if possible, but strict filtering is safer.

        const displayData = filteredData.length > 0 ? filteredData : (route?.name === 'HomeTab' ? data : []);

        const featuredSection = displayData.find(s => s.title === 'Featured');
        if (featuredSection && featuredSection.movies.length > 0) {
            setHeroMovie(featuredSection.movies[0]);
            setSections(displayData.filter(s => s.title !== 'Featured'));
        } else if (displayData.length > 0 && displayData[0].movies.length > 0) {
            setHeroMovie(displayData[0].movies[0]);
            setSections(displayData);
        } else {
            setSections(displayData);
            setHeroMovie(null);
        }

        setLoading(false);
    };

    const handleMoviePress = (movie: Movie) => {
        navigation.navigate('Details', {
            movieId: movie.id,
            isPrimeVideo: movie.isPrimeVideo,
            isHotstar: movie.isHotstar,
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.background} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity>
                    <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu--v1.png' }} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/search--v1.png' }} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {heroMovie && (
                    <View style={styles.heroWrapper}>
                        <MovieItem movie={heroMovie} onPress={handleMoviePress} isHero />
                    </View>
                )}

                <View style={styles.rowsContainer}>
                    {sections.map((section, index) => (
                        <Row
                            key={`${section.title}-${index}`}
                            section={section}
                            onMoviePress={handleMoviePress}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#000',
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
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
});

export default HomeScreen;
