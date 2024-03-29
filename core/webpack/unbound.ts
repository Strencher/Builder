const {findByProps, findByDisplayName, getModule} = unbound.webpack;

export function find(filter) {
    return getModule(filter);
}

export function findAll(filter) {
    return getModule(filter, {all: true});
}

export function getByProps(...props) {
    return findByProps(...props);
}

export function getStore(name) {
    return getModule(m => m?._dispatchToken && m.getName() === name);
}

export function getByDisplayName(displayName, options = {default: true}) {
    return findByDisplayName(displayName, options);
}

