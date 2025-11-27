const axios = require('axios');

const PROVIDERS_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/providers.json';
const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const fetchMovieDetails = async (id, providerId = 'Netflix') => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Fetch movie details with cookies
        const time = Math.round(Date.now() / 1000);
        const baseUrl = 'https://net20.cc';
        let url;
        let referer;

        if (providerId === 'Hotstar') {
            url = `${baseUrl}/hs/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/hs/home`;
        } else if (providerId === 'Prime') {
            url = `${baseUrl}/pv/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/pv/home`;
        } else {
            url = `${baseUrl}/post.php?id=${id}&t=${time}`;
            referer = `${baseUrl}/home`;
        }

        console.log(`Fetching details from: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'Cookie': cookie,
                'Referer': referer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (response.data && response.data.status === 'y') {
            const data = response.data;
            data.provider = providerId;
            return data;
        }

        console.log('Response status not y:', response.data);
        return null;
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        return null;
    }
};

const searchMovies = async (query) => {
    try {
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;
        const time = Date.now();
        const baseUrl = 'https://net51.cc';
        const searchPageUrl = `${baseUrl}/search.php?s=${encodeURIComponent(query)}&t=${time}`;
        const finalUrl = `https://odd-cloud-1e14.hunternisha55.workers.dev/?url=${searchPageUrl}&cookie=${encodeURIComponent(cookie)}`;

        console.log(`Searching: ${finalUrl}`);
        const response = await axios.get(finalUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.data && response.data.searchResult) {
            return response.data.searchResult;
        }
        return [];
    } catch (error) {
        console.error('Error searching:', error.message);
        return [];
    }
};

const runDebug = async () => {
    console.log('Searching for "Stranger Things"...');
    const results = await searchMovies('Stranger Things');
    
    if (results.length === 0) {
        console.log('No results found.');
        return;
    }

    const firstResult = results[0];
    console.log(`Found: ${firstResult.t} (${firstResult.id})`);

    console.log('Fetching main details...');
    const details = await fetchMovieDetails(firstResult.id);

    if (!details) {
        console.log('Failed to fetch details.');
        return;
    }

    console.log(`Title: ${details.title}`);
    console.log(`Main Episodes Count: ${details.episodes ? details.episodes.length : 0}`);
    if (details.episodes && details.episodes.length > 0) {
        console.log('Main First Episode:', JSON.stringify(details.episodes[0], null, 2));
    }

    console.log(`Seasons: ${details.season ? details.season.length : 0}`);
    
    if (details.season && details.season.length > 0) {
        console.log('Season List:', JSON.stringify(details.season, null, 2));

        // Try to fetch the second season if available, or the last one
        const targetSeason = details.season.length > 1 ? details.season[1] : details.season[0];
        console.log(`Fetching details for Season ${targetSeason.s} (ID: ${targetSeason.id})...`);

        // Try fetching with main ID and s parameter
        console.log(`Attempting to fetch Season ${targetSeason.s} using main ID and s parameter...`);
        const time = Math.round(Date.now() / 1000);
        const urlWithS = `https://net20.cc/post.php?id=${details.id || firstResult.id}&t=${time}&s=${targetSeason.s}`;
        console.log(`Testing URL: ${urlWithS}`);
        
        try {
            const cookieResponse = await axios.get(COOKIE_URL);
            const cookie = cookieResponse.data.cookies;
            
            const responseS = await axios.get(urlWithS, {
                headers: {
                    'Cookie': cookie,
                    'Referer': 'https://net20.cc/home',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });
            
            if (responseS.data) {
                console.log('Response with s param:', JSON.stringify(responseS.data, null, 2));
            }
        } catch (e) {
            console.log('Error fetching with s param:', e.message);
        }
    }
};

runDebug();
