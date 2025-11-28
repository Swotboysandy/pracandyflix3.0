const axios = require('axios');
const fs = require('fs');

const url = 'https://github.com/Zenda-Cross/vega-providers/tree/main/providers';

axios.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
})
.then(response => {
    fs.writeFileSync('github_page.html', response.data);
    console.log('Page saved to github_page.html');
    
    // Simple regex to find folder names
    const matches = response.data.match(/href="\/Zenda-Cross\/vega-providers\/tree\/main\/providers\/([^"]+)"/g);
    if (matches) {
        const folders = matches.map(m => m.split('/').pop().replace('"', ''));
        console.log('Found folders:', [...new Set(folders)]);
    } else {
        console.log('No folder matches found via regex.');
    }
})
.catch(error => {
    console.error('Error fetching page:', error.message);
});
