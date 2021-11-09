const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const linguist = require('../helpers/linguist');
const color = require('../helpers/color');
const { getDateArray, dateFromDay, formatDate } = require('../helpers/date');

module.exports = async (data, log) => {
    /***************
     * PR Stats
     ***************/
    log('\n\n----\nPR Stats\n----');
    const results = {};
    await linguist.load();

    // PRs by state
    results.totalPRs = data.pull_requests.states.all.count - data.pull_requests.states.all.states['out-of-bounds'];
    results.totalAcceptedPRs = data.pull_requests.states.all.states['accepted'];
    results.totalNotAcceptedPRs = data.pull_requests.states.all.states['not-accepted'];
    results.totalNotParticipatingPRs = data.pull_requests.states.all.states['not-participating'];
    results.totalSpamPRs = data.pull_requests.states.all.states['spam'];
    results.totalExcludedPRs = data.pull_requests.states.all.states['excluded'];

    const totalInvalidPRs = results.totalSpamPRs + results.totalExcludedPRs;
    const totalUnacceptedPRs = results.totalNotAcceptedPRs + results.totalNotParticipatingPRs;
    log('');
    log(`Total PRs: ${number.commas(results.totalPRs)}`);
    log(`  Accepted PRs: ${number.commas(results.totalAcceptedPRs)} (${number.percentage(results.totalAcceptedPRs / results.totalPRs)})`);
    log(`  Unaccepted PRs: ${number.commas(totalUnacceptedPRs)} (${number.percentage(totalUnacceptedPRs / results.totalPRs)})`);
    log(`    of which were not in a participating repo: ${number.commas(results.totalNotParticipatingPRs)} (${number.percentage(results.totalNotParticipatingPRs / totalUnacceptedPRs)})`);
    log(`    of which were not accepted by a maintainer: ${number.commas(results.totalNotAcceptedPRs)} (${number.percentage(results.totalNotAcceptedPRs / totalUnacceptedPRs)})`);
    log(`  Invalid PRs: ${number.commas(totalInvalidPRs)} (${number.percentage(totalInvalidPRs / results.totalPRs)})`);
    log(`    of which were in an excluded repo: ${number.commas(results.totalExcludedPRs)} (${number.percentage(results.totalExcludedPRs / totalInvalidPRs)})`);
    log(`    of which were labeled as spam/invalid: ${number.commas(results.totalSpamPRs)} (${number.percentage(results.totalSpamPRs / totalInvalidPRs)})`);

    const totalPRsByStateConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 160,
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 22,
        showInLegend: true,
        dataPoints: [
            {
                y: results.totalAcceptedPRs,
                indexLabel: 'Accepted',
                legendText: `Accepted: ${number.commas(results.totalAcceptedPRs)} (${number.percentage(results.totalAcceptedPRs / results.totalPRs)})`,
                color: chart.colors.highlightPositive,
                indexLabelFontSize: 32,
            },
            {
                y: results.totalNotParticipatingPRs,
                indexLabel: 'Not participating',
                legendText: `Repo not participating: ${number.commas(results.totalNotParticipatingPRs)} (${number.percentage(results.totalNotParticipatingPRs / results.totalPRs)})`,
                color: chart.colors.highlightNeutral,
            },
            {
                y: results.totalNotAcceptedPRs,
                indexLabel: 'Not accepted',
                legendText: `Not accepted by maintainer: ${number.commas(results.totalNotAcceptedPRs)} (${number.percentage(results.totalNotAcceptedPRs / results.totalPRs)})`,
                color: chart.colors.highlightNeutral,
            },
            {
                y: results.totalExcludedPRs,
                indexLabel: 'Excluded repo',
                legendText: `Excluded repository: ${number.commas(results.totalExcludedPRs)} (${number.percentage(results.totalExcludedPRs / results.totalPRs)})`,
                color: chart.colors.highlightNegative,
            },
            {
                y: results.totalSpamPRs,
                indexLabel: 'Labeled invalid',
                legendText: `Labeled invalid or spam: ${number.commas(results.totalSpamPRs)} (${number.percentage(results.totalSpamPRs / results.totalPRs)})`,
                color: chart.colors.highlightNegative,
            },
        ].map(x => [x, {
            y: results.totalPRs * 0.007,
            color: 'transparent',
            showInLegend: false,
        }]).flat(1),
    }], { padding: { top: 10, left: 5, right: 5, bottom: 20 }});
    totalPRsByStateConfig.title = {
        ...totalPRsByStateConfig.title,
        text: 'All PRs: Breakdown by State',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalPRsByStateConfig.legend = {
        ...totalPRsByStateConfig.legend,
        fontSize: 36,
        markerMargin: 32,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_state_doughnut.png'),
        await chart.render(totalPRsByStateConfig),
        { width: 170, x: 500, y: 440 },
    );

    // Accepted PRs by merge status
    results.totalAcceptedPRsMerged = data.pull_requests.merged.true.states.accepted;
    results.totalAcceptedPRsNotMerged = data.pull_requests.merged.false.states.accepted;

    log('');
    log('Accepted PRs by merge status:');
    log(`  Merged: ${number.commas(results.totalAcceptedPRsMerged)} (${number.percentage(results.totalAcceptedPRsMerged / results.totalAcceptedPRs)})`);
    log(`  Open: ${number.commas(results.totalAcceptedPRsNotMerged)} (${number.percentage(results.totalAcceptedPRsNotMerged / results.totalAcceptedPRs)})`);

    const totalAcceptedPRsMergedConfig = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelFontSize: 32,
        dataPoints: [
            {
                y: results.totalAcceptedPRsMerged,
                label: 'Yes',
                color: chart.colors.highlightPositive,
                indexLabelPlacement: results.totalAcceptedPRsMerged / results.totalAcceptedPRs > 0.2 ? 'inside' : 'outside',
                indexLabel: number.percentage(results.totalAcceptedPRsMerged / results.totalAcceptedPRs),
            },
            {
                y: results.totalAcceptedPRsNotMerged,
                label: 'No',
                color: chart.colors.highlightNeutral,
                indexLabelPlacement: results.totalAcceptedPRsNotMerged / results.totalAcceptedPRs > 0.2 ? 'inside' : 'outside',
                indexLabel: number.percentage(results.totalAcceptedPRsNotMerged / results.totalAcceptedPRs),
            },
        ].sort((a, b) => a.y > b.y ? 1 : -1),
    }]);
    totalAcceptedPRsMergedConfig.axisX = {
        ...totalAcceptedPRsMergedConfig.axisX,
        labelFontSize: 36,
    };
    totalAcceptedPRsMergedConfig.axisY = {
        ...totalAcceptedPRsMergedConfig.axisY,
        labelFontSize: 24,
    };
    totalAcceptedPRsMergedConfig.title = {
        ...totalAcceptedPRsMergedConfig.title,
        text: 'Accepted PRs: Changes Merged',
        fontSize: 48,
        padding: 5,
        margin: 40,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_accepted_by_merged_bar.png'),
        await chart.render(totalAcceptedPRsMergedConfig),
        { width: 200, x: 880, y: 820 },
    );

    // Accepted PRs by approval
    results.totalAcceptedPRsApproved = data.pull_requests.approved.true.states.accepted;
    results.totalAcceptedPRsNotApproved = data.pull_requests.approved.false.states.accepted;

    log('');
    log('Accepted PRs by approval:');
    log(`  Approved: ${number.commas(results.totalAcceptedPRsApproved)} (${number.percentage(results.totalAcceptedPRsApproved / results.totalAcceptedPRs)})`);
    log(`  Pending: ${number.commas(results.totalAcceptedPRsNotApproved)} (${number.percentage(results.totalAcceptedPRsNotApproved / results.totalAcceptedPRs)})`);

    const totalAcceptedPRsApprovedConfig = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelFontSize: 32,
        dataPoints: [
            {
                y: results.totalAcceptedPRsApproved,
                label: 'Yes',
                color: chart.colors.highlightPositive,
                indexLabelPlacement: results.totalAcceptedPRsApproved / results.totalAcceptedPRs > 0.2 ? 'inside' : 'outside',
                indexLabel: number.percentage(results.totalAcceptedPRsApproved / results.totalAcceptedPRs),
            },
            {
                y: results.totalAcceptedPRsNotApproved,
                label: 'No',
                color: chart.colors.highlightNeutral,
                indexLabelPlacement: results.totalAcceptedPRsNotApproved / results.totalAcceptedPRs > 0.2 ? 'inside' : 'outside',
                indexLabel: number.percentage(results.totalAcceptedPRsNotApproved / results.totalAcceptedPRs),
            },
        ].sort((a, b) => a.y > b.y ? 1 : -1),
    }]);
    totalAcceptedPRsApprovedConfig.axisX = {
        ...totalAcceptedPRsApprovedConfig.axisX,
        labelFontSize: 36,
    };
    totalAcceptedPRsApprovedConfig.axisY = {
        ...totalAcceptedPRsApprovedConfig.axisY,
        labelFontSize: 24,
    };
    totalAcceptedPRsApprovedConfig.title = {
        ...totalAcceptedPRsApprovedConfig.title,
        text: 'Accepted PRs: Maintainer Approval',
        fontSize: 48,
        padding: 5,
        margin: 40,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_accepted_by_approval_bar.png'),
        await chart.render(totalAcceptedPRsApprovedConfig),
        { width: 200, x: 880, y: 820 },
    );

    // Breaking down accepted PRs by language, other tags
    results.totalAcceptedPRsByLanguage = Object.entries(data.pull_requests.languages.all.languages)
        .filter(([ lang ]) => lang && lang !== 'null')
        .map(([ lang, data ]) => [ lang, data.states.accepted || 0 ])
        .sort((a, b) => a[1] < b[1] ? 1 : -1);

    log('');
    log(`Accepted PRs by language: ${number.commas(results.totalAcceptedPRsByLanguage.length)} languages`);
    for (const [ lang, count ] of results.totalAcceptedPRsByLanguage.slice(0, 50)) {
        const name = lang || 'Unknown';
        log(`  ${name}: ${number.commas(count)} (${number.percentage(count / results.totalAcceptedPRs)})`);
    }

    let doughnutTotal = 0;
    const totalPRsByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 180,
        indexLabelPlacement: 'outside',
        dataPoints: results.totalAcceptedPRsByLanguage.slice(0, 10).map(([ lang, count ]) => {
            const dataColor = linguist.get(lang) || chart.colors.highlightNeutral;
            const percent = (count || 0) / results.totalAcceptedPRs;
            doughnutTotal += (count || 0);
            return {
                y: count || 0,
                indexLabel: `${lang.split(' ')[0]}: ${number.commas(count || 0)} (${number.percentage(percent)})`,
                color: dataColor,
                indexLabelFontSize: percent > 0.1 ? 24 : percent > 0.05 ? 22 : 20,
                indexLabelMaxWidth: 500,
            };
        }),
    }], { padding: { top: 5, left: 10, right: 10, bottom: 30 }});
    if (results.totalAcceptedPRs > doughnutTotal) {
        totalPRsByLanguageConfig.data[0].dataPoints.push({
            y: results.totalAcceptedPRs - doughnutTotal,
            indexLabel: `Others: ${number.commas(results.totalAcceptedPRs - doughnutTotal)} (${number.percentage((results.totalAcceptedPRs - doughnutTotal) / results.totalAcceptedPRs)})`,
            color: chart.colors.highlightNeutral,
            indexLabelFontSize: 24,
        });
    }
    totalPRsByLanguageConfig.data[0].dataPoints = totalPRsByLanguageConfig.data[0].dataPoints.map(x => [x, {
        y: results.totalAcceptedPRs * 0.005,
        color: 'transparent',
        showInLegend: false,
    }]).flat(1);
    totalPRsByLanguageConfig.title = {
        ...totalPRsByLanguageConfig.title,
        text: 'Accepted PRs: Top 10 Languages',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalPRsByLanguageConfig.subtitles = [{
        ...totalPRsByLanguageConfig.title,
        text: `Hacktoberfest saw ${number.commas(results.totalAcceptedPRsByLanguage.length)} different programming languages represented across the ${number.commas(results.totalAcceptedPRs)} accepted PRs submitted by users.`,
        fontSize: 32,
        padding: 20,
        cornerRadius: 5,
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        maxWidth: 850,
        backgroundColor: chart.colors.backgroundBox,
        fontColor: chart.colors.textBox,
    }];
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_language_doughnut.png'),
        await chart.render(totalPRsByLanguageConfig),
        { width: 120, x: 500, y: 445 },
    );

    return results;

    /*// Breaking down PRs by day
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
                chart.colors.highlightPositive, chart.colors.highlightNeutral, chart.colors.highlightNegative,
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
        fontColor: chart.colors.highlightPositive,
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
    log(`  ${number.integer(averagesPRs.requested_reviewers)} requested reviews, ${number.integer(averagesPRs.requested_teams)} requested team reviewers`);*/
};
