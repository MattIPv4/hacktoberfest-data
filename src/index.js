require('./prototypes');

const PR = require('./classes/PR');
const Repo = require('./classes/Repo');
const User = require('./classes/User');

const rawPRs = require('../data/pull_requests');
const rawRepos = require('../data/repositories');
const rawUsers = require('../data/users');

const getData = () => {
    const PRs = rawPRs.map(pr => new PR(pr)).uniqueBy(pr => pr.id);
    const Repos = rawRepos.map(repo => new Repo(repo)).uniqueBy(repo => repo.id);
    const Users = rawUsers.map(user => new User(user)).uniqueBy(user => user.id);

    PRs.forEach(pr => pr.findRelations(Users, Repos));
    Repos.forEach(repo => repo.findRelations(Users, PRs));
    Users.forEach(user => user.findRelations(PRs));

    return { PRs, Repos, Users };
};

const main = () => {
    /* eslint no-unused-vars: "off" */
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
    console.log(`Total Valid PRs: ${totalValidPRs} (${(totalValidPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`Total Invalid PRs: ${totalInvalidPRs} (${(totalInvalidPRs / totalPRs * 100).toFixed(2)}%)`);

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
    console.log(`Users with 1 invalid PR: ${singleInvalidUsers.length} (${(singleInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`Users with more than 1 invalid PRs: ${repeatedInvalidUsers.length} (${(repeatedInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);

    // Breaking down PRs by language, other tags
    const PRsByLanguage = ValidPRs.groupBy(pr => pr.base.repo.language);
    console.log('');
    console.log(`Total languages: ${Object.keys(PRsByLanguage).filter(k => !!k).length}`);
    PRsByLanguage.forEach((key, val) => {
        console.log(`  ${key} PRs: ${val.length} (${(val.length / totalPRs * 100).toFixed(2)}%)`);
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
    // We only have relevant PR data, this would need massive abuse of the GH API to determine

    /***************
     * Repo Stats
     ***************/

    // "Connections made" First time PRs to a project, and not first time PRs
    // We only have relevant PR data, this would need massive abuse of the GH API to determine

    // Projects by popularity, contributors, stars (repo metadata)
    const topReposByStars = Repos.sort((a, b) => {
        return b.stargazers_count - a.stargazers_count;
    }).limit(5);
    const topReposByForks = Repos.sort((a, b) => {
        return b.forks_count - a.forks_count;
    }).limit(5);
    const topReposByWatchers = Repos.sort((a, b) => {
        return b.watchers_count - a.watchers_count;
    }).limit(5);
    const topReposByPRs = Repos.sort((a, b) => {
        return b.prs.length - a.prs.length;
    }).limit(5);
    const topReposByContributors = Repos.sort((a, b) => {
        return b.contributors().length - a.contributors().length;
    }).limit(5);
    console.log('');
    console.log('Top repos by PRs');
    topReposByPRs.forEach(repo => {
        console.log(`  ${repo.prs.length} | ${repo.html_url}`);
    });
    console.log('Top repos by contributors');
    topReposByContributors.forEach(repo => {
        console.log(`  ${repo.contributors().length} | ${repo.html_url}`);
    });

    // Histogram breakdown by gitignores in repos
    // TODO: This will need API calls or Octokit to get gitignores
};

main();
