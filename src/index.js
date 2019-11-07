require('./prototypes');
const csv = require('./helpers/csv');
const chart = require('./helpers/chart');
const path = require('path');

const PR = require('./classes/PR');
const Repo = require('./classes/Repo');
const User = require('./classes/User');

const rawPRs = require('../data/pull_requests');
const rawRepos = require('../data/repositories');
const rawUsers = require('../data/users');

const getData = async () => {
    const rawSpamRepos = await csv(path.join(__dirname, '../data/spam_repos.csv'));
    const SpamRepos = rawSpamRepos.map(repo => {
        return {
            id: parseInt(repo['\uFEFFRepo ID']),
            verified: repo['Verified?'] === 'checked',
            permitted: repo['Permitted?'] === 'checked',
        };
    });

    const PRs = rawPRs.map(pr => new PR(pr)).uniqueBy(pr => pr.id);
    const Repos = rawRepos.map(repo => new Repo(repo)).uniqueBy(repo => repo.id);
    const Users = rawUsers.map(user => new User(user)).uniqueBy(user => user.id);

    PRs.forEach(pr => pr.findRelations(Users, Repos));
    Repos.forEach(repo => repo.findRelations(Users, PRs, SpamRepos));
    Users.forEach(user => user.findRelations(PRs));

    return { PRs, Repos, Users, SpamRepos };
};

const main = async () => {
    /* eslint no-unused-vars: "off" */
    const { PRs, Repos, Users, SpamRepos } = await getData();

    /***************
     * PR Stats
     ***************/
    console.log('\n\n----\nPR Stats\n----');

    // Total PRs and invalid PRs
    // TODO: Needs airtable spam repo export
    const totalPRs = PRs.length;
    const ValidPRs = PRs.filter(pr => pr.valid());
    const totalValidPRs = ValidPRs.length;
    const InvalidPRs = PRs.filter(pr => pr.invalid());
    const totalInvalidPRs = InvalidPRs.length;
    const InvalidRepoPRs = PRs.filter(pr => pr.invalid_repo());
    const totalInvalidRepoPRs = InvalidRepoPRs.length;
    const InvalidLabelPRs = PRs.filter(pr => pr.invalid_label());
    const totalInvalidLabelPRs = InvalidLabelPRs.length;
    console.log('');
    console.log(`Total PRs: ${totalPRs}`);
    console.log(`  Valid PRs: ${totalValidPRs} (${(totalValidPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`  Invalid PRs: ${totalInvalidPRs} (${(totalInvalidPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`    Invalid (excluded repo) PRs: ${totalInvalidRepoPRs} (${(totalInvalidRepoPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`    Invalid (labeled invalid) PRs: ${totalInvalidLabelPRs} (${(totalInvalidLabelPRs / totalPRs * 100).toFixed(2)}%)`);

    // Breaking down PRs by language, other tags
    const PRsByLanguage = ValidPRs.groupBy(pr => pr.base.repo.language);
    console.log('');
    console.log(`PRs by language: ${Object.keys(PRsByLanguage).length} languages`);
    PRsByLanguage.forEach((key, val) => {
        key = key === 'null' ? 'Undetermined' : key;
        console.log(`  ${key}: ${val.length} (${(val.length / totalPRs * 100).toFixed(2)}%)`);
    });
    const render = await chart.chartRender(chart.chartConfig(1000, 1000, 'doughnut',
        Object.entries(PRsByLanguage).map(data => { return {
            y: data[1].length,
            indexLabel: `${data[0]}\n${(data[1].length / totalPRs * 100).toFixed(1)}%`,
        }; }),
    ));
    chart.chartSave(path.join(__dirname, '../imgs/prs_by_language.png'), render);

    // Lines of code per PR
    const PRsByChanges = ValidPRs.sort((a, b) => b.changes() - a.changes());
    console.log('');
    console.log('Largest changes in a PR:');
    PRsByChanges.limit(5).forEach(pr => {
        console.log(`  ${pr.changes()} | ${pr.html_url}`);
    });

    /***************
     * User Stats
     ***************/
    console.log('\n\n----\nUser Stats\n----');

    // Repeat engagement, year over year, or any time in past
    // TODO: Not sure how I can do this with just data from this year?

    // Number of users who made first PRs
    // We only have relevant PR data, this would need massive abuse of the GH API to determine

    // Stats on invalid PRs, how many people were repeat spammers
    const winnerUsers = Users.filter(user => user.won());
    const singleInvalidUsers = Users.filter(user => user.prs.filter(pr => pr.invalid()).length === 1);
    const repeatedInvalidUsers = Users.filter(user => user.prs.filter(pr => pr.invalid()).length >= 1);
    const invalidAndWinnerUsers = Users.filter(user => user.won() && user.prs.filter(pr => pr.invalid()).length);
    console.log('');
    console.log(`Total Users: ${Users.length}`);
    console.log(`  Users that won (4+ PRs): ${winnerUsers.length} (${(winnerUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with 1 invalid PR: ${singleInvalidUsers.length} (${(singleInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with more than 1 invalid PRs: ${repeatedInvalidUsers.length} (${(repeatedInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with invalid PRs that also won: ${invalidAndWinnerUsers.length} (${(invalidAndWinnerUsers.length / Users.length * 100).toFixed(2)}%)`);

    // Breaking down users by language
    const UsersByLanguage = Users.groupBy(user => user.prs.map(pr => pr.base.repo.language).mode());
    console.log('');
    console.log(`Users by language: ${Object.keys(UsersByLanguage).length} languages`);
    UsersByLanguage.forEach((key, val) => {
        key = key === 'null' ? 'Undetermined' : key;
        console.log(`  ${key}: ${val.length} (${(val.length / Users.length * 100).toFixed(2)}%)`);
    });

    /***************
     * Repo Stats
     ***************/
    console.log('\n\n----\nRepo Stats\n----');

    // "Connections made" First time PRs to a project, and not first time PRs
    // We only have relevant PR data, this would need massive abuse of the GH API to determine

    // Total: Repos and invalid repos
    const totalRepos = Repos.length;
    const ValidRepos = Repos.filter(repo => !repo.invalid);
    const totalValidRepos = ValidRepos.length;
    const InvalidRepos = Repos.filter(repo => repo.invalid);
    const totalInvalidRepos = InvalidRepos.length;
    const PermittedRepos = Repos.filter(repo => repo.permitted);
    const totalPermittedRepos = PermittedRepos.length;
    console.log('');
    console.log(`Total repos: ${totalRepos}`);
    console.log(`  Valid repos: ${totalValidRepos} (${(totalValidRepos / totalRepos * 100).toFixed(2)}%)`);
    console.log(`    Reported but approved repos: ${totalPermittedRepos} (${(totalPermittedRepos / totalRepos * 100).toFixed(2)}%)`);
    console.log(`  Invalid (excluded) repos: ${totalInvalidRepos} (${(totalInvalidRepos / totalRepos * 100).toFixed(2)}%)`);

    // Breaking down repos by language
    const ReposByLanguage = Repos.groupBy(repo => repo.language);
    console.log('');
    console.log(`Repos by language: ${Object.keys(ReposByLanguage).length} languages`);
    ReposByLanguage.forEach((key, val) => {
        key = key === 'null' ? 'Undetermined' : key;
        console.log(`  ${key}: ${val.length} (${(val.length / totalRepos * 100).toFixed(2)}%)`);
    });

    // Projects by popularity, contributors, stars (repo metadata)
    const topReposByStars = Repos.sort((a, b) => {
        return b.stargazers_count - a.stargazers_count;
    }).limit(5);
    console.log('');
    console.log('Top repos by stars');
    topReposByStars.forEach(repo => {
        console.log(`  ${repo.stargazers_count} | ${repo.html_url}`);
    });

    const topReposByForks = Repos.sort((a, b) => {
        return b.forks_count - a.forks_count;
    }).limit(5);
    console.log('');
    console.log('Top repos by forks');
    topReposByForks.forEach(repo => {
        console.log(`  ${repo.forks_count} | ${repo.html_url}`);
    });

    const topReposByWatchers = Repos.sort((a, b) => {
        return b.watchers_count - a.watchers_count;
    }).limit(5);
    console.log('');
    console.log('Top repos by watchers');
    topReposByWatchers.forEach(repo => {
        console.log(`  ${repo.watchers_count} | ${repo.html_url}`);
    });

    const topReposByPRs = Repos.sort((a, b) => {
        return b.prs.length - a.prs.length;
    }).limit(5);
    console.log('');
    console.log('Top repos by PRs');
    topReposByPRs.forEach(repo => {
        console.log(`  ${repo.prs.length} | ${repo.html_url}`);
    });

    const topReposByContributors = Repos.sort((a, b) => {
        return b.contributors().length - a.contributors().length;
    }).limit(5);
    console.log('');
    console.log('Top repos by contributors');
    topReposByContributors.forEach(repo => {
        console.log(`  ${repo.contributors().length} | ${repo.html_url}`);
    });

    // Histogram breakdown by gitignores in repos
    // TODO: This will need API calls or Octokit to get gitignores
};

main();
