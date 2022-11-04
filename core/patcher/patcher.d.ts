declare module "@patcher" {
    export function after<This, Args, Result>(module: any, method: string, callback: (thisObject: This, args: Args, returnValue: Result) => Result | undefined): () => void;
    export function before<This, Args>(module: any, method: string, callback: (thisObject: This, args: Args) => undefined): () => void;
    export function instead<This, Args, OriginalFn extends (...args: any) => any>(module: any, method: string, callback: (thisObject: This, args: Args, originalFunction: OriginalFn) => any): () => void;
    export function unpatchAll(): void;
}

declare const powercord: any;
declare const Astra: any;
declare const unbound: any;
