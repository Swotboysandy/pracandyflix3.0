import axios from 'axios';

export interface Movie {
    id: string;
    title: string;
    imageUrl: string;
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

const PROVIDERS_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/providers.json';
const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

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

        if (response.data && response.data.success && response.data.data) {
            const sections: Section[] = response.data.data.map((category: any) => ({
                title: category.title,
                movies: category.movies.map((item: any) => {
                    let imageUrl = item.imageUrl;
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
                    };
                }),
            }));

            return sections;
        }

        return [];
    } catch (error) {
        console.warn('Error fetching data:', error);
        return [];
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

export const fetchMovieDetails = async (id: string, providerId: string = 'Netflix', season?: string): Promise<MovieDetails | null> => {
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

        const streamBaseUrl = 'https://net51.cc';

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
        const formData = new FormData();
        formData.append('id', id);

        const playResponse = await axios.post(playUrl, formData, {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'multipart/form-data',
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
                'Referer': 'https://net51.cc/',
                'Origin': 'https://net51.cc',
            },
        });

        console.log('Playlist response:', JSON.stringify(playlistResponse.data, null, 2));

        const data = playlistResponse.data?.[0];

        if (data?.sources && data.sources.length > 0) {
            let streamUrl = data.sources[0].file;

            // If it's a relative path, prepend the stream base URL
            if (!streamUrl.startsWith('http')) {
                streamUrl = streamBaseUrl + streamUrl;
            }

            console.log('Final stream URL:', streamUrl);
            console.log('Using cookies:', cookies);

            return {
                url: streamUrl,
                sources: data.sources,
                tracks: data.tracks,
                cookies: cookies,
                referer: 'https://net51.cc/',
            };
        }

        console.log('No sources found in playlist response');

        // Fallback to Consumet if primary source fails
        console.log('Primary source failed, trying Consumet...');
        return await getConsumetStreamUrl(mainTitle || title, type, season, episode);

    } catch (error) {
        console.error('Error getting stream URL:', error);
        // Fallback to Consumet on error
        console.log('Primary source error, trying Consumet...');
        return await getConsumetStreamUrl(mainTitle || title, type, season, episode);
    }
};

const CONSUMET_URL = 'https://consumet.zendax.tech';

const getConsumetStreamUrl = async (
    query: string,
    type: 'movie' | 'tv' = 'movie',
    season?: number,
    episode?: number
): Promise<StreamResult | null> => {
    try {
        console.log(`Consumet: Searching for ${query} (${type})`);
        // 1. Search for the movie/show
        const searchUrl = `${CONSUMET_URL}/movies/flixhq/${encodeURIComponent(query)}`;
        const searchResponse = await axios.get(searchUrl);

        if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
            console.log('Consumet: No search results found');
            return null;
        }

        // Find best match (simple logic: first result or exact match)
        const match = searchResponse.data.results[0];
        console.log(`Consumet: Found match ${match.title} (${match.id})`);

        // 2. Get Info
        const infoUrl = `${CONSUMET_URL}/movies/flixhq/info/${match.id}`;
        const infoResponse = await axios.get(infoUrl);
        const info = infoResponse.data;

        let episodeId: string;

        if (type === 'tv') {
            if (!season || !episode) {
                console.log('Consumet: TV show requested but no season/episode provided');
                return null;
            }

            // Find the specific episode
            const targetEpisode = info.episodes.find((ep: any) => ep.season === season && ep.number === episode);
            if (!targetEpisode) {
                console.log(`Consumet: Season ${season} Episode ${episode} not found`);
                return null;
            }
            episodeId = targetEpisode.id;
        } else {
            // For movies, usually the episodeId is the movie ID or there's a single episode
            // FlixHQ structure for movies often has one "episode"
            if (info.episodes && info.episodes.length > 0) {
                episodeId = info.episodes[0].id;
            } else {
                episodeId = match.id; // Fallback
            }
        }

        console.log(`Consumet: Fetching stream for episodeId ${episodeId}`);

        // 3. Get Stream
        const watchUrl = `${CONSUMET_URL}/movies/flixhq/watch/${episodeId}`;
        const watchResponse = await axios.get(watchUrl);

        if (watchResponse.data.sources && watchResponse.data.sources.length > 0) {
            // Find best quality (m3u8)
            const source = watchResponse.data.sources.find((s: any) => s.quality === 'auto') || watchResponse.data.sources[0];

            return {
                url: source.url,
                cookies: '', // Consumet streams usually don't need cookies
            };
        }

        return null;

    } catch (error) {
        console.error('Consumet Error:', error);
        return null;
    }
};

export const searchMovies = async (query: string, providerId: string = 'Netflix'): Promise<Movie[]> => {
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
            const baseUrl = 'https://net51.cc';
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
};

export const fetchPrimeHomeData = async (): Promise<Section[]> => {
    try {
        const queries = [
            'Top Movies', 'Top Rated', 'Recently Added', 'English Movies',
            'Latest Movies', 'Top 10 India', 'Romance', 'Romantic Comedy',
            'Young Adult', 'Horror', 'Action', 'Thriller', 'Drama', 'Sci-Fi',
            'Adventure', 'Fantasy', 'Crime', 'Mystery', 'Documentary', 'Kids',
            'Hindi Movies', 'Telugu Movies', 'Tamil Movies', 'Malayalam Movies'
        ];

        // Fetch sequentially or with limited concurrency if needed, but for now let's just make sure one failure doesn't kill all
        const results = await Promise.all(
            queries.map(async (q) => {
                try {
                    const movies = await searchMovies(q, 'Prime');
                    return {
                        title: `${q} Movies`,
                        movies: movies
                    };
                } catch (e) {
                    console.error(`Failed to fetch Prime category: ${q}`, e);
                    return null;
                }
            })
        );

        return results
            .filter((section): section is Section => section !== null && section.movies.length >= 4);

    } catch (error) {
        console.error('Error fetching Prime home data:', error);
        return [];
    }
};

