// Thanks https://stackoverflow.com/a/39077686/5577674
const hexToRgb = hex => hex
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g).map(x => parseInt(x, 16));

// Thanks https://stackoverflow.com/a/39077686/5577674
const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('');

// Thanks https://stackoverflow.com/a/11868159
const brightness = hex => {
    const [r, g, b] = hexToRgb(hex);
    return  Math.round(((parseInt(r) * 299) +
        (parseInt(g) * 587) +
        (parseInt(b) * 114)) / 1000);
};

const isBright = hex => brightness(hex) > 125;

const darken = (hex, percentage) => rgbToHex(hexToRgb(hex).map(x => Math.round(x * (100 - percentage) / 100)));

const lighten = (hex, percentage) => darken(hex, -percentage);

module.exports = { hexToRgb, rgbToHex, brightness, isBright, darken, lighten };
