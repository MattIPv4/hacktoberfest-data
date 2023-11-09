const path = require('path');

const { registerFont } = require('canvas');
registerFont(path.join(path.dirname(require.resolve('@fontsource/jetbrains-mono')), 'files/jetbrains-mono-latin-400-normal.woff'), { family: 'JetBrains Mono', weight: 400 });
registerFont(path.join(path.dirname(require.resolve('@fontsource/jetbrains-mono')), 'files/jetbrains-mono-latin-700-normal.woff'), { family: 'JetBrains Mono', weight: 700 });

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Jimp = require('jimp');

const colors = {
    background: '#0F0913', // void
    backgroundBox: '#655F67', // manga 400
    line: '#655F67', // manga 400
    text: '#EFEDEF', // manga 200
    textBox: '#EFEDEF', // manga 200
    highlightPositive: '#33B6D8', // blue 200
    highlightNeutral: '#FFFBA4', // gold 100
    highlightNeutralAlt: '#D2B863', // gold 200
    highlightNegative: '#EC4237', // red 200
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
        dataSeries.indexLabelFontFamily = dataSeries.indexLabelFontFamily || '\'JetBrains Mono\'';
    }

    const axis = {
        gridColor: colors.line,
        lineColor: colors.line,
        tickColor: colors.line,
        labelFontColor: colors.text,
        labelFontWeight: 'regular',
        labelFontFamily: '\'JetBrains Mono\'',
        titleFontColor: colors.text,
        titleFontWeight: 'bold',
        titleFontFamily: '\'JetBrains Mono\'',
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
            fontFamily: '\'JetBrains Mono\'',
            horizontalAlign: 'center',
            verticalAlign: 'bottom',
            maxWidth: (width - opts.padding.left - opts.padding.right) * .9,
        },
        title: {
            fontColor: colors.text,
            fontWeight: 'bold',
            fontFamily: '\'JetBrains Mono\'',
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
    const hf = await Jimp.read(path.join(__dirname, 'hf.png'));
    hf.resize(watermark_opts.width || Jimp.AUTO, watermark_opts.height || Jimp.AUTO);
    chart.blit(hf, watermark_opts.x - (hf.bitmap.width / 2), watermark_opts.y - (hf.bitmap.height / 2));

    await chart.writeAsync(file);
};

module.exports = { colors, config, render, save };
