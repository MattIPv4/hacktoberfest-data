const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Jimp = require('jimp');

const colors = {
    dark: '#050912', // mix(background, #000, 25%);
    darkBackground: '#101a35', // mix(background, #000, 75%);
    background: '#152347',
    darkBox: '#1D2C4E',
    lightBox: '#37476F',
    light: '#5A688C', // mix(lightBox, text, 25%);
    text: '#C3CCE2',
    white: '#FFFFFF',
    cyan: '#92EAFF',
    magenta: '#FF00AA',
    yellow: '#FFF922',
    blue: '#1595FF',
    purple: '#A11EC6',
};

const config = (width, height, data) => {
    const axis = {
        gridColor: colors.lightBox,
        lineColor: colors.lightBox,
        tickColor: colors.lightBox,
        labelFontColor: colors.text,
        labelFontWeight: 'bold',
        labelFontFamily: 'monospace',
        titleFontColor: colors.text,
        titleFontWeight: 'bold',
        titleFontFamily: 'monospace',
    };
    return {
        width,
        height,
        theme: 'dark2',
        backgroundColor: colors.background,
        axisX: axis,
        axisY: axis,
        legend: {
            fontColor: colors.text,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            horizontalAlign: 'center',
            verticalAlign: 'bottom',
            maxWidth: width * .9,
        },
        data,
    };
};

const render = async config => {
    return new Promise(resolve => {
        const makeCanvas = window => {
            window.chart = new window.CanvasJS.Chart('chartContainer', config);
            window.chart.render();
            window.getCanvas(window);
        };
        const getCanvas = window => {
            const canvas = window.document.body.querySelector('#chartContainer canvas');
            resolve(canvas.toDataURL('image/png'));
        };
        new JSDOM(`<html><body style="height: ${config.height*1.5}px; width: ${config.width*1.5}px;"><div id="chartContainer" style="height: ${config.height*1.1}px; width: ${config.width*1.1}px;"></div><script src="https://cdnjs.cloudflare.com/ajax/libs/canvasjs/1.7.0/canvasjs.min.js" onload="makeCanvas(window)"></script></body></html>`, {
            resources: 'usable',
            runScripts: 'dangerously',
            beforeParse(window) {
                window.makeCanvas = makeCanvas;
                window.getCanvas = getCanvas;
                window.console = console;
            },
        });
    });
};

const save = async (file, data, watermark_opts) => {
    const base64Data = data.replace(/^data:image\/png;base64,/, '');

    const chart = await Jimp.read(Buffer.from(base64Data, 'base64'));
    const hf = await Jimp.read(path.join(__dirname, 'hf-2019.png'));
    hf.resize(watermark_opts.width || Jimp.AUTO, watermark_opts.height || Jimp.AUTO);
    chart.blit(hf, watermark_opts.x - (hf.bitmap.width / 2), watermark_opts.y - (hf.bitmap.height / 2));

    await chart.writeAsync(file);
};

module.exports = { colors, config, render, save };
