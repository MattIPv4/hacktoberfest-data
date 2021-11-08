const commas = num => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const integer = num => {
    if (num < 1) return `Less than 1 (${commas(num)})`;
    return Math.round(num).toLocaleString();
};

const percentage = num => {
    return `${(num * 100).toFixed(2)}%`;
};

module.exports = { commas, integer, percentage };
