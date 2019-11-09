require('../prototypes');

const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const linguist = require('../helpers/linguist');
const color = require('../helpers/color');
const { getDateArray, dateFromDay } = require('../helpers/date');

module.exports = async db => {
    /***************
     * PR Stats
     ***************/
    console.log('\n\n----\nPR Stats\n----');
    await linguist.load();

    // Total PRs and invalid PRs
    const totalPRs = await db.collection('pull_requests').find({}).count();
    const totalInvalidLabelPRs = await db.collection('pull_requests').find({'labels.name': 'invalid'}).count();
    // TODO: Check Hacktoberfest app to see how lax "invalid" checking was (trimmed?, lower-cased?)
    const totalInvalidRepoPRs = (await db.collection('pull_requests').aggregate([
        {
            '$lookup':
                {
                    from: 'spam_repositories',
                    localField: 'base.repo.id',
                    foreignField: 'Repo ID',
                    as: 'spam'
                }
        },
        { '$match': { 'spam.Verified?': 'checked' } },
        { '$group': { _id: null, count: { '$sum': 1 } } },
    ]).limit(1).toArray())[0].count;
    const totalInvalidPRs = totalInvalidLabelPRs + totalInvalidRepoPRs;
    const totalValidPRs = totalPRs - totalInvalidPRs;
    console.log('');
    console.log(`Total PRs: ${number.commas(totalPRs)}`);
    console.log(`  Valid PRs: ${number.commas(totalValidPRs)} (${(totalValidPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`  Invalid PRs: ${number.commas(totalInvalidPRs)} (${(totalInvalidPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`    Invalid (excluded repo) PRs: ${number.commas(totalInvalidRepoPRs)} (${(totalInvalidRepoPRs / totalInvalidPRs * 100).toFixed(2)}%) (${(totalInvalidRepoPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`    Invalid (labeled invalid) PRs: ${number.commas(totalInvalidLabelPRs)} (${(totalInvalidLabelPRs / totalInvalidPRs * 100).toFixed(2)}%) (${(totalInvalidLabelPRs / totalPRs * 100).toFixed(2)}%)`);

    // Breaking down PRs by language, other tags
    const totalPRsByLanguage = await db.collection('pull_requests').aggregate([
        {
            '$lookup':
                {
                    from: 'repositories',
                    localField: 'base.repo.id',
                    foreignField: 'id',
                    as: 'repository'
                }
        },
        {
            '$project':
                {
                    repository: { '$arrayElemAt': [ '$repository', 0 ] },
                }
        },
        {
            '$group':
                {
                    _id: '$repository.language',
                    count: { '$sum': 1 }
                }
        },
        {
            '$sort':
                {
                    count: -1,
                }
        },
    ]).toArray();
    console.log('');
    console.log(`PRs by language: ${number.commas(totalPRsByLanguage.length)} languages`);
    totalPRsByLanguage.limit(15).forEach(group => {
        const name = group['_id'] || 'Undetermined';
        console.log(`  ${name}: ${number.commas(group.count)} (${(group.count / totalPRs * 100).toFixed(2)}%)`);
    });
    const totalPRsByLanguageConfig = chart.config(1000, 1000, [{
        type: 'doughnut',
        indexLabelPlacement: 'inside',
        indexLabelFontSize: 22,
        indexLabelFontFamily: 'monospace',
        dataPoints: totalPRsByLanguage.limit(10).map(data => {
            const name = data['_id'] || 'Undetermined';
            const dataColor = linguist.get(name) || chart.colors.lightBox;
            return {
                y: data.count,
                indexLabel: `${name}\n${(data.count / totalPRs * 100).toFixed(1)}%`,
                color: dataColor,
                indexLabelFontColor: color.isBright(dataColor) ? chart.colors.darkBox : chart.colors.white,
            };
        }),
    }]);
    totalPRsByLanguageConfig.title = {
        text: 'PRs: Top 10 Languages',
        fontColor: chart.colors.text,
        fontFamily: 'monospace',
        padding: 5,
        verticalAlign: 'center',
        horizontalAlign: 'center',
        maxWidth: 500,
    };
    // TODO: Represent "Other" in this using colors.darkBox, so the percentages add up to 100%
    chart.save(
        path.join(__dirname, '../../imgs/prs_by_language_doughnut.png'),
        await chart.render(totalPRsByLanguageConfig),
    );

    const totalPRsByDayByLanguage = await db.collection('pull_requests').aggregate([
        {
            '$lookup':
                {
                    from: 'repositories',
                    localField: 'base.repo.id',
                    foreignField: 'id',
                    as: 'repository'
                }
        },
        {
            '$set':
                {
                    repository: { '$arrayElemAt': [ '$repository', 0 ] },
                    day: { '$dayOfYear': { '$dateFromString': { dateString: '$created_at' } } },
                }
        },
        {
            '$group':
                {
                    _id: {
                        language: '$repository.language',
                        day: '$day',
                    },
                    count: { '$sum': 1 }
                }
        },
        {
            '$group':
                {
                    _id: '$_id.language',
                    data: { '$push': {count: '$count', day: '$_id.day'} },
                    count: { '$sum': '$count' }
                }
        },
        {
            '$sort':
                {
                    count: -1,
                }
        },
        {
            '$limit': 10,
        },
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
            color: linguist.get(name) || chart.colors.darkBox,
        };
    }), true);
    totalPRsByDayByLanguageConfig.axisX = {
        ...totalPRsByDayByLanguageConfig.axisX,
        tickThickness: 0,
        labelFormatter: () => {
            return '';
        }
    };
    totalPRsByDayByLanguageConfig.title = {
        text: 'PRs: Top 10 Languages Per Day',
        fontColor: chart.colors.background,
        fontFamily: 'monospace',
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    chart.save(
        path.join(__dirname, '../../imgs/prs_by_language_spline.png'),
        await chart.render(totalPRsByDayByLanguageConfig),
    );

    // Lines of code per PR
    const PRsByChanges = await db.collection('pull_requests').aggregate([
        {
            '$set':
                {
                    changes: { '$add': [ '$additions', '$deletions' ] },
                }
        },
        {
            '$sort':
                {
                    changes: -1,
                }
        },
        {
            '$limit': 10,
        },
    ]).toArray();
    console.log('');
    console.log('Largest changes in a PR:');
    PRsByChanges.forEach(pr => {
        console.log(`  ${number.commas(pr.changes)} | ${pr.html_url}`);
    });
};
