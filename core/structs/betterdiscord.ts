export class Plugin {
    private _settings = null;

    // Defined by the actual Plugin
    onStart() {}
    onStop() {}

    start() {
        if (typeof this.onStart === "function") {
            this.onStart();
        }
    }

    stop() {
        if (typeof this.onStop === "function") {
            this.onStop();
        }
    }

    registerSettings(settings) {
        this._settings = settings;
    }

    get getSettingsPanel() {
        if (!this._settings) return undefined;

        return () => this._settings;
    }
}
