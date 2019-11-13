const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost/';

const connect = () => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
            if (err) return reject(err);
            resolve(db);
        });
    });
};

module.exports = { connect };
