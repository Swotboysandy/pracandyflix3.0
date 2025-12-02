const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const streamBaseUrl = 'https://net20.cc';

const testNetflix = async () => {
    try {
        console.log('1. Fetching Cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;
        console.log('Cookies fetched.');

        const id = '80187190'; // Stranger Things ID (from screenshot)
        const title = 'Stranger Things';

        console.log(`2. Getting Stream URL for ID: ${id}...`);
        
        // POST to play.php
        const playUrl = `${streamBaseUrl}/play.php`;
        const params = new URLSearchParams();
        params.append('id', id);

        const playResponse = await axios.post(playUrl, params.toString(), {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (!playResponse.data?.h) {
            throw new Error('Failed to get h parameter');
        }
        console.log('Got h parameter.');

        // GET playlist.php
        const timestamp = Math.round(new Date().getTime() / 1000);
        const playlistUrl = `${streamBaseUrl}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
        
        console.log('Fetching playlist:', playlistUrl);
        
        const playlistResponse = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': 'https://net20.cc/',
                'Origin': 'https://net20.cc',
            },
        });

        const data = playlistResponse.data?.[0];
        if (!data?.sources || data.sources.length === 0) {
            throw new Error('No sources found');
        }

        let streamUrl = data.sources[0].file;
        if (!streamUrl.startsWith('http')) {
            streamUrl = streamBaseUrl + streamUrl;
        }
        console.log('Stream URL:', streamUrl);

        // 3. Verify Stream Accessibility
        console.log('3. Verifying Stream Accessibility...');
        try {
            const streamRes = await axios.get(streamUrl, {
                headers: {
                    'Cookie': cookies,
                    'Referer': 'https://net20.cc/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });
            console.log('Stream Status:', streamRes.status);
            console.log('Stream Content Type:', streamRes.headers['content-type']);
            console.log('Stream Content Length:', streamRes.headers['content-length']);
            console.log('--- M3U8 CONTENT START ---');
            const m3u8Content = streamRes.data;
            console.log(m3u8Content);
            console.log('--- M3U8 CONTENT END ---');

            // Extract first m3u8 URL (Media Playlist)
            const lines = m3u8Content.split('\n');
            const mediaPlaylistLine = lines.find(l => l.startsWith('http') && l.includes('.m3u8'));
            
            if (mediaPlaylistLine) {
                console.log('Found Media Playlist URL:', mediaPlaylistLine);
                
                const domainsToTry = [
                    'https://s24.nm-cdn3.top', // From audio track
                    'https://s21.nm-cdn3.top', // Guessing cdn3
                    'https://s21.nfmirrorcdn.top', // From image CDN
                    'https://net20.cc' // Just in case
                ];

                for (const domain of domainsToTry) {
                    const newMediaPlaylistUrl = mediaPlaylistLine.replace('https://s21.nm-cdn4.top', domain);
                    console.log(`Trying domain: ${domain} -> ${newMediaPlaylistUrl}`);
                    
                    try {
                        const mediaRes = await axios.get(newMediaPlaylistUrl, {
                            headers: {
                                'Cookie': cookies,
                                'Referer': 'https://net20.cc/',
                            },
                        });
                        console.log(`SUCCESS with ${domain}! Status:`, mediaRes.status);
                        console.log('--- MEDIA PLAYLIST CONTENT START ---');
                        console.log(mediaRes.data);
                        console.log('--- MEDIA PLAYLIST CONTENT END ---');
                        break; // Found a working one!
                    } catch (e) {
                        console.log(`Failed with ${domain}: ${e.message}`);
                    }
                }
            } else {
                console.log('No absolute Media Playlist URL found in Master Playlist');
            }
        } catch (err) {
            console.error('FAILED to access stream:', err.message);
            if (err.response) {
                console.error('Status:', err.response.status);
                console.error('Data:', err.response.data);
            }
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

testNetflix();
