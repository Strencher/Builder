declare module "@settings" {
    export function onChange(callback: (id: string) => void, options?: {once?: boolean}): () => void;
    export function getSetting<T>(id: string, defaultValue?: T): T;
    export function setSetting(id: string, value: any): void;
    export function toggleSetting(id: string, value: any): void;
}
