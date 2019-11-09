const mongo = require('./helpers/mongo');
const stats = require('./stats');

const main = async () => {
    console.log(new Date().toLocaleString());

    const db = await mongo.connect();
    const dbo = db.db('hacktoberfest-prod-sample');
    await stats(dbo);
    db.close();

    console.log(new Date().toLocaleString());
};

main();
