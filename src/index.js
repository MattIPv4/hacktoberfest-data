const path = require('path');
const mongo = require('./helpers/mongo');
const log = require('./helpers/log');
const stats = require('./stats');

const main = async () => {
    log.reset();
    log.log(`Started ${new Date().toLocaleString()}`);

    const db = await mongo.connect();
    const dbo = db.db('hacktoberfest-2020-dev');
    await stats(dbo, log.log);
    db.close();

    log.log('');
    log.log(`Finished ${new Date().toLocaleString()}`);
    log.save(path.join(__dirname, '../generated/stats.txt'));
};

main();
