Array.prototype.limit = function (limit) {
    return this.slice(0, limit);
};

Array.prototype.sum = function () {
    return this.reduce((a, b) => {
        return a + b;
    }, 0);
};
