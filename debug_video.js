const axios = require('axios');

const cookieUrl = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const run = async () => {
    try {
        // 1. Fetch Cookies
        console.log('=== FETCHING COOKIES ===');
        const cookieRes = await axios.get(cookieUrl);
        const baseCookie = cookieRes.data.cookies;
        const cookies = baseCookie + 'ott=nf; hd=on;';
        console.log('Cookies:', cookies.substring(0, 50) + '...\n');

        const id = '81435684'; // Example Netflix ID
        const title = 'Test Movie';
        const baseUrl = 'https://net20.cc';
        const streamBaseUrl = 'https://net20.cc';

        // Step 1: POST to play.php to get 'h' parameter
        console.log('=== STEP 1: POST to play.php ===');
        const playUrl = `${baseUrl}/play.php`;
        
        const params = new URLSearchParams();
        params.append('id', id);
        
        console.log('URL:', playUrl);
        console.log('Body:', params.toString());
        
        try {
            const playResponse = await axios.post(playUrl, params.toString(), {
                headers: {
                    'Cookie': cookies,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': `${baseUrl}/`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });
            
            console.log('Status:', playResponse.status);
            console.log('Response data:', JSON.stringify(playResponse.data, null, 2));
            console.log('H parameter:', playResponse.data?.h);
            
            if (!playResponse.data?.h) {
                console.log('\n❌ ERROR: No h parameter received from play.php');
                return;
            }
            
            const hParam = playResponse.data.h;
            console.log('\n✅ Successfully got h parameter:', hParam);
            
            // Step 2: GET playlist.php with h parameter
            console.log('\n=== STEP 2: GET playlist.php ===');
            const timestamp = Math.round(new Date().getTime() / 1000);
            const playlistUrl = `${streamBaseUrl}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${hParam}`;
            
            console.log('URL:', playlistUrl);
            
            const playlistResponse = await axios.get(playlistUrl, {
                headers: {
                    'Cookie': cookies,
                    'Referer': `${baseUrl}/`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });
            
            console.log('Status:', playlistResponse.status);
            console.log('Response data:', JSON.stringify(playlistResponse.data, null, 2));
            
            const data = playlistResponse.data?.[0];
            
            if (data?.sources && data.sources.length > 0) {
                console.log('\n✅ SUCCESS: Got video sources!');
                console.log('Number of sources:', data.sources.length);
                console.log('First source:', data.sources[0]);
                
                let streamUrl = data.sources[0].file;
                if (!streamUrl.startsWith('http')) {
                    streamUrl = streamBaseUrl + streamUrl;
                }
                
                console.log('\nFinal stream URL:', streamUrl);
                console.log('Tracks available:', data.tracks?.length || 0);
            } else {
                console.log('\n❌ ERROR: No sources found in playlist response');
            }
            
        } catch (error) {
            console.log('\n❌ ERROR in play.php request:');
            console.log('Message:', error.message);
            console.log('Status:', error.response?.status);
            console.log('Response:', JSON.stringify(error.response?.data, null, 2));
        }

    } catch (e) {
        console.error('\n❌ FATAL ERROR:', e.message);
    }
};

run();
