const {matchChars} = require("../utils");

function parseComptime(text) {
    const query = "comptime:?{";
    const matches = [];

    for (let consumed = 0; consumed < text.length; consumed++) {
        if (matchChars(text, consumed, query)) {
            consumed += query.length;
            const start = consumed - query.length;

            for (let opened = 1; opened > 0;) {
                if (consumed > text.length) throw "Unexpected End";
                switch (text[consumed]) {
                    case "{": {
                        opened++;
                    } break;

                    case "}": {
                        opened--;
                    } break;
                }

                consumed++;
            }

            const end = consumed;
            matches.push({start, end, content: text.slice(start + query.length, end - 1)});
        }
    }

    return matches;
}

module.exports = function comptime({args = []}) {
    return {
        name: "Comptime",
        transform(code) {
            if (code.indexOf("comptime:") < 0) return null;

            const matches = parseComptime(code);
            if (!matches.length) return null;

            for (const match of matches) {
                const {content, start, end} = match;
                const [names, stuff] = args.reduce((args, arg) => {
                    args[0].push(arg.name);
                    args[1].push(arg.code);

                    return args;
                }, [[], []]);

                const wrapped = new Function(names, content);
                
                try {
                    wrapped(...stuff);
                } catch (error) {
                    console.error("Error:", error.message);
                    process.exit(1);
                }
                
                code = code.slice(0, start) + code.slice(end);
            }

            return code;
        }
    }
}
