require('./prototypes');

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
    // eslint-disable-next-line no-unused-vars
    const { PRs, Repos, Users } = getData();

    /***************
     * PR Stats
     ***************/

    // Total PRs and invalid PRs
    const totalPRs = PRs.length;
    const totalValidPRs = PRs.filter(pr => pr.valid()).length;
    const totalInvalidPRs = PRs.filter(pr => pr.invalid()).length;

    // Stats on invalid PRs, how many people were repeat spammers
    const singleInvalidUsers = Users.filter(user => {
        const invalidPRs = user.prs.filter(pr => pr.invalid());
        return invalidPRs.length === 1;
    });
    const repeatedInvalidUsers = Users.filter(user => {
        const invalidPRs = user.prs.filter(pr => pr.invalid());
        return invalidPRs.length >= 1;
    });

    // Breaking down PRs by language, other tags
    const PRsByLanguage = PRs.groupBy(pr => pr.base.repo.language);

    // Lines of code per PR
    // TODO: Unsure, perhaps look at the patch?

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

    // Histogram breakdown by gitignores in repos
    // TODO: This will need API calls or Octokit to get gitignores
};

main();
