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

    // PRs by state
    const totalPRs = await db.collection('pull_requests').find({}).count();
    const totalInvalidLabelPRs = await db.collection('pull_requests').find({'app.state': 'invalid_label'}).count();
    const totalSpamRepoPRs = await db.collection('pull_requests').find({'app.state': 'spam_repo'}).count();
    const totalInvalidPRs = totalInvalidLabelPRs + totalSpamRepoPRs;
    const totalTopicMissingPRs = await db.collection('pull_requests').find({'app.state': 'topic_missing'}).count();
    const totalNotAcceptedPRs = await db.collection('pull_requests').find({'app.state': 'not_accepted'}).count();
    const totalUnacceptedPRs = totalTopicMissingPRs + totalNotAcceptedPRs;
    const totalEligiblePRs = await db.collection('pull_requests').find({'app.state': 'eligible'}).count();
    log('');
    log(`Total PRs: ${number.commas(totalPRs)}`);
    log(`  Eligible PRs: ${number.commas(totalEligiblePRs)} (${(totalEligiblePRs / totalPRs * 100).toFixed(2)}%)`);
    log(`  Unaccepted PRs: ${number.commas(totalUnacceptedPRs)} (${(totalUnacceptedPRs / totalPRs * 100).toFixed(2)}%)`);
    log(`    of which were not in a participating repo: ${number.commas(totalTopicMissingPRs)} (${(totalTopicMissingPRs / totalUnacceptedPRs * 100).toFixed(2)}%)`);
    log(`    of which were not accepted by a maintainer: ${number.commas(totalNotAcceptedPRs)} (${(totalNotAcceptedPRs / totalUnacceptedPRs * 100).toFixed(2)}%)`);
    log(`  Invalid PRs: ${number.commas(totalInvalidPRs)} (${(totalInvalidPRs / totalPRs * 100).toFixed(2)}%)`);
    log(`    of which were in an excluded repo: ${number.commas(totalSpamRepoPRs)} (${(totalSpamRepoPRs / totalInvalidPRs * 100).toFixed(2)}%)`);
    log(`    of which were labeled as invalid: ${number.commas(totalInvalidLabelPRs)} (${(totalInvalidLabelPRs / totalInvalidPRs * 100).toFixed(2)}%)`);
    const totalPRsByStateConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 22,
        indexLabelFontColor: chart.colors.text,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        dataPoints: [
            {
                y: totalEligiblePRs,
                indexLabel: `Eligible\n${number.commas(totalEligiblePRs)} (${(totalEligiblePRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.blue,
                indexLabelFontSize: 32,
            },
            {
                y: totalTopicMissingPRs,
                indexLabel: `Repo not participating\n${number.commas(totalTopicMissingPRs)} (${(totalTopicMissingPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.pink,
            },
            {
                y: totalNotAcceptedPRs,
                indexLabel: `Not accepted by maintainer\n${number.commas(totalNotAcceptedPRs)} (${(totalNotAcceptedPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.pink,
            },
            {
                y: totalSpamRepoPRs,
                indexLabel: `Excluded repository\n${number.commas(totalSpamRepoPRs)} (${(totalSpamRepoPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.crimson,
            },
            {
                y: totalInvalidLabelPRs,
                indexLabel: `Labelled invalid or spam\n${number.commas(totalInvalidLabelPRs)} (${(totalInvalidLabelPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.crimson,
            },
        ],
    }]);
    totalPRsByStateConfig.title = {
        text: 'PRs: Breakdown by State',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 72,
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
        maxWidth: 800,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_state_doughnut.png'),
        await chart.render(totalPRsByStateConfig),
        { width: 150, x: 500, y: 540 },
    );

    // PRs by acceptance method
    const totalPRsByAcceptance = await db.collection('pull_requests').aggregate([
        {
            '$match': {
                'app.state': 'eligible',
            },
        },
        {
            '$lookup': {
                from: 'users',
                localField: 'user.id',
                foreignField: 'id',
                as: 'full_user',
            },
        },
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
                full_user: { '$arrayElemAt': [ '$full_user', 0 ] },
                repository: { '$arrayElemAt': [ '$repository', 0 ] },
            },
        },
        {
            '$set': {
                frozen: {
                    '$arrayElemAt': [
                        {
                            '$filter': {
                                input: '$full_user.app.receipt',
                                as: 'pr',
                                cond: {
                                    '$eq': [ '$$pr.id', '$app.gh_id' ],
                                },
                            },
                        },
                        0,
                    ],
                },
            },
        },
        {
            '$project': {
                state_before_rules: {
                    '$lte': [
                        {
                            '$dateFromString': {
                                dateString: '$created_at',
                            },
                        },
                        {
                            '$dateFromString': {
                                dateString: '2020-10-03T12:00:00.000Z',
                            },
                        },
                    ]
                },
                // The REST data doesn't have approval, so if not in frozen assume false
                state_approved: { '$ifNull': [ { '$eq': [ '$frozen.reviewDecision', 'APPROVED' ] }, false ] },
                state_merged: { '$ifNull': [ '$frozen.merged', '$merged' ] },
                state_has_topic: {
                    '$in': [
                        'hacktoberfest',
                        {
                            '$map': {
                                input: {
                                    '$ifNull': [
                                        {
                                            '$map': {
                                                input: '$frozen.repository.repositoryTopics.edges',
                                                as: 'topic',
                                                in: '$$topic.node.topic.name',
                                            },
                                        },
                                        '$repository.topics.names',
                                    ],
                                },
                                as: 'topic',
                                in: { '$trim': { input: { '$toLower': '$$topic' } } },
                            },
                        },
                    ],
                },
                state_has_label: {
                    '$in': [
                        'hacktoberfest-accepted',
                        {
                            '$map': {
                                input: {
                                    '$ifNull': [
                                        {
                                            '$map': {
                                                input: '$frozen.labels.edges',
                                                as: 'label',
                                                in: '$$label.node.name',
                                            },
                                        },
                                        {
                                            '$map': {
                                                input: '$labels',
                                                as: 'label',
                                                in: '$$label.name',
                                            },
                                        },
                                    ],
                                },
                                as: 'label',
                                in: { '$trim': { input: { '$toLower': '$$label' } } },
                            },
                        },
                    ],
                },
            },
        },
        {
            '$project': {
                state: {
                    '$cond': {
                        if: { '$and': [ '$state_has_label', { '$not': '$state_has_topic' } ] },
                        then: 'labelled_external_repo',
                        else: {
                            '$cond': {
                                if: { '$and': [ '$state_has_label', '$state_has_topic' ] },
                                then: 'labelled_participating_repo',
                                else: {
                                    '$cond': {
                                        if: { '$and': [ '$state_merged', '$state_has_topic' ] },
                                        then: 'merged_participating_repo',
                                        else: {
                                            '$cond': {
                                                if: { '$and': [ '$state_approved', '$state_has_topic' ] },
                                                then: 'approved_participating_repo',
                                                else: {
                                                    '$cond': {
                                                        if: '$state_before_rules',
                                                        then: 'before_rules_change',
                                                        else: 'unknown',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    ]).toArray();
    console.log(totalPRsByAcceptance);

    // TODO: Eligible PRs by acceptance method
    // TODO: Doughnut: PRs by acceptance

    // Users x PRs
    const totalUsers = await db.collection('users').find({}).count();
    log('');
    log(`Average PRs per user: ${number.commas(Math.round(totalPRs / totalUsers))}`);
    log(`  Average eligible PRs: ${number.commas(Math.round(totalEligiblePRs / totalUsers))}`);
    log(`  Average unaccepted PRs: ${number.commas(Math.round(totalUnacceptedPRs / totalUsers))}`);
    log(`  Average invalid PRs: ${number.commas(Math.round(totalInvalidPRs / totalUsers))}`);

    // Breaking down PRs by language, other tags
    const totalPRsByLanguage = await db.collection('pull_requests').aggregate([
        {
            '$match': {
                'app.state': 'eligible',
            },
        },
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
    totalPRsByLanguage.limit(50).forEach(group => {
        const name = group['_id'] || 'Undetermined';
        log(`  ${name}: ${number.commas(group.count)} (${(group.count / totalPRs * 100).toFixed(2)}%)`);
    });
    let doughnutTotal = 0;
    const totalPRsByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        indexLabelPlacement: 'inside',
        indexLabelFontSize: 22,
        indexLabelFontFamily: '\'Inter\', sans-serif',
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
        fontFamily: '\'VT323\', monospace',
        fontSize: 72,
        padding: 5,
        verticalAlign: 'center',
        horizontalAlign: 'center',
        maxWidth: 500,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_language_doughnut.png'),
        await chart.render(totalPRsByLanguageConfig),
        { width: 150, x: 500, y: 660 },
    );

    const totalPRsByDayByLanguage = await db.collection('pull_requests').aggregate([
        {
            '$match': {
                'app.state': 'eligible',
            },
        },
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
        fontFamily: '\'VT323\', monospace',
        fontSize: 72,
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    totalPRsByDayByLanguageConfig.backgroundColor = chart.colors.dark;
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_language_spline.png'),
        await chart.render(totalPRsByDayByLanguageConfig),
        { width: 200, x: 1250, y: 180 },
    );

    // Lines of code per PR
    // PII!
    // const PRsByChanges = await db.collection('pull_requests').aggregate([
    //     {
    //         '$set': {
    //             changes: { '$add': [ '$additions', '$deletions' ] },
    //         },
    //     },
    //     { '$sort': { changes: -1 } },
    //     { '$limit': 15 },
    // ]).toArray();
    // log('');
    // log('Largest changes in a PR:');
    // PRsByChanges.forEach(pr => {
    //     log(`  ${number.commas(pr.changes)} | ${pr.html_url}`);
    // });

    // Breaking down PRs by day
    const totalPRsByDay = await db.collection('pull_requests').aggregate([
        {
            '$match': {
                'app.state': 'eligible',
            },
        },
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
        indexLabelFontSize: 24,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        indexLabelFontColor: chart.colors.white,
        dataPoints: totalPRsByDay.limit(10).map((data, i) => {
            const colors = [
                chart.colors.blue, chart.colors.pink, chart.colors.crimson,
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
        labelFontSize: 34,
    };
    totalPRsByDayConfig.axisY = {
        ...totalPRsByDayConfig.axisY,
        labelFontSize: 34,
    };
    totalPRsByDayConfig.title = {
        text: 'PRs: Most Popular Days',
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
        path.join(__dirname, '../../generated/prs_by_day_bar.png'),
        await chart.render(totalPRsByDayConfig),
        { width: 200, x: 880, y: 820 },
    );
};
