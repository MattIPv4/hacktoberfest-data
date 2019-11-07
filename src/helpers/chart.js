const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const colors = {
    background: '#152347',
    box: '#1D2C4E',
    white: '#FFFFFF',
    cyan: '#92EAFF',
    magenta: '#FF00AA',
    yellow: '#FFF922',
    blue: '#1595FF',
    purple: '#A11EC6'
};

const config = (width, height, data) => {
    return {
        width,
        height,
        theme: 'dark2',
        backgroundColor: colors.background,
        data,
    };
};

const render = async (config) => {
    return new Promise((resolve) => {
        const makeCanvas = window => {
            window.chart = new window.CanvasJS.Chart("chartContainer", config);
            window.chart.render();
            window.getCanvas(window);
        };
        const getCanvas = window => {
            const canvas = window.document.body.querySelector('#chartContainer canvas');
            resolve(canvas.toDataURL('image/png'));
        };
        new JSDOM(`<html><body style="height: ${config.height*1.5}px; width: ${config.width*1.5}px;"><div id="chartContainer" style="height: ${config.height}px; width: ${config.width}px;"></div><script src="https://cdnjs.cloudflare.com/ajax/libs/canvasjs/1.7.0/canvasjs.min.js" onload="makeCanvas(window)"></script></body></html>`, {
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

const save = (file, data) => {
    const base64Data = data.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(file, base64Data, 'base64');
};

module.exports = { colors, config, render, save };
