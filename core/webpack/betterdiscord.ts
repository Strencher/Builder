export function find(filter) {
    return BdApi.Webpack.getModule(filter);
}

export function findAll(filter) {
    return BdApi.Webpack.getModule(filter, {first: false});
}

export function getByProps(...props) {
    return BdApi.Webpack.getModule(BdApi.Webpack.Filters.byProps(...props));
}

export function getStore(name) {
    return BdApi.Webpack.getModule(m => m?._dispatchToken && m.getName() === name);
}

export function getByDisplayName(displayName, options = {default: true}) {
    let filter = m => m?.default?.displayName === displayName;
    if (options.default) {
        filter = m => m.displayName === displayName;
    }

    return BdApi.Webpack.getModule(filter);
}
