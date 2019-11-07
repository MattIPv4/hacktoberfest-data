require('./prototypes');
const csv = require('./helpers/csv');
const path = require('path');

const PR = require('./classes/PR');
const Repo = require('./classes/Repo');
const User = require('./classes/User');

const rawPRs = require('../data/pull_requests');
const rawRepos = require('../data/repositories');
const rawUsers = require('../data/users');

const stats = require('./stats');

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
    const data = await getData();
    await stats(data);
};

main();
