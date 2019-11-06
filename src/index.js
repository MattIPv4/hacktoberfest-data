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

    console.log(Repos[0].prs.length);
};

main();
