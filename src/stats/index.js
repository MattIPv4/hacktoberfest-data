const statsGenerators = [
    require('./PRs'),
    require('./Repos'),
    require('./Users'),
];

module.exports = async data => {
    for (const generator in statsGenerators) {
        if (!statsGenerators.hasOwnProperty(generator)) return;
        await statsGenerators[generator](data);
    }
};
