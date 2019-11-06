const JSONObject = require('./JSONObject');

class Repo extends JSONObject {
    findRelations(users, prs) {
        // Owner
        const ownerUser = users.filter(user => user.id === this.owner.id);
        if (ownerUser.length) this.owner = ownerUser[0];

        // PRs
        this.prs = prs.filter(pr => pr.base.repo.id === this.id);
    }
}

module.exports = Repo;
