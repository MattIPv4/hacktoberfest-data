Object.prototype.forEach = function(callback) {
    Object.keys(this).forEach(key => {
        const value = this[key];
        callback(key, value);
    })
};
