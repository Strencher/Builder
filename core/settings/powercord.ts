const SettingsManager = powercord.api.settings._fluxProps(manifest.id);
const changeCallbacks = new Set<Function>();

function emitChange(id: string) {
    changeCallbacks.forEach(fn => fn(id));
}

export function onChange(callback, options = {once: false}) {
    if (options.once) {
        const originalCallback = callback;

        callback = function () {
            changeCallbacks.delete(callback);
            originalCallback.apply(this, arguments);
        };
    }

    changeCallbacks.add(callback);

    return () => void changeCallbacks.delete(callback);
}

export function getSetting(id: string, defaultValue: any) {
    if (!id.includes(".")) return SettingsManager.getSetting(id, defaultValue);

    const items = id.split(".");
    const first = items.shift();

    return items.reduce((curr, key) => curr?.[key], SettingsManager.getSetting(first)) ?? defaultValue;
}

export function setSetting(id: string, newValue: any) {
    if (!id.includes(".")) return (SettingsManager.updateSetting(id, newValue), emitChange(id));

    const items = id.split(".");
    const first = items.shift();
    const value = SettingsManager.getSetting(first, {});
    const last = items.pop();
    let curr = value;

    for (const key of items) {
        if (!curr[key]) curr[key] = {}; 

        curr = curr[key];
    }

    curr[last] = newValue;

    SettingsManager.updateSetting(first, value);
    emitChange(id);
}

export function toggleSetting(id: string) {
    setSetting(id, !getSetting(id, false));
}
