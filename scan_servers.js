const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const scanServers = async () => {
    try {
        console.log('Fetching Cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const id = '80187190'; // Stranger Things
        const title = 'Stranger Things';

        // Generate list of domains
        const domains = [];
        for (let i = 10; i <= 60; i++) {
            domains.push(`https://net${i}.cc`);
        }
        domains.push('https://netmirror.cc');
        domains.push('https://net51.cc'); // Dead one
        domains.push('https://net20.cc'); // Current one

        console.log(`Scanning ${domains.length} domains...`);

        for (const domain of domains) {
            try {
                // console.log(`Checking ${domain}...`);
                
                // 1. Check play.php
                const playUrl = `${domain}/play.php`;
                const params = new URLSearchParams();
                params.append('id', id);

                const playResponse = await axios.post(playUrl, params.toString(), {
                    headers: {
                        'Cookie': cookies,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    timeout: 2000 // Short timeout
                });

                if (playResponse.data?.h) {
                    console.log(`[ALIVE] ${domain} returned h parameter!`);
                    
                    // 2. Check playlist.php
                    const timestamp = Math.round(new Date().getTime() / 1000);
                    const playlistUrl = `${domain}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
                    
                    const playlistResponse = await axios.get(playlistUrl, {
                        headers: {
                            'Cookie': cookies,
                            'Referer': `${domain}/`,
                        },
                        timeout: 3000
                    });

                    const data = playlistResponse.data?.[0];
                    if (data?.sources && data.sources.length > 0) {
                        const streamUrl = data.sources[0].file;
                        // Check if it points to the dead CDN
                        if (streamUrl.includes('s21.nm-cdn4.top')) {
                            console.log(`  [BAD] ${domain} points to dead CDN (s21.nm-cdn4.top)`);
                        } else {
                            console.log(`  [GOOD?] ${domain} points to: ${streamUrl}`);
                            // Try to fetch the playlist content to see segments
                            let m3u8Url = streamUrl;
                            if (!m3u8Url.startsWith('http')) m3u8Url = domain + m3u8Url;
                            
                            try {
                                const m3u8Res = await axios.get(m3u8Url, {
                                    headers: { 'Cookie': cookies, 'Referer': `${domain}/` },
                                    timeout: 3000
                                });
                                if (m3u8Res.data.includes('s21.nm-cdn4.top')) {
                                    console.log(`    [BAD] M3U8 content points to dead CDN`);
                                } else {
                                    console.log(`    [SUCCESS] Found working server: ${domain}`);
                                    console.log('    M3U8 Preview:', m3u8Res.data.substring(0, 100));
                                    return; // Stop on first success
                                }
                            } catch (e) {
                                console.log(`    [WARN] Failed to fetch M3U8: ${e.message}`);
                            }
                        }
                    }
                }
            } catch (error) {
                // console.log(`[DEAD] ${domain}: ${error.message}`);
            }
        }
        console.log('Scan complete.');

    } catch (error) {
        console.error('Scan Error:', error.message);
    }
};

scanServers();
