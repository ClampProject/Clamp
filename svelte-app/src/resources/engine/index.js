// we have a global & local engine for the runtime
// global engine sends updates & events
// local engine handles events
class Engine {
    constructor() {
        this._listeners = [];
        Engine._instances.push(this);
    }

    static _listeners = [];
    static _instances = [];

    static update(code) {
        Engine.emit("UPDATE", code);
    }

    static on(event, callback) {
        Engine._listeners.push({ event: event, func: callback });
    }
    static dropout(event, callback) {
        const idx = Engine._listeners.indexOf({ event: event, func: callback });
        if (idx === -1) return;
        Engine._listeners.splice(idx, 1);
    }
    static emit(event, data) {
        Engine._listeners.forEach(listener => {
            if (listener.event === event) {
                listener.func(data);
            }
        })
    }

    static emitGlobal(event, data) {
        Engine._listeners.forEach(listener => {
            if (listener.event === event) {
                listener.func(data);
            }
        })
        Engine._instances.forEach(instance => {
            instance._listeners.forEach(listener => {
                if (listener.event === event) {
                    listener.func(data);
                }
            })
        })
    }

    on(event, callback) {
        this._listeners.push({ event: event, func: callback });
    }
    dropout(event, callback) {
        const idx = this._listeners.indexOf({ event: event, func: callback });
        if (idx === -1) return;
        this._listeners.splice(idx, 1);
    }
    emit(event, data) {
        this._listeners.forEach(listener => {
            if (listener.event === event) {
                listener.func(data);
            }
        })
    }
    emitGlobal(...args) {
        // we dont actually need to redefine emitGlobal
        // we can just call the static property from here
        Engine.emitGlobal(...args);
        // this doesnt work inside the compiler since it doesnt have access to the class,
        // but it works here since it does have access to the instance which CAN access the class
    }

    dispose() {
        this._listeners = [];
        const idx = Engine._instances.indexOf(this);
        if (idx === -1) return;
        Engine._instances.splice(idx, 1);
    }
}

export default Engine;