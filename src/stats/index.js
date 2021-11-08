const statsGenerators = [
    require('./readme'),
    // require('./Users'),
    // require('./Orgs'),
    // require('./PRs'),
    // require('./Repos'),
];

module.exports = async (data, log) => {
    for (const generator of statsGenerators) {
        await generator(data, log);
    }
};
