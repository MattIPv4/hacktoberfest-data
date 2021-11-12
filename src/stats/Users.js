const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');

const usersTopCountriesChart = async (userData, totalUsers, title, file, interval, mainSubtitle = null, smallSubtitle = null) => {
    const config = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelFontSize: 24,
        dataPoints: userData.slice(0, 10).map(([ country, count ], i) => {
            const colors = [
                chart.colors.highlightPositive, chart.colors.highlightNeutral, chart.colors.highlightNegative,
            ];
            const dataColor = colors[i % colors.length];
            const percentWidth = count / userData[0][1];
            return {
                y: count,
                color: dataColor,
                indexLabelPlacement: percentWidth > 0.4 ? 'inside' : 'outside',
                indexLabel: `${country || 'Not Given'} (${number.percentage(count / totalUsers)})`,
                indexLabelFontColor: chart.colors.text,
            };
        }).reverse(),
    }]);
    config.axisY = {
        ...config.axisY,
        labelFontSize: 24,
        interval,
    };
    config.axisX = {
        ...config.axisX,
        tickThickness: 0,
        labelFormatter: function () {
            return '';
        },
    };
    config.title = {
        ...config.title,
        text: title,
        fontSize: 48,
        padding: 10,
        margin: 10,
    };
    if (mainSubtitle) {
        config.subtitles = [{
            ...config.title,
            text: mainSubtitle,
            fontColor: chart.colors.textBox,
            fontSize: 28,
            padding: 20,
            margin: 0,
            cornerRadius: 5,
            verticalAlign: 'bottom',
            horizontalAlign: 'center',
            backgroundColor: chart.colors.backgroundBox,
        }];

        if (smallSubtitle) {
            config.subtitles.unshift({
                ...config.title,
                text: smallSubtitle,
                fontColor: chart.colors.textBox,
                fontSize: 16,
                padding: 15,
                margin: 10,
                cornerRadius: 5,
                verticalAlign: 'bottom',
                horizontalAlign: 'center',
                backgroundColor: chart.colors.backgroundBox,
            });
        }
    }
    await chart.save(
        path.join(__dirname, `../../generated/${file}.png`),
        await chart.render(config),
        mainSubtitle
            ? smallSubtitle
                ? { width: 200, x: 880, y: 680 }
                : { width: 200, x: 880, y: 740 }
            : { width: 200, x: 880, y: 820 },
    );
};

const cappedAcceptedUserPRs = (data, max) => Object.entries(data.users.pull_requests.accepted.all.counts)
    .reduce((arr, [ prs, users ]) => {
        arr[Math.min(Number(prs), max) - 1][1] += users;
        return arr;
    }, Array(max).fill(null).map((_, i) => [ i + 1, 0 ]));

module.exports = async (data, log) => {
    /***************
     * User Stats
     ***************/
    log('\n\n----\nUser Stats\n----');
    const results = {};

    // Total users
    results.totalUsers = data.users.states.all.count;
    results.totalUsersEngaged = ['waiting', 'welcome', 'contributor'].reduce((sum, state) => sum + (data.users.states.all.states?.[state] || 0), 0);
    results.totalUsersNotEngaged = results.totalUsers - results.totalUsersEngaged;
    results.totalUsersCompleted = data.users.states.all.states.contributor;
    results.totalUsersDisqualified = data.users.states.all.states.disqualified;
    log('');
    log(`Total Users: ${number.commas(results.totalUsers)}`);
    log(`  Users that submitted 1+ accepted PRs: ${number.commas(results.totalUsersEngaged)} (${number.percentage(results.totalUsersEngaged / results.totalUsers)})`);
    log(`  Users that submitted 4+ accepted PRs: ${number.commas(results.totalUsersCompleted)} (${number.percentage(results.totalUsersCompleted / results.totalUsers)})`);
    log(`  Users that were disqualified: ${number.commas(results.totalUsersDisqualified)} (${number.percentage(results.totalUsersDisqualified / results.totalUsers)})`);


    // Users by accepted PRs
    results.totalUsersByAcceptedPRs = cappedAcceptedUserPRs(data, 10);

    log('');
    log('Users by number of accepted PRs submitted:');
    for (const [ prs, users ] of results.totalUsersByAcceptedPRs) {
        log(`  ${prs}${prs === 10 ? '+' : ''} PR${prs === 1 ? '' : 's'}: ${number.commas(users)} (${number.percentage(users / results.totalUsers)})`);
    }

    const totalUsersByPRsExtConfig = chart.config(2500, 1000, [{
        type: 'column',
        dataPoints: results.totalUsersByAcceptedPRs.map(([ prs, users ]) => ({
            y: users,
            color: Number.parseInt(prs) > 4 ? chart.colors.highlightNeutral : Number.parseInt(prs) === 4 ? chart.colors.highlightPositive : chart.colors.highlightNegative,
            label: `${prs}${prs === 10 ? '+' : ''} PR${prs === 1 ? '' : 's'}`,
        })),
    }]);
    totalUsersByPRsExtConfig.axisX = {
        ...totalUsersByPRsExtConfig.axisX,
        labelFontSize: 36,
    };
    totalUsersByPRsExtConfig.axisY = {
        ...totalUsersByPRsExtConfig.axisY,
        labelFontSize: 24,
    };
    totalUsersByPRsExtConfig.title = {
        ...totalUsersByPRsExtConfig.title,
        text: 'Users: Accepted Pull Requests',
        fontSize: 48,
        padding: 5,
        margin: 40,
    };
    totalUsersByPRsExtConfig.subtitles = [{
        ...totalUsersByPRsExtConfig.title,
        text: `In total, ${number.commas(results.totalUsersCompleted)} users (${number.percentage(results.totalUsersCompleted / results.totalUsers)}) submitted 4 or more accepted PRs, winning Hacktoberfest.`,
        fontColor: chart.colors.textBox,
        fontSize: 32,
        padding: 15,
        margin: 0,
        cornerRadius: 5,
        verticalAlign: 'top',
        horizontalAlign: 'right',
        dockInsidePlotArea: true,
        maxWidth: 800,
        backgroundColor: chart.colors.backgroundBox,
    }, {
        ...totalUsersByPRsExtConfig.title,
        text: `Graphic does not include users that submitted no accepted PRs (${number.commas(results.totalUsersNotEngaged)} (${number.percentage(results.totalUsersNotEngaged / results.totalUsers)})).`,
        fontColor: chart.colors.textBox,
        fontSize: 16,
        padding: 15,
        margin: 0,
        cornerRadius: 5,
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        backgroundColor: chart.colors.backgroundBox,
    }];
    await chart.save(
        path.join(__dirname, '../../generated/users_by_prs_extended_column.png'),
        await chart.render(totalUsersByPRsExtConfig),
        { width: 200, x: 1250, y: 220 },
    );

    const totalUsersByPRsConfig = chart.config(1000, 1000, [{
        type: 'column',
        dataPoints: cappedAcceptedUserPRs(data, 5).map(([ prs, users ]) => ({
            y: users,
            color: Number.parseInt(prs) > 4 ? chart.colors.highlightNeutral : Number.parseInt(prs) === 4 ? chart.colors.highlightPositive : chart.colors.highlightNegative,
            label: `${prs}${prs === 5 ? '+' : ''} PR${prs === 1 ? '' : 's'}`,
        })),
    }]);
    totalUsersByPRsConfig.axisX = {
        ...totalUsersByPRsConfig.axisX,
        labelFontSize: 36,
    };
    totalUsersByPRsConfig.axisY = {
        ...totalUsersByPRsConfig.axisY,
        labelFontSize: 24,
    };
    totalUsersByPRsConfig.title = {
        ...totalUsersByPRsConfig.title,
        text: 'Users: Accepted Pull Requests',
        fontSize: 48,
        padding: 5,
        margin: 40,
    };
    totalUsersByPRsConfig.subtitles = [{
        ...totalUsersByPRsConfig.title,
        text: `Graphic does not include users that submitted no accepted PRs (${number.commas(results.totalUsersNotEngaged)} (${number.percentage(results.totalUsersNotEngaged / results.totalUsers)})).`,
        fontColor: chart.colors.textBox,
        fontSize: 16,
        padding: 15,
        margin: 0,
        cornerRadius: 5,
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        backgroundColor: chart.colors.backgroundBox,
    }];
    await chart.save(
        path.join(__dirname, '../../generated/users_by_prs_column.png'),
        await chart.render(totalUsersByPRsConfig),
        { width: 200, x: 500, y: 180 },
    );

    // Registrations by country
    results.totalUsersByCountry = Object.entries(data.users.metadata.country.all.values)
        .sort((a, b) => a[1] < b[1] ? 1 : -1);

    log('');
    log(`Top countries by registrations: ${number.commas(results.totalUsersByCountry.length)} countries`);
    for (const [ country, count ] of results.totalUsersByCountry.slice(0, 25)) {
        log(`  ${country || 'Not Given'}: ${number.commas(count)} (${number.percentage(count / results.totalUsers)})`);
    }

    const registrationsCaption = `In total, at least ${number.commas(results.totalUsersByCountry.filter(([ country ]) => country !== '').length)} countries were represented by users who registered to participate in Hacktoberfest.`;
    await usersTopCountriesChart(
        results.totalUsersByCountry,
        results.totalUsers,
        'Registered Users: Top Countries',
        'users_registrations_top_countries_bar',
        10000,
        registrationsCaption,
    );
    await usersTopCountriesChart(
        results.totalUsersByCountry.filter(([ country ]) => !['', 'United States', 'India'].includes(country)),
        results.totalUsers,
        'Registered Users: Top Countries',
        'users_registrations_top_countries_bar_excl',
        1000,
        registrationsCaption,
        `Graphic does not include India (${number.percentage(results.totalUsersByCountry.find(([ country ]) => country === 'India')[1] / results.totalUsers)}), the United States (${number.percentage(results.totalUsersByCountry.find(([ country ]) => country === 'United States')[1] / results.totalUsers)}), and users that did not specify their country (${number.percentage(results.totalUsersByCountry.find(([ country ]) => country === '')[1] / results.totalUsers)}).`,
    );

    // Completions by country
    results.totalUsersCompletedByCountry = Object.entries(data.users.metadata.country.states.contributor.values)
        .sort((a, b) => a[1] < b[1] ? 1 : -1);

    log('');
    log(`Top countries by completions: ${number.commas(results.totalUsersCompletedByCountry.length)} countries`);
    for (const [ country, count ] of results.totalUsersCompletedByCountry.slice(0, 25)) {
        log(`  ${country || 'Not Given'}: ${number.commas(count)} (${number.percentage(count / results.totalUsersCompleted)})`);
    }

    const completionsCaption = `In total, at least ${number.commas(results.totalUsersCompletedByCountry.filter(([ country ]) => country !== '').length)} countries were represented by users who completed and won Hacktoberfest.`;
    await usersTopCountriesChart(
        results.totalUsersCompletedByCountry,
        results.totalUsersCompleted,
        'Completed Users: Top Countries',
        'users_completions_top_countries_bar',
        2500,
        completionsCaption,
    );
    await usersTopCountriesChart(
        results.totalUsersCompletedByCountry.filter(([ country ]) => !['', 'United States', 'India'].includes(country)),
        results.totalUsersCompleted,
        'Completed Users: Top Countries',
        'users_completions_top_countries_bar_excl',
        250,
        completionsCaption,
        `Graphic does not include India (${number.percentage(results.totalUsersCompletedByCountry.find(([ country ]) => country === 'India')[1] / results.totalUsersCompleted)}), the United States (${number.percentage(results.totalUsersCompletedByCountry.find(([ country ]) => country === 'United States')[1] / results.totalUsersCompleted)}), and users that did not specify their country (${number.percentage(results.totalUsersCompletedByCountry.find(([ country ]) => country === '')[1] / results.totalUsersCompleted)}).`,
    );

    // Completions percentage by country
    results.totalUsersCompletedPercentageByCountry = Object.entries(data.users.metadata.country.states.contributor.values)
        .map(([ country, count ]) => [ country, count, count / data.users.metadata.country.all.values[country] ])
        .sort((a, b) => a[2] < b[2] ? 1 : -1);

    log('');
    log(`Top countries by completions percentage: ${number.commas(results.totalUsersCompletedPercentageByCountry.length)} countries`);
    for (const [ country, count, percentage ] of results.totalUsersCompletedPercentageByCountry.slice(0, 25)) {
        log(`  ${country || 'Not Given'}: ${number.percentage(percentage)} (${number.commas(count)})`);
    }

    return results;
};
