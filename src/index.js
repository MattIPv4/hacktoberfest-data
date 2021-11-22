const fs = require('fs');
const path = require('path');
const dot = require('dot');
const log = require('./helpers/log');
const stats = require('./stats');
const number = require('./helpers/number');

const main = async () => {
    log.reset();
    log.log(`Started ${new Date().toLocaleString()}`);

    const { data } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', '2021', 'stats.json'), 'utf8'));
    const results = await stats(data, log.log);

    log.log('');
    log.log(`Finished ${new Date().toLocaleString()}`);
    log.save(path.join(__dirname, '../generated/stats.txt'));

    const template = fs.readFileSync(path.join(__dirname, '..', 'README.dot.md'), 'utf8');
    const result = dot.template(template, { argName: 'data, c, p', strip: false })(results, number.commas, number.percentage);
    fs.writeFileSync(path.join(__dirname, '..', 'README.2021.md'), result);
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
