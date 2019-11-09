const statsGenerators = [
    //require('./PRs'),
    //require('./Repos'),
    require('./Users'),
];

module.exports = async db => {
    for (const generator in statsGenerators) {
        if (!statsGenerators.hasOwnProperty(generator)) return;
        await statsGenerators[generator](db);
    }
};
