import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Alert,
} from 'react-native';
import { fetchMovieDetails, MovieDetails, Episode, Season, SuggestedMovie, getStreamUrl } from '../services/api';

interface DetailsPageProps {
    movieId: string;
    onClose: () => void;
    onMoviePress: (id: string) => void;
    onPlay: (url: string, title: string, cookies: string) => void;
    isPrimeVideo?: boolean;
    isHotstar?: boolean;
}

const { width } = Dimensions.get('window');

const DetailsPage: React.FC<DetailsPageProps> = ({ movieId, onClose, onMoviePress, onPlay, isPrimeVideo = false, isHotstar = false }) => {
    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState<string>('1');
    const [loadingStream, setLoadingStream] = useState(false);
    const [loadingSeason, setLoadingSeason] = useState(false);

    useEffect(() => {
        const loadDetails = async () => {
            setLoading(true);
            const data = await fetchMovieDetails(movieId, isPrimeVideo, isHotstar);
            setDetails(data);
            setLoading(false);
        };
        loadDetails();
    }, [movieId, isPrimeVideo, isHotstar]);

    const handlePlayPress = async () => {
        if (!details) return;

        setLoadingStream(true);
        try {
            const streamResult = await getStreamUrl(movieId, details.title, isPrimeVideo, isHotstar);
            setLoadingStream(false);

            if (streamResult) {
                onPlay(streamResult.url, details.title, streamResult.cookies);
            } else {
                Alert.alert('Error', 'Failed to get stream URL');
            }
        } catch {
            setLoadingStream(false);
            Alert.alert('Error', 'Failed to get stream URL');
        }
    };

    const handleEpisodePress = async (episode: Episode) => {
        setLoadingStream(true);
        try {
            const streamResult = await getStreamUrl(episode.id, episode.t, isPrimeVideo, isHotstar);
            setLoadingStream(false);

            if (streamResult) {
                onPlay(streamResult.url, `${episode.s}:E${episode.ep} - ${episode.t}`, streamResult.cookies);
            } else {
                Alert.alert('Error', 'Failed to get stream URL');
            }
        } catch {
            setLoadingStream(false);
            Alert.alert('Error', 'Failed to get stream URL');
        }
    };

    const handleSeasonPress = async (season: Season) => {
        setLoadingSeason(true);
        setSelectedSeason(season.s);
        try {
            const data = await fetchMovieDetails(season.id, isPrimeVideo, isHotstar);
            if (data) {
                setDetails(data);
            }
        } catch (error) {
            console.error('Error loading season:', error);
        } finally {
            setLoadingSeason(false);
        }
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
    }

    if (!details) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load details</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderEpisode = (episode: Episode, _: number) => (
        <TouchableOpacity key={episode.id} style={styles.episodeCard} onPress={() => handleEpisodePress(episode)}>
            <View style={styles.episodeNumber}>
                <Text style={styles.episodeNumberText}>{episode.ep}</Text>
            </View>
            <View style={styles.episodeInfo}>
                <View style={styles.episodeHeader}>
                    <Text style={styles.episodeTitle}>{episode.t}</Text>
                    <Text style={styles.episodeTime}>{episode.time}</Text>
                </View>
                <Text style={styles.episodeDesc} numberOfLines={3}>
                    {episode.ep_desc}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderSuggestion = (movie: SuggestedMovie) => (
        <TouchableOpacity
            key={movie.id}
            style={styles.suggestionCard}
            onPress={() => onMoviePress(movie.id)}
        >
            <Image
                source={{ uri: `https://imgcdn.kim/poster/341/${movie.id}.jpg` }}
                style={styles.suggestionImage}
            />
            <View style={styles.suggestionInfo}>
                <View style={styles.suggestionHeader}>
                    <Text style={styles.suggestionMatch}>{movie.m}</Text>
                    <Text style={styles.suggestionYear}>{movie.y}</Text>
                </View>
                <Text style={styles.suggestionRuntime}>{movie.t}</Text>
                <Text style={styles.suggestionDesc} numberOfLines={3}>
                    {movie.d}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <ScrollView style={styles.scrollView}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: `https://imgcdn.kim/poster/v/${movieId}.jpg` }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.backButton} onPress={onClose}>
                        <Text style={styles.backButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Title and Info */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{details.title}</Text>
                    <View style={styles.metaInfo}>
                        <Text style={styles.match}>{details.match}</Text>
                        <Text style={styles.year}>{details.year}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{details.ua}</Text>
                        </View>
                        <Text style={styles.runtime}>{details.runtime}</Text>
                        <View style={styles.hdBadge}>
                            <Text style={styles.hdText}>{details.hdsd}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayPress}
                        disabled={loadingStream}
                    >
                        {loadingStream ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <>
                                <Text style={styles.playIcon}>▶</Text>
                                <Text style={styles.playButtonText}>Play</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.myListButton}>
                        <Text style={styles.myListIcon}>+</Text>
                        <Text style={styles.myListButtonText}>My List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                        <Text style={styles.shareIcon}>⤴</Text>
                        <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Description */}
                <Text style={styles.description}>{details.desc}</Text>

                {/* Cast */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Cast: </Text>
                    <Text style={styles.infoText}>{details.short_cast}</Text>
                </View>

                {/* Creator */}
                {details.creator && (
                    <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Creator: </Text>
                        <Text style={styles.infoText}>{details.creator}</Text>
                    </View>
                )}

                {/* Genre */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Genres: </Text>
                    <Text style={styles.infoText}>{details.genre}</Text>
                </View>

                {/* This movie is */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>This {details.type === 't' ? 'show' : 'movie'} is: </Text>
                    <Text style={styles.infoText}>{details.thismovieis}</Text>
                </View>

                {/* Maturity Rating */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Maturity rating: </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{details.ua}</Text>
                    </View>
                    <Text style={styles.infoText}> {details.m_desc}</Text>
                </View>

                {details.m_reason && (
                    <Text style={styles.reasonText}>{details.m_reason}</Text>
                )}

                {/* Episodes Section (for TV shows) */}
                {details.episodes && details.episodes.filter(ep => ep !== null).length > 0 && (
                    <View style={styles.episodesSection}>
                        <Text style={styles.sectionTitle}>Episodes</Text>

                        {/* Season Selector */}
                        {details.season && details.season.length > 1 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.seasonSelector}
                            >
                                {details.season.map((season) => (
                                    <TouchableOpacity
                                        key={season.id}
                                        style={[
                                            styles.seasonButton,
                                            selectedSeason === season.s && styles.seasonButtonActive,
                                        ]}
                                        onPress={() => handleSeasonPress(season)}
                                        disabled={loadingSeason}
                                    >
                                        <Text
                                            style={[
                                                styles.seasonButtonText,
                                                selectedSeason === season.s && styles.seasonButtonTextActive,
                                            ]}
                                        >
                                            Season {season.s}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Episodes List */}
                        {loadingSeason ? (
                            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#E50914" />
                            </View>
                        ) : (
                            <View style={styles.episodesList}>
                                {details.episodes.filter(ep => ep !== null).map((episode, index) => renderEpisode(episode, index))}
                            </View>
                        )}
                    </View>
                )}

                {/* More Like This */}
                {details.suggest && details.suggest.length > 0 && (
                    <View style={styles.suggestionsSection}>
                        <Text style={styles.sectionTitle}>More Like This</Text>
                        <View style={styles.suggestionsList}>
                            {details.suggest.filter(movie => movie !== null).map((movie) => renderSuggestion(movie))}
                        </View>
                    </View>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 20,
    },
    scrollView: {
        flex: 1,
    },
    heroContainer: {
        width: width,
        height: 550,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    titleContainer: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
    },
    match: {
        color: '#46d369',
        fontSize: 17,
        fontWeight: 'bold',
    },
    year: {
        color: '#fff',
        fontSize: 16,
    },
    badge: {
        borderWidth: 1,
        borderColor: '#999',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
    },
    badgeText: {
        color: '#999',
        fontSize: 12,
    },
    runtime: {
        color: '#fff',
        fontSize: 16,
    },
    hdBadge: {
        borderWidth: 1,
        borderColor: '#fff',
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    hdText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 10,
    },
    playButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
    },
    playIcon: {
        color: '#000',
        fontSize: 18,
        marginRight: 8,
    },
    playButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    myListButton: {
        backgroundColor: '#2a2a2a',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    myListIcon: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    myListButtonText: {
        color: '#fff',
        fontSize: 11,
    },
    shareButton: {
        backgroundColor: '#2a2a2a',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    shareIcon: {
        color: '#fff',
        fontSize: 20,
        marginBottom: 2,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 11,
    },
    description: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
        padding: 20,
        paddingTop: 15,
    },
    infoSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    infoLabel: {
        color: '#777',
        fontSize: 14,
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    reasonText: {
        color: '#777',
        fontSize: 12,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    episodesSection: {
        padding: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    seasonSelector: {
        marginBottom: 15,
    },
    seasonButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        marginRight: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#555',
        backgroundColor: '#141414',
    },
    seasonButtonActive: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    seasonButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    seasonButtonTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    episodesList: {
        gap: 15,
    },
    episodeCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        padding: 16,
        gap: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    episodeNumber: {
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 6,
        paddingVertical: 8,
    },
    episodeNumberText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    episodeInfo: {
        flex: 1,
    },
    episodeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    episodeTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    episodeTime: {
        color: '#999',
        fontSize: 14,
    },
    episodeDesc: {
        color: '#999',
        fontSize: 14,
        lineHeight: 20,
    },
    suggestionsSection: {
        padding: 20,
    },
    suggestionsList: {
        gap: 15,
    },
    suggestionCard: {
        flexDirection: 'row',
        gap: 15,
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    suggestionImage: {
        width: 130,
        height: 195,
    },
    suggestionInfo: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    suggestionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    suggestionMatch: {
        color: '#46d369',
        fontSize: 14,
        fontWeight: 'bold',
    },
    suggestionYear: {
        color: '#999',
        fontSize: 14,
    },
    suggestionRuntime: {
        color: '#999',
        fontSize: 12,
        marginBottom: 5,
    },
    suggestionDesc: {
        color: '#fff',
        fontSize: 13,
        lineHeight: 18,
    },
    closeButton: {
        backgroundColor: '#E50914',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 4,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomSpacer: {
        height: 50,
    },
});

export default DetailsPage;
