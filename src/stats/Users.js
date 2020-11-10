require('../prototypes');

const path = require('path');
const number = require('../helpers/number');
const chart = require('../helpers/chart');

module.exports = async (db, log) => {

    /***************
     * User Stats
     ***************/
    log('\n\n----\nUser Stats\n----');

    const totalUsers = await db.collection('users').find({}).count();
    const totalUsersByPRs = await db.collection('pull_requests').aggregate([
        {
            '$match': { 'labels.name': { '$nin': [ 'invalid' ] } },
        },
        {
            '$group': {
                _id: '$base.repo.id',
                users: { '$push': {user: '$user.id'} },
            },
        },
        {
            '$lookup': {
                from: 'repositories',
                localField: '_id',
                foreignField: 'id',
                as: 'repository',
            },
        },
        {
            '$project': {
                users: '$users',
                repository: { '$arrayElemAt': [ '$repository', 0 ] },
            },
        },
        {
            '$lookup': {
                from: 'spam_repositories',
                localField: 'repository.id',
                foreignField: 'Repo ID',
                as: 'spam',
            },
        },
        {
            '$match': { 'spam.Verified?': { '$nin': [ 'checked' ] } },
        },
        {
            '$project': {
                users: '$users.user',
            },
        },
        {
            '$unwind': '$users',
        },
        {
            '$group': {
                _id: '$users',
                count: { '$sum': 1 },
            },
        },
        {
            '$group': {
                _id: '$count',
                count: { '$sum': 1 },
            },
        },
    ], { allowDiskUse: true }).toArray();
    const totalUsersWithPRs = totalUsersByPRs.map(score => score['_id'] > 0 ? score.count : 0).sum();
    const totalWinnerUsers = totalUsersByPRs.map(score => score['_id'] >= 4 ? score.count : 0).sum();
    log('');
    log(`Total Users: ${number.commas(totalUsers)}`);
    log(`  Users that submitted 1+ valid PR: ${number.commas(totalUsersWithPRs)} (${(totalUsersWithPRs / totalUsers * 100).toFixed(2)}%)`);
    log(`  Users that won (4+ PRs): ${number.commas(totalWinnerUsers)} (${(totalWinnerUsers / totalUsers * 100).toFixed(2)}%)`);

    log('');
    log('Users by number of PRs submitted:');
    Object.entries(totalUsersByPRs.reduce(function (result, item) {
        if (item['_id'] > 10) {
            result['10+ PRs'][0] += item.count;
        } else {
            result[`${item['_id']} PR${item['_id'] === 1 ? '' : 's'}`] = [item.count, item['_id']];
        }
        return result;
    }, { '10+ PRs': [0, 11] })).sort((a, b) => a[1][1] - b[1][1]).forEach(item => {
        log(`  ${item[0]}: ${number.commas(item[1][0])} (${(item[1][0] / totalUsers * 100).toFixed(2)}%)`);
    });

    const totalUsersByPRsExtConfig = chart.config(2500, 1000, [{
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
                    color = chart.colors.blue;
                    break;
                default:
                    color = chart.colors.pink;
                    break;
            }

            if (item['_id'] > 10) {
                result['10+ PRs'][0] += item.count;
            } else {
                result[`${item['_id']} PR${item['_id'] === 1 ? '' : 's'}`] = [item.count, color, item['_id']];
            }

            return result;
        }, { '10+ PRs': [0, chart.colors.crimson, 11] }))
            .map(data => {
                return {
                    y: data[1][0],
                    color: data[1][1],
                    order: data[1][2], // Ordering
                    label: data[0], // Display
                };
            })
            .sort((a, b) => a.order - b.order),
    }]);
    totalUsersByPRsExtConfig.title = {
        text: 'Users: Valid Pull Requests',
        fontColor: chart.colors.text,
        fontFamily: 'monospace',
        padding: 5,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    await chart.save(
        path.join(__dirname, '../../generated/users_by_prs_extended_column.png'),
        await chart.render(totalUsersByPRsExtConfig),
        { width: 400, x: 1250, y: 150 },
    );

    const totalUsersByPRsConfig = chart.config(1000, 1000, [{
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
                    color = chart.colors.blue;
                    break;
                default:
                    color = chart.colors.pink;
                    break;
            }

            if (item['_id'] > 4) {
                result['5+ PRs'][0] += item.count;
            } else {
                result[`${item['_id']} PR${item['_id'] === 1 ? '' : 's'}`] = [item.count, color, item['_id']];
            }

            return result;
        }, { '5+ PRs': [0, chart.colors.crimson, 5] }))
            .map(data => {
                return {
                    y: data[1][0],
                    color: data[1][1],
                    order: data[1][2], // Ordering
                    label: data[0], // Display
                };
            })
            .sort((a, b) => a.order - b.order),
    }]);
    totalUsersByPRsConfig.title = {
        text: 'Users: Valid Pull Requests',
        fontColor: chart.colors.text,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 46,
        padding: 5,
        margin: 20,
        verticalAlign: 'top',
        horizontalAlign: 'center',
    };
    await chart.save(
        path.join(__dirname, '../../generated/users_by_prs_column.png'),
        await chart.render(totalUsersByPRsConfig),
        { width: 350, x: 500, y: 125 },
    );

    const topUsersByPRs = await db.collection('pull_requests').aggregate([
        {
            '$match': { 'labels.name': { '$nin': [ 'invalid' ] } },
        },
        {
            '$group': {
                _id: '$base.repo.id',
                users: { '$push': {user: '$user.id'} },
            },
        },
        {
            '$lookup': {
                from: 'repositories',
                localField: '_id',
                foreignField: 'id',
                as: 'repository',
            },
        },
        {
            '$project': {
                users: '$users',
                repository: { '$arrayElemAt': [ '$repository', 0 ] },
            },
        },
        {
            '$lookup': {
                from: 'spam_repositories',
                localField: 'repository.id',
                foreignField: 'Repo ID',
                as: 'spam',
            },
        },
        {
            '$match': { 'spam.Verified?': { '$nin': [ 'checked' ] } },
        },
        {
            '$project': {
                users: '$users.user',
            },
        },
        {
            '$unwind': '$users',
        },
        {
            '$group': {
                _id: '$users',
                count: { '$sum': 1 },
            },
        },
        { '$sort': { count: -1 } },
        { '$limit': 15 },
        {
            '$lookup': {
                from: 'users',
                localField: '_id',
                foreignField: 'id',
                as: 'user',
            },
        },
        {
            '$project': {
                prs: '$count',
                user: { '$arrayElemAt': [ '$user', 0 ] },
            },
        },
    ], { allowDiskUse: true }).toArray();
    log('');
    log('Top users by valid PRs');
    topUsersByPRs.forEach(data => {
        log(`  ${number.commas(data.prs)} | ${data.user.html_url}`);
    });
};
