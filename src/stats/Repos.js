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

    const allRepoStars = (await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: null,
                stars: { '$sum': '$stargazers_count' },
            },
        },
    ]).toArray())[0];
    log('');
    log(`Average stars per repo: ${number.commas(Math.round(allRepoStars.stars / totalRepos))}`);

    const topReposByStars = await db.collection('repositories').find({}).sort({ stargazers_count: -1 })
        .limit(5).toArray();
    log('');
    log('Top repos by stars');
    topReposByStars.forEach(repo => {
        log(`  ${number.commas(repo.stargazers_count)} | ${repo.html_url}`);
    });

    const allRepoForks = (await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: null,
                forks: { '$sum': '$forks_count' },
            },
        },
    ]).toArray())[0];
    log('');
    log(`Average forks per repo: ${number.commas(Math.round(allRepoForks.forks / totalRepos))}`);

    const topReposByForks = await db.collection('repositories').find({}).sort({ forks_count: -1 })
        .limit(5).toArray();
    log('');
    log('Top repos by forks');
    topReposByForks.forEach(repo => {
        log(`  ${number.commas(repo.forks_count)} | ${repo.html_url}`);
    });

    const allRepoWatchers = (await db.collection('repositories').aggregate([
        {
            '$group': {
                _id: null,
                watchers: { '$sum': '$subscribers_count' },
            },
        },
    ]).toArray())[0];
    log('');
    log(`Average watchers per repo: ${number.commas(Math.round(allRepoWatchers.watchers / totalRepos))}`);

    const topReposByWatchers = await db.collection('repositories').find({}).sort({ subscribers_count: -1 })
        .limit(5).toArray();
    log('');
    log('Top repos by watchers');
    topReposByWatchers.forEach(repo => {
        log(`  ${number.commas(repo.subscribers_count)} | ${repo.html_url}`);
    });

    const ReposStarsVsForks = await db.collection('repositories').aggregate([
        {
            '$project': {
                stars: '$stargazers_count',
                forks: '$forks_count',
            },
        },
    ]).toArray();
    const ReposStarsVsForksConfig = chart.config(1000, 1000, [{
        type: 'scatter',
        dataPoints: ReposStarsVsForks.map((data, i) => {
            // Cap the chart for more useful insights
            if (data.stars > 25000) return null;
            if (data.forks > 15000) return null;
            const colors = [
                chart.colors.magenta, chart.colors.purple, chart.colors.cyan, chart.colors.yellow, chart.colors.blue,
            ];
            return {
                x: data.stars,
                y: data.forks,
                color: colors[i % colors.length],
            };
        }).filter(x => x !== null),
    }]);
    ReposStarsVsForksConfig.axisX = {
        ...ReposStarsVsForksConfig.axisX,
        title: 'Stars',
        titleFontSize: 28,
        labelFontSize: 20,
        interval: 5000,
    };
    ReposStarsVsForksConfig.axisY = {
        ...ReposStarsVsForksConfig.axisY,
        title: 'Forks',
        titleFontSize: 28,
        labelFontSize: 20,
        interval: 5000,
        labelAngle: -89,
    };
    ReposStarsVsForksConfig.title = {
        text: 'Repos: Stars vs Forks',
        fontColor: chart.colors.text,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 38,
        padding: 5,
        margin: 10,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    await chart.save(
        path.join(__dirname, '../../images/repos_stars_vs_forks_scatter.png'),
        await chart.render(ReposStarsVsForksConfig),
        { width: 350, x: 500, y: 120 },
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
        { '$limit': 10 },
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
        indexLabelFontFamily: 'monospace',
        indexLabelFontWeight: 'bold',
        indexLabelFontColor: chart.colors.white,
        indexLabelFontSize: 24,
        dataPoints: topRepoLicenses.filter(x => x['_id'] !== null).map((data, i) => {
            const colors = [
                chart.colors.magenta, chart.colors.purple, chart.colors.cyan, chart.colors.yellow, chart.colors.blue,
            ];
            const licenseName = data['_id'] === 'NOASSERTION' ? 'Custom License' : data['_id'];
            topRepoLicensesTotal += data.count;
            return {
                y: data.count,
                indexLabel: `${licenseName}\n${number.commas(data.count)} (${(data.count / totalRepos * 100).toFixed(1)}%)`,
                color: colors[i % colors.length],
            };
        }),
    }]);
    topRepoLicensesConfig.data[0].dataPoints.push({
        y: totalRepos - topRepoLicensesTotal,
        indexLabel: `Others\n${((totalRepos - topRepoLicensesTotal) / totalRepos * 100).toFixed(1)}%`,
        color: chart.colors.darkBox,
        indexLabelFontColor: chart.colors.white,
        indexLabelFontSize: 28,
    });
    topRepoLicensesConfig.axisY = {
        ...topRepoLicensesConfig.axisY,
        labelFontSize: 20,
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
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 38,
        padding: 5,
        margin: 25,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    topRepoLicensesConfig.subtitles = [{
        text: `${number.commas(noLicenseCount)} repositories (${(noLicenseCount / totalRepos * 100).toFixed(1)}%) use no license that GitHub can detect`,
        fontColor: chart.colors.white,
        fontFamily: 'monospace',
        fontSize: 30,
        padding: 15,
        verticalAlign: 'top',
        horizontalAlign: 'right',
        dockInsidePlotArea: true,
        maxWidth: 500,
        backgroundColor: chart.colors.darkBackground,
    }];
    await chart.save(
        path.join(__dirname, '../../images/repos_by_license_bar.png'),
        await chart.render(topRepoLicensesConfig),
        { width: 350, x: 780, y: 275 },
    );
};
