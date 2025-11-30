
const axios = require('axios');

const COOKIE_URL = 'https://raw.githubusercontent.com/Anshu78780/json/main/cookies.json';

const getCookies = async () => {
    try {
        const response = await axios.get(COOKIE_URL);
        return response.data; 
    } catch (error) {
        console.error('Error fetching cookies:', error.message);
        return null;
    }
};

const searchHotstar = async (query, cookie) => {
    try {
        const url = `https://anshu-netmirror.hunternisha55.workers.dev/?q=${encodeURIComponent(query)}&cookie=${encodeURIComponent(cookie)}`;
        console.log(`Searching Hotstar: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });
        console.log('Raw Search Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error searching Hotstar:', error.message);
        return null;
    }
};

const runTest = async () => {
    console.log('--- Starting Hotstar API Test (Final Attempt) ---');
    
    const cookieData = await getCookies();
    if (!cookieData || !cookieData.cookies) {
        console.error('Failed to get cookies.');
        return;
    }
    const cookie = cookieData.cookies;

    // Try a very broad query
    const query = 'the'; 
    await searchHotstar(query, cookie);
};

runTest();
