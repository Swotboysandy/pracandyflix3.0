const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const verifySubtitles = async () => {
    try {
        console.log('=== NETFLIX SUBTITLE VERIFICATION ===\n');
        
        // 1. Fetch Cookies
        console.log('1. Fetching cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;
        console.log('✓ Cookies obtained\n');

        const id = '80057281'; // Stranger Things
        const title = 'Stranger Things';
        const timestamp = Math.round(Date.now() / 1000);
        
        // 2. Get h parameter from play.php
        console.log('2. Getting stream token...');
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
            throw new Error('No h parameter received');
        }
        console.log('✓ Stream token obtained\n');
        
        // 3. Get Playlist from net51.cc
        console.log('3. Fetching playlist from net51.cc...');
        const playlistUrl = `https://net51.cc/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
        
        const playlistResponse = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': 'https://net51.cc/',
                'Origin': 'https://net51.cc',
            }
        });

        const data = playlistResponse.data?.[0];
        
        if (!data) {
            console.log('✗ No playlist data received\n');
            return;
        }
        
        console.log('✓ Playlist data received');
        console.log('  - Has sources:', !!data.sources);
        console.log('  - Has tracks:', !!data.tracks);
        
        if (data.tracks && data.tracks.length > 0) {
            console.log(`  - Track count: ${data.tracks.length}\n`);
            
            console.log('4. Analyzing tracks...');
            data.tracks.forEach((track, index) => {
                console.log(`\n  Track ${index + 1}:`);
                console.log(`    Label: ${track.label}`);
                console.log(`    Kind: ${track.kind}`);
                console.log(`    File: ${track.file}`);
            });
        } else {
            console.log('  - No tracks in JSON response\n');
        }
        
        // 4. Check the M3U8 file itself
        if (data.sources && data.sources[0]) {
            let m3u8Url = data.sources[0].file;
            if (!m3u8Url.startsWith('http')) {
                m3u8Url = 'https://net51.cc' + m3u8Url;
            }
            
            console.log(`\n5. Downloading M3U8 file: ${m3u8Url.substring(0, 80)}...`);
            
            try {
                const m3u8Response = await axios.get(m3u8Url, {
                    headers: {
                        'Cookie': cookies,
                        'Referer': 'https://net51.cc/',
                    }
                });
                
                const m3u8Content = m3u8Response.data;
                console.log('✓ M3U8 downloaded\n');
                
                // Check for subtitle references
                const subtitleLines = m3u8Content.split('\n').filter(line => 
                    line.includes('SUBTITLES') || line.includes('subtitles') || 
                    line.includes('.vtt') || line.includes('.srt')
                );
                
                if (subtitleLines.length > 0) {
                    console.log('6. Subtitle references found in M3U8:');
                    subtitleLines.forEach(line => {
                        console.log(`  ${line}`);
                    });
                } else {
                    console.log('6. No subtitle references found in M3U8 file');
                }
                
                // Show first 20 lines of M3U8 for inspection
                console.log('\n7. M3U8 file preview (first 20 lines):');
                const lines = m3u8Content.split('\n').slice(0, 20);
                lines.forEach((line, i) => console.log(`  ${i + 1}: ${line}`));
                
            } catch (m3u8Error) {
                console.log('✗ Failed to download M3U8:', m3u8Error.message);
            }
        }
        
        console.log('\n=== VERIFICATION COMPLETE ===');
        
    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
};

verifySubtitles();
