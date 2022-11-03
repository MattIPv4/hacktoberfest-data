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

const human = num => {
    if (num >= 1000000000) return `${commas(num / 1000000000)}B`;
    if (num >= 1000000) return `${commas(num / 1000000)}M`;
    if (num >= 1000) return `${commas(num / 1000)}K`;
    return commas(num);
};

module.exports = { commas, integer, percentage, human };
