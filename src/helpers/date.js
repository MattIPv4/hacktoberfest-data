const getDateArray = (start, end) => {
    const arr = [];
    const dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
};

function dateFromDay(year, day){
    const date = new Date(year, 0); // initialize a date in `year-01-01`
    return new Date(date.setDate(day)); // add the number of days
}

function formatDate(date) {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();

    return `${monthNames[monthIndex]} ${day}`;
}

module.exports = { getDateArray, dateFromDay, formatDate };
