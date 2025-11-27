const axios = require('axios');

const BASE_URL = 'https://net20.cc';
const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const MOVIE_ID = '106379'; // Stranger Things

async function testDirectVegaEndpoints() {
    try {
        const timestamp = Math.round(Date.now() / 1000);
        
        // 1. Fetch Cookies
        console.log('Fetching cookies...');
        const cookieRes = await axios.get(COOKIE_URL);
        const cookie = cookieRes.data.cookies; // Assuming format { cookies: "..." }
        console.log('Got cookie:', cookie);

        const headers = {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        };

        // Test 1: s=SeasonID
        const seasonId = '80077209';
        const seasonUrl = `${BASE_URL}/episodes.php?s=${seasonId}&t=${timestamp}&page=1`;
        console.log(`\nFetching episodes (SeasonID): ${seasonUrl}`);
        // 0. Search for a show to get a valid ID
        const searchQuery = 'Stranger Things';
        const searchUrl = `https://odd-cloud-1e14.hunternisha55.workers.dev/?url=${encodeURIComponent(`${BASE_URL}/search.php?s=${encodeURIComponent(searchQuery)}&t=${timestamp}`)}&cookie=${encodeURIComponent(cookie)}`;
        console.log(`\nSearching for: ${searchQuery}`);
        const searchRes = await axios.get(searchUrl);
        
        let targetId = MOVIE_ID;
        if (searchRes.data && searchRes.data.searchResult && searchRes.data.searchResult.length > 0) {
            const firstResult = searchRes.data.searchResult[0];
            console.log(`Found: ${firstResult.t} (ID: ${firstResult.id})`);
            targetId = firstResult.id;
        } else {
            console.log('Search failed, using default ID');
        }

        // Test 3: Fetch Main Details using POST with found ID
        const detailsUrl = `${BASE_URL}/post.php?id=${targetId}&t=${timestamp}`;
        console.log(`\nFetching details (POST): ${detailsUrl}`);
        
        const formData = new FormData();
        const detailsRes = await axios.post(detailsUrl, formData, { 
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data',
            }
        });
        
        if (detailsRes.data.movie) {
            const movie = detailsRes.data.movie;
            console.log('Movie Title:', movie.title);
            if (movie.season) {
                console.log('Seasons found:', movie.season.length);
                console.log('Season Data:', JSON.stringify(movie.season, null, 2));
            } else {
                console.log('No season data in movie details.');
            }
        } else {
            console.log('No movie object in response.');
            const fs = require('fs');
            fs.writeFileSync('debug_post_response.json', JSON.stringify(detailsRes.data, null, 2));
            console.log('Saved full response to debug_post_response.json');

            if (detailsRes.data.episodes) {
                console.log('Episodes found in POST details:', detailsRes.data.episodes.length);
                detailsRes.data.episodes.slice(0, 3).forEach(ep => {
                    if (ep) {
                        console.log(`Ep: ${ep.ep}, ID: ${ep.id}, s: ${ep.s}`);
                    } else {
                        console.log('Ep object is null/undefined');
                    }
                });
            }
        }


        // Test 2: s=ShowID
        const showUrl = `${BASE_URL}/episodes.php?s=${MOVIE_ID}&t=${timestamp}&page=1`;
        console.log(`\nFetching episodes (ShowID): ${showUrl}`);
        const episodesRes = await axios.get(showUrl, { headers });
        const episodesData = episodesRes.data;
        
        if (episodesData && episodesData.episodes) {
            console.log(`Found ${episodesData.episodes.length} episodes.`);
            episodesData.episodes.slice(0, 3).forEach(ep => {
                console.log(`Ep: ${ep.ep}, ID: ${ep.id}, s: ${ep.s}`);
            });

            // 3. Fetch Stream (using /mobile/playlist.php)
            if (episodesData.episodes.length > 0) {
                const firstEp = episodesData.episodes[0];
                const streamId = firstEp.id;
                
                const streamUrl = `${BASE_URL}/mobile/playlist.php?id=${streamId}&t=${timestamp}`;
                console.log(`\nFetching stream from: ${streamUrl}`);
                
                const streamRes = await axios.get(streamUrl, { headers });
                console.log('Stream Data:', JSON.stringify(streamRes.data, null, 2));
            }
        } else {
            console.log('No episodes found or invalid format.');
            console.log('Full Response:', JSON.stringify(episodesData, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testDirectVegaEndpoints();
