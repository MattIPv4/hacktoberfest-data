const JSONObject = require('./JSONObject');

class User extends JSONObject {
    findRelations(prs) {
        this.prs = prs.filter(pr => pr.user.id === this.id);
    }

    won() {
        const validPRs = this.prs.filter(pr => pr.valid());
        return validPRs.length >= 4;
    }
}

module.exports = User;
