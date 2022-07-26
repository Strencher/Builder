const {promises: fs} = require("fs");
const path = require("path");

let previousId = {};

function makeStylesheet(content, filename, previousId, mod) {
if (previousId[mod]) {
return `
import Loader from ${JSON.stringify(previousId[mod])};

Loader.sheets.push("/* ${filename} */", ${JSON.stringify(content)});
`;
}
return `export default {
    sheets: ["/* ${filename} */", ${JSON.stringify(content)}],
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
}
`;
}

module.exports = function Style({extensions, mod}) {
    return {
        name: "Style Loader",
        async load(id) {
            const ext = path.extname(id);
            if (!extensions.has(ext)) return null;
            let content;
            
            if (ext === ".scss") {
                content = (await require("sass").compileAsync(id)).css;
            } else {
                content = await fs.readFile(id, "utf8");
            }

            const code = makeStylesheet(content, path.basename(id), previousId, mod);
            previousId[mod] ??= id;
            return code;
        }
    };
}

module.exports.clearPrevious = (mod) => {
    previousId[mod] = null;
};
