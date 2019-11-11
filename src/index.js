const path = require('path');
const mongo = require('./helpers/mongo');
const log = require('./helpers/log');
const stats = require('./stats');

const main = async () => {
    log.reset();
    log.log('Started', new Date().toLocaleString());
    log.log('');

    const db = await mongo.connect();
    const dbo = db.db('hacktoberfest-2019');
    await stats(dbo, log.log);
    db.close();

    log.log('');
    log.log('Finished', new Date().toLocaleString());
    log.save(path.join(__dirname, '../stats.txt'));
};

main();
