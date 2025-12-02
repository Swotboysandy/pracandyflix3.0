const https = require('https');
const axios = require('axios');

const cookieUrl = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const baseUrl = 'https://net20.cc';

const testQueries = ['Animation', 'Anime', 'Cartoon', 'Animated Movies', 'Kids'];

const run = async () => {
    try {
        // 1. Get Cookies
        const cookieRes = await axios.get(cookieUrl);
        const baseCookie = cookieRes.data.cookies;
        const cookies = baseCookie + 'ott=nf; hd=on;';
        
        console.log('Testing queries...');

        for (const q of testQueries) {
            const searchUrl = `${baseUrl}/search.php?search=${encodeURIComponent(q)}`;
            try {
                const res = await axios.get(searchUrl, {
                    headers: { 'Cookie': cookies }
                });
                
                const count = (res.data && res.data.searchResult) ? res.data.searchResult.length : 0;
                console.log(`Query: "${q}" -> Results: ${count}`);
                if (count > 0 && count < 5) {
                     console.log(`  - Items: ${res.data.searchResult.map(i => i.t).join(', ')}`);
                }
            } catch (e) {
                console.log(`Query: "${q}" -> Error: ${e.message}`);
            }
        }

    } catch (e) {
        console.error('Error:', e);
    }
};

run();
