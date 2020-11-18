const statsGenerators = [
    require('./Orgs'),
    require('./PRs'),
    require('./Repos'),
    require('./Users'),
];

module.exports = async (db, log) => {
    for (const generator in statsGenerators) {
        if (!statsGenerators.hasOwnProperty(generator)) continue;
        await statsGenerators[generator](db, log);
    }
};
