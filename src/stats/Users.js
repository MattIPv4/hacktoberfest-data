module.exports = async data => {
    const { Users } = data;

    /***************
     * User Stats
     ***************/
    console.log('\n\n----\nUser Stats\n----');

    // Repeat engagement, year over year, or any time in past
    // TODO: Not sure how I can do this with just data from this year?

    // Number of users who made first PRs
    // We only have relevant PR data, this would need massive abuse of the GH API to determine

    // Stats on invalid PRs, how many people were repeat spammers
    const winnerUsers = Users.filter(user => user.won());
    const singleInvalidUsers = Users.filter(user => user.prs.filter(pr => pr.invalid()).length === 1);
    const repeatedInvalidUsers = Users.filter(user => user.prs.filter(pr => pr.invalid()).length >= 1);
    const invalidAndWinnerUsers = Users.filter(user => user.won() && user.prs.filter(pr => pr.invalid()).length);
    console.log('');
    console.log(`Total Users: ${Users.length}`);
    console.log(`  Users that won (4+ PRs): ${winnerUsers.length} (${(winnerUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with 1 invalid PR: ${singleInvalidUsers.length} (${(singleInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with more than 1 invalid PRs: ${repeatedInvalidUsers.length} (${(repeatedInvalidUsers.length / Users.length * 100).toFixed(2)}%)`);
    console.log(`  Users with invalid PRs that also won: ${invalidAndWinnerUsers.length} (${(invalidAndWinnerUsers.length / Users.length * 100).toFixed(2)}%)`);

    // Breaking down users by language
    const UsersByLanguage = Users.groupBy(user => user.prs.map(pr => pr.languageString()).mode());
    console.log('');
    console.log(`Users by language: ${Object.keys(UsersByLanguage).length} languages`);
    UsersByLanguage.forEach((key, val) => {
        console.log(`  ${key}: ${val.length} (${(val.length / Users.length * 100).toFixed(2)}%)`);
    });
};
