require('../prototypes');

const path = require('path');
const LinearLeastSquares = require('linear-least-squares');
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
    const totalInvalidRepos = ((await db.collection('repositories').aggregate([
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
    ]).limit(1).toArray())[0] || { count: 0 }).count;
    const totalParticipatingRepos = ((await db.collection('pull_requests').aggregate([
        {
            '$match': {
                'app.state': 'eligible',
            },
        },
        { '$group': { _id: '$base.repo.id' } },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0] || { count: 0 }).count;
    const totalTopicRepos = ((await db.collection('repositories').aggregate([
        {
            '$lookup': {
                from: 'users',
                localField: 'id',
                foreignField: 'app.receipt.repository.databaseId',
                as: 'frozen_users',
            },
        },
        {
            '$project': {
                frozen_topics: {
                    '$concatArrays': [
                        '$topics.names',
                        {
                            '$reduce': {
                                input: {
                                    '$map': {
                                        input: '$frozen_users',
                                        as: 'frozen_user',
                                        in: {
                                            '$reduce': {
                                                input: {
                                                    '$map': {
                                                        input: {
                                                            '$filter': {
                                                                input: '$$frozen_user.app.receipt',
                                                                as: 'frozen_pr',
                                                                cond: {
                                                                    '$eq': ['$$frozen_pr.repository.databaseId', '$id'],
                                                                },
                                                            },
                                                        },
                                                        as: 'frozen_pr',
                                                        in: {
                                                            '$map': {
                                                                input: '$$frozen_pr.repository.repositoryTopics.edges',
                                                                as: 'edge',
                                                                in: '$$edge.node.topic.name',
                                                            },
                                                        },
                                                    },
                                                },
                                                initialValue: [],
                                                in: { '$concatArrays': ['$$value', '$$this'] },
                                            },
                                        },
                                    },
                                },
                                initialValue: [],
                                in: { '$concatArrays': ['$$value', '$$this'] },
                            },
                        },
                    ],
                },
            },
        },
        {
            '$match': {
                '$expr': {
                    '$in': [
                        'hacktoberfest',
                        {
                            '$map': {
                                input: '$frozen_topics',
                                as: 'topic',
                                in: { '$trim': { input: { '$toLower': '$$topic' } } },
                            },
                        },
                    ],
                },
            },
        },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0] || { count: 0 }).count;
    log('');
    log(`Total repos: ${number.commas(totalRepos)}`);
    log(`  Participating repos: ${number.commas(totalParticipatingRepos)} (${(totalParticipatingRepos / totalRepos * 100).toFixed(2)}%)`);
    log(`    of which used the hacktoberfest-topic: ${number.commas(totalTopicRepos)} (${(totalTopicRepos / totalParticipatingRepos * 100).toFixed(2)}%)`);
    log('    (A repository was considered participating if it received or one more PRs that were considered eligible)');
    log(`  Excluded repos: ${number.commas(totalInvalidRepos)} (${(totalInvalidRepos / totalRepos * 100).toFixed(2)}%)`);
    log('    (A repository was excluded if we felt it did not follow the values of the event after reports from our community and internal review)');

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
    totalReposByLanguage.limit(50).forEach(lang => {
        const name = lang['_id'] || 'Undetermined';
        log(`  ${name}: ${number.commas(lang.count)} (${(lang.count / totalRepos * 100).toFixed(2)}%)`);
    });
    let doughnutTotal = 0;
    const totalReposByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 125,
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 22,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        indexLabelFontColor: chart.colors.white,
        dataPoints: totalReposByLanguage.limit(10).map(data => {
            const name = data['_id'] || 'Undetermined';
            const dataColor = linguist.get(name) || chart.colors.lightBox;
            const percent = data.count / totalRepos * 100;
            doughnutTotal += data.count;
            return {
                y: data.count,
                indexLabel: `${name}: ${number.commas(data.count)} (${percent.toFixed(1)}%)`,
                color: dataColor,
                indexLabelFontSize: percent > 10 ? 24 : percent > 4 ? 22 : 20,
            };
        }),
    }], { padding: { top: 5, left: 10, right: 10, bottom: 30 }});
    if (totalRepos > doughnutTotal) {
        totalReposByLanguageConfig.data[0].dataPoints.push({
            y: totalRepos - doughnutTotal,
            indexLabel: `Others: ${number.commas(totalRepos - doughnutTotal)} (${((totalRepos - doughnutTotal) / totalRepos * 100).toFixed(1)}%)`,
            color: chart.colors.darkBox,
            indexLabelFontColor: chart.colors.white,
            indexLabelFontSize: 24,
        });
    }
    totalReposByLanguageConfig.data[0].dataPoints = totalReposByLanguageConfig.data[0].dataPoints.map(x => [x, {
        y: totalRepos * 0.005,
        color: 'transparent',
        showInLegend: false,
    }]).flat(1);
    totalReposByLanguageConfig.title = {
        text: 'Repos: Top 10 Languages',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 72,
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
        maxWidth: 900,
    };
    totalReposByLanguageConfig.subtitles = [{
        text: `Hacktoberfest saw ${number.commas(totalReposByLanguage.length)} different programming languages represented across the ${number.commas(totalRepos)} repositories involved.`,
        fontColor: chart.colors.blue,
        fontFamily: '\'VT323\', monospace',
        fontSize: 40,
        padding: 0,
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        maxWidth: 750,
        backgroundColor: chart.colors.darkBackground,
    }];
    await chart.save(
        path.join(__dirname, '../../generated/repos_by_language_doughnut.png'),
        await chart.render(totalReposByLanguageConfig),
        { width: 150, x: 500, y: 460 },
    );

    // Projects by popularity, contributors, stars (repo metadata)
    const allRepoStars = (await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: null,
                stars: { '$sum': '$stargazers_count' },
            },
        },
    ]).toArray())[0];
    log('');
    log(`Average stars per repo: ${number.commas(allRepoStars.stars / totalRepos)}`);
    const allRepoForks = (await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: null,
                forks: { '$sum': '$forks_count' },
            },
        },
    ]).toArray())[0];
    log('');
    log(`Average forks per repo: ${number.commas(allRepoForks.forks / totalRepos)}`);
    const allRepoWatchers = (await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: null,
                watchers: { '$sum': '$subscribers_count' },
            },
        },
    ]).toArray())[0];
    log('');
    log(`Average watchers per repo: ${number.commas(allRepoWatchers.watchers / totalRepos)}`);

    // Plot stars vs forks.
    const ReposStarsVsForks = await db.collection('repositories').aggregate([
        {
            '$project': {
                stars: '$stargazers_count',
                forks: '$forks_count',
            },
        },
    ]).toArray();
    const ReposStarsVsForksFit = new LinearLeastSquares(ReposStarsVsForks.map(data => [data.stars, data.forks]))
        .compute_fit();
    const ReposStarsVsForksConfig = chart.config(1000, 1000, [
        {
            type: 'scatter',
            dataPoints: ReposStarsVsForks.map((data, i) => {
                // Cap the chart for more useful insights
                if (data.stars > 25000) return null;
                if (data.forks > 15000) return null;
                const colors = [
                    chart.colors.pink, chart.colors.crimson,
                ];
                return {
                    x: data.stars,
                    y: data.forks,
                    color: colors[i % colors.length],
                };
            }).filter(x => x !== null),
        },
        {
            type: 'line',
            lineThickness: 5,
            markerSize: 0,
            color: chart.colors.blue,
            dataPoints: [
                {
                    x: 0,
                    y: ReposStarsVsForksFit.b,
                },
                {
                    x: 25000,
                    y: (25000 * ReposStarsVsForksFit.m) + ReposStarsVsForksFit.b,
                },
            ],
        },
    ]);
    ReposStarsVsForksConfig.axisX = {
        ...ReposStarsVsForksConfig.axisX,
        title: 'Stars',
        titleFontSize: 34,
        labelFontSize: 28,
        interval: 5000,
    };
    ReposStarsVsForksConfig.axisY = {
        ...ReposStarsVsForksConfig.axisY,
        title: 'Forks',
        titleFontSize: 34,
        labelFontSize: 28,
        interval: 5000,
        labelAngle: -89.9,
    };
    ReposStarsVsForksConfig.title = {
        text: 'Repos: Stars vs Forks',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontWeight: 'bold',
        fontSize: 72,
        padding: 5,
        margin: 10,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    await chart.save(
        path.join(__dirname, '../../generated/repos_stars_vs_forks_scatter.png'),
        await chart.render(ReposStarsVsForksConfig),
        { width: 200, x: 500, y: 180 },
    );

    // Breakdown by license
    const topRepoLicenses = await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: '$license.spdx_id',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
        { '$limit': 25 },
    ]).toArray();
    log('');
    log('Most used licenses in repos:');
    topRepoLicenses.forEach(license => {
        const name = license['_id'];
        const licenseName = name === null ? 'No License' : (name === 'NOASSERTION' ? 'Custom License' : name);
        log(`  ${licenseName} | ${number.commas(license.count)}  (${(license.count / totalRepos * 100).toFixed(2)}%)`);
    });
    const noLicenseCount = topRepoLicenses.filter(x => x['_id'] === null)[0].count;
    let topRepoLicensesTotal = noLicenseCount;
    const topRepoLicensesConfig = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelFontSize: 24,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        dataPoints: topRepoLicenses.limit(10).filter(x => x['_id'] !== null).map((data, i) => {
            const colors = [
                chart.colors.blue, chart.colors.pink, chart.colors.crimson,
            ];
            const licenseColor = colors[i % colors.length];
            const licenseName = data['_id'] === 'NOASSERTION' ? 'Custom License' : data['_id'];
            topRepoLicensesTotal += data.count;
            return {
                y: data.count,
                indexLabelPlacement: i === 0 ? 'inside' : 'outside',
                indexLabel: `${licenseName}: ${number.commas(data.count)} (${(data.count / totalRepos * 100).toFixed(1)}%)`,
                color: licenseColor,
                indexLabelFontColor: i === 0 ? (color.isBright(licenseColor) ? chart.colors.background : chart.colors.white) : chart.colors.white,
            };
        }),
    }]);
    topRepoLicensesConfig.data[0].dataPoints.push({
        y: totalRepos - topRepoLicensesTotal,
        indexLabelPlacement: 'outside',
        indexLabel: `Others: ${((totalRepos - topRepoLicensesTotal) / totalRepos * 100).toFixed(1)}%`,
        color: chart.colors.darkBox,
        indexLabelFontColor: chart.colors.white,
    });
    topRepoLicensesConfig.axisY = {
        ...topRepoLicensesConfig.axisY,
        labelFontSize: 34,
        interval: 10000,
    };
    topRepoLicensesConfig.axisX = {
        ...topRepoLicensesConfig.axisX,
        tickThickness: 0,
        labelFormatter: function () {
            return '';
        },
    };
    topRepoLicensesConfig.title = {
        text: 'Repos: Top 10 Licenses',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontWeight: 'bold',
        fontSize: 72,
        padding: 5,
        margin: 10,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    topRepoLicensesConfig.subtitles = [{
        text: `${number.commas(noLicenseCount)} repositories (${(noLicenseCount / totalRepos * 100).toFixed(1)}%) use no license that GitHub can detect`,
        fontColor: chart.colors.blue,
        fontFamily: '\'VT323\', monospace',
        fontSize: 36,
        padding: 15,
        verticalAlign: 'top',
        horizontalAlign: 'right',
        dockInsidePlotArea: true,
        maxWidth: 500,
        backgroundColor: chart.colors.darkBackground,
    }];
    await chart.save(
        path.join(__dirname, '../../generated/repos_by_license_bar.png'),
        await chart.render(topRepoLicensesConfig),
        { width: 200, x: 880, y: 300 },
    );

    // Breakdown by state
    const totalPRsByState = (await db.collection('pull_requests').aggregate([
        {
            '$match': {
                'app.state': { '$ne': null },
            },
        },
        {
            '$group': {
                _id: {
                    repo: '$base.repo.id',
                    state: '$app.state',
                },
                count: { '$sum': 1 },
            },
        },
        {
            '$group': {
                _id: '$_id.repo',
                data: {
                    '$push': {
                        k: '$_id.state',
                        v: '$count',
                    },
                },
            },
        },
        {
            '$match': {
                '$expr': {
                    '$let': {
                        vars: {
                            dataObj: { '$arrayToObject': '$data' },
                        },
                        in: {
                            '$and': [
                                {
                                    '$ne': [
                                        '$$dataObj.eligible',
                                        null,
                                    ],
                                },
                                {
                                    '$gt': [
                                        '$$dataObj.eligible',
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
        },
        {
            '$unwind': '$data',
        },
        {
            '$group': {
                _id: '$data.k',
                count: { '$sum': '$data.v' },
            },
        },
        { '$sort': { count: -1 } },
    ]).toArray()).reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
    }, {});
    log('');
    log('On average, a participating repository received the following:');
    log('  (A repository was considered participating if it received or one more PRs that were considered eligible)');
    log(`  Eligible PRs, accepted by a maintainer: ${number.commas(totalPRsByState.eligible / totalParticipatingRepos)}`);
    log(`  PRs not accepted by a maintainer: ${number.commas(totalPRsByState.not_accepted / totalParticipatingRepos)}`);
    log(`  PRs labelled as invalid or spam: ${number.commas(totalPRsByState.invalid_label / totalParticipatingRepos)}`);
};
