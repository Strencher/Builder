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
const replace = require("@rollup/plugin-replace");
const {Style, jscc, react, regions} = require("./loaders");

function makeBdMeta(manifest) {
    return Object.keys(manifest).reduce((str, key) => str + ` * @${key} ${manifest[key]}\n`, "/**\n") + " */\n\n";
}

const bundlers = {
    async betterdiscord(code, manifest) {
        code = makeBdMeta({...manifest, name: manifest.name.replaceAll(" ", "")}) + code;

        await fs.promises.writeFile(path.resolve(argv.output, `${manifest.id}.plugin.js`), code, "utf8");
    },
    async unbound(code, manifest) {
        const pluginPath = path.resolve(argv.output, "unbound");

        manifest.authors ??= [manifest.author];
        delete manifest.author;
        
        if (!fs.existsSync(pluginPath)) await fs.promises.mkdir(pluginPath, {recursive: true});
        await fs.promises.writeFile(path.resolve(pluginPath, "index.js"), code, "utf8");
        await fs.promises.writeFile(path.resolve(pluginPath, "manifest.json"), JSON.stringify(manifest, null, 4), "utf8");
    },
    async astra(code, manifest) {
        const pluginPath = path.resolve(argv.output, "astra");

        if (!fs.existsSync(pluginPath)) await fs.promises.mkdir(pluginPath, {recursive: true});
        await fs.promises.writeFile(path.resolve(pluginPath, "index.js"), code, "utf8");
        await fs.promises.writeFile(path.resolve(pluginPath, "manifest.json"), JSON.stringify(manifest, null, 4), "utf8");
    },
    async powercord(code, manifest) {
        const pluginPath = path.resolve(argv.output, "powercord");

        manifest.license ??= "Unlicensed";

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
                        {find: "@settings", replacement: path.resolve(__dirname, "./core/settings/index.ts")},
                        {find: "@structs", replacement: path.resolve(__dirname, "./core/structs/index.ts")}
                    ],
                    customResolver: resolver
                }),
                Style({
                    extensions: new Set([".css", ".scss"]),
                    mod
                }),
                jscc({
                    globals: globals
                }),
                esBuild({
                    target: "esNext",
                    jsx: "transform"
                }),
                regions(),
                react({
                    mod: mod
                }),
                replace({
                    preventAssignment: true,
                    values: {
                        "__NON_ROLLUP_REQUIRE__": "require"
                    }
                }),
                resolver
            ]
        });

        watcher.on("event", async event => {
            switch (event.code) {
                case "BUNDLE_START": {
                    if (argv.watch) console.clear();
                    console.time(`Build for ${mod} in`);
                } break;

                case "BUNDLE_END": {
                    Style.clearPrevious(mod);

                    const manifest = JSON.parse(await fs.promises.readFile(path.resolve(pluginPath, "manifest.json"), "utf8"));
                    const bundle = event.result;

                    let {output: [{code}]} = await bundle.generate({format: "cjs", exports: "auto"});
                    
                    code = code.replace("'use strict';\n", "");
                    code = `"use strict";\n// #region manifest.json\nconst manifest = Object.freeze(${JSON.stringify(manifest, null, 2)});\n// #endregion manifest.json\n` + code;

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
