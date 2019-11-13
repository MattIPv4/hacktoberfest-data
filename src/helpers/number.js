const commas = num => {
    // Thanks https://stackoverflow.com/a/2901298
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

module.exports = { commas };
