const number = require('../helpers/number');

module.exports = async (db, log) => {
    /***************
     * Org Stats
     ***************/
    log('\n\n----\nOrg Stats\n----');

    // Total: Orgs
    const totalOrgs = (await db.collection('repositories').aggregate([
        {
            '$project': {
                org: '$organization',
            },
        },
        {
            '$match': {
                'org': { '$exists': true },
            },
        },
        {
            '$group': {
                _id: '$org.id',
                count: { '$sum': 1 },
            },
        },
        {
            '$group': {
                _id: null,
                count: { '$sum': 1 },
            },
        },
    ]).limit(1).toArray())[0].count;
    const totalPRsToOrgs = await db.collection('pull_requests').find({
        'app.state': {
            '$eq': 'eligible',
        },
        'base.repo.owner.type': {
            '$eq': 'Organization',
        },
    }).count();
    log('');
    log(`Total orgs: ${number.commas(totalOrgs)}`);
    log(`Total PRs to repos in orgs: ${number.commas(totalPRsToOrgs)}`);
    log(`  Avg. PRs to each org: ${number.commas(Math.round(totalPRsToOrgs / totalOrgs))}`);
};
