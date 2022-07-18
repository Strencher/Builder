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

module.exports = function jscc({globals}) {
    return {
        name: "CONDITIONAL_COMPILATION",
        transform(code) {
            const matches = matchAll({
                regex: /[+]?\/\*#ifdef (\S+)\*\/[+]?((?!\/\*endif)[\S\s]+?)[+]?\/\*#endif\*\//ig,
                input: code,
                parent: true
            });
            
            if (!matches.length) return;

            for (const match of matches) {
                const [heap, variable, content] = match;
                code = code.replace(heap, globals.has(variable) ? content : "");
            }
            
            return code.trim();
        }
    };
}
