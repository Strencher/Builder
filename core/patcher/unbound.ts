const patcher = unbound.patcher.create(manifest.name);

export function after(module, method, callback) {
    return patcher.after(module, method, callback);
}

export function before(module, method, callback) {
    return patcher.before(module, method, callback);
}

export function instead(module, method, callback) {
    return patcher.instead(module, method, callback);
}

export function unpatchAll() {
    patcher.unpatchAll();
}
