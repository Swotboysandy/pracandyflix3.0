import React, { useEffect, useState, useCallback } from 'react';
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
    BackHandler,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { fetchMovieDetails, MovieDetails, Episode, SuggestedMovie, getStreamUrl, Movie, getHistory } from '../services/api';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/watchlistService';
import VideoPlayer from './VideoPlayer';
import { Play, Plus, Star, ChevronDown, ChevronLeft, Check } from 'lucide-react-native';

interface DetailsPageProps {
    movieId: string;
    onClose: () => void;
    onMoviePress: (movie: Movie) => void;
    providerId?: string;
    title?: string;
}

const { width } = Dimensions.get('window');

const DetailsPage: React.FC<DetailsPageProps> = ({ movieId, onClose, onMoviePress, providerId = 'Netflix', title }) => {
    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState<string>('1');
    const [_loadingStream, setLoadingStream] = useState(false);
    const [videoStream, setVideoStream] = useState<{ url: string; cookies: string; title: string; referer?: string; sources?: any[]; tracks?: any[]; startTime?: number } | null>(null);
    const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
    const [_fetchedSeasons, setFetchedSeasons] = useState<Set<string>>(new Set());
    const [seasonLoading, setSeasonLoading] = useState(false);

    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
    const [activeTab, setActiveTab] = useState<string>('Overview');
    const [inWatchlist, setInWatchlist] = useState(false);
    const [resumeTime, setResumeTime] = useState<number>(0);

    // Determine tabs based on content type
    let tabs = (details?.type === 't' || details?.season)
        ? ['Episodes', 'Overview', 'Casts', 'Related']
        : ['Overview', 'Casts', 'Related'];

    if (providerId === 'Prime' || providerId === 'Prime Video') {
        tabs = tabs.filter(t => t !== 'Related');
    }

    const getPosterUrl = useCallback((id: string, type: 'poster' | 'hero') => {
        if (providerId === 'Hotstar') {
            return `https://imgcdn.media/hs/${type === 'hero' ? 'v' : 'v'}/${id}.jpg`;
        } else if (providerId === 'Prime' || providerId === 'Prime Video') {
            return `https://imgcdn.kim/pv/${type === 'hero' ? 'v' : 'v'}/${id}.jpg`;
        } else {
            return `https://imgcdn.kim/poster/${type === 'hero' ? 'v' : 'v'}/${id}.jpg`;
        }
    }, [providerId]);

    useEffect(() => {
        if (details) {
            // Default to Episodes for series, Overview for movies
            if (details.type === 't' || details.season) {
                setActiveTab('Episodes');
            } else {
                setActiveTab('Overview');
            }
        }
    }, [details]);

    useEffect(() => {
        loadDetails();
        checkWatchlistStatus();
        checkHistoryStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkHistoryStatus = async () => {
        const history = await getHistory(providerId);
        const item = history.find(h => h.id === movieId);
        if (item && item.progress > 10 && item.progress < (item.duration || 7200) * 0.95) {
            setResumeTime(item.progress);
        }
    };

    const checkWatchlistStatus = async () => {
        const status = await isInWatchlist(movieId);
        setInWatchlist(status);
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (videoStream) {
                handleCloseVideo();
                return true;
            }
            onClose();
            return true;
        });
        return () => backHandler.remove();
    }, [onClose, videoStream]);

    const renderEpisode = useCallback((episode: Episode, _index: number) => (
        <TouchableOpacity key={episode.id} style={styles.episodeCard} onPress={() => handleEpisodePress(episode)}>
            <View style={styles.episodeThumbnailContainer}>
                <FastImage
                    source={{ uri: getPosterUrl(movieId, 'hero'), priority: FastImage.priority.normal }}
                    style={styles.episodeThumbnail}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.episodePlayOverlay}>
                    <Play size={20} color="#fff" fill="#fff" />
                </View>
            </View>
            <View style={styles.episodeInfo}>
                <Text style={styles.episodeTitle}>Episode {episode.ep}</Text>
                <Text style={styles.episodeName} numberOfLines={1}>{episode.t}</Text>
                <Text style={styles.episodeDesc} numberOfLines={2}>
                    {episode.ep_desc || 'No description available.'}
                </Text>
            </View>

        </TouchableOpacity>
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [movieId, providerId, getPosterUrl]);

    const renderSuggestion = useCallback((movie: SuggestedMovie) => (
        <TouchableOpacity
            key={movie.id}
            style={styles.suggestionCard}
            onPress={() => onMoviePress({ id: movie.id, title: movie.t, imageUrl: `https://imgcdn.kim/poster/v/${movie.id}.jpg` })}
        >
            <Image
                source={{ uri: `https://imgcdn.kim/poster/v/${movie.id}.jpg` }}
                style={styles.suggestionImage}
                resizeMode="cover"
            />
        </TouchableOpacity>
    ), [onMoviePress]);

    const loadDetails = async () => {
        setLoading(true);
        const data = await fetchMovieDetails(movieId, providerId, undefined, title);
        setDetails(data);

        let initialEpisodes: Episode[] = [];
        if (data?.episodes && Array.isArray(data.episodes)) {
            // Filter out nulls
            initialEpisodes = data.episodes.filter(ep => ep !== null);
            setAllEpisodes(initialEpisodes);

            // Mark initial seasons as fetched
            const initialSeasons = new Set<string>();
            initialEpisodes.forEach(ep => {
                if (ep && ep.s) initialSeasons.add(String(ep.s));
            });
            setFetchedSeasons(initialSeasons);
        }

        if (data?.season && Array.isArray(data.season) && data.season.length > 0) {
            // Default to the first season in the list
            const firstSeason = String(data.season[0].s);
            setSelectedSeason(firstSeason);

            // Check if we have episodes for this season
            const hasEpisodes = initialEpisodes.some(ep => ep && String(ep.s) === String(firstSeason));
            if (!hasEpisodes) {
                console.log(`loadDetails: Auto-fetching episodes for default Season ${firstSeason}`);
                await fetchSeasonEpisodes(firstSeason, data);
            }
        }
        setLoading(false);
    };

    const fetchSeasonEpisodes = async (seasonStr: string, currentDetails: MovieDetails | null) => {
        if (!currentDetails || !currentDetails.season || !Array.isArray(currentDetails.season)) return;

        const seasonObj = currentDetails.season.find(s => String(s.s) === String(seasonStr));
        if (seasonObj) {
            setSeasonLoading(true);
            try {
                console.log(`fetchSeasonEpisodes: Fetching details for Season ${seasonStr}`);
                const seasonData = await fetchMovieDetails(movieId, providerId, seasonStr);

                if (seasonData && seasonData.episodes) {
                    console.log(`fetchSeasonEpisodes: Got ${seasonData.episodes.length} episodes`);

                    const fixedEpisodes = seasonData.episodes.map(ep => ({
                        ...ep,
                        s: seasonStr,
                        // Do NOT modify ID to ensure playback works
                        id: ep.id
                    }));

                    setAllEpisodes(prev => {
                        const validNewEpisodes = fixedEpisodes.filter(ep => ep !== null);
                        // Merge new episodes, avoiding duplicates by ID
                        const newEpisodes = validNewEpisodes.filter(newEp =>
                            !prev.some(existingEp => existingEp && existingEp.id === newEp.id)
                        );
                        return [...prev, ...newEpisodes];
                    });

                    setFetchedSeasons(prev => new Set(prev).add(seasonStr));
                }
            } catch (error) {
                console.error("Failed to fetch season episodes", error);
            } finally {
                setSeasonLoading(false);
            }
        }
    };

    const handleSeasonPress = async (seasonStr: string) => {
        console.log(`handleSeasonPress: Clicked Season ${seasonStr}`);
        setSelectedSeason(seasonStr);

        // Check if we already have episodes for this season
        const hasEpisodes = allEpisodes.some(ep => ep && String(ep.s) === String(seasonStr));

        if (!hasEpisodes) {
            await fetchSeasonEpisodes(seasonStr, details);
        }
    };

    const handleToggleWatchlist = async () => {
        if (!details) return;

        if (inWatchlist) {
            await removeFromWatchlist(movieId);
            setInWatchlist(false);
        } else {
            const movieItem: Movie = {
                id: movieId,
                title: details.title,
                imageUrl: getPosterUrl(movieId, 'poster'),
                provider: providerId,
            };
            const type = (details.type === 't' || details.season) ? 'series' : 'movie';
            await addToWatchlist(movieItem, type);
            setInWatchlist(true);
        }
    };

    const handlePlayPress = async (startTime?: number) => {
        if (!details) return;

        // If it's a series, try to find the first episode
        if (details.type === 't' || details.season) {
            // Find first episode (S1 E1 or just first in list)
            let targetEpisode = allEpisodes.find(ep => String(ep.s) === '1' && String(ep.ep) === '1');
            if (!targetEpisode && allEpisodes.length > 0) {
                targetEpisode = allEpisodes[0];
            }

            if (targetEpisode) {
                handleEpisodePress(targetEpisode);
                return;
            }

            if (allEpisodes.length === 0) {
                Alert.alert('Info', 'No episodes available to play.');
                return;
            }
        }

        setLoadingStream(true);
        try {
            const streamResult = await getStreamUrl(
                movieId,
                details.title,
                providerId,
                details.type === 't' ? 'tv' : 'movie',
                undefined,
                undefined,
                details.title
            );
            setLoadingStream(false);

            if (streamResult) {
                setVideoStream({
                    url: streamResult.url,
                    cookies: streamResult.cookies,
                    title: details.title,
                    referer: streamResult.referer,
                    sources: streamResult.sources,
                    tracks: streamResult.tracks,
                    startTime: startTime
                });
                setCurrentEpisode(null); // Movie has no episode
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
            const streamResult = await getStreamUrl(
                episode.id,
                episode.t,
                providerId,
                'tv',
                parseInt(episode.s),
                parseInt(episode.ep),
                details?.title
            );
            setLoadingStream(false);

            if (streamResult) {
                setVideoStream({
                    url: streamResult.url,
                    cookies: streamResult.cookies,
                    title: `${episode.s}:E${episode.ep} - ${episode.t}`,
                    referer: streamResult.referer,
                    sources: streamResult.sources,
                    tracks: streamResult.tracks,
                });
                setCurrentEpisode(episode);
            } else {
                Alert.alert('Error', 'Failed to get stream URL');
            }
        } catch {
            setLoadingStream(false);
            Alert.alert('Error', 'Failed to get stream URL');
        }
    };

    const handleCloseVideo = () => {
        setVideoStream(null);
        setCurrentEpisode(null);
    };

    const getNextEpisode = () => {
        if (!currentEpisode || allEpisodes.length === 0) return null;

        // Try to find next episode in same season
        const nextEpInSeason = allEpisodes.find(ep =>
            String(ep.s) === String(currentEpisode.s) &&
            parseInt(ep.ep) === parseInt(currentEpisode.ep) + 1
        );
        if (nextEpInSeason) return nextEpInSeason;

        // Try to find first episode of next season
        const nextSeason = parseInt(currentEpisode.s) + 1;
        const firstEpNextSeason = allEpisodes.find(ep =>
            parseInt(ep.s) === nextSeason &&
            parseInt(ep.ep) === 1
        );
        return firstEpNextSeason || null;
    };

    const handleNextEpisode = () => {
        const nextEp = getNextEpisode();
        if (nextEp) {
            handleEpisodePress(nextEp);
        }
    };

    // Show video player if video stream is available
    if (videoStream) {
        const nextEp = getNextEpisode();
        return (
            <VideoPlayer
                videoUrl={videoStream.url}
                title={videoStream.title}
                cookies={videoStream.cookies}
                referer={videoStream.referer}
                sources={videoStream.sources}
                tracks={videoStream.tracks}
                onClose={handleCloseVideo}
                onNextEpisode={nextEp ? handleNextEpisode : undefined}
                movieId={movieId}
                poster={getPosterUrl(movieId, 'poster')}
                provider={providerId}
                startTime={videoStream.startTime}
            />
        );
    }

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



    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <FastImage
                        source={{ uri: getPosterUrl(movieId, 'hero'), priority: FastImage.priority.high }}
                        style={styles.heroImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={styles.heroOverlay}>
                        <TouchableOpacity style={styles.heroPlayButton} onPress={() => handlePlayPress()}>
                            <View style={styles.playCircle}>
                                <Play size={32} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.backButton} onPress={onClose}>
                        <ChevronLeft color="#fff" size={28} />
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{details.title}</Text>
                        <TouchableOpacity style={styles.addButton} onPress={handleToggleWatchlist}>
                            {inWatchlist ? <Check color="#fff" size={24} /> : <Plus color="#fff" size={24} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{details.year}</Text>
                        <View style={styles.ageBadge}>
                            <Text style={styles.ageText}>{details.ua}</Text>
                        </View>
                        {details.season && Array.isArray(details.season) && (
                            <Text style={styles.metaText}>{details.season.length} SEASONS</Text>
                        )}
                        <View style={styles.hdBadge}>
                            <Text style={styles.hdText}>HD</Text>
                        </View>
                    </View>

                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={16} color="#FFD700" fill="#FFD700" style={{ marginRight: 2 }} />
                        ))}
                    </View>

                    <TouchableOpacity style={styles.longPlayButton} onPress={() => handlePlayPress(resumeTime > 0 ? resumeTime : undefined)}>
                        <Play size={24} color="#000" fill="#000" />
                        <Text style={styles.longPlayButtonText}>{resumeTime > 0 ? "Resume" : "Play"}</Text>
                    </TouchableOpacity>

                    <Text style={styles.description} numberOfLines={4}>
                        {details.desc}
                    </Text>

                    {/* Tabs / Content */}
                    <View style={styles.tabBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                        {tab}
                                    </Text>
                                    {activeTab === tab && <View style={styles.activeIndicator} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Tab Content */}
                    <View style={styles.tabContent}>
                        {/* Episodes Tab */}
                        {activeTab === 'Episodes' && details?.episodes && allEpisodes.length > 0 && (
                            <View style={styles.episodesSection}>
                                {/* Season Selector */}
                                {details.season && Array.isArray(details.season) && details.season.length > 0 && (
                                    <View style={styles.seasonSelectorContainer}>
                                        <TouchableOpacity style={styles.seasonDropdown}>
                                            <Text style={styles.seasonDropdownText}>Season {selectedSeason}</Text>
                                            <ChevronDown size={16} color="#fff" />
                                        </TouchableOpacity>
                                        <Text style={styles.episodeCountText}>{allEpisodes.length} Episodes</Text>
                                    </View>
                                )}

                                {/* Season List (Horizontal Scroll if multiple seasons) */}
                                {details.season && Array.isArray(details.season) && details.season.length > 1 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                                        {details.season.map((season) => (
                                            <TouchableOpacity
                                                key={season.id}
                                                style={[
                                                    styles.seasonButton,
                                                    selectedSeason === season.s && styles.seasonButtonActive,
                                                ]}
                                                onPress={() => handleSeasonPress(season.s)}
                                            >
                                                <Text style={[
                                                    styles.seasonButtonText,
                                                    selectedSeason === season.s && styles.seasonButtonTextActive,
                                                ]}>
                                                    S{season.s}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}

                                {/* Episodes List */}
                                {seasonLoading ? (
                                    <ActivityIndicator size="small" color="#E50914" style={styles.spinner} />
                                ) : (
                                    <View style={styles.episodesList}>
                                        {allEpisodes
                                            .filter(ep => ep !== null && String(ep.s).replace(/[^0-9]/g, '') === String(selectedSeason).replace(/[^0-9]/g, ''))
                                            .map((episode, index) => renderEpisode(episode, index))}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Other Tabs (Overview, Casts, etc) - Keeping existing logic but simplified UI */}
                        {activeTab === 'Overview' && (
                            <View>
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Genres: </Text>
                                    <Text style={styles.infoText}>{details.genre}</Text>
                                </View>
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>This {details.type === 't' ? 'show' : 'movie'} is: </Text>
                                    <Text style={styles.infoText}>{details.thismovieis}</Text>
                                </View>
                                <Text style={styles.descriptionText}>{details.m_desc}</Text>
                            </View>
                        )}

                        {activeTab === 'Casts' && (
                            <View>
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Cast: </Text>
                                    <Text style={styles.infoText}>{details.short_cast}</Text>
                                </View>
                                {details.creator && (
                                    <View style={styles.infoSection}>
                                        <Text style={styles.infoLabel}>Creator: </Text>
                                        <Text style={styles.infoText}>{details.creator}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'Reviews' && (
                            <View style={styles.placeholderContainer}>
                                <Text style={styles.placeholderText}>No reviews available yet.</Text>
                            </View>
                        )}

                        {activeTab === 'Related' && details.suggest && details.suggest.length > 0 && (
                            <View style={styles.suggestionsSection}>
                                <View style={styles.suggestionsList}>
                                    {details.suggest.filter(movie => movie !== null).map((movie) => renderSuggestion(movie))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
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
        textAlign: 'center',
        marginBottom: 20,
    },
    scrollView: {
        flex: 1,
    },
    heroContainer: {
        width: '100%',
        height: 300, // Taller hero
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroPlayButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent ring
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    playCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker inner circle
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    infoContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    metaText: {
        color: '#a3a3a3',
        fontSize: 14,
        fontWeight: '500',
    },
    ageBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    hdBadge: {
        borderWidth: 1,
        borderColor: '#a3a3a3',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
    },
    hdText: {
        color: '#a3a3a3',
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    description: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    tabBar: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    tabContainer: {
        paddingRight: 20,
    },
    tabItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    tabItemActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#E50914',
    },
    tabText: {
        color: '#a3a3a3',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tabTextActive: {
        color: '#fff',
    },
    activeIndicator: {
        // Handled by tabItemActive border
    },
    tabContent: {
        flex: 1,
    },
    episodesSection: {
        marginTop: 10,
    },
    seasonSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    seasonDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        gap: 8,
    },
    seasonDropdownText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    episodeCountText: {
        color: '#a3a3a3',
        fontSize: 14,
    },
    seasonSelector: {
        marginBottom: 15,
    },
    seasonButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: '#333',
    },
    seasonButtonActive: {
        backgroundColor: '#fff',
    },
    seasonButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    seasonButtonTextActive: {
        color: '#000',
    },
    episodesList: {
        gap: 15,
    },
    episodeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    episodeThumbnailContainer: {
        width: 120,
        height: 68,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        marginRight: 12,
    },
    episodeThumbnail: {
        width: '100%',
        height: '100%',
    },
    episodePlayOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    episodeInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    episodeTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    episodeName: {
        color: '#a3a3a3',
        fontSize: 13,
        marginBottom: 4,
    },
    episodeDesc: {
        color: '#777',
        fontSize: 12,
        lineHeight: 16,
    },
    downloadButton: {
        padding: 10,
    },
    infoSection: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        color: '#777',
        fontSize: 14,
        marginRight: 5,
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    reasonText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 10,
    },
    descriptionText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
        marginTop: 10,
    },
    spinner: {
        marginVertical: 20,
    },
    placeholderContainer: {
        padding: 40,
        alignItems: 'center',
    },
    placeholderText: {
        color: '#777',
    },
    suggestionsSection: {
        marginTop: 20,
    },
    suggestionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    suggestionCard: {
        width: (width - 60) / 3,
        marginBottom: 10,
    },
    longPlayButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 4,
        marginBottom: 16,
        gap: 8,
    },
    longPlayButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    suggestionImage: {
        width: '100%',
        height: 150,
        borderRadius: 4,
    },
    bottomSpacer: {
        height: 50,
    },
    closeButton: {
        backgroundColor: '#E50914',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default DetailsPage;
