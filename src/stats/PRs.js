const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const linguist = require('../helpers/linguist');
const color = require('../helpers/color');
const { getDateArray, formatDate } = require('../helpers/date');

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
    log(`Total PRs/MRs: ${number.commas(results.totalPRs)}`);
    log(`  Accepted PRs/MRs: ${number.commas(results.totalAcceptedPRs)} (${number.percentage(results.totalAcceptedPRs / results.totalPRs)})`);
    log(`  Unaccepted PRs/MRs: ${number.commas(totalUnacceptedPRs)} (${number.percentage(totalUnacceptedPRs / results.totalPRs)})`);
    log(`    of which were not in a participating repo: ${number.commas(results.totalNotParticipatingPRs)} (${number.percentage(results.totalNotParticipatingPRs / totalUnacceptedPRs)})`);
    log(`    of which were not accepted by a maintainer: ${number.commas(results.totalNotAcceptedPRs)} (${number.percentage(results.totalNotAcceptedPRs / totalUnacceptedPRs)})`);
    log(`  Invalid PRs/MRs: ${number.commas(totalInvalidPRs)} (${number.percentage(totalInvalidPRs / results.totalPRs)})`);
    log(`    of which were in an excluded repo: ${number.commas(results.totalExcludedPRs)} (${number.percentage(results.totalExcludedPRs / totalInvalidPRs)})`);
    log(`    of which were labeled as spam/invalid: ${number.commas(results.totalSpamPRs)} (${number.percentage(results.totalSpamPRs / totalInvalidPRs)})`);

    const totalPRsByStateConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 150,
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
                indexLabel: 'Excluded',
                legendText: `Excluded repository: ${number.commas(results.totalExcludedPRs)} (${number.percentage(results.totalExcludedPRs / results.totalPRs)})`,
                color: chart.colors.highlightNegative,
            },
            {
                y: results.totalSpamPRs,
                indexLabel: 'Invalid/spam',
                legendText: `Labeled invalid or spam: ${number.commas(results.totalSpamPRs)} (${number.percentage(results.totalSpamPRs / results.totalPRs)})`,
                color: chart.colors.highlightNegative,
            },
        ].map(x => [x, {
            y: results.totalPRs * 0.007,
            color: 'transparent',
            showInLegend: false,
        }]).flat(1),
    }], { padding: { top: 10, left: 5, right: 5, bottom: 5 }});
    totalPRsByStateConfig.title = {
        ...totalPRsByStateConfig.title,
        text: 'All PRs/MRs: Breakdown by State',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalPRsByStateConfig.legend = {
        ...totalPRsByStateConfig.legend,
        fontSize: 36,
        markerMargin: 32,
    };
    totalPRsByStateConfig.subtitles = [
        {
            text: '_',
            fontColor: chart.colors.background,
            fontSize: 16,
            verticalAlign: 'bottom',
            horizontalAlign: 'center',
        },
    ];
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_state_doughnut.png'),
        await chart.render(totalPRsByStateConfig),
        { width: 170, x: 500, y: 440 },
    );

    // Accepted PRs by merge status
    results.totalAcceptedPRsMerged = data.pull_requests.merged.true.states.accepted;
    results.totalAcceptedPRsNotMerged = data.pull_requests.merged.false.states.accepted;

    log('');
    log('Accepted PRs/MRs by merge status:');
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
        text: 'Accepted PRs/MRs:\nChanges Merged',
        fontSize: 48,
        padding: 5,
        margin: 100,
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
    log('Accepted PRs/MRs by approval:');
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
        text: 'Accepted PRs/MRs:\nMaintainer Approval',
        fontSize: 48,
        padding: 5,
        margin: 100,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_accepted_by_approval_bar.png'),
        await chart.render(totalAcceptedPRsApprovedConfig),
        { width: 200, x: 880, y: 820 },
    );

    // Breaking down accepted PRs by language, other tags
    results.totalAcceptedPRsByLanguage = Object.entries(data.pull_requests.languages.all.languages)
        .filter(([ lang ]) => lang && lang !== 'null')
        .map(([ lang, langData ]) => [ lang, langData.states.accepted || 0 ])
        .sort((a, b) => a[1] < b[1] ? 1 : -1);

    log('');
    log(`Accepted PRs/MRs by language: ${number.commas(results.totalAcceptedPRsByLanguage.length)} languages`);
    for (const [ lang, count ] of results.totalAcceptedPRsByLanguage.slice(0, 50)) {
        log(`  ${lang}: ${number.commas(count)} (${number.percentage(count / results.totalAcceptedPRs)})`);
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
        text: 'Accepted PRs/MRs: Top 10 Languages',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalPRsByLanguageConfig.subtitles = [{
        ...totalPRsByLanguageConfig.title,
        text: `Hacktoberfest saw ${number.commas(results.totalAcceptedPRsByLanguage.length)} different programming languages represented across the ${number.commas(results.totalAcceptedPRs)} accepted PRs/MRs submitted by participants.`,
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

    // Breaking down PRs by day
    results.totalPRsByDay = Object.entries(data.pull_requests.states.daily)
        .map(([ day, dayData ]) => [ day, dayData.states.accepted || 0 ])
        .sort((a, b) => a[1] < b[1] ? 1 : -1)
        .slice(0, 15);

    log('');
    log('Top days by accepted PRs/MRs:');
    for (const [ day, count ] of results.totalPRsByDay) {
        log(`  ${formatDate(new Date(day))}: ${number.commas(count)} (${number.percentage(count / results.totalAcceptedPRs)})`);
    }

    const totalPRsByDayConfig = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelPlacement: 'inside',
        indexLabelFontSize: 24,
        dataPoints: results.totalPRsByDay.slice(0, 10).map(([ day, count ], i) => {
            const colors = [
                chart.colors.highlightPositive, chart.colors.highlightNeutral, chart.colors.highlightNegative,
            ];
            const dataColor = colors[i % colors.length];
            return {
                y: count,
                label: formatDate(new Date(day), true),
                color: dataColor,
                indexLabel: number.percentage(count / results.totalAcceptedPRs),
                indexLabelFontColor: color.isBright(dataColor) ? chart.colors.background : chart.colors.text,
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
        ...totalPRsByDayConfig.title,
        text: 'Accepted PRs/MRs: Most Popular Days',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    await chart.save(
        path.join(__dirname, '../../generated/prs_by_day_bar.png'),
        await chart.render(totalPRsByDayConfig),
        { width: 200, x: 880, y: 820 },
    );

    // Breaking down PRs by day and by language
    results.totalAcceptedPRsByLanguageByDay = results.totalAcceptedPRsByLanguage.slice(0, 10).map(([ language ]) => ({
        language,
        daily: getDateArray(new Date('2021-09-29'), new Date('2021-11-03'))
            .map(date => ({
                date,
                count: data.pull_requests.languages.daily?.[date.toISOString().split('T')[0]]?.languages?.[language]?.states?.accepted || 0,
            })),
    }));
    const totalPRsByLanguageByDayConfig = chart.config(2500, 1000, results.totalAcceptedPRsByLanguageByDay
        .map(({ language, daily }) => ({
            type: 'spline',
            name: language,
            showInLegend: true,
            dataPoints: daily.map(({ date, count }) => ({
                x: date,
                y: count,
            })),
            lineThickness: 3,
            color: linguist.get(language) || chart.colors.highlightNeutral,
        })));
    totalPRsByLanguageByDayConfig.axisX = {
        ...totalPRsByLanguageByDayConfig.axisX,
        labelFontSize: 34,
        interval: 1,
        intervalType: 'week',
        title: 'PR/MR Created At',
        titleFontSize: 24,
        titleFontWeight: 400,
    };
    totalPRsByLanguageByDayConfig.axisY = {
        ...totalPRsByLanguageByDayConfig.axisY,
        labelFontSize: 34,
        interval: 500,
    };
    totalPRsByLanguageByDayConfig.title = {
        ...totalPRsByLanguageByDayConfig.title,
        text: 'Accepted PRs/MRs: Top 10 Languages',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalPRsByLanguageByDayConfig.subtitles = [
        {
            text: '_',
            fontColor: chart.colors.text,
            fontSize: 16,
            verticalAlign: 'bottom',
            horizontalAlign: 'center',
        },
    ];

    totalPRsByLanguageByDayConfig.backgroundColor = chart.colors.text;
    totalPRsByLanguageByDayConfig.title.fontColor = chart.colors.background;
    totalPRsByLanguageByDayConfig.legend.fontColor = chart.colors.background;
    totalPRsByLanguageByDayConfig.axisX.labelFontColor = chart.colors.background;
    totalPRsByLanguageByDayConfig.axisX.titleFontColor = chart.colors.background;
    totalPRsByLanguageByDayConfig.axisX.lineColor = color.lighten(chart.colors.text, 10);
    totalPRsByLanguageByDayConfig.axisX.gridColor = color.lighten(chart.colors.text, 10);
    totalPRsByLanguageByDayConfig.axisX.tickColor = color.lighten(chart.colors.text, 10);
    totalPRsByLanguageByDayConfig.axisY.labelFontColor = chart.colors.background;
    totalPRsByLanguageByDayConfig.axisY.titleFontColor = chart.colors.background;
    totalPRsByLanguageByDayConfig.axisY.lineColor = color.lighten(chart.colors.text, 10);
    totalPRsByLanguageByDayConfig.axisY.gridColor = color.lighten(chart.colors.text, 10);
    totalPRsByLanguageByDayConfig.axisY.tickColor = color.lighten(chart.colors.text, 10);

    await chart.save(
        path.join(__dirname, '../../generated/prs_by_language_spline.png'),
        await chart.render(totalPRsByLanguageByDayConfig),
        { width: 200, x: 1250, y: 220 },
    );

    // Breaking down PRs by day and by state
    results.totalPRsByStateByDay = Object.keys(data.pull_requests.states.all.states)
        .map(state => ({
            state,
            daily: getDateArray(new Date('2021-09-29'), new Date('2021-11-03'))
                .map(date => ({
                    date,
                    count: data.pull_requests.states.daily?.[date.toISOString().split('T')[0]]?.states?.[state] || 0,
                })),
        }));

    const totalPRsByStateByDayOrder = ['accepted', 'not-participating', 'not-accepted', 'excluded', 'spam'];
    const totalPRsByStateByDayColors = {
        spam: color.darken(chart.colors.highlightNegative, 20),
        excluded: chart.colors.highlightNegative,
        'not-accepted': color.darken(chart.colors.highlightNeutral, 20),
        'not-participating': chart.colors.highlightNeutral,
        accepted: chart.colors.highlightPositive,
    };

    const totalPRsByStateByDayConfig = chart.config(2500, 1000, results.totalPRsByStateByDay
        .filter(({ state }) => totalPRsByStateByDayOrder.includes(state))
        .sort((a, b) => totalPRsByStateByDayOrder.indexOf(b.state) - totalPRsByStateByDayOrder.indexOf(a.state))
        .map(({ state, daily }) => ({
            type: 'stackedArea',
            name: state,
            showInLegend: true,
            dataPoints: daily.map(({ date, count }) => ({
                x: date,
                y: count,
            })),
            lineThickness: 3,
            color: totalPRsByStateByDayColors[state] || chart.colors.highlightNeutral,
        })));
    totalPRsByStateByDayConfig.axisX = {
        ...totalPRsByStateByDayConfig.axisX,
        labelFontSize: 34,
        interval: 1,
        intervalType: 'week',
        title: 'PR Created At',
        titleFontSize: 24,
        titleFontWeight: 400,
    };
    totalPRsByStateByDayConfig.axisY = {
        ...totalPRsByStateByDayConfig.axisY,
        labelFontSize: 34,
        interval: 2500,
    };
    totalPRsByStateByDayConfig.title = {
        ...totalPRsByStateByDayConfig.title,
        text: 'All PRs/MRs: Breakdown by State',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalPRsByStateByDayConfig.subtitles = [
        {
            text: '_',
            fontColor: chart.colors.text,
            fontSize: 16,
            verticalAlign: 'bottom',
            horizontalAlign: 'center',
        },
    ];

    await chart.save(
        path.join(__dirname, '../../generated/prs_by_state_stacked.png'),
        await chart.render(totalPRsByStateByDayConfig),
        { width: 200, x: 1250, y: 220 },
    );

    // Averages of certain metrics
    results.averageAcceptedPRCommits = data.pull_requests.commits.states.accepted / results.totalAcceptedPRs;
    results.averageAcceptedPRFiles = data.pull_requests.files.states.accepted / results.totalAcceptedPRs;
    results.averageAcceptedPRAdditions = data.pull_requests.additions.states.accepted / results.totalAcceptedPRs;
    results.averageAcceptedPRDeletions = data.pull_requests.deletions.states.accepted / results.totalAcceptedPRs;

    log('');
    log('On average, an accepted PR/MR had:');
    log(`  ${number.integer(results.averageAcceptedPRCommits)} commits`);
    log(`  ${number.integer(results.averageAcceptedPRFiles)} modified files`);
    log(`  ${number.integer(results.averageAcceptedPRAdditions)} additions`);
    log(`  ${number.integer(results.averageAcceptedPRDeletions)} deletions`);

    // TODO: Bar of PRs by state by provider

    return results;
};
