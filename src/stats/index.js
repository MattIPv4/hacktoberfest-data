const statsGenerators = [
    require('./Orgs'),
    require('./PRs'),
    require('./Repos'),
    require('./Users'),
];

module.exports = async (data, log) => {
    for (const generator of statsGenerators) {
        await generator(data, log);
    }
};
