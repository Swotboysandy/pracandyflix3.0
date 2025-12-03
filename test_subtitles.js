const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const BASE_URL = 'https://net51.cc';

const testSubtitles = async () => {
    try {
        console.log('Fetching cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const id = '80057281'; // Stranger Things
        const title = 'Stranger Things';
        const timestamp = Math.round(Date.now() / 1000);
        
        // 1. Get h parameter
        const playUrl = 'https://net20.cc/play.php'; // play.php is on net20.cc
        const params = new URLSearchParams();
        params.append('id', id);
        
        const playResponse = await axios.post(playUrl, params.toString(), {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        
        if (!playResponse.data?.h) throw new Error('No h parameter');
        
        // 2. Get Playlist
        const playlistUrl = `${BASE_URL}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
        
        console.log(`Fetching playlist from: ${playlistUrl}`);
        
        const response = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': `${BASE_URL}/`,
                'Origin': `${BASE_URL}`,
            }
        });

        const data = response.data?.[0];
        if (data && data.tracks) {
            console.log('Tracks found:', data.tracks.length);
            data.tracks.forEach((track, index) => {
                console.log(`Track ${index}:`);
                console.log(`  Label: ${track.label}`);
                console.log(`  File: ${track.file}`);
                console.log(`  Kind: ${track.kind}`);
            });
        } else {
            console.log('No tracks found in response');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testSubtitles();
