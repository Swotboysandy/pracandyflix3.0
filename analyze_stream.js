const axios = require('axios');
const FormData = require('form-data');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const getStreamUrl = async (id, title) => {
    try {
        // 1. Fetch Cookies
        const cookieResponse = await axios.get(COOKIE_URL);
        const baseCookie = cookieResponse.data.cookies;
        const cookies = baseCookie + `ott=nf; hd=on;`;

        const streamBaseUrl = 'https://net51.cc';

        // 2. POST to play.php to get the 'h' parameter
        const baseUrl = 'https://net20.cc';
        const playUrl = `${baseUrl}/play.php`;
        const formData = new FormData();
        formData.append('id', id);

        console.log(`Getting 'h' parameter for ID: ${id}...`);
        const playResponse = await axios.post(playUrl, formData, {
            headers: {
                'Cookie': cookies,
                ...formData.getHeaders()
            },
        });

        if (!playResponse.data?.h) {
            throw new Error('Failed to get h parameter from play.php');
        }

        // 3. Make request to playlist.php with the h parameter
        const timestamp = Math.round(new Date().getTime() / 1000);
        const playlistUrl = `${streamBaseUrl}/playlist.php?id=${id}&t=${encodeURIComponent(title)}&tm=${timestamp}&h=${playResponse.data.h}`;

        console.log(`Fetching playlist from: ${playlistUrl}`);
        const playlistResponse = await axios.get(playlistUrl, {
            headers: {
                'Cookie': cookies,
                'Referer': 'https://net51.cc/',
                'Origin': 'https://net51.cc',
            },
        });

        const data = playlistResponse.data?.[0];

        if (data?.sources && data.sources.length > 0) {
            console.log('Sources found:', JSON.stringify(data.sources, null, 2));
            let streamUrl = data.sources[0].file;
            if (!streamUrl.startsWith('http')) {
                streamUrl = streamBaseUrl + streamUrl;
            }
            return { url: streamUrl, cookies };
        }
        return null;
    } catch (error) {
        console.error('Error getting stream URL:', error.message);
        return null;
    }
};

const fs = require('fs');

const logToFile = (message) => {
    fs.appendFileSync('stream_analysis.txt', message + '\n');
    console.log(message);
};

// Replace console.log with logToFile in analyzeStream function
const analyzeStream = async () => {
    // Clear previous log
    fs.writeFileSync('stream_analysis.txt', '');
    
    // ... (rest of the logic using logToFile instead of console.log)
    // For brevity, I'll just wrap the main logic in a try-catch and use logToFile
    
    const searchUrl = `https://odd-cloud-1e14.hunternisha55.workers.dev/?url=https://net51.cc/search.php?s=Inception&t=${Date.now()}&cookie=`;
    
    try {
        logToFile('Searching for "Inception"...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;
        
        const searchRes = await axios.get(searchUrl + encodeURIComponent(cookie));
        const movie = searchRes.data.searchResult?.[0];

        if (!movie) {
            logToFile('Movie not found');
            return;
        }

        logToFile(`Found movie: ${movie.t} (${movie.id})`);

        const streamData = await getStreamUrl(movie.id, movie.t);

        if (!streamData) {
            logToFile('Failed to get stream URL');
            return;
        }

        logToFile(`Stream URL: ${streamData.url}`);

        // Fetch m3u8 content
        logToFile('Fetching m3u8 content...');
        const m3u8Response = await axios.get(streamData.url, {
            headers: {
                'Cookie': streamData.cookies,
                'Referer': 'https://net51.cc/',
            }
        });

        const m3u8Content = m3u8Response.data;
        logToFile('\n--- M3U8 Analysis ---');
        
        // Check for audio tracks
        const audioRegex = /#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="[^"]+",NAME="([^"]+)",.*URI="([^"]+)"/g;
        let match;
        const audioTracks = [];

        while ((match = audioRegex.exec(m3u8Content)) !== null) {
            audioTracks.push({
                name: match[1],
                uri: match[2]
            });
        }

        if (audioTracks.length > 0) {
            logToFile(`Found ${audioTracks.length} audio tracks:`);
            audioTracks.forEach((track, index) => {
                logToFile(`${index + 1}. ${track.name} - ${track.uri}`);
            });
        } else {
            logToFile('No explicit #EXT-X-MEDIA:TYPE=AUDIO tags found in the master playlist.');
        }

        logToFile('\n--- First 20 lines of M3U8 ---');
        logToFile(m3u8Content.split('\n').slice(0, 20).join('\n'));

    } catch (error) {
        logToFile('Error during analysis: ' + error.message);
    }
};

analyzeStream();
