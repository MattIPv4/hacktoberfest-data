require('./prototypes');

function roundNumber(num, scale) {
    if(!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale)  + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if(+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

const PR = require('./classes/PR');
const Repo = require('./classes/Repo');
const User = require('./classes/User');

const rawPRs = require('../data/pull_requests');
const rawRepos = require('../data/repositories');
const rawUsers = require('../data/users');

const getData = () => {
    const PRs = rawPRs.map(pr => new PR(pr));
    const Repos = rawRepos.map(repo => new Repo(repo));
    const Users = rawUsers.map(user => new User(user));

    PRs.forEach(pr => pr.findRelations(Users, Repos));
    Repos.forEach(repo => repo.findRelations(Users, PRs));
    Users.forEach(user => user.findRelations(PRs));

    return { PRs, Repos, Users };
};

const main = () => {
    const { PRs, Repos, Users } = getData();

    /***************
     * PR Stats
     ***************/

    // Total PRs and invalid PRs
    // TODO: Needs airtable spam repo export
    const totalPRs = PRs.length;
    const ValidPRs = PRs.filter(pr => pr.valid());
    const totalValidPRs = ValidPRs.length;
    const InvalidPRs = PRs.filter(pr => pr.invalid());
    const totalInvalidPRs = InvalidPRs.length;
    console.log('');
    console.log(`Total PRs: ${totalPRs}`);
    console.log(`Total Valid PRs: ${totalValidPRs} (${roundNumber(totalValidPRs / totalPRs * 100, 2)}%)`);
    console.log(`Total Invalid PRs: ${totalInvalidPRs} (${roundNumber(totalInvalidPRs / totalPRs * 100, 2)}%)`);

    // Stats on invalid PRs, how many people were repeat spammers
    const singleInvalidUsers = Users.filter(user => {
        const invalidPRs = user.prs.filter(pr => pr.invalid());
        return invalidPRs.length === 1;
    });
    const repeatedInvalidUsers = Users.filter(user => {
        const invalidPRs = user.prs.filter(pr => pr.invalid());
        return invalidPRs.length >= 1;
    });
    console.log('');
    console.log(`Users with 1 invalid PR: ${singleInvalidUsers.length} (${roundNumber(singleInvalidUsers.length / Users.length * 100, 2)}%)`);
    console.log(`Users with more than 1 invalid PRs: ${repeatedInvalidUsers.length} (${roundNumber(repeatedInvalidUsers.length / Users.length * 100, 2)}%)`);

    // Breaking down PRs by language, other tags
    const PRsByLanguage = ValidPRs.groupBy(pr => pr.base.repo.language);
    console.log('');
    console.log(`Total languages: ${Object.keys(PRsByLanguage).filter(k => !!k).length}`);
    PRsByLanguage.forEach((key, val) => {
        console.log(`  ${key} PRs: ${val.length} (${roundNumber(val.length / totalPRs * 100, 2)}%)`);
    });

    // Lines of code per PR
    const changesPerPR = ValidPRs.map(pr => pr.changes()).sort().reverse();
    console.log('');
    console.log(`Largest change in PR: ${changesPerPR[0]}`);

    /***************
     * User Stats
     ***************/

    // Repeat engagement, year over year, or any time in past
    // TODO: Not sure how I can do this with just data from this year?

    // Number of users who made first PRs
    // TODO: We only have relevant PR data, so will need Octokit (or scrape HTML for "their first ever")

    /***************
     * Repo Stats
     ***************/

    // "Connections made" First time PRs to a project, and not first time PRs
    // TODO: We only have relevant PR data, so will need Octokit (or scrape HTML for "their first ever")

    // Projects by popularity, contributors, stars (repo metadata)
    const topReposByStars = Repos.sort(function(a, b) {
        return b.stargazers_count - a.stargazers_count
    }).limit(25);
    const topReposByPRs = Repos.sort(function(a, b) {
        return b.prs.length - a.prs.length
    }).limit(25);
    const topReposByForks = Repos.sort(function(a, b) {
        return b.forks_count - a.forks_count
    }).limit(25);
    const topReposByWatchers = Repos.sort(function(a, b) {
        return b.watchers_count - a.watchers_count
    }).limit(25);
    // TODO: What do we want to do with this data?

    // Histogram breakdown by gitignores in repos
    // TODO: This will need API calls or Octokit to get gitignores
};

main();
