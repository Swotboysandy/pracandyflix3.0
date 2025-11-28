const axios = require('axios');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/Zenda-Cross/vega-providers/main/providers/getBaseUrl.ts';

axios.get(url)
.then(response => {
    fs.writeFileSync('getBaseUrl.ts', response.data);
    console.log('Saved getBaseUrl.ts');
})
.catch(error => {
    console.error('Error:', error.message);
});
