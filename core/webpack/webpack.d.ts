declare module "@webpack" {
    export function getByDisplayName<T>(displayName: string, options?: {default?: boolean}): T;
    export function findAll<T>(filter: (m: any) => boolean): T;
    export function find<T>(filter: (m: any) => boolean): T;
    export function getByProps<T>(...props: string[]): T;
}
