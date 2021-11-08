const number = require('../helpers/number');

module.exports = async (data, log) => {
    /***************
     * Readme Stats
     ***************/
    log('\n\n----\nReadme Stats\n----');

    const registeredUsers = data.users.states.all.count;
    const completedUsers = data.users.states.all.states.contributor;
    const acceptedPRs = data.pull_requests.states.all.states.accepted;
    const participatingRepos = data.repositories.pull_requests.accepted.count;
    const countriesRegistered = data.users.metadata.country.all.unique;
    const countriesCompleted = data.users.metadata.country.states.contributor.unique;

    const dailyPRStates = data.pull_requests.states.daily;
    const mostPRsDay = Object.keys(dailyPRStates).sort((a, b) => (dailyPRStates[b].states.accepted || 0) - (dailyPRStates[a].states.accepted || 0))[0];
    const mostPRsDayPercentage = dailyPRStates[mostPRsDay].states.accepted / acceptedPRs;

    const allPRLanguages = data.pull_requests.languages.all.languages;
    const mostCommonLanguageInPRs = Object.keys(allPRLanguages).sort((a, b) => (allPRLanguages[b].states.accepted || 0) - (allPRLanguages[a].states.accepted || 0))[0];
    const mostCommonLanguageInPRsPercentage = allPRLanguages[mostCommonLanguageInPRs].states.accepted / acceptedPRs;

    log('');
    log(`Registered users: ${number.commas(registeredUsers)}`);
    log(`Completed users: ${number.commas(completedUsers)}`);
    log(`Accepted PRs: ${number.commas(acceptedPRs)}`);
    log(`Active repositories (1+ accepted PRs): ${number.commas(participatingRepos)}`);
    log(`Countries represented by registered users: ${number.commas(countriesRegistered)}`);
    log(`Countries represented by completed users: ${number.commas(countriesCompleted)}`);
    log(`Day with most accepted PRs submitted: ${mostPRsDay} (${number.percentage(mostPRsDayPercentage)})`);
    log(`Most common repository language in accepted PRs: ${mostCommonLanguageInPRs} (${number.percentage(mostCommonLanguageInPRsPercentage)})`);
};
