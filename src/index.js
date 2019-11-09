const mongo = require('./helpers/mongo');
const stats = require('./stats');

const main = async () => {
    console.log('Started', new Date().toLocaleString());
    console.log('');

    const db = await mongo.connect();
    const dbo = db.db('hacktoberfest-prod-sample');
    await stats(dbo);
    db.close();

    console.log('');
    console.log('Finished', new Date().toLocaleString());
};

main();
