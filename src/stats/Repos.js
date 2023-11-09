const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const linguist = require('../helpers/linguist');
const color = require('../helpers/color');

module.exports = async (data, log) => {
    /***************
     * Repo Stats
     ***************/
    log('\n\n----\nRepo Stats\n----');
    const results = {};
    await linguist.load();

    // Total: Repos
    results.totalReposActive = data.repositories.pull_requests.accepted.count;
    results.totalReposTracked = Object.values(data.repositories.languages.languages).reduce((acc, count) => acc + count, 0);
    results.totalReposReported = data.excluded_repositories.count;
    results.totalReposExcluded = data.excluded_repositories.active.true.count;
    results.totalReposPermitted = data.excluded_repositories.active.false.has_note.true.count;
    results.totalReposUnreviewed = data.excluded_repositories.active.false.has_note.false.count;
    log('');
    log(`Total active repos: ${number.commas(results.totalReposActive)}`);
    log('(A repository was considered active if it received a PR/MR from a Hacktoberfest participant that was considered accepted)');
    log('');
    log(`Total tracked repos: ${number.commas(results.totalReposTracked)}`);
    log('(A repository was considered tracked if it received a PR/MR from a Hacktoberfest participant, whether the repository was participating in Hacktoberfest or not)');
    log('');
    log(`Reported repositories: ${number.commas(results.totalReposReported)}`);
    log('(The Hacktoberfest community was able to report repositories that they did not feel followed our values)');
    log(`  Excluded repositories: ${number.commas(results.totalReposExcluded)} (${number.percentage(results.totalReposExcluded / results.totalReposReported)})`);
    log(`  Permitted repositories: ${number.commas(results.totalReposPermitted)} (${number.percentage(results.totalReposPermitted / results.totalReposReported)})`);
    log(`  Unreviewed repositories: ${number.commas(results.totalReposUnreviewed)} (${number.percentage(results.totalReposUnreviewed / results.totalReposReported)})`);

    const totalReposReportedConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 90,
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 32,
        showInLegend: true,
        dataPoints: [
            {
                y: results.totalReposExcluded,
                indexLabel: 'Excluded',
                legendText: `Excluded: ${number.commas(results.totalReposExcluded)} (${number.percentage(results.totalReposExcluded / results.totalReposReported)})`,
                color: chart.colors.highlightNegative,
            },
            {
                y: results.totalReposPermitted,
                indexLabel: 'Permitted',
                legendText: `Permitted: ${number.commas(results.totalReposPermitted)} (${number.percentage(results.totalReposPermitted / results.totalReposReported)})`,
                color: chart.colors.highlightPositive,
            },
            {
                y: results.totalReposUnreviewed,
                indexLabel: 'Unreviewed',
                legendText: `Unreviewed: ${number.commas(results.totalReposUnreviewed)} (${number.percentage(results.totalReposUnreviewed / results.totalReposReported)})`,
                color: chart.colors.highlightNeutral,
            },
        ].map(x => [x, {
            y: results.totalReposReported * 0.007,
            color: 'transparent',
            showInLegend: false,
        }]).flat(1),
    }], { padding: { top: 10, left: 5, right: 5, bottom: 5 }});
    totalReposReportedConfig.title = {
        ...totalReposReportedConfig.title,
        text: 'Reported Repositories',
        fontSize: 48,
        padding: 5,
        margin: 25,
    };
    totalReposReportedConfig.legend = {
        ...totalReposReportedConfig.legend,
        fontSize: 36,
        markerMargin: 32,
        maxWidth: 750,
        margin: 25,
    };
    totalReposReportedConfig.subtitles = [
        {
            text: '_',
            fontColor: chart.colors.background,
            fontSize: 16,
            verticalAlign: 'bottom',
            horizontalAlign: 'center',
        },
    ];
    await chart.save(
        path.join(__dirname, '../../generated/repos_reported_doughnut.png'),
        await chart.render(totalReposReportedConfig),
        { width: 250, x: 500, y: 475 },
    );

    // Breaking down repos by language
    results.totalReposByLanguage = Object.entries(data.repositories.languages.languages)
        .filter(([ lang ]) => lang && lang !== 'null')
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    results.totalReposNoLanguage = data.repositories.languages.languages.null;
    log('');
    log(`Tracked repos by language: ${results.totalReposByLanguage.length} languages`);
    for (const [ lang, count ] of results.totalReposByLanguage.slice(0, 50)) {
        const name = lang || 'Unknown';
        log(`  ${name}: ${number.commas(count)} (${number.percentage(count / results.totalReposTracked)})`);
    }
    log(`Tracked repos without a detectable language: ${number.commas(results.totalReposNoLanguage)} (${number.percentage(results.totalReposNoLanguage / results.totalReposTracked)})`);

    let doughnutTotal = 0;
    const totalReposByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 180,
        indexLabelPlacement: 'outside',
        dataPoints: results.totalReposByLanguage.slice(0, 10).map(([ lang, count ]) => {
            const dataColor = linguist.get(lang) || chart.colors.highlightNeutral;
            const percent = (count || 0) / results.totalReposTracked;
            doughnutTotal += (count || 0);
            return {
                y: count || 0,
                indexLabel: `${lang.split(' ')[0]}: ${number.percentage(percent)}`,
                color: dataColor,
                indexLabelFontSize: percent > 0.1 ? 24 : percent > 0.05 ? 22 : 20,
                indexLabelMaxWidth: 500,
            };
        }),
    }], { padding: { top: 5, left: 10, right: 10, bottom: 5 }});
    if (results.totalReposTracked > doughnutTotal) {
        totalReposByLanguageConfig.data[0].dataPoints.push({
            y: results.totalReposTracked - doughnutTotal,
            indexLabel: `Others: ${number.percentage((results.totalReposTracked - doughnutTotal) / results.totalReposTracked)}`,
            color: chart.colors.highlightNeutral,
            indexLabelFontSize: 24,
        });
    }
    totalReposByLanguageConfig.data[0].dataPoints = totalReposByLanguageConfig.data[0].dataPoints.map(x => [x, {
        y: results.totalReposTracked * 0.005,
        color: 'transparent',
        showInLegend: false,
    }]).flat(1);
    totalReposByLanguageConfig.title = {
        ...totalReposByLanguageConfig.title,
        text: 'Tracked Repos: Top 10 Languages',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalReposByLanguageConfig.subtitles = [{
        ...totalReposByLanguageConfig.title,
        text: 'A repository was considered tracked if it received a PR/MR from a Hacktoberfest participant, whether the repository was participating in Hacktoberfest or not',
        fontSize: 16,
        padding: 10,
        margin: 5,
        cornerRadius: 5,
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        maxWidth: 900,
        backgroundColor: chart.colors.backgroundBox,
        fontColor: chart.colors.textBox,
    }, {
        ...totalReposByLanguageConfig.title,
        text: `Hacktoberfest saw ${number.commas(results.totalReposByLanguage.length)} different programming languages represented across the ${number.commas(results.totalReposTracked)} tracked repositories.`,
        fontSize: 32,
        padding: 20,
        margin: 0,
        cornerRadius: 5,
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        maxWidth: 850,
        backgroundColor: chart.colors.backgroundBox,
        fontColor: chart.colors.textBox,
    }];
    await chart.save(
        path.join(__dirname, '../../generated/repos_by_language_doughnut.png'),
        await chart.render(totalReposByLanguageConfig),
        { width: 200, x: 500, y: 435 },
    );

    // Breakdown by license
    results.totalReposByLicenses = Object.entries(data.repositories.licenses.licenses)
        .filter(([ license ]) => license && license !== 'null')
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    results.totalReposNoLicense = data.repositories.licenses.licenses.null;
    log('');
    log(`Tracked repos by license: ${results.totalReposByLicenses.length} licenses`);
    for (const [ license, count ] of results.totalReposByLicenses.slice(0, 50)) {
        log(`  ${license}: ${number.commas(count)} (${number.percentage(count / results.totalReposTracked)})`);
    }
    log(`Tracked repos without a detectable license: ${number.commas(results.totalReposNoLicense)} (${number.percentage(results.totalReposNoLicense / results.totalReposTracked)})`);

    let topRepoLicensesTotal = results.totalReposNoLicense;
    const topRepoLicensesConfig = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelFontSize: 24,
        dataPoints: results.totalReposByLicenses.slice(0, 10).map(([ license, count ], i) => {
            const colors = [
                chart.colors.highlightPositive,
                chart.colors.highlightNeutral,
                chart.colors.highlightNeutralAlt,
                chart.colors.highlightNegative,
            ];
            const dataColor = colors[i % colors.length];
            const percentWidth = count / results.totalReposByLicenses[0][1];
            topRepoLicensesTotal += count;
            return {
                y: count,
                indexLabelPlacement: percentWidth > 0.4 ? 'inside' : 'outside',
                indexLabel: `${license}: ${number.commas(count)} (${number.percentage(count / results.totalReposTracked)})`,
                color: dataColor,
                indexLabelFontColor: (percentWidth > 0.4 && color.isBright(chart.colors.highlightPositive))
                    ? chart.colors.background : chart.colors.text,
            };
        }),
    }]);
    topRepoLicensesConfig.data[0].dataPoints.push({
        y: results.totalReposTracked - topRepoLicensesTotal,
        indexLabelPlacement: 'outside',
        indexLabel: `Others: ${number.commas(results.totalReposTracked - topRepoLicensesTotal)} (${number.percentage((results.totalReposTracked - topRepoLicensesTotal) / results.totalReposTracked)})`,
        color: chart.colors.highlightNeutral,
        indexLabelFontColor: chart.colors.text,
    });
    topRepoLicensesConfig.axisY = {
        ...topRepoLicensesConfig.axisY,
        tickThickness: 0,
        labelFormatter: () => '',
    };
    topRepoLicensesConfig.axisX = {
        ...topRepoLicensesConfig.axisX,
        tickThickness: 0,
        labelFormatter: () => '',
    };
    topRepoLicensesConfig.title = {
        ...topRepoLicensesConfig.title,
        text: 'Tracked Repos: Top 10 Licenses',
        fontSize: 48,
        padding: 10,
        margin: 10,
    };
    topRepoLicensesConfig.subtitles = [{
        ...totalReposByLanguageConfig.title,
        text: 'A repository was considered tracked if it received a PR/MR from a Hacktoberfest participant, whether the repository was participating in Hacktoberfest or not',
        fontSize: 16,
        padding: 10,
        margin: 0,
        cornerRadius: 5,
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        maxWidth: 900,
        backgroundColor: chart.colors.backgroundBox,
        fontColor: chart.colors.textBox,
    }, {
        ...topRepoLicensesConfig.title,
        text: `${number.percentage(results.totalReposNoLicense / results.totalReposTracked)} repositories use no license that can be detected`,
        fontSize: 28,
        padding: 20,
        margin: 0,
        cornerRadius: 5,
        verticalAlign: 'top',
        horizontalAlign: 'right',
        dockInsidePlotArea: true,
        maxWidth: 500,
        backgroundColor: chart.colors.backgroundBox,
        fontColor: chart.colors.textBox,
    }];
    await chart.save(
        path.join(__dirname, '../../generated/repos_by_license_bar.png'),
        await chart.render(topRepoLicensesConfig),
        { width: 200, x: 880, y: 325 },
    );

    return results;
};
