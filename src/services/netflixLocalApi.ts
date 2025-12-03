import axios from 'axios';

// Change this to your machine's IP when testing on a physical device
// For emulator, use localhost:3000
// For physical device, use your computer's IP (e.g., 192.168.1.x:3000)
export let API_BASE_URL = 'http://192.168.29.193:3000/api';

export interface NetflixSearchResult {
    id: string;
    t: string;  // title
    y: string;  // year
    d: string;  // description
    ua: string; // rating
    m: string;  // type (movie/series)
}

export interface NetflixDetailsResponse {
    title: string;
    year: string;
    ua: string;
    match: string;
    runtime: string;
    type: string;
    creator: string;
    director: string;
    writer: string;
    short_cast: string;
    cast: string;
    genre: string;
    thismovieis: string;
    m_desc: string;
    desc: string;
    season?: Array<{
        s: string;
        id: string;
        ep: string;
    }>;
    suggest?: Array<{
        id: string;
        t: string;
        y: string;
        d: string;
        ua: string;
        m: string;
    }>;
}

export interface NetflixEpisode {
    id: string;
    t: string;      // title
    s: string;      // season
    ep: string;     // episode number
    ep_desc: string;
    time: string;
    complate: string;
}

export interface NetflixEpisodesResponse {
    episodes: NetflixEpisode[];
}

export interface NetflixStreamResponse {
    r: string;      // 'y' for yes, 'n' for no
    url?: string;
    error?: string;
}

/**
 * Search for Netflix content
 * @param query - Search query
 * @returns Array of search results
 */
export const searchNetflix = async (query: string): Promise<NetflixSearchResult[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: { q: query }
        });

        if (response.data && response.data.searchResult) {
            return response.data.searchResult;
        }

        return [];
    } catch (error) {
        console.error('Error searching Netflix:', error);
        throw error;
    }
};

/**
 * Get details for a specific video/series
 * @param videoId - The Netflix video ID
 * @returns Details object
 */
export const getNetflixDetails = async (videoId: string): Promise<NetflixDetailsResponse | null> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/details/${videoId}`);

        if (response.data) {
            return response.data;
        }

        return null;
    } catch (error) {
        console.error('Error fetching Netflix details:', error);
        throw error;
    }
};

/**
 * Get episodes for a series
 * @param seriesId - The Netflix series ID
 * @returns Episodes object
 */
export const getNetflixEpisodes = async (seriesId: string): Promise<NetflixEpisodesResponse | null> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/episodes/${seriesId}`);

        if (response.data) {
            return response.data;
        }

        return null;
    } catch (error) {
        console.error('Error fetching Netflix episodes:', error);
        throw error;
    }
};

/**
 * Get stream URL for a video
 * @param videoId - The Netflix video ID
 * @param hash - The site hash (required for streaming)
 * @returns Stream response
 */
export const getNetflixStream = async (videoId: string, hash: string): Promise<NetflixStreamResponse | null> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stream`, {
            params: {
                id: videoId,
                hash: hash
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching Netflix stream:', error);
        throw error;
    }
};

/**
 * Test all API endpoints
 */
export const testAllEndpoints = async () => {
    const results = {
        search: { status: 'pending' as const, data: null as any, error: null as any },
        details: { status: 'pending' as const, data: null as any, error: null as any },
        episodes: { status: 'pending' as const, data: null as any, error: null as any },
        stream: { status: 'pending' as const, data: null as any, error: null as any },
    };

    // Test Search
    try {
        console.log('Testing Search endpoint...');
        const searchResults = await searchNetflix('Stranger');
        (results.search.status as any) = 'success';
        results.search.data = searchResults;
        console.log('✓ Search endpoint working:', searchResults.length, 'results');
    } catch (error) {
        (results.search.status as any) = 'error';
        results.search.error = error;
        console.error('✗ Search endpoint failed:', error);
    }

    // Test Details
    try {
        console.log('Testing Details endpoint...');
        const details = await getNetflixDetails('80057281');
        (results.details.status as any) = 'success';
        results.details.data = details;
        console.log('✓ Details endpoint working:', details?.title);
    } catch (error) {
        (results.details.status as any) = 'error';
        results.details.error = error;
        console.error('✗ Details endpoint failed:', error);
    }

    // Test Episodes (use a series ID from search results if available)
    try {
        console.log('Testing Episodes endpoint...');
        const episodes = await getNetflixEpisodes('80057281');
        (results.episodes.status as any) = 'success';
        results.episodes.data = episodes;
        console.log('✓ Episodes endpoint working:', episodes?.episodes?.length, 'episodes');
    } catch (error) {
        (results.episodes.status as any) = 'error';
        results.episodes.error = error;
        console.error('✗ Episodes endpoint failed:', error);
    }

    // Test Stream (this will likely return {r: 'n'} due to server protections)
    try {
        console.log('Testing Stream endpoint...');
        const stream = await getNetflixStream('80057281', 'test-hash');
        (results.stream.status as any) = 'success';
        results.stream.data = stream;
        console.log('✓ Stream endpoint working:', stream);
    } catch (error) {
        (results.stream.status as any) = 'error';
        results.stream.error = error;
        console.error('✗ Stream endpoint failed:', error);
    }

    return results;
};

/**
 * Set the API base URL (useful for switching between localhost and IP address)
 * @param url - The new base URL (e.g., 'http://192.168.1.5:3000/api')
 */
export const setApiBaseUrl = (url: string) => {
    API_BASE_URL = url;
    console.log('Netflix Local API URL updated to:', url);
};
