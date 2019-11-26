require('../prototypes');

const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const linguist = require('../helpers/linguist');
const color = require('../helpers/color');
const { getDateArray, dateFromDay, formatDate } = require('../helpers/date');

module.exports = async (db, log) => {
    /***************
     * PR Stats
     ***************/
    log('\n\n----\nPR Stats\n----');
    await linguist.load();

    // Total PRs and invalid PRs
    const totalPRs = await db.collection('pull_requests').find({}).count();
    const totalInvalidLabelPRs = await db.collection('pull_requests').find({'labels.name': 'invalid'}).count();
    // TODO: Check Hacktoberfest app to see how lax "invalid" checking was (trimmed?, lower-cased?)
    const totalInvalidRepoPRs = (await db.collection('pull_requests').aggregate([
        {
            '$lookup': {
                from: 'spam_repositories',
                localField: 'base.repo.id',
                foreignField: 'Repo ID',
                as: 'spam',
            },
        },
        { '$match': { 'spam.Verified?': 'checked' } },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0].count;
    const totalInvalidPRs = totalInvalidLabelPRs + totalInvalidRepoPRs;
    const totalValidPRs = totalPRs - totalInvalidPRs;
    log('');
    log(`Total PRs: ${number.commas(totalPRs)}`);
    log(`  Valid PRs: ${number.commas(totalValidPRs)} (${(totalValidPRs / totalPRs * 100).toFixed(2)}%)`);
    log(`  Invalid PRs: ${number.commas(totalInvalidPRs)} (${(totalInvalidPRs / totalPRs * 100).toFixed(2)}%)`);
    log(`    of which were in an excluded repo: ${number.commas(totalInvalidRepoPRs)} (${(totalInvalidRepoPRs / totalInvalidPRs * 100).toFixed(2)}%)`);
    log(`    of which were labeled as invalid: ${number.commas(totalInvalidLabelPRs)} (${(totalInvalidLabelPRs / totalInvalidPRs * 100).toFixed(2)}%)`);

    const totalUsers = await db.collection('users').find({}).count();
    log('');
    log(`Average PRs per user: ${number.commas(Math.round(totalPRs / totalUsers))}`);
    log(`  Average valid PRs: ${number.commas(Math.round(totalValidPRs / totalUsers))}`);
    log(`  Average invalid PRs: ${number.commas(Math.round(totalInvalidPRs / totalUsers))}`);

    // Breaking down PRs by language, other tags
    const totalPRsByLanguage = await db.collection('pull_requests').aggregate([
        {
            '$lookup': {
                from: 'repositories',
                localField: 'base.repo.id',
                foreignField: 'id',
                as: 'repository',
            },
        },
        {
            '$project': {
                repository: { '$arrayElemAt': [ '$repository', 0 ] },
            },
        },
        {
            '$group': {
                _id: '$repository.language',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
    ]).toArray();
    log('');
    log(`PRs by language: ${number.commas(totalPRsByLanguage.length)} languages`);
    totalPRsByLanguage.limit(25).forEach(group => {
        const name = group['_id'] || 'Undetermined';
        log(`  ${name}: ${number.commas(group.count)} (${(group.count / totalPRs * 100).toFixed(2)}%)`);
    });
    let doughnutTotal = 0;
    const totalPRsByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        indexLabelPlacement: 'inside',
        indexLabelFontSize: 22,
        indexLabelFontFamily: 'monospace',
        dataPoints: totalPRsByLanguage.limit(10).map(data => {
            const name = data['_id'] || 'Undetermined';
            const dataColor = linguist.get(name) || chart.colors.lightBox;
            const displayName = name === 'TypeScript' ? 'TS' : name; // TypeScript causes length/overlap issues
            const percent = data.count / totalPRs * 100;
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
    totalPRsByLanguageConfig.data[0].dataPoints.push({
        y: totalPRs - doughnutTotal,
        indexLabel: `Others\n${((totalPRs - doughnutTotal) / totalPRs * 100).toFixed(1)}%`,
        color: chart.colors.darkBox,
        indexLabelFontColor: chart.colors.white,
        indexLabelFontSize: 28,
    });
    totalPRsByLanguageConfig.title = {
        text: 'PRs: Top 10 Languages',
        fontColor: chart.colors.text,
        fontFamily: 'monospace',
        padding: 5,
        verticalAlign: 'center',
        horizontalAlign: 'center',
        maxWidth: 500,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_language_doughnut.png'),
        await chart.render(totalPRsByLanguageConfig),
        { width: 300, x: 500, y: 640 },
    );

    const totalPRsByDayByLanguage = await db.collection('pull_requests').aggregate([
        {
            '$lookup': {
                from: 'repositories',
                localField: 'base.repo.id',
                foreignField: 'id',
                as: 'repository',
            },
        },
        {
            '$set': {
                repository: { '$arrayElemAt': [ '$repository', 0 ] },
                day: { '$dayOfYear': { '$dateFromString': { dateString: '$created_at' } } },
            },
        },
        {
            '$group': {
                _id: {
                    language: '$repository.language',
                    day: '$day',
                },
                count: { '$sum': 1 },
            },
        },
        {
            '$group': {
                _id: '$_id.language',
                data: { '$push': {count: '$count', day: '$_id.day'} },
                count: { '$sum': '$count' },
            },
        },
        { '$sort': { count: -1 } },
        { '$limit': 10 },
    ]).toArray();
    const totalPRsByDayByLanguageConfig = chart.config(2500, 1000, totalPRsByDayByLanguage.map(data => {
        const name = data['_id'] || 'Undetermined';
        const dates = getDateArray(new Date('2019-09-30'), new Date('2019-11-01'));
        const PRsByDate = data.data.reduce(function(result, item) {
            result[dateFromDay(2019, item.day).toDateString()] = item.count;
            return result;
        }, {});
        const PRData = dates.map(date => {
            const dateString = date.toDateString();
            return { x: date, y: dateString in PRsByDate ? PRsByDate[dateString] : 0 };
        }).sort((a, b) => {
            return b.x - a.x;
        });
        return {
            type: 'spline',
            name: name,
            showInLegend: true,
            dataPoints: PRData,
            lineThickness: 3,
            color: linguist.get(name) || chart.colors.light,
        };
    }));
    totalPRsByDayByLanguageConfig.axisX = {
        ...totalPRsByDayByLanguageConfig.axisX,
        interval: 1,
        intervalType: 'week',
    };
    totalPRsByDayByLanguageConfig.title = {
        text: 'PRs: Top 10 Languages',
        fontColor: chart.colors.text,
        fontFamily: 'monospace',
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    totalPRsByDayByLanguageConfig.backgroundColor = chart.colors.dark;
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_language_spline.png'),
        await chart.render(totalPRsByDayByLanguageConfig),
        { width: 400, x: 1250, y: 150 },
    );

    // Lines of code per PR
    const PRsByChanges = await db.collection('pull_requests').aggregate([
        {
            '$set': {
                changes: { '$add': [ '$additions', '$deletions' ] },
            },
        },
        { '$sort': { changes: -1 } },
        { '$limit': 15 },
    ]).toArray();
    log('');
    log('Largest changes in a PR:');
    PRsByChanges.forEach(pr => {
        log(`  ${number.commas(pr.changes)} | ${pr.html_url}`);
    });

    // Breaking down PRs by day
    const totalPRsByDay = await db.collection('pull_requests').aggregate([
        {
            '$set': {
                day: { '$dayOfYear': { '$dateFromString': { dateString: '$created_at' } } },
            },
        },
        {
            '$group': {
                _id: '$day',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
        { '$limit': 15 },
    ]).toArray();
    log('');
    log('Top days by PRs:');
    totalPRsByDay.forEach(day => {
        log(`  ${formatDate(dateFromDay(2019, day['_id']))} | ${number.commas(day.count)} (${(day.count / totalPRs * 100).toFixed(2)}%)`);
    });
    const totalPRsByDayConfig = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelPlacement: 'inside',
        indexLabelFontSize: 22,
        indexLabelFontFamily: 'monospace',
        indexLabelFontColor: chart.colors.white,
        dataPoints: totalPRsByDay.limit(10).map((data, i) => {
            const colors = [
                chart.colors.magenta, chart.colors.purple, chart.colors.cyan, chart.colors.yellow, chart.colors.blue,
            ];
            const dataColor = colors[i % colors.length];
            return {
                y: data.count,
                label: formatDate(dateFromDay(2019, data['_id']), true),
                color: dataColor,
                indexLabel: `${(data.count / totalPRs * 100).toFixed(2)}%`,
                indexLabelFontColor: color.isBright(dataColor) ? chart.colors.background : chart.colors.white,
            };
        }).reverse(),
    }]);
    totalPRsByDayConfig.axisX = {
        ...totalPRsByDayConfig.axisX,
        labelFontSize: 20,
    };
    totalPRsByDayConfig.axisY = {
        ...totalPRsByDayConfig.axisY,
        labelFontSize: 20,
    };
    totalPRsByDayConfig.title = {
        text: 'PRs: Most Popular Days',
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
        path.join(__dirname, '../../generated/prs_by_day_bar.png'),
        await chart.render(totalPRsByDayConfig),
        { width: 400, x: 780, y: 860 },
    );
};
