const axios = require('axios');
const fs = require('fs');

const baseUrl = 'https://raw.githubusercontent.com/Zenda-Cross/vega-providers/main/providers/netflixMirror';
const files = ['stream.ts', 'episodes.ts', 'posts.ts'];

async function fetchFiles() {
    for (const file of files) {
        try {
            const response = await axios.get(`${baseUrl}/${file}`);
            fs.writeFileSync(`netflixMirror_${file}`, response.data);
            console.log(`Saved ${file}`);
        } catch (error) {
            console.error(`Error fetching ${file}:`, error.message);
        }
    }
}

fetchFiles();
