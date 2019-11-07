const JSONObject = require('./JSONObject');

class Repo extends JSONObject {
    findRelations(users, prs, spam_repos) {
        // Owner
        const ownerUser = users.filter(user => user.id === this.owner.id);
        if (ownerUser.length) this.owner = ownerUser[0];

        // PRs
        this.prs = prs.filter(pr => pr.base.repo.id === this.id);

        // Spam data (both can be false if not reported or reports not processed)
        this.invalid = !!spam_repos.filter(repo => repo.id === this.id && repo.verified).length;
        this.permitted = !!spam_repos.filter(repo => repo.id === this.id && repo.permitted).length;
    }

    contributors() {
        return this.prs.map(pr => pr.user).unique();
    }
}

module.exports = Repo;
