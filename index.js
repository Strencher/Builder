const fs = require("fs");
const path = require("path");

const defaults = Object.entries({
    mods: ["betterdiscord", "powercord", "unbound", "astra"],
    output: path.resolve(process.cwd(), "dist"),
    watch: false
});

const aliases = new Proxy({
    i: "input",
    m: "mods",
    o: "output",
    h: "help",
    w: false
}, {
    get(target, key) {
        return target[key] ?? key;
    }
});

const argv = Object.fromEntries(defaults.concat(
    process.argv.slice(2).reduce((args, arg) => {
        if (arg.indexOf("-") !== 0 && args.length > 0) {
            arg.includes(",") && (arg = arg.split(",")); 
            args[args.length - 1][1] = arg;
        } else {
            while (arg.indexOf("-") === 0) arg = arg.slice(1);
            args.push([aliases[arg], true]);
        }
    
        return args;
    }, [])
));

if ("help" in argv) {
    console.log(fs.readFileSync("./help.txt", "utf8"));
    process.exit(1);
}

if (!Reflect.has(argv, "input")) {
    console.error("No input provided!");
    process.exit(0);
}

const {rollup} = require("rollup");
const {default: esBuild} = require("rollup-plugin-esbuild");
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const alias = require("@rollup/plugin-alias");

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

function makeBdMeta(manifest) {
    return Object.keys(manifest).reduce((str, key) => str + ` * @${key} ${manifest[key]}\n`, "/**\n") + " */\n\n";
}

function getReactInstance(mod) {
    switch (mod) {
        case "powercord": return "powercord.webpack.React";
        case "astra": return "Astra.Webpack.React";
        case "unbound": return "unbound.webpack.React";
        case "betterdiscord": return "BdApi.React";

        default: {
            throw new Error(`Unknown mod ${mod}`);
        };
    }
};

const bundlers = {
    async betterdiscord(code, manifest) {
        code = makeBdMeta(manifest) + code;

        await fs.promises.writeFile(path.resolve(argv.output, `${manifest.id}.plugin.js`), code, "utf8");
    },
    async unbound(code, manifest) {
        const pluginPath = path.resolve(argv.output, "unbound", manifest.id);

        if (!fs.existsSync(pluginPath)) await fs.promises.mkdir(pluginPath, {recursive: true});
        await fs.promises.writeFile(path.resolve(pluginPath, "index.js"), code, "utf8");
        await fs.promises.writeFile(path.resolve(pluginPath, "manifest.json"), JSON.stringify(manifest, null, 4), "utf8");
    },
    async astra(code, manifest) {
        const pluginPath = path.resolve(argv.output, "astra", manifest.id);

        if (!fs.existsSync(pluginPath)) await fs.promises.mkdir(pluginPath, {recursive: true});
        await fs.promises.writeFile(path.resolve(pluginPath, "index.js"), code, "utf8");
        await fs.promises.writeFile(path.resolve(pluginPath, "manifest.json"), JSON.stringify(manifest, null, 4), "utf8");
    },
    async powercord(code, manifest) {
        const pluginPath = path.resolve(argv.output, "powercord", manifest.id);

        if (!fs.existsSync(pluginPath)) await fs.promises.mkdir(pluginPath, {recursive: true});
        await fs.promises.writeFile(path.resolve(pluginPath, "index.js"), code, "utf8");
        await fs.promises.writeFile(path.resolve(pluginPath, "manifest.json"), JSON.stringify(manifest, null, 4), "utf8");
    }
};

(async () => {
    const pluginPath = path.isAbsolute(argv.input) ? argv.input : path.resolve(process.cwd(), argv.input);
    const manifest = require(path.resolve(pluginPath, "manifest.json"));
    
    if (!fs.existsSync(argv.output)) {
        fs.mkdirSync(argv.output, {recursive: true});
    }

    if (!path.isAbsolute(argv.output)) {
        argv.output = path.resolve(process.cwd(), argv.output);
    }
    
    console.time("Done in");
    for (const mod of Array.isArray(argv.mods) ? argv.mods : [argv.mods]) {
        const globals = new Set([mod.toUpperCase()]);
        console.time(`Build for ${mod} in`);

        const resolver = nodeResolve({
            extensions: [".ts", ".tsx", ".js"]
        });

        await rollup({
            input: path.resolve(pluginPath, "index"),
            watch: argv.watch,
            output: {
                format: "commonjs",
                exports: "auto"
            },
            external: require("module").builtinModules,
            plugins: [
                alias({
                    entries: [
                        {find: "@patcher", replacement: path.resolve("./core/patcher/index.ts")},   
                        {find: "@webpack", replacement: path.resolve("./core/webpack/index.ts")},
                        {find: "@structs", replacement: path.resolve("./core/structs/index.ts")}
                    ],
                    customResolver: resolver
                }),
                {
                    name: "CC",
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
                            // code = sliceString(code, match.index, heap.length, globals.has(variable) ? content : "");
                            // console.log(mod, "\n", code, "\n", mod);
                        }
                        
                        return code.trim();
                    }
                },
                esBuild({
                    target: "esNext",
                    jsx: "transform"
                }),
                resolver,
                {
                    name: "react",
                    resolveId(id) {
                        if (id === "react") return id;

                        return null;
                    },
                    load(id) {
                        if (id === "react") return "export default " + getReactInstance(mod);

                        return null;
                    }
                }
            ]
        }).then(async bundle => {
            let {output: [{code}]} = await bundle.generate({format: "cjs", exports: "auto"});
            
            code = code.replace("'use strict';\n", "");
            code =  `"use strict";\nconst manifest = Object.freeze(${JSON.stringify(manifest, null, 2)});\n` + code;

            await bundlers[mod](code, manifest);
        }, console.error);

        console.timeEnd(`Build for ${mod} in`);
    }

    console.timeEnd("Done in");
})();
