Array.prototype.limit = function(limit) {
    return this.slice(0, limit)
};

Array.prototype.groupBy = function(keyGetter) {
    const obj = {};
    this.forEach(item => {
        const key = keyGetter(item);
        if (!(key in obj)) obj[key] = [];
        obj[key].push(item);
    });
    return obj;
};
