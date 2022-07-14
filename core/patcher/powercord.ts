const {injector} = powercord;
const patches = new Set<Function>;
const id = (id => () => id++)(0);

export function after(module, method, callback) {
    if (!module[method]) module[method] = function () {};
    const caller = `${manifest.name}-${method}-${id()}`;
    const revert = () => injector.uninject(caller);

    injector.inject(caller, module, method, function (args, res) {
        const temp = callback.call(this, this, args, res);
        return typeof temp == "undefined" ? res : temp;
    });

    patches.add(revert);

    return revert;
}

export function before(module, method, callback) {
    if (!module[method]) module[method] = function () {};
    const caller = `${manifest.name}-${method}-${id()}`;
    const revert = () => injector.uninject(caller);

    injector.inject(caller, module, method, function (args) {
        const temp = callback.call(this, this, args);
        return typeof temp == "undefined" ? args : temp;
    }, true);

    patches.add(revert);
    
    return revert;
}

export function instead(module, method, callback) {
    const original = module[method] ?? function () {};
    const revert = () => {
        module[method] = original;
    };

    module[method] = function () {
        try {
            return callback.call(this, this, arguments, original);
        } catch (error) {
            console.error(`[Patcher] Instead patch of ${manifest.name} ran into an error:`, error);
        }

        return original.apply(this, arguments);
    };

    patches.add(revert);

    return revert;
}

export function unpatchAll() {
    patches.forEach(patch => patch());
}
