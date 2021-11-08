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
        startAngle: 160,
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 22,
        indexLabelFontColor: chart.colors.text,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        showInLegend: true,
        dataPoints: [
            {
                y: totalEligiblePRs,
                indexLabel: 'Eligible',
                legendText: `Eligible: ${number.commas(totalEligiblePRs)} (${(totalEligiblePRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.blue,
                indexLabelFontSize: 32,
            },
            {
                y: totalTopicMissingPRs,
                indexLabel: 'Repo not participating',
                legendText: `Repo not participating: ${number.commas(totalTopicMissingPRs)} (${(totalTopicMissingPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.pink,
            },
            {
                y: totalNotAcceptedPRs,
                indexLabel: 'Not accepted',
                legendText: `Not accepted by maintainer: ${number.commas(totalNotAcceptedPRs)} (${(totalNotAcceptedPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.pink,
            },
            {
                y: totalSpamRepoPRs,
                indexLabel: 'Excluded repo',
                legendText: `Excluded repository: ${number.commas(totalSpamRepoPRs)} (${(totalSpamRepoPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.crimson,
            },
            {
                y: totalInvalidLabelPRs,
                indexLabel: 'Labelled invalid',
                legendText: `Labelled invalid or spam: ${number.commas(totalInvalidLabelPRs)} (${(totalInvalidLabelPRs / totalPRs * 100).toFixed(1)}%)`,
                color: chart.colors.crimson,
            },
        ].map(x => [x, {
            y: totalPRs * 0.007,
            color: 'transparent',
            showInLegend: false,
        }]).flat(1),
    }], { padding: { top: 10, left: 5, right: 5, bottom: 20 }});
    totalPRsByStateConfig.title = {
        text: 'All PRs: Breakdown by State',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 72,
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
        maxWidth: 900,
    };
    totalPRsByStateConfig.legend = {
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 44,
        markerMargin: 24,
        horizontalAlign: 'center',
        verticalAlign: 'bottom',
        maxWidth: 980,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_state_doughnut.png'),
        await chart.render(totalPRsByStateConfig),
        { width: 150, x: 500, y: 425 },
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
                    ],
                },
                // The REST data doesn't have approval, so if not in frozen assume false
                state_approved: { '$ifNull': [ { '$eq': [ '$frozen.reviewDecision', 'APPROVED' ] }, false ] },
                state_merged: { '$ifNull': [ '$frozen.merged', '$merged' ] },
                state_has_topic: {
                    '$in': [
                        'hacktoberfest',
                        {
                            '$ifNull': [
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
                                [],
                            ],
                        },
                    ],
                },
                state_has_label: {
                    '$in': [
                        'hacktoberfest-accepted',
                        {
                            '$ifNull': [
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
                                [],
                            ],
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
        {
            '$group': {
                _id: '$state',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
    ]).toArray();
    const stateMap = {
        labelled_external_repo: {
            short: 'Labelled accepted',
            label: 'Labelled hacktoberfest-accepted',
            color: chart.colors.pink,
        },
        labelled_participating_repo: {
            short: 'Labelled accepted, with topic',
            label: 'Labelled hacktoberfest-accepted, with hacktoberfest topic',
            color: chart.colors.blue,
        },
        merged_participating_repo: {
            short: 'Merged, with topic',
            label: 'Merged by maintainer, with hacktoberfest topic',
            color: chart.colors.blue,
        },
        approved_participating_repo: {
            short: 'Approved, with topic',
            label: 'Approved by maintainer, with hacktoberfest topic',
            color: chart.colors.blue,
        },
        before_rules_change: {
            short: 'Before rules change',
            label: 'Created before rules change',
            color: chart.colors.crimson,
        },
        unknown: {
            short: 'Unknown',
            label: 'Unknown',
            color: chart.colors.light,
        },
    };
    log('');
    log('Eligible PRs by acceptance method:');
    for (const state of totalPRsByAcceptance) {
        log(`  ${stateMap[state._id].label}: ${number.commas(state.count)} (${(state.count / totalEligiblePRs * 100).toFixed(2)}%)`);
    }
    const missingKeys = Object.keys(stateMap).filter(x => !totalPRsByAcceptance.map(y => y._id).includes(x));
    totalPRsByAcceptance.push(...missingKeys.map(x => ({
        _id: x,
        count: 0,
    })));
    const totalPRsByAcceptanceConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 160,
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 22,
        indexLabelFontColor: chart.colors.text,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        showInLegend: true,
        dataPoints: totalPRsByAcceptance.map(state => {
            const data = stateMap[state._id];
            return {
                y: state.count,
                indexLabel: data.short,
                legendText: `${data.label}: ${number.commas(state.count)} (${(state.count / totalEligiblePRs * 100).toFixed(1)}%)`,
                color: data.color,
            };
        }).map(x => [x, {
            y: totalEligiblePRs * 0.007,
            color: 'transparent',
            showInLegend: false,
        }]).flat(1),
    }], { padding: { top: 10, left: 5, right: 5, bottom: 20 }});
    totalPRsByAcceptanceConfig.title = {
        text: 'Eligible PRs: Acceptance Method',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 72,
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
        maxWidth: 980,
    };
    totalPRsByAcceptanceConfig.legend = {
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 44,
        horizontalAlign: 'center',
        verticalAlign: 'bottom',
        maxWidth: 980,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_acceptance_doughnut.png'),
        await chart.render(totalPRsByAcceptanceConfig),
        { width: 150, x: 500, y: 335 },
    );

    // Users x PRs
    const totalUsers = await db.collection('users').find({}).count();
    log('');
    log(`Average PRs per user: ${number.commas(totalPRs / totalUsers)}`);
    log(`  Average eligible PRs: ${number.commas(totalEligiblePRs / totalUsers)}`);
    log(`  Average unaccepted PRs: ${number.commas(totalUnacceptedPRs / totalUsers)}`);
    log(`  Average invalid PRs: ${number.commas(totalInvalidPRs / totalUsers)}`);

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
    log(`Eligible PRs by language: ${number.commas(totalPRsByLanguage.length)} languages`);
    totalPRsByLanguage.limit(50).forEach(group => {
        const name = group['_id'] || 'Undetermined';
        log(`  ${name}: ${number.commas(group.count)} (${(group.count / totalEligiblePRs * 100).toFixed(2)}%)`);
    });
    let doughnutTotal = 0;
    const totalPRsByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 170,
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 22,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        indexLabelFontColor: chart.colors.white,
        dataPoints: totalPRsByLanguage.filter(data => data['_id']).limit(20).map(data => {
            const dataColor = linguist.get(data['_id']) || chart.colors.lightBox;
            const percent = data.count / totalEligiblePRs * 100;
            doughnutTotal += data.count;
            return {
                y: data.count,
                indexLabel: `${data['_id']}: ${number.commas(data.count)} (${percent.toFixed(1)}%)`,
                color: dataColor,
                indexLabelFontSize: percent > 10 ? 24 : percent > 4 ? 22 : 20,
            };
        }),
    }], { padding: { top: 5, left: 10, right: 10, bottom: 30 }});
    if (totalEligiblePRs > doughnutTotal) {
        totalPRsByLanguageConfig.data[0].dataPoints.push({
            y: totalPRs - doughnutTotal,
            indexLabel: `Others: ${number.commas(totalEligiblePRs - doughnutTotal)} (${((totalEligiblePRs - doughnutTotal) / totalEligiblePRs * 100).toFixed(1)}%)`,
            color: chart.colors.darkBox,
            indexLabelFontColor: chart.colors.white,
            indexLabelFontSize: 24,
        });
    }
    totalPRsByLanguageConfig.data[0].dataPoints = totalPRsByLanguageConfig.data[0].dataPoints.map(x => [x, {
        y: totalEligiblePRs * 0.005,
        color: 'transparent',
        showInLegend: false,
    }]).flat(1);
    totalPRsByLanguageConfig.title = {
        text: 'Eligible PRs: Top 20 Languages',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 72,
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
        maxWidth: 900,
    };
    totalPRsByLanguageConfig.subtitles = [{
        text: `Hacktoberfest saw ${number.commas(totalPRsByLanguage.length)} different programming languages represented across the ${number.commas(totalEligiblePRs)} eligible PRs submitted by users.`,
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
        path.join(__dirname, '../../generated/prs_by_language_doughnut.png'),
        await chart.render(totalPRsByLanguageConfig),
        { width: 150, x: 500, y: 460 },
    );

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
    log('Top days by eligible PRs:');
    totalPRsByDay.forEach(day => {
        log(`  ${formatDate(dateFromDay(2020, day['_id']))} | ${number.commas(day.count)} (${(day.count / totalEligiblePRs * 100).toFixed(2)}%)`);
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
                label: formatDate(dateFromDay(2020, data['_id']), true),
                color: dataColor,
                indexLabel: `${(data.count / totalEligiblePRs * 100).toFixed(2)}%`,
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
        text: 'Eligible PRs: Most Popular Days',
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

    // Breaking down PRs by day and by language
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
        const dates = getDateArray(new Date('2020-09-30'), new Date('2020-11-01'));
        const PRsByDate = data.data.reduce(function(result, item) {
            result[dateFromDay(2020, item.day).toDateString()] = item.count;
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
        text: 'Eligible PRs: Top 10 Languages',
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontSize: 84,
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    totalPRsByDayByLanguageConfig.subtitles = [{
        text: `On ${formatDate(dateFromDay(2020, totalPRsByDay[0]._id), false)}, over ${Math.floor(totalPRsByDay[0].count / totalEligiblePRs * 100)}% of the total eligible PRs for Hacktoberfest were submitted in just one day: ${number.commas(totalPRsByDay[0].count)} PRs.`,
        fontColor: chart.colors.blue,
        fontFamily: '\'VT323\', monospace',
        fontSize: 40,
        padding: 100,
        verticalAlign: 'top',
        horizontalAlign: 'right',
        dockInsidePlotArea: true,
        maxWidth: 700,
        backgroundColor: chart.colors.darkBackground,
    }];
    totalPRsByDayByLanguageConfig.backgroundColor = chart.colors.dark;
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_language_spline.png'),
        await chart.render(totalPRsByDayByLanguageConfig),
        { width: 200, x: 1250, y: 220 },
    );

    // Averages of certain metrics
    const averagesPRs = (await db.collection('pull_requests').aggregate([
        {
            '$match': {
                'app.state': 'eligible',
            },
        },
        {
            '$group': {
                _id: null,
                additions: { '$avg': '$additions' },
                assignees: { '$avg': { '$size': { '$ifNull': [ '$assignees', [] ] } } },
                changed_files: { '$avg': '$changed_files' },
                comments: { '$avg': '$comments' },
                commits: { '$avg': '$commits' },
                deletions: { '$avg': '$deletions' },
                labels: { '$avg': { '$size': { '$ifNull': [ '$labels', [] ] } } },
                requested_reviewers: { '$avg': { '$size': { '$ifNull': [ '$requested_reviewers', [] ] } } },
                requested_teams: { '$avg': { '$size': { '$ifNull': [ '$requested_teams', [] ] } } },
                review_comments: { '$avg': '$review_comments' },
            },
        },
    ]).toArray())[0];
    log('');
    log('On average, an eligible PR had:');
    log(`  ${number.integer(averagesPRs.commits)} commits`);
    log(`  ${number.integer(averagesPRs.changed_files)} modified files`);
    log(`  ${number.integer(averagesPRs.additions)} additions, ${number.integer(averagesPRs.deletions)} deletions`);
    log(`  ${number.integer(averagesPRs.comments)} comments`);
    log(`  ${number.integer(averagesPRs.review_comments)} review comments`);
    log(`  ${number.integer(averagesPRs.labels)} labels`);
    log(`  ${number.integer(averagesPRs.assignees)} assigned users`);
    log(`  ${number.integer(averagesPRs.requested_reviewers)} requested reviews, ${number.integer(averagesPRs.requested_teams)} requested team reviewers`);
};
