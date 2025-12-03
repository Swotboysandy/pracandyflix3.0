const axios = require('axios');
const fs = require('fs');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const testMultipleTitles = async () => {
    const titles = [
        { id: '80057281', name: 'Stranger Things' },
        { id: '70242311', name: 'Narcos' },
        { id: '80025744', name: 'The Crown' },
    ];
    
    try {
        console.log('Fetching cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        for (const item of titles) {
            console.log(`\n=== Testing: ${item.name} (${item.id}) ===`);
            
            try {
                const timestamp = Math.round(Date.now() / 1000);
                
                // Get h parameter
                const playUrl = 'https://net20.cc/play.php';
                const params = new URLSearchParams();
                params.append('id', item.id);
                
                const playResponse = await axios.post(playUrl, params.toString(), {
                    headers: {
                        'Cookie': cookies,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                
                if (!playResponse.data?.h) {
                    console.log('  ✗ No h parameter');
                    continue;
                }
                
                // Get Playlist
                const playlistUrl = `https://net51.cc/playlist.php?id=${item.id}&t=${encodeURIComponent(item.name)}&tm=${timestamp}&h=${playResponse.data.h}`;
                
                const playlistResponse = await axios.get(playlistUrl, {
                    headers: {
                        'Cookie': cookies,
                        'Referer': 'https://net51.cc/',
                        'Origin': 'https://net51.cc',
                    }
                });

                const data = playlistResponse.data?.[0];
                
                if (data) {
                    console.log('  Has sources:', !!data.sources);
                    console.log('  Has tracks:', !!data.tracks);
                    
                    if (data.tracks) {
                        console.log(`  Track count: ${data.tracks.length}`);
                        data.tracks.forEach(t => {
                            console.log(`    - ${t.label} (${t.kind})`);
                        });
                    }
                } else {
                    console.log('  ✗ No data received');
                }
                
            } catch (error) {
                console.log(`  ✗ Error: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('Fatal error:', error.message);
    }
};

testMultipleTitles();
