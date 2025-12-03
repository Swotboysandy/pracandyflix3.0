const axios = require('axios');
const fs = require('fs');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const investigateWebsiteSubtitles = async () => {
    try {
        console.log('=== INVESTIGATING NET20.CC SUBTITLE METHOD ===\n');
        
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const id = '80057281'; // Stranger Things
        const title = 'Stranger Things';
        const timestamp = Math.round(Date.now() / 1000);
        
        // 2. Try different approaches to get subtitles
        
        // Approach 1: Check if there's a subtitle-specific endpoint
        console.log('1. Checking for subtitle endpoint...');
        try {
            const subUrl = `https://net20.cc/subtitles.php?id=${id}`;
            const subResponse = await axios.get(subUrl, {
                headers: { 'Cookie': cookies }
            });
            console.log('✓ Subtitles endpoint response:', subResponse.data);
        } catch (err) {
            console.log('✗ No subtitles.php endpoint');
        }
        
        // Approach 2: Try playlist from net20.cc instead of net51.cc
        console.log('\n2. Getting playlist from net20.cc...');
        const playUrl = 'https://net20.cc/play.php';
        const params = new URLSearchParams();
        params.append('id', id);
        
        const playResponse = await axios.post(playUrl, params.toString(), {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        
        if (playResponse.data?.h) {
            // Try net20.cc for playlist instead of net51.cc
            const playlistUrl = `https://net20.cc/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
            
            console.log('Fetching from:', playlistUrl);
            const playlistResponse = await axios.get(playlistUrl, {
                headers: {
                    'Cookie': cookies,
                    'Referer': 'https://net20.cc/',
                    'Origin': 'https://net20.cc',
                }
            });

            const data = playlistResponse.data?.[0];
            
            // Save the response
            fs.writeFileSync('playlist_net20.json', JSON.stringify(data, null, 2));
            console.log('✓ Saved playlist_net20.json');
            
            if (data.tracks) {
                console.log(`✓ Found ${data.tracks.length} tracks!`);
                data.tracks.forEach(t => {
                    console.log(`  - ${t.label} (${t.kind}): ${t.file?.substring(0, 50)}...`);
                });
            } else {
                console.log('✗ No tracks field');
            }
            
            // Download the M3U8 file
            if (data.sources && data.sources[0]) {
                let m3u8Url = data.sources[0].file;
                if (!m3u8Url.startsWith('http')) {
                    m3u8Url = 'https://net20.cc' + m3u8Url;
                }
                
                console.log('\nDownloading M3U8 from:', m3u8Url.substring(0, 60) + '...');
                const m3u8Response = await axios.get(m3u8Url, {
                    headers: {
                        'Cookie': cookies,
                        'Referer': 'https://net20.cc/',
                    }
                });
                
                fs.writeFileSync('playlist_net20.m3u8', m3u8Response.data);
                console.log('✓ Saved playlist_net20.m3u8');
                
                // Check for CEA-608/708 captions
                const hasCEA = m3u8Response.data.includes('CLOSED-CAPTIONS');
                console.log('Has CLOSED-CAPTIONS tag:', hasCEA);
                
                // Check for subtitle media
                const hasSubMedia = m3u8Response.data.includes('TYPE=SUBTITLES');
                console.log('Has TYPE=SUBTITLES:', hasSubMedia);
            }
        }
        
        console.log('\n=== INVESTIGATION COMPLETE ===');
        
    } catch (error) {
        console.error('ERROR:', error.message);
    }
};

investigateWebsiteSubtitles();
