const axios = require('axios');

const CONSUMET_URL = 'https://api.consumet.org';

const testConsumet = async () => {
    try {
        const query = 'Inception';
        console.log(`Searching for: ${query}`);
        
        const searchUrl = `${CONSUMET_URL}/movies/flixhq/${encodeURIComponent(query)}`;
        console.log('GET', searchUrl);
        
        const searchRes = await axios.get(searchUrl);
        console.log('Search Results:', searchRes.data.results?.length);
        
        if (searchRes.data.results?.length > 0) {
            const match = searchRes.data.results[0];
            console.log('Match:', match);
            
            // Try watch endpoint directly with various ID formats
            const idsToTry = [
                match.id, // movie/watch-inception-19764
                match.id.replace('movie/', ''), // watch-inception-19764
                `movie/${match.id.split('-').pop()}`, // movie/19764
                match.id.split('-').pop() // 19764
            ];

            for (const id of idsToTry) {
                try {
                    console.log(`Trying watch ID: ${id}`);
                    const watchUrl = `${CONSUMET_URL}/movies/flixhq/watch/${encodeURIComponent(id)}`;
                    console.log('GET', watchUrl);
                    const watchRes = await axios.get(watchUrl);
                    console.log('Watch Status:', watchRes.status);
                    if (watchRes.data.sources && watchRes.data.sources.length > 0) {
                        console.log('SUCCESS! Found sources:', watchRes.data.sources.length);
                        console.log('First source:', watchRes.data.sources[0]);
                        break;
                    }
                } catch (e) {
                    console.log(`Failed for ID ${id}: ${e.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

testConsumet();
