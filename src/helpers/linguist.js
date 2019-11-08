const fetch = require('node-fetch');
const yaml = require('js-yaml');
const colors = {};

const clean = lang => lang.toString().toLowerCase().trim();

const load = async () => {
    const res = await fetch('https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml');
    const text = await res.text();
    const data = yaml.safeLoad(text);
    Object.entries(data).forEach(lang => {
        if (lang[1].color) colors[clean(lang[0])] = lang[1].color;
    });
};

const get = lang => colors[clean(lang)];

module.exports = { load, get };
