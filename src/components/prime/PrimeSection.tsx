import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Section, Movie } from '../../services/api';
import { Play } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface PrimeSectionProps {
    section: Section;
    onMoviePress: (movie: Movie) => void;
    variant?: 'keep-watching' | 'standard';
}

const PrimeSection = ({ section, onMoviePress, variant = 'standard' }: PrimeSectionProps) => {

    const renderItem = ({ item }: { item: Movie }) => {
        if (variant === 'keep-watching') {
            return (
                <TouchableOpacity
                    style={styles.keepWatchingCard}
                    onPress={() => onMoviePress(item)}
                    activeOpacity={0.8}
                >
                    <View style={styles.thumbnailWrapper}>
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                        <View style={styles.playOverlay}>
                            <View style={styles.playCircle}>
                                <Play size={16} color="black" fill="black" style={{ marginLeft: 2 }} />
                            </View>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: `${Math.min(Math.max(((item as any).progress / (item as any).duration) * 100, 0), 100)}%`
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.standardCard}
                onPress={() => onMoviePress(item)}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.poster}
                    resizeMode="cover"
                />
                <View style={styles.primeIconOverlay}>
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Amazon_Prime_Video_logo_%282024%29.svg/2048px-Amazon_Prime_Video_logo_%282024%29.svg.png' }}
                        style={styles.miniLogo}
                        resizeMode="contain"
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {variant === 'standard' && (
                    <View style={styles.primeHeaderBadge}>
                        <Image
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png' }}
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                    </View>
                )}
                <Text style={styles.title}>
                    {variant === 'keep-watching' ? 'Keep watching' : section.title}
                </Text>
            </View>

            <FlatList
                data={section.movies}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 25,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        gap: 8,
    },
    primeHeaderBadge: {
        backgroundColor: '#00A8E1',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLogo: {
        width: 12,
        height: 12,
        tintColor: 'white',
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 20,
        gap: 15,
    },
    // Keep Watching Styles
    keepWatchingCard: {
        width: width * 0.7, // Wider card
        height: width * 0.4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    thumbnailWrapper: {
        flex: 1,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    playCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#00A8E1',
    },
    // Standard Styles
    standardCard: {
        width: width * 0.28, // Smaller width to show 3 items
        height: width * 0.42, // Maintain aspect ratio
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    miniLogo: {
        width: 40,
        height: 20,
        tintColor: '#00A8E1',
    },
    primeIconOverlay: {
        position: 'absolute',
        top: 5,
        left: 5,
    }
});

export default PrimeSection;
