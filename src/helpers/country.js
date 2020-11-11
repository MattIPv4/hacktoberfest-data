const countries = require('country-data').countries;

const getCountryName = (code, unknownName = 'Unknown', nullName = 'Not given' ) =>
    code === null ? nullName : (countries[code] || { name: unknownName }).name;

module.exports = { getCountryName };
