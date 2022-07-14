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

export function getByDisplayName(displayName, options = {default: true}) {
    return findByDisplayName(displayName, options);
}

