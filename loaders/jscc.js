const {matchAll} = require("../utils");

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
