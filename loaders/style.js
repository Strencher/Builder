const {promises: fs} = require("fs");
const path = require("path");
const cssom = require("cssom");
const {matchAll, toCamelCase} = require("../utils");

const loader =
`export default {
    sheets: [],
    _element: null,
    load() {
        if (this._element) return;

        this._element = Object.assign(document.createElement("style"), {
            textContent: this.sheets.join("\\n"),
            id: manifest.id
        });

        document.head.appendChild(this._element);
    },
    unload() {
        this._element?.remove();
        this._element = null;
    }
}`;

function makeStylesheet(content, filename) {
    const names = cssom.parse(content).cssRules.reduce((classNames, rule) => {
        const matches = matchAll({
            regex: /((?:\.|#)\S+)/g,
            input: rule.selectorText,
            flat: true
        });

        Object.assign(classNames,
            Object.fromEntries(matches.map(m => (m = m.slice(1), [toCamelCase(m), m])))
        );

        return classNames;
    }, {});

return`
import Styles from "styles";

Styles.sheets.push("/* ${filename} */", 
\`${content.replaceAll("`", "\\`")}\`);

export default ${JSON.stringify(names, null)};
`;
}

module.exports = function Style({extensions}) {
    return {
        name: "Style Loader",
        resolveId(id) {
            if (id === "styles") return id;

            return null;
        },
        async load(id) {
            if (id === "styles") return loader;

            const ext = path.extname(id);
            if (!extensions.has(ext)) return null;

            let content; {
                if (ext === ".scss") {
                    content = (await require("sass").compileAsync(id)).css;
                } else {
                    content = await fs.readFile(id, "utf8");
                }
            };

            return makeStylesheet(content, path.basename(id));
        }
    };
}
