const fs = require('fs');
let output;

const log = message => {
    output += `${message}\n`;
    console.log(message);
};

const reset = () => {
    output = '';
};

const save = file => {
    fs.writeFileSync(file, output);
};

module.exports = { log, reset, save };
