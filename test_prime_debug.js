const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const streamBaseUrl = 'https://net20.cc';

const testPrime = async () => {
    try {
        console.log('1. Fetching Cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=pv; hd=on;`;
        console.log('Cookies fetched.');

        const id = 'amzn1.dv.gti.4bba566f-0056-4148-8922-276386475853'; // Example Prime ID
        
        // GET playlist.php for Prime
        const timestamp = Math.round(new Date().getTime() / 1000);
        const playlistUrl = `${streamBaseUrl}/pv/playlist.php?id=${id}&t=${timestamp}`;
        
        console.log('Fetching Prime playlist:', playlistUrl);
        
        const playlistResponse = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': `${streamBaseUrl}/`,
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
        console.log('Prime Stream URL:', streamUrl);

        // 3. Verify Stream Accessibility and Content
        console.log('3. Verifying Prime Stream...');
        try {
            const streamRes = await axios.get(streamUrl, {
                headers: {
                    'Cookie': cookies,
                    'Referer': `${streamBaseUrl}/`,
                },
            });
            console.log('Stream Status:', streamRes.status);
            console.log('--- PRIME M3U8 CONTENT START ---');
            console.log(streamRes.data);
            console.log('--- PRIME M3U8 CONTENT END ---');
        } catch (err) {
            console.error('FAILED to access Prime stream:', err.message);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

testPrime();
