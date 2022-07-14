const {Patcher} = Astra;

export function after(module, method, callback) {
    return Patcher.after(manifest.name, module, method, callback);
}

export function before(module, method, callback) {
    return Patcher.before(manifest.name, module, method, callback);
}

export function instead(module, method, callback) {
    return Patcher.instead(manifest.name, module, method, callback);
}

export function unpatchAll() {
    return Patcher.unpatchAll(manifest.name);
}
