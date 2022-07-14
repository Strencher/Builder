# Builder
* Plugin builder that compiles to several different discord client mods.
# Supports
- [Powercord](https://github.com/powercord-org/powercord)
- [Unbound](https://github.com/unbound-mod)
- [Asstra](https://github.com/Astra-mod)
- [BetterDiscord](https://github.com/BetterDiscord)

# Installation
```bash
git submodule add https://github.com/Strencher/Builder
cd Builder && npm install # or pnpm
```

# Usage
```bash
pnpm builder -i ./path/to/my/plugin
```

# Plugin Structure
* Please see `tests/test-plugin` as an example.

# Docs
* Coming soon™️

# CLI Commands
```
-h, --help   - Shows this message.
-i, --input  - Input plugin to be build.
-o, --output - Output path for compiled plugin(s).
-m, --mods   - Mods to build for. Supported: betterdiscord,unbound,powercord,astra.
-w, --watch  - Start the watcher.
```

# FAQ
### Q: Why do I have no typings?
### A: You need to include them as shown below.
```ts
/// <reference path="./Builder/typings.d.ts">

// Above HAS to be the first line inside your index file.
// Make sure you use THREE /'s
// You can now continue your work below that.
import {Plugin} from "@structs";

export default class MyPlugin extends Plugin {
    // ... rest of your code
}
```
<hr>
Copyright &copy; Strencher - 2022<br>
For license information, please see the license file.
