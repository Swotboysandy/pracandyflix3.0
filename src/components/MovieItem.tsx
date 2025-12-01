import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Movie } from '../services/api';
import { Play, Plus } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import ScalePressable from './ScalePressable';

interface MovieItemProps {
    movie: Movie;
    onPress: (movie: Movie) => void;
    isHero?: boolean;
    tags?: string;
    progress?: number; // 0 to 1
    progressColor?: string;
}

const { width } = Dimensions.get('window');

const MovieItem: React.FC<MovieItemProps> = ({ movie, onPress, isHero, tags, progress, progressColor = '#E50914' }) => {
    if (isHero) {
        // Check if title is just a number (ID) - hide title if true
        const isOnlyNumber = /^\d+$/.test(movie.title);

        return (
            <View style={styles.heroWrapper}>
                {/* Poster Container with Overlay Content */}
                <View style={styles.posterContainer}>
                    <FastImage
                        source={{ uri: movie.imageUrl, priority: FastImage.priority.high }}
                        style={styles.heroImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />

                    {/* Gradient Overlay */}
                    <View style={StyleSheet.absoluteFill}>
                        <Svg height="100%" width="100%">
                            <Defs>
                                <LinearGradient id="grad" x1="0" y1="0.75" x2="0" y2="1">
                                    <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                                    <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                                </LinearGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                        </Svg>
                    </View>

                    {/* Content Overlay */}
                    <View style={styles.overlayContent}>
                        {/* Movie Info - Always show metadata, conditionally show title */}
                        <View style={styles.movieInfo}>
                            {!isOnlyNumber && (
                                <Text style={styles.movieTitle} numberOfLines={2}>
                                    {movie.title}
                                </Text>
                            )}
                            <Text style={styles.movieMeta}>
                                {tags ? tags.replace(/,/g, ' • ') : 'Underrated • Dark • Drama • Detectives'}
                            </Text>
                        </View>

                        {/* Buttons */}
                        <View style={styles.heroButtons}>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={() => onPress(movie)}
                                activeOpacity={0.8}
                            >
                                <Play fill="#000" color="#000" size={18} />
                                <Text style={styles.playButtonText}>Play</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.listButton}
                                activeOpacity={0.8}
                            >
                                <Plus color="#fff" size={22} />
                                <Text style={styles.listButtonText}>My List</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScalePressable onPress={() => onPress(movie)} style={styles.container}>
            <FastImage
                source={{ uri: movie.imageUrl, priority: FastImage.priority.normal }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
            />
            {progress !== undefined && (
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
                                backgroundColor: progressColor
                            }
                        ]}
                    />
                </View>
            )}
        </ScalePressable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    image: {
        width: 90,
        height: 135,
        borderRadius: 4,
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#E50914',
    },
    heroWrapper: {
        width: width,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        alignItems: 'center',
    },
    posterContainer: {
        width: width - 40,
        height: (width - 40) * 1.5, // Increased height slightly as requested
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative', // Needed for absolute positioning of children
    },
    heroImage: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    overlayContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 8, // Reduced to 8 to bring content even further down
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    movieInfo: {
        width: '100%',
        marginBottom: 16,
        alignItems: 'center',
    },
    movieTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    movieMeta: {
        color: '#ddd',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    heroButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    playButton: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 4,
        gap: 8,
    },
    playButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    listButton: {
        flex: 1,
        backgroundColor: 'rgba(50, 50, 50, 0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 4,
        gap: 8,
    },
    listButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default React.memo(MovieItem);
