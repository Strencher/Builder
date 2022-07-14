declare module "@structs" {
    export class Plugin {
        onStart(): void;
        onStop(): void;

        registerSettings(settings: React.FC): void;
    }
}
