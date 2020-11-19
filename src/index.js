const path = require('path');
const mongo = require('./helpers/mongo');
const log = require('./helpers/log');
const stats = require('./stats');

const main = async () => {
    log.reset();
    log.log(`Started ${new Date().toLocaleString()}`);
    log.log('Please note that these stats do not consider users that were banned or deleted on GitHub, nor pull requests that are no longer publicly available.');

    const db = await mongo.connect();
    const dbo = db.db('hacktoberfest-2020');
    await stats(dbo, log.log);
    db.close();

    log.log('');
    log.log(`Finished ${new Date().toLocaleString()}`);
    log.save(path.join(__dirname, '../generated/stats.txt'));
};

main();
