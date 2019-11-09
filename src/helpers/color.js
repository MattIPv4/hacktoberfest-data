const hexToRgb = hex => {
    const color = hex.replace("#", "");
    const r = parseInt(color.substr(0,2),16);
    const g = parseInt(color.substr(2,2),16);
    const b = parseInt(color.substr(4,2),16);
    return [r, g, b];
};

const brightness = hex => {
    const [r, g, b] = hexToRgb(hex);
    return  Math.round(((parseInt(r) * 299) +
        (parseInt(g) * 587) +
        (parseInt(b) * 114)) / 1000);
};

const isBright = hex => {
    return brightness(hex) > 125;
};

module.exports = { hexToRgb, brightness, isBright };
