const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const streamBaseUrl = 'https://net20.cc';

const testNet20Content = async () => {
    try {
        console.log('Fetching Cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const id = '80187190'; // Stranger Things
        const title = 'Stranger Things';

        // 1. Get Master Playlist
        console.log('Fetching Master Playlist...');
        const playUrl = `${streamBaseUrl}/play.php`;
        const params = new URLSearchParams();
        params.append('id', id);

        const playResponse = await axios.post(playUrl, params.toString(), {
            headers: { 'Cookie': cookies, 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const timestamp = Math.round(new Date().getTime() / 1000);
        const playlistUrl = `${streamBaseUrl}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
        
        const playlistResponse = await axios.get(playlistUrl, {
            headers: { 'Cookie': cookies, 'Referer': 'https://net20.cc/' }
        });

        const data = playlistResponse.data?.[0];
        if (!data?.sources) throw new Error('No sources');

        // 2. Extract Path from Dead Link
        // Example: https://s21.nm-cdn4.top/files/220884/1080p/1080p.m3u8?in=unknown::ni
        // OR relative: /hls/80187190.m3u8?in=unknown::ni
        const deadUrl = data.sources[0].file;
        console.log('Original URL from Playlist:', deadUrl);

        let pathPart;
        if (deadUrl.startsWith('http')) {
            // It's absolute, try to extract path after domain
            const urlObj = new URL(deadUrl);
            pathPart = urlObj.pathname + urlObj.search;
        } else {
            // It's relative, use as is
            pathPart = deadUrl.startsWith('/') ? deadUrl : '/' + deadUrl;
        }
        console.log('Path Part:', pathPart);

        // 3. Try Variations on net20.cc
        const variations = [
            `${streamBaseUrl}${pathPart}`, // Direct path
            `${streamBaseUrl}/hls${pathPart}`, // /hls prefix
            `${streamBaseUrl}/proxy${pathPart}`, // /proxy prefix
            `${streamBaseUrl}/stream${pathPart}`, // /stream prefix
            `${streamBaseUrl}${pathPart.replace('/files', '')}`, // Remove /files
            `${streamBaseUrl}/hls${pathPart.replace('/files', '')}` // /hls without /files
        ];

        console.log('Testing variations...');
        for (const url of variations) {
            try {
                console.log(`Trying: ${url}`);
                const res = await axios.get(url, {
                    headers: { 'Cookie': cookies, 'Referer': 'https://net20.cc/' },
                    timeout: 3000
                });
                if (res.status === 200 && res.headers['content-type'].includes('mpegurl')) {
                    console.log(`[SUCCESS] Found working URL: ${url}`);
                    console.log('--- MASTER PLAYLIST START ---');
                    console.log(res.data);
                    console.log('--- MASTER PLAYLIST END ---');

                    // Extract a media playlist URL
                    // https://s21.nm-cdn4.top/files/220884/1080p/1080p.m3u8?in=unknown::ni
                    const lines = res.data.split('\n');
                    const mediaLine = lines.find(l => l.startsWith('http') && l.includes('.m3u8'));
                    
                    if (mediaLine) {
                        console.log('Found Media Playlist URL:', mediaLine);
                        // Try variations
                        const pathOnly = mediaLine.split('.top')[1]; // /files/220884/1080p/1080p.m3u8?in=unknown::ni
                        
                        const variations = [
                            `${streamBaseUrl}${pathOnly}`,
                            `${streamBaseUrl}/hls${pathOnly}`,
                            // Try proxying the FULL URL
                            `${streamBaseUrl}/proxy/${encodeURIComponent(mediaLine)}`,
                            `${streamBaseUrl}/proxy?url=${encodeURIComponent(mediaLine)}`,
                            // Try replacing domain but keeping path
                            mediaLine.replace('https://s21.nm-cdn4.top', 'https://net20.cc')
                        ];

                        for (const url of variations) {
                            console.log(`Trying: ${url}`);
                            try {
                                const mediaRes = await axios.get(url, {
                                    headers: { 'Cookie': cookies, 'Referer': 'https://net20.cc/' }
                                });
                                console.log(`[SUCCESS] Found working Media Playlist: ${url}`);
                                console.log('Content:', mediaRes.data.substring(0, 100));
                                break;
                            } catch (e) {
                                console.log(`  [FAIL] ${e.message}`);
                            }
                        }
                    }
                    return;
                } else {
                    console.log(`  [FAIL] Status: ${res.status}, Type: ${res.headers['content-type']}`);
                }
            } catch (e) {
                console.log(`  [FAIL] ${e.message}`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testNet20Content();
