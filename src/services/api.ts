import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Movie {
    id: string;
    title: string;
    imageUrl: string;
    originalImageUrl?: string;
    provider?: string;
}

export interface Section {
    title: string;
    movies: Movie[];
}

export interface Provider {
    id: string;
    name: string;
    url: string;
}

export interface HistoryItem extends Movie {
    progress: number; // in seconds
    duration: number; // in seconds
    timestamp: number; // last watched time
    provider: string; // 'Netflix' or 'Prime'
}

const HISTORY_KEY = 'watch_history';

export const addToHistory = async (item: HistoryItem) => {
    try {
        const history = await getHistory();
        // Remove existing entry for this movie if it exists
        const filtered = history.filter(h => h.id !== item.id);
        // Add new item to the beginning
        const updated = [item, ...filtered];
        // Limit history to 20 items
        if (updated.length > 20) updated.pop();

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error adding to history:', error);
    }
};

export const getHistory = async (filterProvider?: string): Promise<HistoryItem[]> => {
    try {
        const json = await AsyncStorage.getItem(HISTORY_KEY);
        let history: HistoryItem[] = json ? JSON.parse(json) : [];

        if (filterProvider) {
            history = history.filter(item => {
                // Handle legacy items that might not have a provider (assume Netflix)
                const itemProvider = item.provider || 'Netflix';
                // Normalize provider names for comparison
                const p1 = itemProvider.toLowerCase().includes('prime') ? 'Prime' : 'Netflix';
                const p2 = filterProvider.toLowerCase().includes('prime') ? 'Prime' : 'Netflix';
                return p1 === p2;
            });
        }

        return history;
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
};

export const removeFromHistory = async (id: string) => {
    try {
        const history = await getHistory();
        const updated = history.filter(h => h.id !== id);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error removing from history:', error);
    }
};

const PROVIDERS_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/providers.json';
const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/hs.json';

export const fetchProviders = async (): Promise<Provider[]> => {
    try {
        const response = await axios.get(PROVIDERS_URL);
        const data = response.data;
        // Convert object to array
        return Object.keys(data).map(key => ({
            id: key,
            name: data[key].name,
            url: data[key].url
        }));
    } catch (error) {
        console.error('Error fetching providers:', error);
        // Fallback to default providers if fetch fails
        return [
            { id: 'Netflix', name: 'Netflix', url: 'https://net20.cc' },
            { id: 'Prime', name: 'Prime Video', url: 'https://net20.cc' },
            { id: 'Hotstar', name: 'Hotstar', url: 'https://net20.cc' }
        ];
    }
};

const HOME_DATA_URL = 'https://net-cookie-kacj.vercel.app/api/data';

export const fetchHomeData = async (): Promise<Section[]> => {
    try {
        const response = await axios.get(HOME_DATA_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        console.log('Home Data Response Status:', response.status);
        console.log('Home Data Response Keys:', Object.keys(response.data));
        if (response.data.success !== undefined) console.log('Success flag:', response.data.success);
        if (response.data.data) console.log('Data length:', response.data.data.length);

        if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
            const sections: Section[] = response.data.data.map((category: any) => ({
                title: category.title,
                movies: category.movies.map((item: any) => {
                    let imageUrl = item.imageUrl;
                    const originalImageUrl = item.imageUrl; // Store original

                    // Upgrade resolution if possible
                    if (imageUrl) {
                        imageUrl = imageUrl.replace('/poster/h/', '/poster/v/');
                        imageUrl = imageUrl.replace('/poster/m/', '/poster/v/');
                        imageUrl = imageUrl.replace('/341/', '/v/');
                    }
                    return {
                        id: item.id,
                        title: item.title || item.id,
                        imageUrl: imageUrl,
                        originalImageUrl: originalImageUrl,
                    };
                }),
            }));

            return sections;
        }

        console.log('fetchHomeData: Primary API returned empty data, using fallback.');
        throw new Error('Empty data from primary API');

    } catch (error) {
        console.warn('Error fetching data, using fallback:', error);

        // Fallback: Fetch categories manually using searchMovies
        const queries = [
            { q: 'Trending', title: 'Trending Now' },
            { q: 'Series', title: 'TV Series' },
            { q: 'Action', title: 'Action Movies' },
            { q: 'Comedy', title: 'Comedy Movies' },
            { q: 'Romance', title: 'Romance Movies' },
            { q: 'Horror', title: 'Horror Movies' },
            { q: 'Sci-Fi', title: 'Sci-Fi & Fantasy' },
            { q: 'Suspense', title: 'Thriller & Suspense' },
            { q: 'Drama Movies', title: 'Drama Movies' },
            { q: 'Mystery', title: 'Mystery' },
            { q: 'Crime', title: 'Crime' },
            { q: 'Anime', title: 'Anime' },
            { q: 'Kids', title: 'Kids & Family' },
            { q: 'Adventure', title: 'Adventure' },
        ];

        const BATCH_SIZE = 3;
        const results: (Section | null)[] = [];

        for (let i = 0; i < queries.length; i += BATCH_SIZE) {
            const batch = queries.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(async (item) => {
                    try {
                        const movies = await searchMovies(item.q, 'Netflix');
                        return {
                            title: item.title,
                            movies: movies
                        };
                    } catch (e) {
                        console.error(`Failed to fetch Netflix category: ${item.q}`, e);
                        return null;
                    }
                })
            );
            results.push(...batchResults);

            if (i + BATCH_SIZE < queries.length) {
                await new Promise(resolve => setTimeout(() => resolve(null), 500));
            }
        }

        const validSections = results.filter((section): section is Section => section !== null && section.movies.length > 0);

        // Manually construct "Top 10 Today" from the best of other sections
        const top10Movies: any[] = [];
        const seenIds = new Set();

        // 1. Take top 2 from Trending
        const trending = validSections.find(s => s.title === 'Trending Now');
        if (trending) {
            for (const m of trending.movies.slice(0, 2)) {
                if (!seenIds.has(m.id)) {
                    top10Movies.push(m);
                    seenIds.add(m.id);
                }
            }
        }

        // 2. Take top 1 from others until we have 10
        for (const section of validSections) {
            if (section.title === 'Trending Now') continue;
            for (const m of section.movies) {
                if (!seenIds.has(m.id)) {
                    top10Movies.push(m);
                    seenIds.add(m.id);
                    break;
                }
            }
            if (top10Movies.length >= 10) break;
        }

        if (top10Movies.length > 0) {
            validSections.unshift({
                title: 'Top 10 Today',
                movies: top10Movies
            });
        }

        return validSections;
    }
};
export interface Episode {
    complate: string;
    id: string;
    t: string;
    s: string;
    ep: string;
    ep_desc: string;
    time: string;
}

export interface Season {
    s: string;
    id: string;
    ep: string;
    sele?: string;
}

export interface SuggestedMovie {
    id: string;
    d: string;
    ua: string;
    t: string;
    y: string;
    m: string;
}

export interface MovieDetails {
    status: string;
    d_lang: string;
    title: string;
    year: string;
    ua: string;
    match: string;
    runtime: string;
    hdsd: string;
    type: string;
    creator: string;
    director: string;
    writer: string;
    short_cast: string;
    cast: string;
    genre: string;
    thismovieis: string;
    m_desc: string;
    m_reason: string;
    desc: string;
    season?: Season[];
    episodes?: Episode[];
    nextPageSeason?: string;
    lang?: Array<{ l: string; s: string }>;
    last_ep?: string;
    resume?: string;
    suggest?: SuggestedMovie[];
    error: any;
    provider?: string;
}

export const fetchMovieDetails = async (id: string, providerId: string = 'Netflix', season?: string, title?: string): Promise<MovieDetails | null> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Fetch movie details with cookies
        const time = Math.round(Date.now() / 1000);
        const baseUrl = 'https://net20.cc';
        let url: string;
        let referer: string;
        let basePath = '';

        if (providerId === 'Hotstar') {
            basePath = '/hs';
            url = `${baseUrl}/hs/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/hs/home`;
        } else if (providerId === 'Prime') {
            basePath = '/pv';
            url = `${baseUrl}/pv/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/pv/home`;
        } else {
            url = `${baseUrl}/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/home`;
        }

        // Note: We do NOT append &s= to post.php anymore, as we handle season fetching via episodes.php

        const headers = {
            'Cookie': cookie,
            'Referer': referer,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        const response = await axios.get(url, { headers });

        if (response.data) {
            let data = response.data;

            // Handle nested 'movie' object if present
            if (data.movie) {
                data = data.movie;
            }

            // Basic validation to ensure we have some data
            if (data.id || data.title || data.episodes) {
                // Set provider
                data.provider = providerId;

                // 3. Handle Season Selection
                if (season && data.season && Array.isArray(data.season)) {
                    // Find the season ID for the requested season number
                    // season arg might be "1" or "Season 1" or the ID itself.
                    const targetSeason = data.season.find((s: any) =>
                        String(s.s) === String(season) ||
                        String(s.id) === String(season) ||
                        `Season ${s.s}` === season
                    );

                    if (targetSeason) {
                        console.log(`fetchMovieDetails: Fetching episodes for season ${season} (ID: ${targetSeason.id})`);
                        const episodesUrl = `${baseUrl}${basePath}/episodes.php?s=${targetSeason.id}&t=${time}&page=1`;

                        try {
                            const epResponse = await axios.get(episodesUrl, { headers });
                            if (epResponse.data && epResponse.data.episodes) {
                                console.log(`fetchMovieDetails: Found ${epResponse.data.episodes.length} episodes for season ${season}`);
                                data.episodes = epResponse.data.episodes;
                            } else {
                                console.log('fetchMovieDetails: No episodes found in season response');
                            }
                        } catch (epError) {
                            console.error('fetchMovieDetails: Error fetching season episodes:', epError);
                        }
                    } else {
                        console.log(`fetchMovieDetails: Season ${season} not found in season list`);
                    }
                }

                // 4. Fallback for Related Content (Suggest)
                const searchTitle = data.title || title;
                console.log(`fetchMovieDetails: Checking related content. suggest length: ${data.suggest?.length}, searchTitle: ${searchTitle}`);

                if ((!data.suggest || data.suggest.length === 0) && searchTitle) {
                    try {
                        console.log(`fetchMovieDetails: No related content found, searching for "${searchTitle}"`);
                        // Search for the title to get related items
                        const searchResults = await searchMovies(searchTitle, providerId);
                        console.log(`fetchMovieDetails: Search results for "${searchTitle}": ${searchResults.length} items`);

                        // Filter out the current movie and map to SuggestedMovie format
                        data.suggest = searchResults
                            .filter(m => m.id !== id)
                            .map(m => ({
                                id: m.id,
                                t: m.title,
                                d: '',
                                ua: '',
                                y: '',
                                m: ''
                            }));

                        console.log(`fetchMovieDetails: Mapped ${data.suggest.length} related items`);

                        // If still empty (e.g. unique title), try searching for genre if available
                        if (data.suggest.length === 0 && data.genre) {
                            const firstGenre = data.genre.split(',')[0].trim();
                            if (firstGenre) {
                                console.log(`fetchMovieDetails: Still no related content, searching for genre "${firstGenre}"`);
                                const genreResults = await searchMovies(firstGenre, providerId);
                                console.log(`fetchMovieDetails: Genre search results for "${firstGenre}": ${genreResults.length} items`);

                                data.suggest = genreResults
                                    .filter(m => m.id !== id)
                                    .map(m => ({
                                        id: m.id,
                                        t: m.title,
                                        d: '',
                                        ua: '',
                                        y: '',
                                        m: ''
                                    }));
                            }
                        }

                        console.log(`fetchMovieDetails: Populated ${data.suggest.length} related items via fallback`);
                    } catch (err) {
                        console.warn('fetchMovieDetails: Failed to populate fallback related content', err);
                    }
                }

                return data;
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
};

export interface StreamSource {
    file: string;
    label?: string;
    type?: string;
}

export interface StreamTrack {
    file: string;
    label: string;
    kind: string;
    default?: boolean;
}

export interface StreamData {
    sources: StreamSource[];
    tracks?: StreamTrack[];
    title?: string;
}

export interface StreamResult {
    url: string; // Keep for backward compatibility or primary stream
    sources?: StreamSource[];
    tracks?: StreamTrack[];
    cookies: string;
    referer?: string;
}

export const getStreamUrl = async (
    id: string,
    title: string = 'Movie',
    providerId: string = 'Netflix',
    type: 'movie' | 'tv' = 'movie',
    season?: number,
    episode?: number,
    mainTitle?: string
): Promise<StreamResult | null> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        let ott: string;
        if (providerId === 'Hotstar') {
            ott = 'hs';
        } else if (providerId === 'Prime') {
            ott = 'pv';
        } else {
            ott = 'nf';
        }
        const cookies = baseCookie + `ott=${ott}; hd=on;`;

        const streamBaseUrl = 'https://net20.cc';

        // For Hotstar, use simplified approach without play.php
        if (providerId === 'Hotstar') {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const playlistUrl = `${streamBaseUrl}/hs/playlist.php?id=${id}&t=${timestamp}`;

            console.log('Hotstar Playlist URL:', playlistUrl);

            const playlistResponse = await axios.get(playlistUrl, {
                headers: {
                    'Cookie': cookies,
                    'Referer': `${streamBaseUrl}/`,
                },
            });

            console.log('Hotstar Playlist response:', JSON.stringify(playlistResponse.data, null, 2));

            const data = playlistResponse.data?.[0];

            if (data?.sources && data.sources.length > 0) {
                let streamUrl = data.sources[0].file;

                // If it's a relative path, prepend the stream base URL
                if (!streamUrl.startsWith('http')) {
                    streamUrl = streamBaseUrl + streamUrl;
                }

                // Fix duplicate /mobile path issue
                streamUrl = streamUrl.replace(/\/mobile\/+mobile/g, '/mobile');
                while (streamUrl.includes('//mobile')) {
                    streamUrl = streamUrl.replace('//mobile', '/mobile');
                }

                console.log('Final Hotstar stream URL:', streamUrl);
                console.log('Using cookies:', cookies);

                return {
                    url: streamUrl,
                    sources: data.sources,
                    tracks: data.tracks,
                    cookies: cookies,
                    referer: `${streamBaseUrl}/`,
                };
            }

            console.log('No sources found in Hotstar playlist response');
            return null;
        }

        // For Prime Video, use simplified approach without play.php
        if (providerId === 'Prime') {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const playlistUrl = `${streamBaseUrl}/pv/playlist.php?id=${id}&t=${timestamp}`;

            console.log('PV Playlist URL:', playlistUrl);

            const playlistResponse = await axios.get(playlistUrl, {
                headers: {
                    'Cookie': cookies,
                    'Referer': `${streamBaseUrl}/`,
                },
            });

            console.log('PV Playlist response:', JSON.stringify(playlistResponse.data, null, 2));

            const data = playlistResponse.data?.[0];

            if (data?.sources && data.sources.length > 0) {
                let streamUrl = data.sources[0].file;

                // If it's a relative path, prepend the stream base URL
                if (!streamUrl.startsWith('http')) {
                    streamUrl = streamBaseUrl + streamUrl;
                }

                // Fix duplicate /mobile path issue
                streamUrl = streamUrl.replace(/\/mobile\/+mobile/g, '/mobile');
                while (streamUrl.includes('//mobile')) {
                    streamUrl = streamUrl.replace('//mobile', '/mobile');
                }

                console.log('Final PV stream URL:', streamUrl);
                console.log('Using cookies:', cookies);

                return {
                    url: streamUrl,
                    sources: data.sources,
                    tracks: data.tracks,
                    cookies: cookies,
                    referer: `${streamBaseUrl}/`,
                };
            }

            console.log('No sources found in PV playlist response');
            return null;
        }

        // For Netflix, use the original flow with play.php
        // 2. POST to play.php to get the 'h' parameter
        const baseUrl = 'https://net20.cc';
        const playUrl = `${baseUrl}/play.php`;

        const params = new URLSearchParams();
        params.append('id', id);

        const playResponse = await axios.post(playUrl, params.toString(), {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log('Play response:', playResponse.data);
        console.log('Play response h parameter:', playResponse.data?.h);

        if (!playResponse.data?.h) {
            throw new Error('Failed to get h parameter from play.php');
        }

        // 3. Make request to playlist.php with the h parameter
        const timestamp = Math.round(new Date().getTime() / 1000);
        const playlistUrl = `${streamBaseUrl}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;

        console.log('Playlist URL:', playlistUrl);

        const playlistResponse = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': 'https://net20.cc/',
            },
        });

        console.log('Playlist response:', JSON.stringify(playlistResponse.data, null, 2));

        const data = playlistResponse.data?.[0];

        if (data?.sources && data.sources.length > 0) {
            // Convert all relative paths to absolute URLs
            const absoluteSources = data.sources.map((source: any) => ({
                ...source,
                file: source.file.startsWith('http') ? source.file : streamBaseUrl + source.file
            }));

            let streamUrl = absoluteSources[0].file;

            console.log('Final stream URL:', streamUrl);
            console.log('Using cookies:', cookies);

            return {
                url: streamUrl,
                sources: absoluteSources,
                tracks: data.tracks,
                cookies: cookies,
                referer: 'https://net20.cc/',
            };
        }

        console.log('No sources found in playlist response');
        return null;

    } catch (error) {
        console.error('Error getting stream URL:', error);
        return null;
    }
};

export async function searchMovies(query: string, providerId: string = 'Netflix'): Promise<Movie[]> {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Perform Search
        const time = Date.now();
        let finalUrl: string;

        if (providerId === 'Hotstar') {
            // Use new Hotstar API endpoint
            finalUrl = `https://anshu-netmirror.hunternisha55.workers.dev/?q=${encodeURIComponent(query)}&cookie=${encodeURIComponent(cookie)}`;
        } else {
            const baseUrl = 'https://net20.cc';
            let searchPageUrl: string;

            if (providerId === 'Prime') {
                searchPageUrl = `${baseUrl}/pv/search.php?s=${encodeURIComponent(query)}&t=${time}`;
            } else {
                searchPageUrl = `${baseUrl}/search.php?s=${encodeURIComponent(query)}&t=${time}`;
            }

            finalUrl = `https://odd-cloud-1e14.hunternisha55.workers.dev/?url=${searchPageUrl}&cookie=${encodeURIComponent(cookie)}`;
        }

        const response = await axios.get(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (response.data && response.data.searchResult) {
            return response.data.searchResult.map((item: any) => {
                let imageUrl: string;
                if (providerId === 'Hotstar') {
                    imageUrl = `https://imgcdn.media/hs/v/${item.id}.jpg`;
                } else if (providerId === 'Prime') {
                    imageUrl = `https://imgcdn.kim/pv/v/${item.id}.jpg`;
                } else {
                    imageUrl = `https://img.nfmirrorcdn.top/poster/v/${item.id}.jpg`;
                }

                return {
                    id: item.id,
                    title: item.t,
                    imageUrl: imageUrl,
                    provider: providerId,
                };
            });
        }

        return [];
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}

export const fetchPrimeHomeData = async (): Promise<Section[]> => {
    try {
        const queries = [
            { q: 'Action', title: 'Action', type: 'movie' },
            { q: 'Comedy', title: 'Comedy', type: 'movie' },
            { q: 'Drama Movies', title: 'Drama Movies', type: 'movie' },
            { q: 'Best Drama', title: 'Best Drama', type: 'movie' },
            { q: 'Thriller', title: 'Thriller', type: 'movie' },
            { q: 'Horror', title: 'Horror', type: 'movie' },
            { q: 'Romance', title: 'Romance', type: 'movie' },
            { q: 'Sci-Fi', title: 'Sci-Fi', type: 'movie' },
            { q: 'Kids', title: 'Kids & Family', type: 'mixed' },
            { q: 'Top Movies', title: 'Top Movies', type: 'movie' },
            { q: 'Top Series', title: 'Top Series', type: 'series' },
            { q: 'Amazon Originals', title: 'Amazon Originals', type: 'series' },
            { q: 'Recently Added', title: 'Recently Added', type: 'mixed' },
            { q: 'English Movies', title: 'English Movies', type: 'movie' },
            { q: 'Hindi Movies', title: 'Hindi Movies', type: 'movie' },
            { q: 'Telugu Movies', title: 'Telugu Movies', type: 'movie' },
            { q: 'Tamil Movies', title: 'Tamil Movies', type: 'movie' },
            { q: 'Malayalam Movies', title: 'Malayalam Movies', type: 'movie' },
        ];

        // Fetch in batches to avoid rate limiting
        const BATCH_SIZE = 2;
        const results: (Section | null)[] = [];

        for (let i = 0; i < queries.length; i += BATCH_SIZE) {
            const batch = queries.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(async (item) => {
                    try {
                        const movies = await searchMovies(item.q, 'Prime');
                        return {
                            title: item.title,
                            movies: movies
                        };
                    } catch (e) {
                        console.error(`Failed to fetch Prime category: ${item.q}`, e);
                        return null;
                    }
                })
            );
            results.push(...batchResults);

            // Delay between batches
            if (i + BATCH_SIZE < queries.length) {
                await new Promise(resolve => setTimeout(() => resolve(null), 1000));
            }
        }

        return results
            .filter((section): section is Section => section !== null && section.movies.length >= 1);

    } catch (error) {
        console.error('Error fetching Prime home data:', error);
        return [];
    }
};
