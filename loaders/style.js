const {promises: fs} = require("fs");
const path = require("path");

function makeStylesheet(content, filename) {
return `export default {
    content: ${JSON.stringify(content)},
    _element: null,
    load() {
        if (this._element) return;

        this._element = Object.assign(document.createElement("style"), {
            textContent: this.content,
            id: manifest.id + "-" + "${filename}"
        });

        document.head.appendChild(this._element);
    },
    unload() {
        this._element?.remove();
        this._element = null;
    },
    concat(...styles) {
        this.content += styles.reduce((final, style) => final + "\\n" + style.content, "");
    }
}
`;
}

module.exports = function Style({extensions}) {
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

            return makeStylesheet(content, path.basename(id));
        }
    };
}
