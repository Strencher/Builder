import React from "react";

const defaultOverrides = {
    useMemo: factory => factory(),
    useState: initialState => [initialState, () => void 0],
    useReducer: initialValue => [initialValue, () => void 0],
    useEffect: () => {},
    useLayoutEffect: () => {},
    useRef: () => ({current: null}),
    useCallback: callback => callback,
    useContext: ctx => ctx._currentValue
};

const isClassComponent = what => typeof what === "function" && Boolean(what.prototype?.isReactComponent);

export default class TreeSearcher {
    _current: any;
    _break: boolean;
    _exceptionsHandler: ((error: any) => boolean | undefined) | null;
    defaultWalkable: string[];

    constructor(target, type) {
        this._current = target;
        this._break = false;

        switch (type) {
            case "react": {
                this.defaultWalkable = ["props", "children"];
            } break;

            case "react-vdom": {
                this.defaultWalkable = ["child", "return", "alternate"];
            } break;

            default: {
                this.defaultWalkable = [];
            };
        }
    }

    _wrapHandler(fn) {
        const self = this;
        return function () {
            try {
                return fn.apply(this, arguments);
            } catch (error) {
                if (self._exceptionsHandler) this._break = Boolean(self._exceptionsHandler(error));
                else {
                    throw error;
                }
            }
        }
    }

    catch(handler) {return this._exceptionsHandler = handler, this;}

    type() {return typeof this._current;}

    isNull() {return this._current == null;}

    isArray() {return this._break = !Array.isArray(this._current), this;}

    isNumber() {return this._break = this.type() !== "number", this;}

    isFunction() {return this._break = this.type() !== "function", this;}

    isObject() {return this._break = !(this.type() === "object" && this._current !== null), this;}

    isClassComponent() {return this._break = !isClassComponent(this._current), this;}

    where(condition) {return this._break = !this._wrapHandler(condition).call(this, this.value(), this), this;}

    walk(...path) {
        if (this._break) return this;

        try {
            for (let i = 0; i < path.length; i++) {
                if (!this._current) break;
    
                this._current = this._current?.[path[i]];
            }
        } catch (error) {
            if (this._exceptionsHandler) this._break = Boolean(this._exceptionsHandler(error));
            else {
                throw error;
            }
        }

        if (!this._current) this._break = true;

        return this;
    }

    find(filter, {ignore = [] as string[], walkable = this.defaultWalkable, maxProperties = 100} = {}) {
        if (this._break) return this;
        const stack = [this._current];

        filter = this._wrapHandler(filter);
        
        while (stack.length && maxProperties) {
            const node = stack.shift();
            if (filter(node)) {
                this._current = node;
                return this;
            }

            if (Array.isArray(node)) stack.push(...node);
            else if (typeof node === "object" && node !== null) {
                for (const key in node) {
                    const value = node[key];

                    if (
                        (walkable.length && (~walkable.indexOf(key) && !~ignore.indexOf(key))) ||
                        node && ~ignore.indexOf(key)
                    ) {
                        stack.push(value);
                    }
                }
            }
            maxProperties--;
        }

        this._break = true;
        this._current = null;

        return this;
    }

    render(props: any, options?: {[key in keyof typeof defaultOverrides]: (...args: any[]) => any}) {
        if (this._break) return this;

        if (isClassComponent(this._current)) {
            this._wrapHandler(() => {
                const instance = new this._current(props);

                const res = instance.render();
                if (res === null) this._break = true;
                else {
                    this._current = res;
                }
            })();

            return this;
        }

        const overrides = Object.assign({}, defaultOverrides, options);
        const keys = Object.keys(overrides);

        const ReactDispatcher = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
        const originals = keys.map(e => [e, ReactDispatcher[e]]);

        Object.assign(ReactDispatcher, overrides);

        let error = null;
        try {
            this._current = this.call(null, props)._current;
        } catch (err) {
            error = err;
        }

        Object.assign(ReactDispatcher, Object.fromEntries(originals));

        if (error && !this._exceptionsHandler) throw error;

        if (!this._current) this._break = true;

        return this;
    }

    put(factory) {
        if (this._break) return this;

        const value = this._current = this._wrapHandler(factory).call(this, this.value(), this);
        if (value == null) this._break = true;

        return this;
    }

    call(_this, ...args) {
        if (this._break) return this;

        const value = this._current = this._wrapHandler(this._current).call(_this, ...args);
        if (value == null) this._break = true;
        
        return this;
    }

    break() {return this._break = true, this;}

    value() {return this._current;}

    toString() {return String(this._current);}

    then(onSuccess, onError) {
        return Promise.resolve(this._current)
            .then(
                value => (onSuccess.call(this, value), this),
                onError
                    ? (error) => (onError(error), this)
                    : void 0
            );
    }
}
