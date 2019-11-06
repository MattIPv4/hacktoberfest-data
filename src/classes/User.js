const JSONObject = require('./JSONObject');

class User extends JSONObject {
    findRelations(prs) {
        this.prs = prs.filter(pr => pr.user.id === this.id);
    }
}

module.exports = User;
