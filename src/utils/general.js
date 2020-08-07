const { stripIndents, TemplateTag } = require('common-tags');

exports.parseBoolean = function (input) {
    if (typeof input === 'string') {
        input = input.toLowerCase();
        if (input === 'false') { return false; }
        if (input === '0') { return false; }
        if (input === 'no') { return false; }
        if (input === 'off') { return false; }
    }

    if (input) return true;
    else return false;
};

// Fisher-Yates shuffle
// TODO: Should be refactored. Code will need updated elsewhere.
exports.shuffleArray = function (origArray) {
    let array = [...origArray];

    let m = array.length;
    let t, i;

    // While there remain elements to shuffle...
    while (m) {
        // Pick a remaining element...
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
};

// Fixes a problem with stripIndents not stripping indents from an escaped newline
exports.stripIndentsExtra = new TemplateTag([{
    onEndResult(res) {
        return stripIndents(res).replace(/ +/g, ' ').replace(/\n /g, '\n');
    }
}]);
