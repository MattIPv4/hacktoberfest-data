const csv = require('csv-parser');
const fs = require('fs');

module.exports = (file) => {
    return new Promise((resolve, reject) => {
        const results = [];
        try {
            fs.createReadStream(file)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                })
        } catch (err) {
            reject(err);
        }
    });
};
