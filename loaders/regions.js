const path = require("path");

module.exports = function regions() {
    return {
        name: "Code Regions",
        transform(code, id) {
            if (id.toLowerCase().indexOf(["builder", "core"].join(path.sep).toLowerCase()) > -1) {
                id = "@" + path.basename(path.dirname(id));
            } else {
                id = path.basename(id);
            }

            return `// #region ${id}\n${code}\n// #endregion ${id}`;
        }
    };
}
