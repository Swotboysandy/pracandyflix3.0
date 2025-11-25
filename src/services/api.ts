import axios from 'axios';

export interface Movie {
    id: string;
    title: string;
    imageUrl: string;
    isPrimeVideo?: boolean;
    isHotstar?: boolean;
}

export interface Section {
    title: string;
    movies: Movie[];
}

const HOME_DATA_URL = 'https://net-cookie-kacj.vercel.app/api/data';

export const fetchHomeData = async (): Promise<Section[]> => {
    try {
        const response = await axios.get(HOME_DATA_URL);

        if (response.data && response.data.success && response.data.data) {
            const sections: Section[] = response.data.data.map((category: any) => ({
                title: category.title,
                movies: category.movies.map((item: any) => ({
                    id: item.id,
                    title: item.title || item.id,
                    imageUrl: item.imageUrl,
                })),
            }));

            return sections;
        }

        return [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

const COOKIE_URL = 'https://anshu78780.github.io/json/cookies.json';

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
    nextPageShow?: number;
    nextPage?: number;
    nextPageSeason?: string;
    lang?: Array<{ l: string; s: string }>;
    last_ep?: string;
    resume?: string;
    suggest?: SuggestedMovie[];
    error: any;
}

export const fetchMovieDetails = async (id: string, isPrimeVideo: boolean = false, isHotstar: boolean = false): Promise<MovieDetails | null> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Fetch movie details with cookies
        const time = Math.round(Date.now() / 1000);
        const baseUrl = 'https://net20.cc';
        let url: string;
        let referer: string;
        
        if (isHotstar) {
            url = `${baseUrl}/hs/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/hs/home`;
        } else if (isPrimeVideo) {
            url = `${baseUrl}/pv/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/pv/home`;
        } else {
            url = `${baseUrl}/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/home`;
        }

        const response = await axios.get(url, {
            headers: {
                'Cookie': cookie,
                'Referer': referer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (response.data && response.data.status === 'y') {
            return response.data;
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

export interface StreamData {
    sources: StreamSource[];
    title?: string;
}

export interface StreamResult {
    url: string;
    cookies: string;
}

export const getStreamUrl = async (id: string, title: string = 'Movie', isPrimeVideo: boolean = false, isHotstar: boolean = false): Promise<StreamResult | null> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        let ott: string;
        if (isHotstar) {
            ott = 'hs';
        } else if (isPrimeVideo) {
            ott = 'pv';
        } else {
            ott = 'nf';
        }
        const cookies = baseCookie + `ott=${ott}; hd=on;`;

        const streamBaseUrl = 'https://net51.cc';

        // For Hotstar, use simplified approach without play.php
        if (isHotstar) {
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
                    cookies: cookies,
                };
            }

            console.log('No sources found in Hotstar playlist response');
            return null;
        }

        // For Prime Video, use simplified approach without play.php
        if (isPrimeVideo) {
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
                    cookies: cookies,
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
                cookies: cookies,
            };
        }

        console.log('No sources found in playlist response');
        return null;
    } catch (error) {
        console.error('Error getting stream URL:', error);
        return null;
    }
};

export const searchMovies = async (query: string, platform: 'netflix' | 'primevideo' | 'hotstar' = 'netflix'): Promise<Movie[]> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Perform Search
        const time = Date.now();
        let finalUrl: string;
        
        if (platform === 'hotstar') {
            // Use new Hotstar API endpoint
            finalUrl = `https://anshu-netmirror.hunternisha55.workers.dev/?q=${encodeURIComponent(query)}&cookie=${encodeURIComponent(cookie)}`;
        } else {
            const baseUrl = 'https://net51.cc';
            let searchPageUrl: string;
            
            if (platform === 'primevideo') {
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
                if (platform === 'hotstar') {
                    imageUrl = `https://imgcdn.media/hs/341/${item.id}.jpg`;
                } else if (platform === 'primevideo') {
                    imageUrl = `https://imgcdn.kim/pv/341/${item.id}.jpg`;
                } else {
                    imageUrl = `https://img.nfmirrorcdn.top/poster/h/${item.id}.jpg`;
                }
                
                return {
                    id: item.id,
                    title: item.t,
                    imageUrl: imageUrl,
                    isPrimeVideo: platform === 'primevideo',
                    isHotstar: platform === 'hotstar',
                };
            });
        }

        return [];
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
};
