const axios = require('axios');

const HOME_DATA_URL = 'https://net-cookie-kacj.vercel.app/api/data';

async function fetchHomeData() {
    try {
        console.log('Fetching home data...');
        const response = await axios.get(HOME_DATA_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (response.data && response.data.success && response.data.data) {
            console.log('Successfully fetched data.');
            console.log('--- Section Titles ---');
            response.data.data.forEach(category => {
                console.log(`- ${category.title}`);
            });
            console.log('----------------------');
        } else {
            console.log('Failed to fetch data or invalid format.');
            console.log(JSON.stringify(response.data, null, 2));
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

fetchHomeData();
