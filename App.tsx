import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
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
import { fetchHomeData, Section, Movie } from './src/services/api';
import Row from './src/components/Row';
import MovieItem from './src/components/MovieItem';
import SplashScreen from './src/components/SplashScreen';

const { width } = Dimensions.get('window');

const App = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState('All');

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
    Alert.alert('Selected Movie', `ID: ${movie.id}\nTitle: ${movie.title}`);
  };

  // Show Splash Screen until animation finishes OR data is still loading (optional logic)
  // Usually we want to wait for animation to finish at least once.
  // If data loads fast, we wait for animation. If data is slow, we show loading indicator after animation?
  // Or just keep splash until data is ready AND animation is done.

  if (!splashFinished || loading) {
    // If data is ready but animation is not, we still show splash (handled by onAnimationFinish)
    // If animation is done but data is loading, we could show a spinner or keep the splash logo.
    // For a smooth experience, let's keep the splash view but maybe show a loading indicator if it takes too long?
    // For now, let's just rely on the SplashScreen component. 
    // We can pass a prop to SplashScreen to tell it to loop if data isn't ready, 
    // but the user asked for "custom by that get data".

    // Let's modify logic: 
    // 1. Render SplashScreen.
    // 2. When Animation finishes, check if loading is false. If yes, hide splash.
    // 3. If loading is true, maybe show a loading indicator on top of splash or loop?
    // For simplicity: Wait for both.

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

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu--v1.png' }} style={styles.icon} />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/799px-Netflix_2015_logo.svg.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity>
          <Image source={{ uri: 'https://img.icons8.com/color/48/000000/netflix-desktop-app.png' }} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryBar}>
        {['All', 'TV Shows', 'Movies', 'My List'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.categoryText, activeTab === tab && styles.activeCategoryText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/E50914/home.png' }} style={styles.navIcon} />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/search--v1.png' }} style={styles.navIcon} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/like--v1.png' }} style={styles.navIcon} />
          <Text style={styles.navText}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/download.png' }} style={styles.navIcon} />
          <Text style={styles.navText}>Downloads</Text>
        </TouchableOpacity>
      </View>

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
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  logo: {
    width: 100,
    height: 30,
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  categoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.7,
  },
  activeCategoryText: {
    fontWeight: 'bold',
    opacity: 1,
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
