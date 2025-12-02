const axios = require('axios');

const testPrimeStream = async () => {
    try {
        const cookieRes = await axios.get('https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json');
        const cookies = cookieRes.data.cookies + 'ott=pv; hd=on;';
        
        const id = '81435684'; // Test ID
        const streamBaseUrl = 'https://net20.cc';
        const timestamp = Math.round(new Date().getTime() / 1000);
        const playlistUrl = `${streamBaseUrl}/pv/playlist.php?id=${id}&t=${timestamp}`;
        
        console.log('Fetching Prime playlist from:', playlistUrl);
        
        const response = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': `${streamBaseUrl}/`,
            }
        });
        
        console.log('\n=== Prime Response ===');
        console.log(JSON.stringify(response.data, null, 2));
        
        // If we get sources, fetch the M3U8 to see what CDN it uses
        if (response.data[0]?.sources?.[0]?.file) {
            const m3u8Url = streamBaseUrl + response.data[0].sources[0].file;
            console.log('\nFetching M3U8 from:', m3u8Url);
            
            const m3u8 = await axios.get(m3u8Url, {
                headers: {
                    'Cookie': cookies,
                    'Referer': `${streamBaseUrl}/`,
                }
            });
            
            console.log('\n=== Prime M3U8 Content ===');
            console.log(m3u8.data);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
};

testPrimeStream();
