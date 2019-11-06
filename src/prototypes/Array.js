Array.prototype.limit = function (limit) {
    return this.slice(0, limit)
};

Array.prototype.unique = function () {
    return this.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
};

Array.prototype.uniqueBy = function (keyGetter) {
    const keys = [];
    return this.filter(item => {
        const key = keyGetter(item);
        if (keys.includes(key)) return false;
        keys.push(key);
        return true;
    });
};

Array.prototype.groupBy = function (keyGetter) {
    const obj = {};
    this.forEach(item => {
        const key = keyGetter(item);
        if (!(key in obj)) obj[key] = [];
        obj[key].push(item);
    });
    return obj;
};
