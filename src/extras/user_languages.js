const path = require('path');
const fs = require('fs');
const mongo = require('../helpers/mongo');

const main = async () => {
    const db = await mongo.connect();
    const dbo = db.db('hacktoberfest-2019');

    const cursor = dbo.collection('pull_requests').aggregate([
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
                repository: { '$arrayElemAt': ['$repository', 0] },
                user: '$user',
            },
        },
        {
            '$group': {
                _id: {
                    user: '$user.id',
                    language: '$repository.language',
                },
                count: { '$sum': 1 },
            },
        },
        {
            '$group': {
                _id: '$_id.user',
                data: { '$push': { count: '$count', language: '$_id.language' } },
            },
        },
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
                user: { '$arrayElemAt': ['$user', 0] },
                data: '$data',
            },
        },
        {
            '$match': {
                '$and': [
                    { 'user': { '$ne': [null, undefined] } },
                    { 'user.email': { '$ne': [null, undefined] } },
                ],
            },
        },
    ]);

    const file = path.join(__dirname, '../../data/user_languages.csv');
    fs.writeFileSync(file, 'id,email,language\n');
    let item;
    while ((item = await cursor.next())) {
        if (!item.user || !item.user.id || !item.user.email) continue;
        const langs = item.data.filter(x => !!x.language).sort((a, b) => b.count - a.count);
        if (!langs.length || !langs[0].language) continue;
        const data = [item.user.id, item.user.email, langs[0].language];
        fs.appendFileSync(file, `${data.join(',')}\n`);
    }

    db.close();
};

main();
