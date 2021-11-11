const statsGenerators = [
    'readme',
    'PRs',
    'Users',
    // 'Orgs',
    // 'Repos',
];

module.exports = async (data, log) => {
    const results = {};
    for (const generator of statsGenerators) {
        results[generator] = await require(`./${generator}`)(data, log);
    }
    return results;
};
