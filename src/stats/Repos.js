module.exports = async data => {
    const { Repos } = data;

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
    const ReposByLanguage = Repos.groupBy(repo => repo.languageString());
    console.log('');
    console.log(`Repos by language: ${Object.keys(ReposByLanguage).length} languages`);
    ReposByLanguage.forEach((key, val) => {
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
