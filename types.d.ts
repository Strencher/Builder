/// <reference path="./core/patcher/patcher.d.ts" />
/// <reference path="./core/webpack/webpack.d.ts" />
/// <reference path="./core/structs/structs.d.ts" />
/// <reference path="./core/settings/settings.d.ts" />

declare module "*.css" {
    const Style: {
        readonly _element?: HTMLStyleElement,
        load(): void,
        unload(): void,
        concat(...styles: (typeof Style)[]): void;
    };

    export default Style;
}

declare module "*.scss" {
    export {default as default} from "*.css";
}

declare const manifest: any;
declare const __NON_ROLLUP_REQUIRE__: Function;
