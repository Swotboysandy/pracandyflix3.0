const axios = require('axios');
const fs = require('fs');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

// Test if using different parameters or endpoints gives us subtitle tracks
const testSubtitleVariations = async () => {
    try {
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const id = '80057281';
        const title = 'Stranger Things';
        const timestamp = Math.round(Date.now() / 1000);
        
        // Get h parameter
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
            console.log('No h parameter');
            return;
        }
        
        console.log('Testing different playlist variations...\n');
        
        // Test 1: Standard playlist
        console.log('1. Standard playlist:');
        const url1 = `https://net20.cc/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;
        await testUrl(url1, cookies, 'net20.cc');
        
        // Test 2: With subtitle parameter
        console.log('\n2. With &sub=1 parameter:');
        const url2 = `https://net20.cc/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}&sub=1`;
        await testUrl(url2, cookies, 'net20.cc');
        
        // Test 3: With cc parameter
        console.log('\n3. With &cc=1 parameter:');
        const url3 = `https://net20.cc/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}&cc=1`;
        await testUrl(url3, cookies, 'net20.cc');
        
        // Test 4: Check if there's a separate subtitle endpoint
        console.log('\n4. Testing subtitle endpoint:');
        try {
            const subUrl = `https://net20.cc/sub.php?id=${id}&h=${playResponse.data.h}`;
            const subResponse = await axios.get(subUrl, {
                headers: { 'Cookie': cookies, 'Referer': 'https://net20.cc/' }
            });
            console.log('Response:', subResponse.data);
        } catch (err) {
            console.log('No sub.php endpoint');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

async function testUrl(url, cookies, referer) {
    try {
        const response = await axios.get(url, {
            headers: {
                'Cookie': cookies,
                'Referer': `https://${referer}/`,
            }
        });
        
        const data = response.data?.[0];
        console.log('Has tracks field:', !!data?.tracks);
        if (data?.tracks) {
            console.log('Track count:', data.tracks.length);
            data.tracks.forEach(t => console.log(`  - ${t.label} (${t.kind})`));
        }
    } catch (err) {
        console.log('Request failed:', err.message);
    }
}

testSubtitleVariations();
