const PCPlugin = __NON_ROLLUP_REQUIRE__("powercord/entities").Plugin;

export class Plugin extends PCPlugin {
    private _shouldUnregisterSettings = false;

    // Defined by the actual Plugin
    onStart() {}
    onStop() {}

    startPlugin() {
        if (typeof this.onStart === "function") {
            this.onStart();
        }
    }

    pluginWillUnload() {
        if (typeof this.onStop === "function") {
            this.onStop();
        }

        if (this._shouldUnregisterSettings) {
            powercord.api.settings.unregisterSettings(manifest.name);
        }
    }

    registerSettings(settings) {
        this._shouldUnregisterSettings = true;
        powercord.api.settings.registerSettings({
            label: manifest.name,
            render: settings,
            category: manifest.name
        });
    }
}
