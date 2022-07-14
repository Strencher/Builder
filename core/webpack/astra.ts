const {Webpack} = Astra;

export function find(filter) {
    return Webpack.getModule(filter);
}

export function findAll(filter) {
    return Webpack.getModule(filter, {all: true});
}

export function getByProps(...props) {
    return Webpack.getByProps(...props);
}

export function getByDisplayName(displayName, options = {default: true}) {
    let filter = m => m?.default?.displayName === displayName;
    if (options.default) {
        filter = m => m.displayName === displayName;
    }

    return Webpack.getModule(filter);
}
