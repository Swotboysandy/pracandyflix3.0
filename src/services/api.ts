import axios from 'axios';

export interface Movie {
    id: string;
    title: string;
    imageUrl: string;
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

export const fetchMovieDetails = async (id: string): Promise<MovieDetails | null> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Fetch movie details with cookies
        const time = Date.now();
        const url = `https://net20.cc/post.php?id=${id}&t=${time}`;

        const response = await axios.get(url, {
            headers: {
                'Cookie': cookie,
                'Referer': 'https://net20.cc/home',
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

export const getStreamUrl = async (id: string, title: string = 'Movie'): Promise<string | null> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + 'ott=nf; hd=on;';

        // 2. POST to play.php to get the 'h' parameter
        const playUrl = 'https://net20.cc/play.php';
        const formData = new FormData();
        formData.append('id', id);

        const playResponse = await axios.post(playUrl, formData, {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Play response:', playResponse.data);

        if (!playResponse.data?.h) {
            throw new Error('Failed to get h parameter from play.php');
        }

        // 3. Make request to playlist.php with the h parameter
        const timestamp = Math.round(new Date().getTime() / 1000);
        const streamBaseUrl = 'https://net51.cc';
        const playlistUrl = `${streamBaseUrl}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;

        const playlistResponse = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': 'https://net51.cc/',
                'Origin': 'https://net51.cc',
            },
        });

        const data = playlistResponse.data?.[0];
        
        if (data?.sources && data.sources.length > 0) {
            let streamUrl = data.sources[0].file;
            
            // If it's a relative path, prepend the stream base URL
            if (!streamUrl.startsWith('http')) {
                streamUrl = streamBaseUrl + streamUrl;
            }
            
            return streamUrl;
        }

        return null;
    } catch (error) {
        console.error('Error getting stream URL:', error);
        return null;
    }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Perform Search
        const time = Date.now();
        const searchPageUrl = `https://net51.cc/search.php?s=${encodeURIComponent(query)}&t=${time}`;
        const finalUrl = `https://odd-cloud-1e14.hunternisha55.workers.dev/?url=${searchPageUrl}&cookie=${encodeURIComponent(cookie)}`;

        const response = await axios.get(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (response.data && response.data.searchResult) {
            return response.data.searchResult.map((item: any) => ({
                id: item.id,
                title: item.t,
                imageUrl: `https://img.nfmirrorcdn.top/poster/h/${item.id}.jpg`,
            }));
        }

        return [];
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
};
