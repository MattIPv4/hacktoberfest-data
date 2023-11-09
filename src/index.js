const fs = require('fs');
const path = require('path');
const dot = require('dot');
const log = require('./helpers/log');
const stats = require('./stats');
const number = require('./helpers/number');

const year = 2023;

const main = async () => {
    log.reset();
    log.log(`Started ${new Date().toLocaleString()}`);

    const { data } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', year.toString(), 'stats.json'), 'utf8'));
    data.year = year;
    const results = await stats(data, log.log);

    log.log('');
    log.log(`Finished ${new Date().toLocaleString()}`);
    log.save(path.join(__dirname, '../generated/stats.txt'));

    const template = fs.readFileSync(path.join(__dirname, '..', 'README.dot.md'), 'utf8');
    const result = dot.template(template, { argName: 'data, c, p', strip: false })(results, number.commas, number.percentage)
        // Fix double line breaks in lists
        .replace(/( *(?:\d+\.|-).+(?:\n.+)*)\n\n( *(?:\d+\.|-))/g, '$1\n$2')
        // Fix line breaks in text (this would break code blocks, but we don't have any)
        .replace(/([^\\\n])\n(?!\s*(?:[-<>]|\d+\.))([^\s])/g, '$1 $2')
        // Fix triple (or more) line breaks
        .replace(/\n{3,}/g, '\n\n');
    fs.writeFileSync(path.join(__dirname, '..', 'README.md'), result);
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
