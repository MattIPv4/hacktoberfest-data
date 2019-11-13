const getDateArray = (start, end) => {
    // Thanks https://stackoverflow.com/a/4413721
    const arr = [];
    const dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
};

const dateFromDay = (year, day) => {
    // Thanks https://stackoverflow.com/a/4049020
    const date = new Date(year, 0);
    return new Date(date.setDate(day));
};

const formatDate = (date, short) => {
    // Thanks https://stackoverflow.com/a/3552493
    let monthNames = [
        'January', 'February', 'March',
        'April', 'May', 'June', 'July',
        'August', 'September', 'October',
        'November', 'December',
    ];
    if (short) {
        monthNames = [
            'Jan', 'Feb', 'Mar',
            'Apr', 'May', 'Jun', 'Jul',
            'Aug', 'Sept', 'Oct',
            'Nov', 'Dec',
        ];
    }

    const day = date.getDate();
    const monthIndex = date.getMonth();

    return `${monthNames[monthIndex]} ${day}`;
};

module.exports = { getDateArray, dateFromDay, formatDate };
