require('../prototypes');

const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const linguist = require('../helpers/linguist');
const color = require('../helpers/color');

module.exports = async (db, log) => {
    /***************
     * Repo Stats
     ***************/
    log('\n\n----\nRepo Stats\n----');
    await linguist.load();

    // Total: Repos and invalid repos
    const totalRepos = await db.collection('repositories').find({}).count();
    const totalInvalidRepos = (await db.collection('repositories').aggregate([
        {
            '$lookup': {
                from: 'spam_repositories',
                localField: 'id',
                foreignField: 'Repo ID',
                as: 'spam',
            },
        },
        { '$match': { 'spam.Verified?': 'checked' } },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0].count;
    const totalValidRepos = totalRepos - totalInvalidRepos;
    const totalPermittedRepos = (await db.collection('repositories').aggregate([
        {
            '$lookup': {
                from: 'spam_repositories',
                localField: 'id',
                foreignField: 'Repo ID',
                as: 'spam',
            },
        },
        { '$match': { 'spam.Permitted?': 'checked' } },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0].count;
    log('');
    log(`Total repos: ${number.commas(totalRepos)}`);
    log(`  Valid repos: ${number.commas(totalValidRepos)} (${(totalValidRepos / totalRepos * 100).toFixed(2)}%)`);
    log(`    of which were reported but approved: ${number.commas(totalPermittedRepos)} (${(totalPermittedRepos / totalValidRepos * 100).toFixed(2)}%)`);
    log(`  Excluded repos: ${number.commas(totalInvalidRepos)} (${(totalInvalidRepos / totalRepos * 100).toFixed(2)}%)`);

    // Breaking down repos by language
    const totalReposByLanguage = await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: '$language',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
    ]).toArray();
    log('');
    log(`Repos by language: ${totalReposByLanguage.length} languages`);
    totalReposByLanguage.limit(15).forEach(lang => {
        const name = lang['_id'] || 'Undetermined';
        log(`  ${name}: ${number.commas(lang.count)} (${(lang.count / totalRepos * 100).toFixed(2)}%)`);
    });
    let doughnutTotal = 0;
    const totalReposByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        indexLabelPlacement: 'inside',
        indexLabelFontFamily: 'monospace',
        dataPoints: totalReposByLanguage.limit(10).map(data => {
            const name = data['_id'] || 'Undetermined';
            const dataColor = linguist.get(name) || chart.colors.lightBox;
            const displayName = name === 'TypeScript' ? 'TS' : name; // TypeScript causes length/overlap issues
            const percent = data.count / totalRepos * 100;
            doughnutTotal += data.count;
            return {
                y: data.count,
                indexLabel: `${displayName}\n${percent.toFixed(1)}%`,
                color: dataColor,
                indexLabelFontColor: color.isBright(dataColor) ? chart.colors.background : chart.colors.white,
                indexLabelFontSize: percent > 10 ? 28 : percent > 5 ? 24 : percent > 4 ? 22 : 20,
            };
        }),
    }]);
    totalReposByLanguageConfig.data[0].dataPoints.push({
        y: totalRepos - doughnutTotal,
        indexLabel: `Others\n${((totalRepos - doughnutTotal) / totalRepos * 100).toFixed(1)}%`,
        color: chart.colors.darkBox,
        indexLabelFontColor: chart.colors.white,
        indexLabelFontSize: 28,
    });
    totalReposByLanguageConfig.title = {
        text: 'Repos: Top 10 Languages',
        fontColor: chart.colors.text,
        fontFamily: 'monospace',
        padding: 5,
        verticalAlign: 'center',
        horizontalAlign: 'center',
        maxWidth: 500,
    };
    await chart.save(
        path.join(__dirname, '../../images/repos_by_language_doughnut.png'),
        await chart.render(totalReposByLanguageConfig),
        { width: 300, x: 500, y: 640 },
    );

    // Projects by popularity, contributors, stars (repo metadata)
    const topReposByPRs = await db.collection('pull_requests').aggregate([
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
            '$project': {
                count: '$count',
                link: '$repository.html_url',
            },
        },
        { '$sort': { count: -1 } },
        { '$limit': 10 },
    ]).toArray();
    log('');
    log('Top repos by PRs');
    topReposByPRs.forEach(repo => {
        log(`  ${number.commas(repo.count)} | ${repo.link}`);
    });

    const topReposByStars = await db.collection('repositories').find({}).sort({ stargazers_count: -1 })
        .limit(5).toArray();
    log('');
    log('Top repos by stars');
    topReposByStars.forEach(repo => {
        log(`  ${number.commas(repo.stargazers_count)} | ${repo.html_url}`);
    });

    const topReposByForks = await db.collection('repositories').find({}).sort({ forks_count: -1 })
        .limit(5).toArray();
    log('');
    log('Top repos by forks');
    topReposByForks.forEach(repo => {
        log(`  ${number.commas(repo.forks_count)} | ${repo.html_url}`);
    });

    const topReposByWatchers = await db.collection('repositories').find({}).sort({ watchers_count: -1 })
        .limit(5).toArray();
    log('');
    log('Top repos by watchers');
    topReposByWatchers.forEach(repo => {
        log(`  ${number.commas(repo.watchers_count)} | ${repo.html_url}`);
    });
};
