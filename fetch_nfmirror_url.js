const axios = require('axios');

const url = 'https://himanshu8443.github.io/providers/modflix.json';

axios.get(url)
.then(response => {
    const data = response.data;
    console.log('nfMirror URL:', data.nfMirror ? data.nfMirror.url : 'Not found');
    console.log('Full data keys:', Object.keys(data));
})
.catch(error => {
    console.error('Error:', error.message);
});
