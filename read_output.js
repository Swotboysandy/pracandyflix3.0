const fs = require('fs');
const content = fs.readFileSync('repro_output.txt', 'utf8');
console.log(content);
