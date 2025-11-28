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
        const cookie = cookieRes.data.cookies;
        console.log('Got cookie:', cookie);

        const headers = {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        };

        // Test 1: s=SeasonID (Season 1 of Stranger Things)
        const seasonId = '80077209';
        const seasonUrl = `${BASE_URL}/episodes.php?s=${seasonId}&t=${timestamp}&page=1`;
        console.log(`\nFetching episodes (SeasonID): ${seasonUrl}`);
        
        try {
            const seasonRes = await axios.get(seasonUrl, { headers });
            console.log('SeasonID Success. Keys:', Object.keys(seasonRes.data));
            
            if (seasonRes.data.episodes && seasonRes.data.episodes.length > 0) {
                console.log(`Episodes found: ${seasonRes.data.episodes.length}`);
                const firstEp = seasonRes.data.episodes[0];
                console.log(`First Ep: ${firstEp.ep}, ID: ${firstEp.id}, s: ${firstEp.s}`);
                
                // Test Stream for this episode
                const streamUrl = `${BASE_URL}/mobile/playlist.php?id=${firstEp.id}&t=${timestamp}`;
                console.log(`\nFetching stream for Season 1 Ep 1: ${streamUrl}`);
                // Test Stream using play.php flow (like api.ts)
                const playUrl = `${BASE_URL}/play.php`;
                const playFormData = new FormData();
                playFormData.append('id', firstEp.id);
                
                console.log(`\nFetching play.php for ID: ${firstEp.id}`);
                try {
                    const playRes = await axios.post(playUrl, playFormData, {
                        headers: {
                            ...headers,
                            'Content-Type': 'multipart/form-data',
                        }
                    });
                    
                    console.log('Play Response:', playRes.data);
                    
                    if (playRes.data && playRes.data.h) {
                        const h = playRes.data.h;
                        const playlistUrl = `${BASE_URL}/playlist.php?id=${firstEp.id}&t=${encodeURIComponent('Episode')}&tm=${timestamp}&h=${h}`;
                        console.log(`Fetching playlist.php: ${playlistUrl}`);
                        
                        const playlistRes = await axios.get(playlistUrl, { 
                            headers: {
                                ...headers,
                                'Referer': 'https://net51.cc/',
                                'Origin': 'https://net51.cc',
                            }
                        });
                        
                        console.log('Playlist Data:', JSON.stringify(playlistRes.data, null, 2));

                        if (playlistRes.data && playlistRes.data.length > 0 && playlistRes.data[0].sources && playlistRes.data[0].sources.length > 0) {
                            let file = playlistRes.data[0].sources[0].file;
                            if (!file.startsWith('http')) {
                                file = 'https://net51.cc' + file;
                            }
                            console.log(`\nTesting Stream URL: ${file}`);
                            
                            try {
                                const streamTestRes = await axios.get(file, {
                                    headers: {
                                        ...headers,
                                        'Referer': 'https://net51.cc/',
                                        'Origin': 'https://net51.cc',
                                    }
                                });
                                console.log('Stream Fetch Success:', streamTestRes.status);
                                console.log('Stream Content (first 200 chars):', streamTestRes.data.substring(0, 200));
                            } catch (streamErr) {
                                console.log('Stream Fetch Failed:', streamErr.message);
                                if (streamErr.response) {
                                    console.log('Stream Error Status:', streamErr.response.status);
                                }
                            }
                        }
                    } else {
                        console.log('Failed to get h parameter from play.php');
                    }
                } catch (e) {
                    console.log('Play flow failed:', e.message);
                }
            } else {
                console.log('No episodes in SeasonID response.');
                console.log('Full Response:', JSON.stringify(seasonRes.data, null, 2));
            }
        } catch (e) {
            console.log('SeasonID failed:', e.message);
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
