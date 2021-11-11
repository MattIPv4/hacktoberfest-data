const path = require('path');
const number = require('../helpers/number');
const country = require('../helpers/country');
const chart = require('../helpers/chart');
const color = require('../helpers/color');

const usersTopCountriesChart = async (userData, totalUsers, title, file, interval, mainSubtitle = null, smallSubtitle = null) => {
    const config = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelFontSize: 24,
        indexLabelFontFamily: '\'Inter\', sans-serif',
        dataPoints: userData.limit(10).map((data, i) => {
            const colors = [
                chart.colors.highlightPositive, chart.colors.highlightNeutral, chart.colors.highlightNegative,
            ];
            const dataColor = colors[i % colors.length];
            return {
                y: data.count,
                color: dataColor,
                indexLabelPlacement: i === 0 ? 'inside' : 'outside',
                indexLabel: `${country.getCountryName(data._id)} (${(data.count / totalUsers * 100).toFixed(2)}%)`,
                indexLabelFontColor: i === 0 ? (color.isBright(dataColor) ? chart.colors.background : chart.colors.white) : chart.colors.white,
            };
        }).reverse(),
    }]);
    config.axisY = {
        ...config.axisY,
        labelFontSize: 34,
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
        text: title,
        fontColor: chart.colors.text,
        fontFamily: '\'VT323\', monospace',
        fontWeight: 'bold',
        fontSize: 64,
        padding: mainSubtitle ? 10 : 5,
        margin: mainSubtitle ? 5 : 10,
        verticalAlign: 'top',
        horizontalAlign: mainSubtitle ? 'left' : 'center',
        maxWidth: mainSubtitle ? 600 : 900,
    };
    if (mainSubtitle) {
        config.subtitles = [{
            text: mainSubtitle,
            fontColor: chart.colors.highlightPositive,
            fontFamily: '\'VT323\', monospace',
            fontSize: 36,
            padding: 15,
            verticalAlign: 'bottom',
            horizontalAlign: 'right',
            dockInsidePlotArea: true,
            maxWidth: 450,
            backgroundColor: chart.colors.darkBackground,
        }];

        if (smallSubtitle) {
            config.subtitles.unshift({
                text: smallSubtitle,
                fontColor: chart.colors.highlightPositive,
                fontFamily: '\'VT323\', monospace',
                fontSize: 22,
                padding: 15,
                verticalAlign: 'bottom',
                horizontalAlign: 'right',
                dockInsidePlotArea: true,
                maxWidth: 350,
                backgroundColor: chart.colors.darkBackground,
            });
        }
    }
    await chart.save(
        path.join(__dirname, `../../generated/${file}.png`),
        await chart.render(config),
        mainSubtitle ? { width: 150, x: 890, y: 80 }
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
    // totalUsersByPRsExtConfig.subtitles = [{
    //     text: `In total, ${number.commas(totalWinnerStateUsers)} users submitted 4+ eligible PRs, winning Hacktoberfest. The most eligible PRs submitted by a single user was ${number.commas(Math.max(...totalUsersByPRs.map(x => x._id)))}.`,
    //     fontColor: chart.colors.highlightPositive,
    //     fontFamily: '\'VT323\', monospace',
    //     fontSize: 40,
    //     padding: 100,
    //     verticalAlign: 'top',
    //     horizontalAlign: 'right',
    //     dockInsidePlotArea: true,
    //     maxWidth: 800,
    //     backgroundColor: chart.colors.darkBackground,
    // }];
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
    await chart.save(
        path.join(__dirname, '../../generated/users_by_prs_column.png'),
        await chart.render(totalUsersByPRsConfig),
        { width: 200, x: 500, y: 180 },
    );

    // Registrations by country
    /*const totalRegistrationsByCountry = await db.collection('users').aggregate([
        {
            '$match': {
                'app.state': {
                    '$nin': ['new'],
                },
            },
        },
        {
            '$project': {
                country: {
                    '$cond': {
                        if: {
                            '$in': [
                                '$app.country',
                                [null, ''],
                            ],
                        },
                        then: null,
                        else: '$app.country',
                    },
                },
            },
        },
        {
            '$group': {
                _id: '$country',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
    ]).toArray();
    log('');
    log(`Top countries by registrations: ${number.commas(totalRegistrationsByCountry.length)} countries`);
    totalRegistrationsByCountry.limit(15).forEach(data => {
        log(`  [${data._id || '--'}] ${country.getCountryName(data._id)} | ${number.commas(data.count)} (${(data.count / totalRegisteredUsers * 100).toFixed(2)}%)`);
    });
    const registrationsCaption = `In total, at least ${number.commas(totalRegistrationsByCountry.filter(x => x._id !== null).length)} countries were represented by users who registered to participate in Hacktoberfest.`;
    await usersTopCountriesChart(
        totalRegistrationsByCountry,
        totalRegisteredUsers,
        'Users (registered): Top Countries',
        'users_registrations_top_countries_bar',
        10000,
        registrationsCaption,
    );
    await usersTopCountriesChart(
        totalRegistrationsByCountry.filter(x => ![null, 'US', 'IN'].includes(x._id)),
        totalRegisteredUsers,
        'Users (registered): Top Countries',
        'users_registrations_top_countries_bar_excl',
        1000,
        registrationsCaption,
        `Graphic does not include the United States (${(totalRegistrationsByCountry.find(x => x._id === 'US').count / totalRegisteredUsers * 100).toFixed(2)}%), India (${(totalRegistrationsByCountry.find(x => x._id === 'IN').count / totalRegisteredUsers * 100).toFixed(2)}%) and users that did not specify their country (${(totalRegistrationsByCountry.find(x => x._id === null).count / totalRegisteredUsers * 100).toFixed(2)}%).`,
    );*/

    // Completions by country
    /*const totalCompletionsByCountry = await db.collection('users').aggregate([
        {
            '$match': {
                'app.state': {
                    '$in': ['completed', 'won_shirt', 'won_sticker'],
                },
            },
        },
        {
            '$project': {
                country: {
                    '$cond': {
                        if: {
                            '$in': [
                                '$app.country',
                                [null, ''],
                            ],
                        },
                        then: null,
                        else: '$app.country',
                    },
                },
            },
        },
        {
            '$group': {
                _id: '$country',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
    ]).toArray();
    log('');
    log(`Top countries by completions: ${number.commas(totalCompletionsByCountry.length)} countries`);
    totalCompletionsByCountry.limit(15).forEach(data => {
        log(`  [${data._id || '--'}] ${country.getCountryName(data._id)} | ${number.commas(data.count)} (${(data.count / totalWinnerStateUsers * 100).toFixed(2)}%)`);
    });
    const completionsCaption = `In total, at least ${number.commas(totalCompletionsByCountry.filter(x => x._id !== null).length)} countries were represented by users who completed and won Hacktoberfest.`;
    await usersTopCountriesChart(
        totalCompletionsByCountry,
        totalWinnerStateUsers,
        'Users (completions): Top Countries',
        'users_completions_top_countries_bar',
        10000,
        completionsCaption,
    );
    await usersTopCountriesChart(
        totalCompletionsByCountry.filter(x => ![null, 'US', 'IN'].includes(x._id)),
        totalWinnerStateUsers,
        'Users (completions): Top Countries',
        'users_completions_top_countries_bar_excl',
        1000,
        completionsCaption,
        `Graphic does not include the United States (${(totalCompletionsByCountry.find(x => x._id === 'US').count / totalWinnerStateUsers * 100).toFixed(2)}%), India (${(totalCompletionsByCountry.find(x => x._id === 'IN').count / totalWinnerStateUsers * 100).toFixed(2)}%) and users that did not specify their country (${(totalCompletionsByCountry.find(x => x._id === null).count / totalWinnerStateUsers * 100).toFixed(2)}%).`,
    );*/

    return results;
};
