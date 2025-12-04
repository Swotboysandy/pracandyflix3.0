const axios = require('axios');
const fs = require('fs');

const CONSUMET_URL = 'https://consumet.zendax.tech';
const COOKIE_URL = 'https://net-cookie-kacj.vercel.app/api/cookie';

function log(message) {
    console.log(message);
    fs.appendFileSync('debug_output.txt', message + '\n');
}

async function searchConsumet(query) {
    try {
        log(`Fallback: Searching Consumet for: ${query}`);
        const searchUrl = `${CONSUMET_URL}/movies/flixhq/${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl);

        if (response.data && response.data.results) {
            log(`Fallback: Found ${response.data.results.length} results for "${query}"`);
            if (response.data.results.length > 0) {
                log(`Fallback First result: ${response.data.results[0].title}`);
            }
            return response.data.results;
        }
        return [];
    } catch (error) {
        log(`Fallback Error: ${error.message}`);
        return [];
    }
}

async function searchMovies(query, providerId = 'Prime') {
    try {
        log(`Primary: Searching for: ${query}`);
        const cookieResponse = await axios.get(COOKIE_URL);
        const cookie = cookieResponse.data.cookies;
        const time = Date.now();
        
        const baseUrl = 'https://net51.cc';
        const searchPageUrl = `${baseUrl}/pv/search.php?s=${encodeURIComponent(query)}&t=${time}`;
        const finalUrl = `https://odd-cloud-1e14.hunternisha55.workers.dev/?url=${searchPageUrl}&cookie=${encodeURIComponent(cookie)}`;

        const response = await axios.get(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (response.data && response.data.searchResult) {
            log(`Primary: Found ${response.data.searchResult.length} results`);
            return response.data.searchResult;
        } else {
            log(`Primary: No results`);
            return [];
        }
    } catch (error) {
        log(`Primary Error: ${error.message}`);
        log('Initiating Fallback...');
        return await searchConsumet(query);
    }
}

async function testPrimeSeriesQueries() {
    // Clear output file
    fs.writeFileSync('debug_output.txt', '');

    const seriesQueries = [
        'Amazon Originals', 'TV Shows'
    ];

    log('--- Testing Prime Series Queries with Fallback ---');
    for (const query of seriesQueries) {
        await searchMovies(query);
    }
    log('------------------------------------------------');
}

testPrimeSeriesQueries().catch(err => log(err));
