const number = require('../helpers/number');

module.exports = async (data, log) => {
    /***************
     * Readme Stats
     ***************/
    log('\n\n----\nReadme Stats\n----');
    const results = {};

    results.year = data.year;
    results.blog = 'www.digitalocean.com/blog/10th-anniversary-hacktoberfest-recap';

    results.registeredUsers = data.users.states.all.count;
    results.engagedUsers = data.users.states.all.states['first-accepted'] - data.users.states.all.states.contributor;
    results.completedUsers = data.users.states.all.states.contributor;
    results.acceptedPRs = data.pull_requests.states.all.states.accepted;
    results.activeRepos = data.repositories.pull_requests.accepted.count;
    results.countriesRegistered = Object.keys(data.users.metadata['demographic-country'].values).filter(country => country !== '').length;
    results.countriesCompleted = Object.entries(data.users.metadata['demographic-country'].values).filter(([ country, { states } ]) => country !== '' && states.contributor).length;

    const dailyPRStates = data.pull_requests.states.daily;
    results.mostPRsDay = Object.keys(dailyPRStates).sort((a, b) => (dailyPRStates[b].states.accepted || 0) - (dailyPRStates[a].states.accepted || 0))[0];
    results.mostPRsDayPercentage = dailyPRStates[results.mostPRsDay].states.accepted / results.acceptedPRs;

    const allPRLanguages = data.pull_requests.languages.all.languages;
    results.mostCommonLanguageInPRs = Object.keys(allPRLanguages).sort((a, b) => (allPRLanguages[b].states.accepted || 0) - (allPRLanguages[a].states.accepted || 0))[0];
    results.mostCommonLanguageInPRsPercentage = allPRLanguages[results.mostCommonLanguageInPRs].states.accepted / results.acceptedPRs;

    log('');
    log(`Registered users: ${number.commas(results.registeredUsers)}`);
    log(`Completed users: ${number.commas(results.completedUsers)}`);
    log(`Accepted PR/MRs: ${number.commas(results.acceptedPRs)}`);
    log(`Active repositories (1+ accepted PR/MRs): ${number.commas(results.activeRepos)}`);
    log(`Countries represented by registered users: ${number.commas(results.countriesRegistered)}`);
    log(`Countries represented by completed users: ${number.commas(results.countriesCompleted)}`);
    log(`Day with most accepted PR/MRs submitted: ${results.mostPRsDay} (${number.percentage(results.mostPRsDayPercentage)})`);
    log(`Most common repository language in accepted PR/MRs: ${results.mostCommonLanguageInPRs} (${number.percentage(results.mostCommonLanguageInPRsPercentage)})`);

    results.americaRegisteredUsers = data.users.metadata['demographic-country'].values['us']?.count || 0;
    results.americaCompletedUsers = data.users.metadata['demographic-country'].values['us']?.states?.contributor || 0;
    results.indiaRegisteredUsers = data.users.metadata['demographic-country'].values['in']?.count || 0;
    results.indiaCompletedUsers = data.users.metadata['demographic-country'].values['in']?.states?.contributor || 0;

    log('');
    log('Region-specific:');
    log(`  Registered users in the US: ${number.commas(results.americaRegisteredUsers)}`);
    log(`  Completed users in the US: ${number.commas(results.americaCompletedUsers)}`);
    log(`  Registered users in India: ${number.commas(results.indiaRegisteredUsers)}`);
    log(`  Completed users in India: ${number.commas(results.indiaCompletedUsers)}`);

    return results;
};
