class JSONObject {
    constructor(json_object) {
        for (let prop in json_object) {
            if (!json_object.hasOwnProperty(prop)) return;
            if (this.hasOwnProperty(prop)) return;
            this[prop] = json_object[prop];
        }
    }
}

module.exports = JSONObject;
