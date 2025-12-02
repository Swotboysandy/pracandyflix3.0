const axios = require('axios');

const testStream = async () => {
    try {
        const cookieRes = await axios.get('https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json');
        const cookies = cookieRes.data.cookies + 'ott=nf; hd=on;';
        
        // Test the M3U8 playlist
        const streamUrl = 'https://net20.cc/hls/81901943.m3u8?in=unknown::ni';
        
        console.log('Fetching M3U8 playlist from:', streamUrl);
        
        const response = await axios.get(streamUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': 'https://net20.cc/',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        console.log('\n=== M3U8 Playlist Content ===');
        console.log(response.data);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testStream();
