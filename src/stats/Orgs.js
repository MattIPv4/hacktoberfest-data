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
                'org': { '$exists': true }
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
        'base.repo.owner.type': {
            '$eq': 'Organization',
        },
    }).count();
    log('');
    log(`Total orgs: ${number.commas(totalOrgs)}`);
    log(`Total PRs to repos in orgs: ${number.commas(totalPRsToOrgs)}`);
    log(`  Avg. PRs to each org: ${number.commas(Math.round(totalPRsToOrgs / totalOrgs))}`);

    // Orgs by prs
    const topOrgsByPRs = await db.collection('pull_requests').aggregate([
        {
            '$match': { 'labels.name': { '$nin': [ 'invalid' ] } },
        },
        {
            '$group': {
                _id: '$base.repo.id',
                count: { '$sum': 1 },
            },
        },
        {
            '$match': { '_id': { '$ne': null } },
        },
        {
            '$lookup': {
                from: 'repositories',
                localField: '_id',
                foreignField: 'id',
                as: 'repository',
            },
        },
        {
            '$project': {
                count: '$count',
                repository: { '$arrayElemAt': [ '$repository', 0 ] },
            },
        },
        {
            '$lookup': {
                from: 'spam_repositories',
                localField: 'repository.id',
                foreignField: 'Repo ID',
                as: 'spam',
            },
        },
        {
            '$match': { 'spam.Verified?': { '$nin': [ 'checked' ] } },
        },
        {
            '$match': { 'repository.organization': { '$exists': true } },
        },
        {
            '$group': {
                _id: '$repository.organization.id',
                org: { '$push': '$repository.organization' },
                count: { '$sum': '$count' },
            },
        },
        {
            '$project': {
                count: '$count',
                org: { '$arrayElemAt': [ '$org', 0 ] },
            },
        },
        { '$sort': { count: -1 } },
        { '$limit': 25 },
    ]).toArray();
    log('');
    log('Top orgs by PRs');
    topOrgsByPRs.forEach(org => {
        log(`  ${number.commas(org.count)} | ${org.org.html_url}`);
    });
};
