class Engine {
    static _listeners = [];

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
}

export default Engine;