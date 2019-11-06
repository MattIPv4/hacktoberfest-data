const PR = require('./classes/PR');
const User = require('./classes/User');
const Repo = require('./classes/Repo');

const getData = () => {
    const rawPRs = [];
    const PRs = rawPRs.map(pr => new PR(pr));

    const rawUsers = [];
    const Users = rawUsers.map(user => new User(user));

    const rawRepos = [];
    const Repos = rawRepos.map(repo => new Repo(repo));

    PRs.forEach(pr => pr.findRelations(Users, Repos));
    Users.forEach(user => user.findRelations(PRs));
    Repos.forEach(repo => repo.findRelations(Users, PRs));

    return { PRs, Users, Repos };
};

const main = () => {
    // eslint-disable-next-line
    const { PRs, Users, Repos } = getData();
};

main();
