const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';
const BASE_URL = 'https://net20.cc';

const testDetails = async () => {
    try {
        console.log('Fetching cookies...');
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;

        const id = '80057281'; // Stranger Things
        const time = Math.round(Date.now() / 1000);
        const url = `${BASE_URL}/post.php?id=${id}&t=${time}`;
        
        console.log(`Fetching details from: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'Cookie': cookie,
                'Referer': `${BASE_URL}/home`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });

        console.log('Response status:', response.status);
        if (response.data) {
            console.log('Data received:');
            // Log specific fields to check if they are populated
            console.log('Title:', response.data.title || response.data.movie?.title);
            console.log('Genre:', response.data.genre || response.data.movie?.genre);
            console.log('Desc:', response.data.desc || response.data.movie?.desc);
            console.log('Episodes:', (response.data.episodes || response.data.movie?.episodes)?.length);
        } else {
            console.log('No data received');
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

testDetails();
