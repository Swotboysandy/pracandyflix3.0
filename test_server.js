const axios = require('axios');

const testServer = async () => {
    try {
        const cookieRes = await axios.get('https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json');
        const cookies = cookieRes.data.cookies + 'ott=nf; hd=on;';
        
        // Test net20.cc (Alternative)
        const baseUrl = 'https://net20.cc';
        const id = '81435684'; // Stranger Things
        
        console.log(`Testing ${baseUrl}...`);
        
        // 1. Play.php
        const playUrl = `${baseUrl}/play.php`;
        const formData = new URLSearchParams();
        formData.append('id', id);
        
        console.log('POST', playUrl);
        const playRes = await axios.post(playUrl, formData.toString(), {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!playRes.data.h) {
            console.error('Failed to get h parameter');
            return;
        }
        console.log('Got h parameter:', playRes.data.h);
        
        // 2. Playlist.php
        const timestamp = Math.round(new Date().getTime() / 1000);
        const playlistUrl = `${baseUrl}/playlist.php?id=${id}&t=Test&tm=${timestamp}&h=${playRes.data.h}`;
        
        console.log('GET', playlistUrl);
        const playlistRes = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': `${baseUrl}/`
            }
        });
        
        const sources = playlistRes.data[0].sources;
        console.log('Sources:', sources);
        
        if (sources && sources.length > 0) {
            const file = sources[0].file;
            const fullUrl = file.startsWith('http') ? file : baseUrl + file;
            console.log('Stream URL:', fullUrl);
            
            // Check CDN domain
            const match = fullUrl.match(/https?:\/\/([^/]+)/);
            if (match) {
                console.log('CDN Domain:', match[1]);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testServer();
