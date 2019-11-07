const path = require('path');
const chart = require('../helpers/chart');
const { getDateArray } = require('../helpers/date');

module.exports = async data => {
    const { PRs } = data;

    /***************
     * PR Stats
     ***************/
    console.log('\n\n----\nPR Stats\n----');

    // Total PRs and invalid PRs
    const totalPRs = PRs.length;
    const ValidPRs = PRs.filter(pr => pr.valid());
    const totalValidPRs = ValidPRs.length;
    const InvalidPRs = PRs.filter(pr => pr.invalid());
    const totalInvalidPRs = InvalidPRs.length;
    const InvalidRepoPRs = PRs.filter(pr => pr.invalid_repo());
    const totalInvalidRepoPRs = InvalidRepoPRs.length;
    const InvalidLabelPRs = PRs.filter(pr => pr.invalid_label());
    const totalInvalidLabelPRs = InvalidLabelPRs.length;
    console.log('');
    console.log(`Total PRs: ${totalPRs}`);
    console.log(`  Valid PRs: ${totalValidPRs} (${(totalValidPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`  Invalid PRs: ${totalInvalidPRs} (${(totalInvalidPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`    Invalid (excluded repo) PRs: ${totalInvalidRepoPRs} (${(totalInvalidRepoPRs / totalPRs * 100).toFixed(2)}%)`);
    console.log(`    Invalid (labeled invalid) PRs: ${totalInvalidLabelPRs} (${(totalInvalidLabelPRs / totalPRs * 100).toFixed(2)}%)`);

    // Breaking down PRs by language, other tags
    const PRsByLanguage = ValidPRs.groupBy(pr => pr.languageString());
    console.log('');
    console.log(`PRs by language: ${Object.keys(PRsByLanguage).length} languages`);
    PRsByLanguage.forEach((key, val) => {
        console.log(`  ${key}: ${val.length} (${(val.length / totalPRs * 100).toFixed(2)}%)`);
    });
    chart.save(path.join(__dirname, '../../imgs/prs_by_language_doughnut.png'),
        await chart.render(chart.config(1000, 1000, [{
            type: 'doughnut',
            indexLabelPlacement: 'inside',
            indexLabelFontSize: 22,
            indexLabelFontColor: chart.colors.white,
            indexLabelFontFamily: 'monospace',
            dataPoints: Object.entries(PRsByLanguage).map(data => {
                return {
                    y: data[1].length,
                    indexLabel: `${data[0]}\n${(data[1].length / totalPRs * 100).toFixed(1)}%`,
                };
            }),
        }])),
    );
    chart.save(path.join(__dirname, '../../imgs/prs_by_language_spline.png'),
        await chart.render(chart.config(2500, 1000, Object.entries(PRsByLanguage).map(data => {
            const dates = getDateArray(new Date('2019-09-30'), new Date('2019-11-01'));
            const PRsByDate = data[1].groupBy(pr => pr.date().toDateString());
            const PRData = dates.map(date => {
                const dateString = date.toDateString();
                return { x: date, y:  dateString in PRsByDate ? PRsByDate[dateString].length : 0 };
            }).sort((a, b) => {
                return b.x - a.x;
            });
            return {
                type: 'spline',
                name: data[0],
                showInLegend: true,
                dataPoints: PRData,
            };
        }))),
    );

    // Lines of code per PR
    const PRsByChanges = ValidPRs.sort((a, b) => b.changes() - a.changes());
    console.log('');
    console.log('Largest changes in a PR:');
    PRsByChanges.limit(5).forEach(pr => {
        console.log(`  ${pr.changes()} | ${pr.html_url}`);
    });
};
