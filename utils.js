function matchAll({regex, input, parent = false, flat = false}) {
    let matches, output = [], lastIndex = 0;
    while (matches = regex.exec(input.slice(lastIndex))) {
        if (!regex.global) lastIndex += matches.index + matches[0].length;
        if (parent) output.push(matches);
        else {
            const [, ...match] = matches;

            output.push(...(flat ? match : [match]));
        }
    }
    return output;
}

function upperFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
    let out = "";
    const split = str.split("-");

    for (let i = 0; i < split.length; i++) {
        out += i > 0 ? upperFirst(split[i]) : split[i];
    }

    return out;
}

function matchChars(text, start, search) {
    for (let i = 0; i < search.length; i++) {
        const char = search[i];

        if (char === "?") continue;
        if (char !== text[start + i]) return false;
    }

    return true;
};

function range(start, end = start) {
    const result = [];

    for (let i = 0, first = start.charCodeAt(), stop = end.charCodeAt(); (first + i) <= stop; i++) {
        result.push(String.fromCharCode(first + i));
    }

    return result;
}

module.exports = {matchAll, upperFirst, toCamelCase, matchChars, range};
