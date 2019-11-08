const mongo = require('./helpers/mongo');

const main = async () => {
    const db = await mongo.connect();
    const PRStats = require('./stats/PRs');
    await PRStats(db);
};

main();
