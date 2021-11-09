const path = require('path');

const { registerFont } = require('canvas');
registerFont(path.join(__dirname, 'Poppins-Regular.ttf'), { family: 'Poppins', weight: 400 });
registerFont(path.join(__dirname, 'Poppins-Bold.ttf'), { family: 'Poppins', weight: 700 });

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Jimp = require('jimp');

const colors = {
    dark: '#072540', // mix(background, #000, 25%); // TODO: update
    darkBackground: '#072540', // mix(background, #000, 75%); // TODO: update
    darkBox: '#183D5D', // TODO: update
    lightBox: '#183D5D', // TODO: update
    light: '#183D5D', // mix(lightBox, text, 25%); // TODO: update
    white: '#FFFFFF', // TODO: update

    background: '#f4f0e1',
    backgroundBox: '#dbe8d9',
    line: '#677662',
    text: '#2B3531',
    textBox: '#2B3531',
    highlightPositive: '#91A88C',
    highlightNeutral: '#A88771',
    highlightNegative: '#B53A25',
};

const config = (width, height, data, opts) => {
    opts = opts || {};
    opts.size = {
        width,
        height,
    };
    opts.padding = opts.padding || {};
    opts.padding.top = opts.padding.top || 0;
    opts.padding.right = opts.padding.right || 0;
    opts.padding.bottom = opts.padding.bottom || 0;
    opts.padding.left = opts.padding.left || 0;

    for (const dataSeries of data) {
        dataSeries.indexLabelFontColor = dataSeries.indexLabelFontColor || colors.text;
        dataSeries.indexLabelFontWeight = dataSeries.indexLabelFontWeight || 'regular';
        dataSeries.indexLabelFontFamily = dataSeries.indexLabelFontFamily || '\'Poppins\', sans-serif';
    }

    const axis = {
        gridColor: colors.line,
        lineColor: colors.line,
        tickColor: colors.line,
        labelFontColor: colors.text,
        labelFontWeight: 'regular',
        labelFontFamily: '\'Poppins\', sans-serif',
        titleFontColor: colors.text,
        titleFontWeight: 'bold',
        titleFontFamily: '\'Poppins\', sans-serif',
    };
    return {
        width: width - opts.padding.left - opts.padding.right,
        height: height - opts.padding.top - opts.padding.bottom,
        backgroundColor: colors.background,
        axisX: axis,
        axisY: axis,
        legend: {
            fontColor: colors.text,
            fontWeight: 'regular',
            fontFamily: '\'Poppins\', sans-serif',
            horizontalAlign: 'center',
            verticalAlign: 'bottom',
            maxWidth: (width - opts.padding.left - opts.padding.right) * .9,
        },
        title: {
            fontColor: colors.text,
            fontWeight: 'bold',
            fontFamily: '\'Poppins\', sans-serif',
            horizontalAlign: 'center',
            verticalAlign: 'top',
            maxWidth: (width - opts.padding.left - opts.padding.right),
        },
        data,
        renderOpts: opts,
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

            // Apply padding
            if (config.renderOpts.size.width !== config.width || config.renderOpts.size.height !== config.height) {
                const ctx = canvas.getContext('2d');
                const temp = ctx.getImageData(0, 0, canvas.width, canvas.height);
                ctx.canvas.width = config.renderOpts.size.width;
                ctx.canvas.height = config.renderOpts.size.height;
                ctx.fillStyle = config.backgroundColor;
                ctx.fillRect(0, 0, config.renderOpts.size.width, config.renderOpts.size.height);
                ctx.putImageData(temp, config.renderOpts.padding.left, config.renderOpts.padding.top);
            }

            resolve(canvas.toDataURL('image/png'));
        };
        const virtualConsole = new jsdom.VirtualConsole();
        virtualConsole.sendTo(console, { omitJSDOMErrors: true });
        new JSDOM(`<html><body style="height: ${config.renderOpts.size.height*1.5}px; width: ${config.renderOpts.size.width*1.5}px;"><div id="chartContainer" style="height: ${config.renderOpts.size.height*1.1}px; width: ${config.renderOpts.size.width*1.1}px; background: ${config.backgroundColor};"></div><script src="https://cdnjs.cloudflare.com/ajax/libs/canvasjs/1.7.0/canvasjs.min.js" onload="makeCanvas(window)"></script></body></html>`, {
            resources: 'usable',
            runScripts: 'dangerously',
            virtualConsole,
            beforeParse(window) {
                window.makeCanvas = makeCanvas;
                window.getCanvas = getCanvas;
            },
        });
    });
};

const save = async (file, data, watermark_opts) => {
    const base64Data = data.replace(/^data:image\/png;base64,/, '');

    const chart = await Jimp.read(Buffer.from(base64Data, 'base64'));
    const hf = await Jimp.read(path.join(__dirname, watermark_opts.full ? 'hf-full.png' : 'hf.png'));
    hf.resize(watermark_opts.width || Jimp.AUTO, watermark_opts.height || Jimp.AUTO);
    chart.blit(hf, watermark_opts.x - (hf.bitmap.width / 2), watermark_opts.y - (hf.bitmap.height / 2));

    await chart.writeAsync(file);
};

module.exports = { colors, config, render, save };
