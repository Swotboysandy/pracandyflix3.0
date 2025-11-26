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

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await fetchHomeData();

        const featuredSection = data.find(s => s.title === 'Featured');
        if (featuredSection && featuredSection.movies.length > 0) {
            setHeroMovie(featuredSection.movies[0]);
            setSections(data.filter(s => s.title !== 'Featured'));
        } else if (data.length > 0 && data[0].movies.length > 0) {
            setHeroMovie(data[0].movies[0]);
            setSections(data);
        } else {
            setSections(data);
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
