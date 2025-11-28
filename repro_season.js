const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const fetchMovieDetails = async (id, providerId = 'Netflix', season) => {
    try {
        console.log(`Fetching details for ID: ${id}, Season: ${season}`);
        
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        // 2. Fetch movie details with cookies
        const time = Math.round(Date.now() / 1000);
        const baseUrl = 'https://net20.cc';
        let url = `${baseUrl}/post.php?id=${id}&t=${time}`;

        if (season) {
            url += `&s=${season}`;
        }

        console.log(`Request URL: ${url}`);

        const formData = new FormData();
        if (season) {
            formData.append('s', season);
        }

        const response = await axios.post(url, formData, {
            headers: {
                'Cookie': cookie,
                'Referer': `${baseUrl}/home`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data) {
            let data = response.data;
            console.log('Raw Response Status:', data.status);
            
            // Handle nested 'movie' object if present
            if (data.movie) {
                console.log('Found nested "movie" object');
                data = data.movie;
            } else {
                console.log('No nested "movie" object found');
            }

            // Log keys to see what we have
            console.log('Data Keys:', Object.keys(data));
            
            if (data.episodes) {
                console.log(`Episodes found: ${data.episodes.length}`);
                if (data.episodes.length > 0) {
                    const firstEp = data.episodes[0];
                    if (firstEp) {
                        console.log('First Episode s value:', JSON.stringify(firstEp.s));
                        console.log('First Episode Title:', JSON.stringify(firstEp.t));
                        // console.log('First Episode full:', JSON.stringify(firstEp, null, 2));
                    } else {
                        console.log('First Episode is NULL');
                    }
                    
                    // Check if all episodes match the requested season
                    if (season) {
                        const matching = data.episodes.filter(ep => String(ep.s) === String(season));
                        console.log(`Episodes matching season ${season}: ${matching.length}`);
                        
                        if (matching.length === 0) {
                            console.log('WARNING: No episodes match the requested season!');
                            console.log('All episode s values:', data.episodes.map(ep => ep.s));
                        }
                    }
                }
            } else {
                console.log('No episodes found in data');
            }

            // Basic validation to ensure we have some data
            if (data.id || data.title || data.episodes) {
                return data;
            } else {
                console.log('Validation failed: Missing id, title, or episodes');
            }
        } else {
            console.log('No response data');
        }

        return null;
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        return null;
    }
};

// Test with a known show ID (e.g., Stranger Things or whatever was in debug_seasons.js)
// I'll use a hardcoded ID if I can find one, or search first.
// Let's try to search first to get a valid ID.

const searchAndTest = async () => {
    try {
        // Search for "Stranger Things"
        const searchUrl = `https://odd-cloud-1e14.hunternisha55.workers.dev/?url=${encodeURIComponent('https://net51.cc/search.php?s=Stranger%20Things&t=' + Date.now())}&cookie=`;
        const searchRes = await axios.get(searchUrl);
        
        if (searchRes.data && searchRes.data.searchResult && searchRes.data.searchResult.length > 0) {
            const show = searchRes.data.searchResult[0];
            console.log(`Found Show: ${show.t} (${show.id})`);
            
            // Fetch Main Details
            const mainDetails = await fetchMovieDetails(show.id, 'Netflix');
            if (mainDetails && mainDetails.season) {
                console.log('Season List:', JSON.stringify(mainDetails.season, null, 2));
                
            // Fetch Season 1 using ID
            console.log('Fetching Season 1 using ID 80077209...');
            await fetchMovieDetails(show.id, 'Netflix', '80077209');
            }
        } else {
            console.log('Search failed to find Family Guy');
        }
    } catch (e) {
        console.error('Search error:', e.message);
    }
};

searchAndTest();
