import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchHomeData, Section, Movie } from './src/services/api';
import Row from './src/components/Row';
import MovieItem from './src/components/MovieItem';
import SplashScreen from './src/components/SplashScreen';
import Search from './src/components/Search';
import DetailsPage from './src/components/DetailsPage';


const { width } = Dimensions.get('window');

const App = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Start fetching data immediately
    const data = await fetchHomeData();

    // Find a hero section or use the first movie
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

  const handleSplashFinish = () => {
    setSplashFinished(true);
  };

  const handleMoviePress = (movie: Movie) => {
    setSelectedMovieId(movie.id);
  };

  const handleCloseDetails = () => {
    setSelectedMovieId(null);
  };

  const handleDetailsMoviePress = (id: string) => {
    setSelectedMovieId(id);
  };

  if (!splashFinished || loading) {

    if (!splashFinished) {
      return <SplashScreen onFinish={handleSplashFinish} />;
    }

    // If splash finished but still loading data
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      );
    }
  }



  // Show details page if a movie is selected
  if (selectedMovieId) {
    return (
      <DetailsPage
        movieId={selectedMovieId}
        onClose={handleCloseDetails}
        onMoviePress={handleDetailsMoviePress}
      />
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu--v1.png' }} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSearchVisible(true)}>
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
    position: 'absolute', // Overlay on top of content if desired, or relative
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
    paddingBottom: 80, // Space for bottom nav
  },
  heroWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  rowsContainer: {
    paddingBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingVertical: 10,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  navText: {
    color: '#757575',
    fontSize: 10,
  },
  activeNavText: {
    color: '#E50914', // Netflix Red
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
  }
});

export default App;
