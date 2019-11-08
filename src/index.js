const mongo = require('./helpers/mongo');

const main = async () => {
    const db = await mongo.connect();
    const dbo = db.db('hacktoberfest-prod-sample');
    const PRStats = require('./stats/PRs');
    await PRStats(dbo);
    db.close();
};

main();
