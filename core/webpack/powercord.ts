const {getAllModules, getModule} = __NON_ROLLUP_REQUIRE__("powercord/webpack");

export function find(filter) {
    return getModule(filter, false);
}

export function findAll(filter) {
    return getAllModules(filter, false);
}

export function getByProps(...props) {
    return getModule(props, false);
}

export function getStore(name) {
    return getModule(m => m?._dispatchToken && m.getName() === name, false);
}

export function getByDisplayName(displayName, options = {default: true}) {
    let filter = m => m?.default?.displayName === displayName;

    if (options.default) {
        filter = m => m?.displayName === displayName;
    }

    return getModule(filter, false);
}
