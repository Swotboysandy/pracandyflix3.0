const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const BASE_URL = 'https://net20.cc';

const testSubtitleContent = async () => {
    try {
        console.log('Fetching cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const id = '80057281'; // Stranger Things
        const title = 'Stranger Things';
        const timestamp = Math.round(Date.now() / 1000);
        
        // 1. Get h parameter
        const playUrl = 'https://net20.cc/play.php'; 
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
        console.log('Response data type:', typeof response.data);
        console.log('Is array:', Array.isArray(response.data));
        console.log('First item keys:', data ? Object.keys(data) : 'N/A');
        if (data) {
             console.log('Sources:', data.sources ? data.sources.length : 0);
             console.log('Tracks:', data.tracks ? data.tracks.length : 0);
        }

        if (data && data.tracks && data.tracks.length > 0) {
            // Find a subtitle track
            const subTrack = data.tracks.find(t => t.kind === 'captions' || t.kind === 'subtitles');
            
            if (subTrack) {
                let subUrl = subTrack.file;
                if (!subUrl.startsWith('http')) {
                    subUrl = BASE_URL + subUrl;
                }
                
                console.log(`Testing subtitle URL: ${subUrl}`);
                
                try {
                    const subResponse = await axios.get(subUrl, {
                        headers: {
                            'Cookie': cookies,
                            'Referer': `${BASE_URL}/`,
                        }
                    });
                    
                    console.log('Subtitle fetch status:', subResponse.status);
                    console.log('Subtitle content preview:', subResponse.data.substring(0, 100));
                } catch (subError) {
                    console.error('Failed to fetch subtitle:', subError.message);
                    if (subError.response) {
                        console.error('Status:', subError.response.status);
                    }
                }
            } else {
                console.log('No subtitle track found to test');
            }
        } else {
            console.log('No tracks found in response');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testSubtitleContent();
