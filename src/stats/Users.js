const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const { getDateArray } = require('../helpers/date');
const color = require('../helpers/color');
const { getName, overwrite } = require('country-list');

overwrite([
    {
        code: 'US',
        name: 'United States', // United States of America
    },
    {
        code: 'GB',
        name: 'United Kingdom', // United Kingdom of Great Britain and Northern Ireland
    },
    {
        code: 'TW',
        name: 'Taiwan', // Taiwan, Province of China
    },
]);

const usersTopChart = async (userData, totalUsers, title, file, interval, mainSubtitle = null, smallSubtitle = null) => {
    const max = Math.max(...userData.map(([, count]) => count));
    const config = chart.config(1000, 1000, [{
        type: 'bar',
        indexLabelFontSize: 24,
        dataPoints: userData.slice(0, 10).map(([ title, count ], i) => {
            const colors = [
                chart.colors.highlightPositive,
                chart.colors.highlightNeutral,
                chart.colors.highlightNeutralAlt,
                chart.colors.highlightNegative,
            ];
            const dataColor = colors[i % colors.length];
            const percentWidth = count / max;
            return {
                y: count,
                color: dataColor,
                indexLabelPlacement: percentWidth > 0.5 ? 'inside' : 'outside',
                indexLabel: `${title || 'Not Given'} (${number.percentage(count / totalUsers)})`,
                indexLabelFontColor: (percentWidth > 0.5 && color.isBright(chart.colors.highlightPositive))
                    ? chart.colors.background : chart.colors.text,
            };
        }).reverse(),
    }]);
    config.axisY = {
        ...config.axisY,
        labelFontSize: 24,
        labelFormatter: e => number.human(e.value),
        interval,
    };
    config.axisX = {
        ...config.axisX,
        tickThickness: 0,
        labelFormatter: () => '',
    };
    config.title = {
        ...config.title,
        text: title,
        fontSize: 42,
        padding: 10,
        margin: 10,
    };
    config.subtitles = [];
    if (mainSubtitle) {
        config.subtitles.unshift({
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
        });
    }
    if (smallSubtitle) {
        config.subtitles.unshift({
            ...config.title,
            text: smallSubtitle,
            fontColor: chart.colors.textBox,
            fontSize: 22,
            padding: 15,
            margin: 10,
            cornerRadius: 5,
            verticalAlign: 'bottom',
            horizontalAlign: 'right',
            dockInsidePlotArea: true,
            maxWidth: 400,
            backgroundColor: chart.colors.backgroundBox,
        });
    }
    await chart.save(
        path.join(__dirname, `../../generated/${file}.png`),
        await chart.render(config),
        mainSubtitle
            ? smallSubtitle
                ? { width: 200, x: 880, y: 620 }
                : { width: 200, x: 880, y: 740 }
            : smallSubtitle
                ? { width: 200, x: 880, y: 720 }
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
    results.totalUsersNotEngaged = data.users.states.all.count - data.users.states.all.states['first-accepted'];
    results.totalUsersEngaged = data.users.states.all.states['first-accepted'] - data.users.states.all.states.contributor;
    results.totalUsersCompleted = data.users.states.all.states.contributor;
    results.totalUsersWarned = data.users.states.all.states.warning;
    results.totalUsersDisqualified = data.users.states.all.states.disqualified;

    log('');
    log(`Total Users: ${number.commas(results.totalUsers)}`);
    log(`  Users that submitted no accepted PR/MRs: ${number.commas(results.totalUsersNotEngaged)} (${number.percentage(results.totalUsersNotEngaged / results.totalUsers)})`);
    log(`  Users that submitted 1-3 accepted PR/MRs: ${number.commas(results.totalUsersEngaged)} (${number.percentage(results.totalUsersEngaged / results.totalUsers)})`);
    log(`  Users that submitted 4+ accepted PR/MRs: ${number.commas(results.totalUsersCompleted)} (${number.percentage(results.totalUsersCompleted / results.totalUsers)})`);
    log(`  Users that were warned (1 spammy PR/MR): ${number.commas(results.totalUsersWarned)} (${number.percentage(results.totalUsersWarned / results.totalUsers)})`);
    log(`  Users that were disqualified (2+ spammy PR/MRs): ${number.commas(results.totalUsersDisqualified)} (${number.percentage(results.totalUsersDisqualified / results.totalUsers)})`);

    const totalUsersByStateConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        startAngle: 160,
        indexLabelPlacement: 'outside',
        indexLabelFontSize: 22,
        showInLegend: true,
        dataPoints: [
            {
                y: results.totalUsersCompleted,
                indexLabel: 'Completed',
                legendText: `Completed: 4+ accepted PR/MRs: ${number.commas(results.totalUsersCompleted)} (${number.percentage(results.totalUsersCompleted / results.totalUsers)})`,
                color: chart.colors.highlightPositive,
                indexLabelFontSize: 32,
            },
            {
                y: results.totalUsersEngaged,
                indexLabel: 'Engaged',
                legendText: `Engaged: 1-3 accepted PR/MRs: ${number.commas(results.totalUsersEngaged)} (${number.percentage(results.totalUsersEngaged / results.totalUsers)})`,
                color: chart.colors.highlightNeutral,
                indexLabelFontSize: 26,
            },
            {
                y: results.totalUsersNotEngaged,
                indexLabel: 'Registered',
                legendText: `Registered: No accepted PR/MRs: ${number.commas(results.totalUsersNotEngaged)} (${number.percentage(results.totalUsersNotEngaged / results.totalUsers)})`,
                color: chart.colors.highlightNeutralAlt,
                indexLabelFontSize: 26,
            },
            {
                y: results.totalUsersDisqualified,
                indexLabel: 'Disqualified',
                legendText: `Disqualified: Spammy behaviour: ${number.commas(results.totalUsersDisqualified)} (${number.percentage(results.totalUsersDisqualified / results.totalUsers)})`,
                color: chart.colors.highlightNegative,
                indexLabelFontSize: 26,
            },
        ].map(x => [x, {
            y: results.totalUsers * 0.007,
            color: 'transparent',
            showInLegend: false,
        }]).flat(1),
    }], { padding: { top: 10, left: 5, right: 5, bottom: 5 }});
    totalUsersByStateConfig.title = {
        ...totalUsersByStateConfig.title,
        text: 'All Users: Breakdown by State',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalUsersByStateConfig.legend = {
        ...totalUsersByStateConfig.legend,
        fontSize: 28,
        markerMargin: 32,
    };
    totalUsersByStateConfig.subtitles = [
        {
            text: '_',
            fontColor: chart.colors.background,
            fontSize: 16,
            verticalAlign: 'bottom',
            horizontalAlign: 'center',
        },
    ];
    await chart.save(
        path.join(__dirname, '../../generated/users_by_state_doughnut.png'),
        await chart.render(totalUsersByStateConfig),
        { width: 250, x: 500, y: 470 },
    );

    // Users by accepted PRs
    results.totalUsersByAcceptedPRs = cappedAcceptedUserPRs(data, 10);

    log('');
    log('Users by number of accepted PRs/MR submitted:');
    for (const [ prs, users ] of results.totalUsersByAcceptedPRs) {
        log(`  ${prs}${prs === 10 ? '+' : ''} PR${prs === 1 ? '' : 's'}/MR${prs === 1 ? '' : 's'}: ${number.commas(users)} (${number.percentage(users / results.totalUsers)})`);
    }

    const totalUsersByPRsExtConfig = chart.config(2500, 1000, [{
        type: 'column',
        dataPoints: results.totalUsersByAcceptedPRs.map(([ prs, users ]) => ({
            y: users,
            color: Number.parseInt(prs) > 4
                ? chart.colors.highlightNeutral
                : Number.parseInt(prs) === 4
                    ? chart.colors.highlightPositive
                    : chart.colors.highlightNegative,
            label: `${prs}${prs === 10 ? '+' : ''} PR/MR${prs === 1 ? '' : 's'}`,
        })),
    }]);
    totalUsersByPRsExtConfig.axisX = {
        ...totalUsersByPRsExtConfig.axisX,
        labelFontSize: 24,
    };
    totalUsersByPRsExtConfig.axisY = {
        ...totalUsersByPRsExtConfig.axisY,
        labelFontSize: 24,
    };
    totalUsersByPRsExtConfig.title = {
        ...totalUsersByPRsExtConfig.title,
        text: 'Users: Accepted Pull/Merge Requests',
        fontSize: 48,
        padding: 5,
        margin: 40,
    };
    totalUsersByPRsExtConfig.subtitles = [{
        ...totalUsersByPRsExtConfig.title,
        text: `Over the month, ${number.commas(results.totalUsersCompleted)} participants (${number.percentage(results.totalUsersCompleted / results.totalUsers)}) submitted 4 or more accepted PR/MRs, completing Hacktoberfest.`,
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
        text: `Graphic does not include participants that submitted no accepted PR/MRs (${number.commas(results.totalUsersNotEngaged)} (${number.percentage(results.totalUsersNotEngaged / results.totalUsers)})).`,
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

    results.totalUsersByAcceptedPRsCapped = cappedAcceptedUserPRs(data, 5);

    const totalUsersByPRsConfig = chart.config(1000, 1000, [{
        type: 'column',
        dataPoints: results.totalUsersByAcceptedPRsCapped.map(([ prs, users ]) => ({
            y: users,
            color: Number.parseInt(prs) > 4
                ? chart.colors.highlightNeutral
                : Number.parseInt(prs) === 4
                    ? chart.colors.highlightPositive
                    : chart.colors.highlightNegative,
            label: `${prs}${prs === 5 ? '+' : ''} PR/MR${prs === 1 ? '' : 's'}`,
        })),
    }]);
    totalUsersByPRsConfig.axisX = {
        ...totalUsersByPRsConfig.axisX,
        labelFontSize: 24,
    };
    totalUsersByPRsConfig.axisY = {
        ...totalUsersByPRsConfig.axisY,
        labelFontSize: 24,
    };
    totalUsersByPRsConfig.title = {
        ...totalUsersByPRsConfig.title,
        text: 'Users: Accepted Pull/Merge Requests',
        fontSize: 42,
        padding: 5,
        margin: 40,
    };
    totalUsersByPRsConfig.subtitles = [{
        ...totalUsersByPRsConfig.title,
        text: `Graphic does not include participants that submitted no accepted PR/MRs (${number.commas(results.totalUsersNotEngaged)} (${number.percentage(results.totalUsersNotEngaged / results.totalUsers)})).`,
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
    results.totalUsersByCountry = Object.entries(data.users.metadata.country.values)
        .filter(([ country ]) => country !== '')
        .map(([ country, { count } ]) => [ getName(country) || country, count ])
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    results.totalUsersNoCountry = data.users.metadata.country.values['']?.count || 0;

    log('');
    log(`Top countries by registrations: ${number.commas(results.totalUsersByCountry.length)} countries`);
    results.totalUsersByCountry.slice(0, 25).forEach(([ country, count ], i) => {
        log(`${i + 1}. ${country}: ${number.commas(count)} (${number.percentage(count / results.totalUsers)})`);
    });
    if (results.totalUsersByCountry.length > 25)
        log(`+ ${number.commas(results.totalUsersByCountry.length - 25)} more...`);
    log(`${number.commas(results.totalUsersNoCountry)} (${number.percentage(results.totalUsersNoCountry / results.totalUsers)}) users did not specify their country`);

    const registrationsCaption = `In total, at least ${number.commas(results.totalUsersByCountry.filter(([ country ]) => country !== '').length)} countries were represented by users who registered to participate in Hacktoberfest.`;
    await usersTopChart(
        results.totalUsersByCountry,
        results.totalUsers,
        'Registered Users: Top Countries',
        'users_registrations_top_countries_bar',
        10000,
        registrationsCaption,
        `Graphic does not include users that did not specify their country, ${number.commas(results.totalUsersNoCountry)} (${number.percentage(results.totalUsersNoCountry / results.totalUsers)}).`,
    );
    await usersTopChart(
        results.totalUsersByCountry.filter(([ country ]) => !['United States', 'India'].includes(country)),
        results.totalUsers,
        'Registered Users: Top Countries',
        'users_registrations_top_countries_bar_excl',
        1000,
        registrationsCaption,
        `Graphic does not include India (${number.percentage(results.totalUsersByCountry.find(([ country ]) => country === 'India')[1] / results.totalUsers)}), the United States (${number.percentage(results.totalUsersByCountry.find(([ country ]) => country === 'United States')[1] / results.totalUsers)}), and users that did not specify their country (${number.percentage(results.totalUsersNoCountry / results.totalUsers)}).`,
    );

    // Completions by country
    results.totalUsersCompletedByCountry = Object.entries(data.users.metadata.country.values)
        .filter(([ country ]) => country !== '')
        .map(([ country, { states } ]) => [ getName(country) || country, states.contributor || 0 ])
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    results.totalUsersCompletedNoCountry = data.users.metadata.country.values['']?.states?.contributor || 0;

    log('');
    log(`Top countries by completions: ${number.commas(results.totalUsersCompletedByCountry.length)} countries`);
    results.totalUsersCompletedByCountry.slice(0, 25).forEach(([ country, count ], i) => {
        log(`${i + 1}. ${country}: ${number.commas(count)} (${number.percentage(count / results.totalUsersCompleted)})`);
    });
    if (results.totalUsersCompletedByCountry.length > 25)
        log(`+ ${number.commas(results.totalUsersCompletedByCountry.length - 25)} more...`);
    log(`${number.commas(results.totalUsersCompletedNoCountry)} (${number.percentage(results.totalUsersCompletedNoCountry / results.totalUsersCompleted)}) users did not specify their country`);


    const completionsCaption = `In total, at least ${number.commas(results.totalUsersCompletedByCountry.length)} countries were represented by users who completed and won Hacktoberfest.`;
    await usersTopChart(
        results.totalUsersCompletedByCountry,
        results.totalUsersCompleted,
        'Completed Users: Top Countries',
        'users_completions_top_countries_bar',
        5000,
        completionsCaption,
        `Graphic does not include users that did not specify their country, ${number.commas(results.totalUsersCompletedNoCountry)} (${number.percentage(results.totalUsersCompletedNoCountry / results.totalUsersCompleted)}).`,
    );
    await usersTopChart(
        results.totalUsersCompletedByCountry.filter(([ country ]) => !['United States', 'India'].includes(country)),
        results.totalUsersCompleted,
        'Completed Users: Top Countries',
        'users_completions_top_countries_bar_excl',
        500,
        completionsCaption,
        `Graphic does not include India (${number.percentage(results.totalUsersCompletedByCountry.find(([ country ]) => country === 'India')[1] / results.totalUsersCompleted)}), the United States (${number.percentage(results.totalUsersCompletedByCountry.find(([ country ]) => country === 'United States')[1] / results.totalUsersCompleted)}), and users that did not specify their country (${number.percentage(results.totalUsersCompletedNoCountry / results.totalUsersCompleted)}).`,
    );

    // Breaking down users by day and by state
    results.totalUsersByStateByDay = Object.keys(data.users.states.all.states)
        .reduce((states, state) => ({
            ...states,
            [state]: getDateArray(new Date('2022-09-26'), new Date('2022-11-01'))
                .reduce((obj, date) => {
                    const day = date.toISOString().split('T')[0];
                    return {
                        ...obj,
                        [day]: {
                            date,
                            count: data.users.states.daily?.[day]?.states?.[state] || 0,
                        },
                    };
                }, {}),
        }), {});

    const totalUsersByStateByDayOrder = ['contributor', 'first-accepted', 'registered', 'disqualified'];
    const totalUsersByStateByDayColors = {
        disqualified: chart.colors.highlightNegative,
        registered: chart.colors.highlightNeutralAlt,
        'first-accepted': chart.colors.highlightNeutral,
        contributor: chart.colors.highlightPositive,
    };

    const totalUsersByStateByDayConfig = chart.config(2500, 1000, Object.entries(results.totalUsersByStateByDay)
        .filter(([ state ]) => totalUsersByStateByDayOrder.includes(state))
        .sort(([ a ], [ b ]) => totalUsersByStateByDayOrder.indexOf(b) - totalUsersByStateByDayOrder.indexOf(a))
        .map(([ state, daily ]) => ({
            type: 'stackedArea',
            name: state,
            showInLegend: true,
            dataPoints: Object.entries(daily).map(([ day, { date, count } ]) => ({
                x: date,
                y: state === 'registered'
                    ? count - (results.totalUsersByStateByDay['first-accepted']?.[day]?.count || 0)
                    : (state === 'first-accepted'
                        ? count - (results.totalUsersByStateByDay.contributor?.[day]?.count || 0)
                        : count),
            })),
            lineThickness: 3,
            color: totalUsersByStateByDayColors[state] || chart.colors.highlightNeutral,
        })));
    totalUsersByStateByDayConfig.axisX = {
        ...totalUsersByStateByDayConfig.axisX,
        labelFontSize: 34,
        interval: 1,
        intervalType: 'week',
        title: 'User Registered At',
        titleFontSize: 24,
        titleFontWeight: 400,
    };
    totalUsersByStateByDayConfig.axisY = {
        ...totalUsersByStateByDayConfig.axisY,
        labelFontSize: 34,
        interval: 2000,
    };
    totalUsersByStateByDayConfig.title = {
        ...totalUsersByStateByDayConfig.title,
        text: 'All Users: Breakdown by State',
        fontSize: 48,
        padding: 5,
        margin: 15,
    };
    totalUsersByStateByDayConfig.subtitles = [
        {
            text: '_',
            fontColor: chart.colors.text,
            fontSize: 16,
            verticalAlign: 'bottom',
            horizontalAlign: 'center',
        },
    ];

    await chart.save(
        path.join(__dirname, '../../generated/users_by_state_stacked.png'),
        await chart.render(totalUsersByStateByDayConfig),
        { width: 200, x: 1250, y: 220 },
    );

    const providerMap = {
        github: 'GitHub',
        gitlab: 'GitLab',
    };

    // Provider accounts registered
    results.totalUsersByProvider = Object.entries(data.users.providers)
        .map(([ provider, { count } ]) => ([
            providerMap[provider] || provider,
            count,
        ]))
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    log('');
    log('Registered users by provider:');
    log('(Users were able to link one, or both, of the supported providers to their Hacktoberfest account)');
    for (const [ provider, count ] of results.totalUsersByProvider) {
        log(`  ${provider}: ${number.commas(count)} (${number.percentage(count / results.totalUsers)})`);
    }

    await usersTopChart(
        results.totalUsersByProvider,
        results.totalUsers,
        'Registered Users: Linked Providers',
        'users_registrations_linked_providers_bar',
        25000,
        'Users were able to link one, or both, of the supported providers to their Hacktoberfest account.',
    );

    // Provider accounts engaged
    results.totalUsersEngagedByProvider = Object.entries(data.users.providers)
        .map(([ provider, { states } ]) => ([
            providerMap[provider] || provider,
            (states['first-accepted'] || 0) - (states.contributor || 0),
        ]))
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    log('');
    log('Engaged (1-3 PR/MRs) users by provider:');
    log('(Users were able to link one, or both, of the supported providers to their Hacktoberfest account)');
    for (const [ provider, count ] of results.totalUsersEngagedByProvider) {
        log(`  ${provider}: ${number.commas(count)} (${number.percentage(count / results.totalUsersEngaged)})`);
    }

    await usersTopChart(
        results.totalUsersEngagedByProvider,
        results.totalUsersEngaged,
        'Engaged Users: Linked Providers',
        'users_engaged_linked_providers_bar',
        5000,
        'Users were able to link one, or both, of the supported providers to their Hacktoberfest account.',
    );

    // Provider accounts completed
    results.totalUsersCompletedByProvider = Object.entries(data.users.providers)
        .map(([ provider, { states } ]) => ([
            providerMap[provider] || provider,
            states.contributor || 0,
        ]))
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    log('');
    log('Completed (4+ PR/MRs) users by provider:');
    log('(Users were able to link one, or both, of the supported providers to their Hacktoberfest account)');
    for (const [ provider, count ] of results.totalUsersCompletedByProvider) {
        log(`  ${provider}: ${number.commas(count)} (${number.percentage(count / results.totalUsersCompleted)})`);
    }

    await usersTopChart(
        results.totalUsersCompletedByProvider,
        results.totalUsersCompleted,
        'Completed Users: Linked Providers',
        'users_completions_linked_providers_bar',
        10000,
        'Users were able to link one, or both, of the supported providers to their Hacktoberfest account.',
    );

    const experienceMap = {
        'stage-newbie': 'Newbie',
        'stage-familiar': 'Familiar',
        'stage-experienced': 'Experienced',
    };

    // Experience level
    results.totalUsersByExperience = Object.entries(data.users.metadata)
        .filter(([ level ]) => level.startsWith('stage-'))
        .map(([ level, { values } ]) => ([
            experienceMap[level] || level,
            values.true?.count || 0,
        ]))
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    results.totalUsersNoExperience = results.totalUsers - results.totalUsersByExperience.reduce((sum, [ , count ]) => sum + count, 0);

    log('');
    log('Registered users by experience:');
    log('(Users were able to optionally self-identify their experience level when registering)');
    for (const [ level, count ] of results.totalUsersByExperience) {
        log(`  ${level}: ${number.commas(count)} (${number.percentage(count / results.totalUsers)})`);
    }
    log(`${number.commas(results.totalUsersNoExperience)} (${number.percentage(results.totalUsersNoExperience / results.totalUsers)}) users did not specify their experience level`);

    await usersTopChart(
        results.totalUsersByExperience,
        results.totalUsers,
        'Registered Users: Experience Level',
        'users_registrations_experience_level_bar',
        25000,
        null,
        `Graphic does not include users that did not specify their experience level, ${number.commas(results.totalUsersNoExperience)} (${number.percentage(results.totalUsersNoExperience / results.totalUsers)}).`,
    );

    // Experience level completed
    results.totalUsersCompletedByExperience = Object.entries(data.users.metadata)
        .filter(([ level ]) => level.startsWith('stage-'))
        .map(([ level, { values } ]) => ([
            experienceMap[level] || level,
            values.true?.states?.contributor || 0,
        ]))
        .sort((a, b) => a[1] < b[1] ? 1 : -1);
    results.totalUsersCompletedNoExperience = results.totalUsersCompleted - results.totalUsersCompletedByExperience.reduce((sum, [ , count ]) => sum + count, 0);

    log('');
    log('Completed (4+ PR/MRs) users by experience:');
    log('(Users were able to optionally self-identify their experience level when registering)');
    for (const [ level, count ] of results.totalUsersCompletedByExperience) {
        log(`  ${level}: ${number.commas(count)} (${number.percentage(count / results.totalUsersCompleted)})`);
    }
    log(`${number.commas(results.totalUsersCompletedNoExperience)} (${number.percentage(results.totalUsersCompletedNoExperience / results.totalUsersCompleted)}) users did not specify their experience level`);

    await usersTopChart(
        results.totalUsersCompletedByExperience,
        results.totalUsersCompleted,
        'Completed Users: Experience Level',
        'users_completions_experience_level_bar',
        10000,
        null,
        `Graphic does not include users that did not specify their experience level, ${number.commas(results.totalUsersCompletedNoExperience)} (${number.percentage(results.totalUsersCompletedNoExperience / results.totalUsersCompleted)}).`,
    );

    const typeMap = {
        'type-code': 'Code',
        'type-non-code': 'Non-code',
    };

    // Contribution type
    results.totalUsersByContribution = Object.entries(data.users.metadata)
        .filter(([ type ]) => type.startsWith('type-'))
        .map(([ type, { values } ]) => ([
            typeMap[type] || type,
            values.true?.count || 0,
        ]))
        .sort((a, b) => a[1] < b[1] ? 1 : -1);

    log('');
    log('Registered users by intended contribution type:');
    log('(Users were able to optionally self-identify what type of contribution(s) they intended to make when registering)');
    log('(Users were able to select multiple options)');
    for (const [ type, count ] of results.totalUsersByContribution) {
        log(`  ${type}: ${number.commas(count)} (${number.percentage(count / results.totalUsers)})`);
    }

    await usersTopChart(
        results.totalUsersByContribution,
        results.totalUsers,
        'Registered Users: Contribution Type',
        'users_registrations_contribution_type_bar',
        25000,
        'Users were able to optionally select one, or more, intended contribution types when registering.',
    );

    // Contribution type completed
    results.totalUsersCompletedByContribution = Object.entries(data.users.metadata)
        .filter(([ type ]) => type.startsWith('type-'))
        .map(([ type, { values } ]) => ([
            typeMap[type] || type,
            values.true?.states?.contributor || 0,
        ]))
        .sort((a, b) => a[1] < b[1] ? 1 : -1);

    log('');
    log('Completed (4+ PR/MRs) users by intended contribution type:');
    log('(Users were able to optionally self-identify what type of contribution(s) they intended to make when registering)');
    log('(Users were able to select multiple options)');
    for (const [ type, count ] of results.totalUsersCompletedByContribution) {
        log(`  ${type}: ${number.commas(count)} (${number.percentage(count / results.totalUsersCompleted)})`);
    }

    await usersTopChart(
        results.totalUsersCompletedByContribution,
        results.totalUsersCompleted,
        'Completed Users: Contribution Type',
        'users_completions_contribution_type_bar',
        10000,
        'Users were able to optionally select one, or more, intended contribution types when registering.',
    );

    return results;
};
