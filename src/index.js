const fs = require('fs');
const path = require('path');
const log = require('./helpers/log');
const stats = require('./stats');

const main = async () => {
    log.reset();
    log.log(`Started ${new Date().toLocaleString()}`);
    log.log('Please note that these stats do not consider users that were banned or deleted on GitHub, nor pull requests that are no longer publicly available.');

    const { data } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', '2021', 'stats.json'), 'utf8'));
    await stats(data, log.log);

    log.log('');
    log.log(`Finished ${new Date().toLocaleString()}`);
    log.save(path.join(__dirname, '../generated/stats.txt'));
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
