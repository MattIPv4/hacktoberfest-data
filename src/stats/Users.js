require('../prototypes');

const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');
const linguist = require('../helpers/linguist');

module.exports = async db => {

    /***************
     * User Stats
     ***************/
    console.log('\n\n----\nUser Stats\n----');

    const totalUsers = await db.collection('users').find({}).count();
    const totalUsersByPRs = await db.collection('pull_requests').aggregate([
        {
            '$match': { 'labels.name': { '$nin': [ 'invalid' ] } },
        },
        {
            '$group':
                {
                    _id: '$base.repo.id',
                    users: { '$push': {user: '$user.id'} },
                }
        },
        {
            '$lookup':
                {
                    from: 'repositories',
                    localField: '_id',
                    foreignField: 'id',
                    as: 'repository',
                }
        },
        {
            '$project':
                {
                    users: '$users',
                    repository: { '$arrayElemAt': [ '$repository', 0 ] },
                }
        },
        {
            '$lookup':
                {
                    from: 'spam_repositories',
                    localField: 'repository.id',
                    foreignField: 'Repo ID',
                    as: 'spam'
                }
        },
        {
            '$match': { 'spam.Verified?': { '$nin': [ 'checked' ] } },
        },
        {
            '$project':
                {
                    users: '$users.user',
                }
        },
        {
            '$unwind': '$users',
        },
        {
            '$group':
                {
                    _id: '$users',
                    count: { '$sum': 1 },
                }
        },
        {
            '$group':
                {
                    _id: '$count',
                    count: { '$sum': 1 },
                }
        },
    ], { allowDiskUse: true }).toArray();
    const totalUsersWithPRs = totalUsersByPRs.map(score => score['_id'] > 0 ? score.count : 0).sum();
    const totalWinnerUsers = totalUsersByPRs.map(score => score['_id'] >= 4 ? score.count : 0).sum();
    console.log('');
    console.log(`Total Users: ${number.commas(totalUsers)}`);
    console.log(`  Users that submitted 1+ valid PR: ${number.commas(totalUsersWithPRs)} (${(totalUsersWithPRs / totalUsers * 100).toFixed(2)}%)`);
    console.log(`  Users that won (4+ PRs): ${number.commas(totalWinnerUsers)} (${(totalWinnerUsers / totalUsers * 100).toFixed(2)}%)`);

    const totalUsersByPRsConfig = chart.config(2500, 1000, [{
        type: 'column',
        dataPoints: Object.entries(totalUsersByPRs.reduce(function (result, item) {
            let color;
            switch (item['_id']) {
                case 0:
                case 1:
                case 2:
                case 3:
                    color = chart.colors.lightBox;
                    break;
                case 4:
                    color = chart.colors.magenta;
                    break;
                default:
                    color = chart.colors.purple;
                    break;
            }

            if (item['_id'] > 10) {
                result['10+'][0] += item.count;
            } else {
                result[item['_id']] = [item.count, color];
            }

            return result;
        }, { '10+': [0, chart.colors.purple] })).map(data => {
            return {
                y: data[1][0],
                color: data[1][1],
                label: data[0]
            }
        })
    }]);
    chart.save(
        path.join(__dirname, '../../images/users_by_prs_column.png'),
        await chart.render(totalUsersByPRsConfig),
    );
    // TODO: needs title & better labels


    /*// Repeat engagement, year over year, or any time in past
    // TODO: Not sure how I can do this with just data from this year?

    // Number of users who made first PRs
    // We only have relevant PR data, this would need massive abuse of the GH API to determine

    // Stats on invalid PRs, how many people were repeat spammers
    const winnerUsers = Users.filter(user => user.won());
    const singleInvalidUsers = Users.filter(user => user.prs.filter(pr => pr.invalid()).length === 1);
    const repeatedInvalidUsers = Users.filter(user => user.prs.filter(pr => pr.invalid()).length >= 1);
    const invalidAndWinnerUsers = Users.filter(user => user.won() && user.prs.filter(pr => pr.invalid()).length);
    console.log('');
    console.log(`Total Users: ${Users.length}`);
    console.log(`  Users that won (4+ PRs): ${winnerUsers.length} (${(winnerUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with 1 invalid PR: ${singleInvalidUsers.length} (${(singleInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with more than 1 invalid PRs: ${repeatedInvalidUsers.length} (${(repeatedInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with invalid PRs that also won: ${invalidAndWinnerUsers.length} (${(invalidAndWinnerUsers.length / Users.length * 100).toFixed(2)}%)`);

    // Breaking down users by language
    const UsersByLanguage = Users.groupBy(user => user.prs.map(pr => pr.languageString()).mode() || 'Undetermined');
    console.log('');
    console.log(`Users by language: ${Object.keys(UsersByLanguage).length} languages`);
    UsersByLanguage.forEach((key, val) => {
        console.log(`  ${key}: ${val.length} (${(val.length / Users.length * 100).toFixed(2)}%)`);
    });
    await linguist.load();
    chart.save(path.join(__dirname, '../../imgs/users_by_language_stacked.png'),
        await chart.render(chart.config(1000, 500, Object.entries(UsersByLanguage).sort((a, b) => {
            return b[1].length - a[1].length;
        }).limit(5).map(data => {
            return {
                type: 'stackedBar100',
                indexLabelPlacement: 'inside',
                indexLabelFontSize: 22,
                indexLabelFontColor: chart.colors.white,
                indexLabelFontFamily: 'monospace',
                indexLabel: `${(data[1].length / Users.length * 100).toFixed(1)}%`,
                name: data[0],
                showInLegend: true,
                color: linguist.get(data[0]) || chart.colors.lightBox,
                dataPoints: [{ y: data[1].length }],
            };
        }))),
    );*/
};
