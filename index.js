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
    w: "watch"
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
    console.log(fs.readFileSync(path.resolve(__dirname, "help.txt"), "utf8"));
    process.exit(1);
}

if (!Reflect.has(argv, "input")) {
    console.error("No input provided!");
    process.exit(0);
}

const {watch} = require("rollup");
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
    }
}
`;
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

        manifest.authors ??= [manifest.author];
        delete manifest.author;
        
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
    
    if (!fs.existsSync(argv.output)) {
        fs.mkdirSync(argv.output, {recursive: true});
    }
    
    if (!path.isAbsolute(argv.output)) {
        argv.output = path.resolve(process.cwd(), argv.output);
    }
    
    for (const mod of Array.isArray(argv.mods) ? argv.mods : [argv.mods]) {
        const globals = new Set([mod.toUpperCase()]);

        const resolver = nodeResolve({
            extensions: [".ts", ".tsx", ".js", ".css", ".scss"]
        });

        const watcher = watch({
            input: path.resolve(pluginPath, "index"),
            watch: {
                skipWrite: true
            },
            output: {
                format: "commonjs",
                exports: "auto"
            },
            external: require("module").builtinModules,
            plugins: [
                alias({
                    entries: [
                        {find: "@patcher", replacement: path.resolve(__dirname, "./core/patcher/index.ts")},
                        {find: "@webpack", replacement: path.resolve(__dirname, "./core/webpack/index.ts")},
                        {find: "@structs", replacement: path.resolve(__dirname, "./core/structs/index.ts")}
                    ],
                    customResolver: resolver
                }),
                (extensions => ({
                    name: "Style Loader",
                    async load(id) {
                        const ext = path.extname(id);
                        if (!extensions.has(ext)) return null;
                        let content;
                        
                        if (ext === ".scss") {
                            content = (await require("sass").compileAsync(id)).css;
                        } else {
                            content = await fs.promises.readFile(id, "utf8");
                        }

                        return makeStylesheet(content, path.basename(id));
                    }
                }))(new Set([".css", ".scss"])),
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
        });

        watcher.on("event", async event => {
            switch (event.code) {
                case "BUNDLE_START": {
                    if (argv.watch) console.clear();
                    console.time(`Build for ${mod} in`);
                } break;

                case "BUNDLE_END": {
                    const manifest = JSON.parse(await fs.promises.readFile(path.resolve(pluginPath, "manifest.json"), "utf8"));
                    const bundle = event.result;

                    let {output: [{code}]} = await bundle.generate({format: "cjs", exports: "auto"});
                    
                    code = code.replace("'use strict';\n", "");
                    code = `"use strict";\nconst manifest = Object.freeze(${JSON.stringify(manifest, null, 2)});\n` + code;

                    await bundlers[mod](code, manifest);

                    console.timeEnd(`Build for ${mod} in`);

                    event.result.close();
                    if (!argv.watch) watcher.close();
                } break;

                case "ERROR": {
                    console.error(event.error);
                } break;
            }
        });
    }
})();
