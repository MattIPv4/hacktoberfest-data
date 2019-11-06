const JSONObject = require('./JSONObject');

class PR extends JSONObject {
    findRelations(users, repos) {
        // Base
        const baseRepo = repos.filter(repo => repo.id === this.base.repo.id);
        if (baseRepo.length) this.base.repo = baseRepo[0];
        const baseUser = users.filter(user => user.id === this.base.user.id);
        if (baseUser.length) this.base.user = baseUser[0];

        // Head
        const headRepo = repos.filter(repo => repo.id === this.head.repo.id);
        if (headRepo.length) this.head.repo = headRepo[0];
        const headUser = users.filter(user => user.id === this.head.user.id);
        if (headUser.length) this.head.user = headUser[0];

        // User
        const prUser = users.filter(user => user.id === this.user.id);
        if (prUser.length) this.user = prUser[0];

        // Assignees
        this.assignees.map(assignee => {
            const assigneeUser = users.filter(user => user.id === assignee.id);
            if (assigneeUser.length) return assigneeUser[0];
            return assignee
        });

        // Reviewers
        this.requested_reviewers.map(reviewer => {
            const reviewerUser = users.filter(user => user.id === reviewer.id);
            if (reviewerUser.length) return reviewerUser[0];
            return reviewer
        });
    }

    invalid() {
        const invalidLabels = this.labels.filter(label => label.name.toLowerCase().trim() === "invalid");
        return !!invalidLabels.length;

    }

    valid() {
        return !this.invalid();
    }
}

module.exports = PR;
