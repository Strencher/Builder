function getReactInstance(mod) {
    switch (mod) {
        case "powercord": return "require('powercord/webpack').React";
        case "astra": return "Astra.Webpack.React";
        case "unbound": return "unbound.webpack.React";
        case "betterdiscord": return "BdApi.React";

        default: {
            throw new Error(`Unknown mod ${mod}`);
        };
    }
};

module.exports = function react({mod}) {
    return {
        name: "react",
        resolveId(id) {
            if (id === "react") return id;

            return null;
        },
        load(id) {
            if (id === "react") return "export default " + getReactInstance(mod);

            return null;
        }
    };
};
