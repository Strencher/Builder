/// <reference path="./core/patcher/patcher.d.ts" />
/// <reference path="./core/webpack/webpack.d.ts" />
/// <reference path="./core/structs/structs.d.ts" />
/// <reference path="./core/settings/settings.d.ts" />

    
declare const GLOBAL_ENV: {
    CLIENT_MOD: "BETTERDISCORD" | "UNBOUND" | "ASTRA" | "POWERCORD"
};

declare module "styles" {
    const Style: {
        readonly _element?: HTMLStyleElement,
        load(): void,
        unload(): void
    };

    export default Style;
}

declare module "*.scss";
declare module "*.css";

declare const manifest: any;
declare const __NON_ROLLUP_REQUIRE__: Function;
