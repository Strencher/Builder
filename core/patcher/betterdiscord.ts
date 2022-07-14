export function after(module, method, callback) {
    return BdApi.Patcher.after(manifest.name, module, method, callback);
}

export function before(module, method, callback) {
    return BdApi.Patcher.instead(manifest.name, module, method, callback);
}

export function instead(module, method, callback) {
    return BdApi.Patcher.instead(manifest.name, module, method, callback);
}

export function unpatchAll() {
    BdApi.Patcher.unpatchAll(manifest.name);
}
