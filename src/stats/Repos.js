require('../prototypes');

const number = require('../helpers/number');

module.exports = async db => {
    /***************
     * Repo Stats
     ***************/
    console.log('\n\n----\nRepo Stats\n----');

    // "Connections made" First time PRs to a project, and not first time PRs
    // We only have relevant PR data, this would need massive abuse of the GH API to determine

    // Total: Repos and invalid repos
    const totalRepos = await db.collection('repositories').find({}).count();
    const totalInvalidRepos = (await db.collection('repositories').aggregate([
        {
            '$lookup':
                {
                    from: 'spam_repositories',
                    localField: 'id',
                    foreignField: 'Repo ID',
                    as: 'spam'
                }
        },
        { '$match': { 'spam.Verified?': 'checked' } },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0].count;
    const totalValidRepos = totalRepos - totalInvalidRepos;
    const totalPermittedRepos = (await db.collection('repositories').aggregate([
        {
            '$lookup':
                {
                    from: 'spam_repositories',
                    localField: 'id',
                    foreignField: 'Repo ID',
                    as: 'spam'
                }
        },
        { '$match': { 'spam.Permitted?': 'checked' } },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0].count;
    console.log('');
    console.log(`Total repos: ${number.commas(totalRepos)}`);
    console.log(`  Valid repos: ${number.commas(totalValidRepos)} (${(totalValidRepos / totalRepos * 100).toFixed(2)}%)`);
    console.log(`    of which were reported but approved: ${number.commas(totalPermittedRepos)} (${(totalPermittedRepos / totalValidRepos * 100).toFixed(2)}%)`);
    console.log(`  Excluded repos: ${number.commas(totalInvalidRepos)} (${(totalInvalidRepos / totalRepos * 100).toFixed(2)}%)`);

    // Breaking down repos by language
    const totalReposByLanguage = await db.collection('repositories').aggregate([
        {
            '$group':
                {
                    _id: '$language',
                    count: { '$sum': 1 }
                }
        },
        {
            '$sort':
                {
                    count: -1,
                }
        }
    ]).toArray();
    console.log('');
    console.log(`Repos by language: ${totalReposByLanguage.length} languages`);
    totalReposByLanguage.limit(15).forEach(lang => {
        const name = lang['_id'] || 'Undetermined';
        console.log(`  ${name}: ${number.commas(lang.count)} (${(lang.count / totalRepos * 100).toFixed(2)}%)`);
    });

    // Projects by popularity, contributors, stars (repo metadata)
    const topReposByPRs = await db.collection('pull_requests').aggregate([
        {
            '$match': { 'labels.name': { '$nin': [ 'invalid' ] } },
        },
        {
            '$group':
                {
                    _id: '$base.repo.id',
                    count: { '$sum': 1 },
                }
        },
        {
            '$match': { '_id': { '$ne': null } },
        },
        {
            '$lookup':
                {
                    from: 'repositories',
                    localField: '_id',
                    foreignField: 'id',
                    as: 'repository',
                }
        },
        {
            '$project':
                {
                    count: '$count',
                    repository: { '$arrayElemAt': [ '$repository', 0 ] },
                }
        },
        {
            '$lookup':
                {
                    from: 'spam_repositories',
                    localField: 'repository.id',
                    foreignField: 'Repo ID',
                    as: 'spam'
                }
        },
        {
            '$match': { 'spam.Verified?': { '$nin': [ 'checked' ] } },
        },
        {
            '$sort':
                {
                    count: -1,
                }
        },
        {
            '$limit': 10,
        },
    ]).toArray();
    console.log('');
    console.log('Top repos by PRs');
    topReposByPRs.forEach(repo => {
        console.log(`  ${number.commas(repo.count)} | ${repo.repository.html_url}`);
    });

    const topReposByStars = await db.collection('repositories').find({}).sort({ stargazers_count: -1 })
        .limit(5).toArray();
    console.log('');
    console.log('Top repos by stars');
    topReposByStars.forEach(repo => {
        console.log(`  ${number.commas(repo.stargazers_count)} | ${repo.html_url}`);
    });

    const topReposByForks = await db.collection('repositories').find({}).sort({ forks_count: -1 })
        .limit(5).toArray();
    console.log('');
    console.log('Top repos by forks');
    topReposByForks.forEach(repo => {
        console.log(`  ${number.commas(repo.forks_count)} | ${repo.html_url}`);
    });

    const topReposByWatchers = await db.collection('repositories').find({}).sort({ watchers_count: -1 })
        .limit(5).toArray();
    console.log('');
    console.log('Top repos by watchers');
    topReposByWatchers.forEach(repo => {
        console.log(`  ${number.commas(repo.watchers_count)} | ${repo.html_url}`);
    });

    // Histogram breakdown by gitignores in repos
    // TODO: This will need API calls or Octokit to get gitignores
};
