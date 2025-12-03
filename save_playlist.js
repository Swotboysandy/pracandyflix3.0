const axios = require('axios');
const fs = require('fs');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const verifySubtitles = async () => {
    try {
        console.log('Fetching cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const id = '80057281'; // Stranger Things
        const title = 'Stranger Things';
        const timestamp = Math.round(Date.now() / 1000);
        
        // Get h parameter
        const playUrl = 'https://net20.cc/play.php';
        const params = new URLSearchParams();
        params.append('id', id);
        
        const playResponse = await axios.post(playUrl, params.toString(), {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        
        if (!playResponse.data?.h) {
            throw new Error('No h parameter');
        }
        
        // Get Playlist
        const playlistUrl = `https://net51.cc/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
        
        const playlistResponse = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': 'https://net51.cc/',
                'Origin': 'https://net51.cc',
            }
        });

        const data = playlistResponse.data?.[0];
        
        // Save playlist JSON
        fs.writeFileSync('playlist_response.json', JSON.stringify(data, null, 2));
        console.log('Saved playlist_response.json');
        
        // Get M3U8
        if (data.sources && data.sources[0]) {
            let m3u8Url = data.sources[0].file;
            if (!m3u8Url.startsWith('http')) {
                m3u8Url = 'https://net51.cc' + m3u8Url;
            }
            
            const m3u8Response = await axios.get(m3u8Url, {
                headers: {
                    'Cookie': cookies,
                    'Referer': 'https://net51.cc/',
                }
            });
            
            // Save M3U8 content
            fs.writeFileSync('playlist.m3u8', m3u8Response.data);
            console.log('Saved playlist.m3u8');
            
            // Check for subtitles
            const hasSubtitles = m3u8Response.data.includes('SUBTITLES') || 
                                 m3u8Response.data.includes('subtitles');
            console.log('Has subtitle references:', hasSubtitles);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

verifySubtitles();
