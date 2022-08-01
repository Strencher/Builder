
type StoreNames = import("./stores").StoreNames;
type Store<T> = import("./stores").Store<T>;

declare module "@webpack" {
    export function getByDisplayName<T>(displayName: string, options?: {default?: boolean}): T;
    export function findAll<T>(filter: (m: any) => boolean): T;
    export function find<T>(filter: (m: any) => boolean): T;
    export function getByProps<T>(...props: string[]): T;
    export function getStore<T extends StoreNames>(name: T): Store<T>;
}
