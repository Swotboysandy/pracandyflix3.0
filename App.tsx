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
} from 'react-native';
import { fetchHomeData, Section, Movie } from './src/services/api';
import Row from './src/components/Row';
import MovieItem from './src/components/MovieItem';

const App = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchHomeData();

    // Find a hero section or use the first movie
    const featuredSection = data.find(s => s.title === 'Featured');
    if (featuredSection && featuredSection.movies.length > 0) {
      setHeroMovie(featuredSection.movies[0]);
      // Remove featured from the list if you don't want it duplicated, 
      // or keep it. Usually Featured is separate.
      setSections(data.filter(s => s.title !== 'Featured'));
    } else if (data.length > 0 && data[0].movies.length > 0) {
      // Fallback to first movie of first section
      setHeroMovie(data[0].movies[0]);
      setSections(data);
    } else {
      setSections(data);
    }

    setLoading(false);
  };

  const handleMoviePress = (movie: Movie) => {
    Alert.alert('Selected Movie', `ID: ${movie.id}\nTitle: ${movie.title}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.background}>

        {/* Navbar Placeholder */}
        <View style={styles.navbar}>
          <Text style={styles.logo}>NETFLIX</Text>
          <Text style={styles.navItem}>TV Shows</Text>
          <Text style={styles.navItem}>Movies</Text>
          <Text style={styles.navItem}>My List</Text>
        </View>

        {heroMovie && (
          <View style={styles.heroWrapper}>
            <MovieItem movie={heroMovie} onPress={handleMoviePress} isHero />
            <View style={styles.heroOverlay}>
              <View style={styles.heroButtons}>
                <View style={styles.playButton}>
                  <Text style={styles.playButtonText}>Play</Text>
                </View>
                <View style={styles.infoButton}>
                  <Text style={styles.infoButtonText}>My List</Text>
                </View>
              </View>
            </View>
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Netflix Clone Demo</Text>
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10, // Adjust for status bar if needed
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent', // Or semi-transparent
    height: 60,
  },
  logo: {
    color: '#E50914',
    fontSize: 24,
    fontWeight: '900',
    marginRight: 20,
  },
  navItem: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  heroWrapper: {
    position: 'relative',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    // Gradient could be added here if we had a gradient lib
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  playButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoButton: {
    backgroundColor: 'rgba(109, 109, 110, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  infoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rowsContainer: {
    marginTop: -20, // Pull up over the hero slightly if desired, or just 0
    paddingBottom: 40,
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
