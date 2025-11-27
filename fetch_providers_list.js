const axios = require('axios');

const url = 'https://api.github.com/repos/Zenda-Cross/vega-providers/contents/providers';

axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
})
.then(response => {
    const files = response.data;
    files.forEach(file => {
        console.log(file.name);
    });
})
.catch(error => {
    console.error('Error:', error.message);
});
