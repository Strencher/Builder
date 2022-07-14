export function find(filter) {
    return BdApi.findModule(filter);
}

export function findAll(filter) {
    return BdApi.findAllModules(filter);
}

export function getByProps(...props) {
    return BdApi.findModuleByProps(...props);
}

export function getByDisplayName(displayName, options = {default: true}) {
    let filter = m => m?.default?.displayName === displayName;
    if (options.default) {
        filter = m => m.displayName === displayName;
    }

    return BdApi.findModule(filter);
}
