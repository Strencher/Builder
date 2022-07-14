const {getAllModules, getModule} = powercord.webpack;

export function find(filter) {
    return getModule(filter, false);
}

export function findAll(filter) {
    return getAllModules(filter, false);
}

export function getByProps(...props) {
    return getModule(props, false);
}

export function getByDisplayName(displayName, options = {default: true}) {
    let filter = m => m?.default?.displayName === displayName;

    if (options.default) {
        filter = m => m?.displayName === displayName;
    }

    return getModule(filter, false);
}
