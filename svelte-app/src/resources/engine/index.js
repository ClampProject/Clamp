// we have a global & local engine for the runtime
// global engine sends updates & events
// local engine handles events
class Engine {
    constructor() {
        this._listeners = [];
        Engine._instances.push(this);
    }

    /**
     * All event listeners are in this array.
     */
    static _listeners = [];
    /**
     * Any engines created by new Engine() will be here unless they are disposed of.
     */
    static _instances = [];

    /**
     * Emits the "UPDATE" event with the provided code.
     * @param {string} code 
     */
    static update(code) {
        Engine.emit("UPDATE", code);
    }

    static on(event, callback) {
        Engine._listeners.push({ event: event, func: callback });
    }
    /**
     * Removes an event listener from the event type it is apart of.
     * @param {string} event The event type that is being removed
     * @param {Function} callback The listener function attached to that event type
     * @returns nothin'
     */
    static dropout(event, callback) {
        const idx = Engine._listeners.indexOf({ event: event, func: callback });
        if (idx === -1) return;
        Engine._listeners.splice(idx, 1);
    }
    static emit(event, ...data) {
        for (const listener of Engine._listeners) {
            if (listener.event === event) {
                listener.func(...data);
            }
        }
    }

    /**
     * Like static emit(), but it also runs for all instances created with new Engine().
     * @param {string} event The type of event you are firing. Only listeners with this type will recieve the event.
     * @param  {...any} data Any data you want to send.
     */
    static emitGlobal(event, ...data) {
        for (const listener of Engine._listeners) {
            if (listener.event === event) {
                listener.func(...data);
            }
        }
        for (const instance of Engine._instances) {
            for (const listener of instance._listeners) {
                if (listener.event === event) {
                    listener.func(...data);
                }
            }
        }
    }

    on(event, callback) {
        this._listeners.push({ event: event, func: callback });
    }
    /**
     * Removes an event listener from the event type it is apart of.
     * @param {string} event The event type that is being removed
     * @param {Function} callback The listener function attached to that event type
     * @returns nothin'
     */
    dropout(event, callback) {
        const idx = this._listeners.indexOf({ event: event, func: callback });
        if (idx === -1) return;
        this._listeners.splice(idx, 1);
    }
    emit(event, ...data) {
        for (const listener of Engine._listeners) {
            if (listener.event === event) {
                listener.func(...data);
            }
        }
    }
    /**
     * Like emit(), but it also runs for all instances created with new Engine() and any listeners put in the static on() function will also recieve it.
     * @param {string} event The type of event you are firing. Only listeners with this type will recieve the event.
     * @param  {...any} data Any data you want to send.
     */
    emitGlobal(...args) {
        // we dont actually need to redefine emitGlobal
        // we can just call the static property from here
        Engine.emitGlobal(...args);
        // this doesnt work inside the compiler since it doesnt have access to the class,
        // but it works here since it does have access to the instance which CAN access the class
    }

    /**
     * Deletes all event listeners and stops it from recieving any emitGlobal() events.
     * @returns nothing lol
     */
    dispose() {
        this._listeners = [];
        const idx = Engine._instances.indexOf(this);
        if (idx === -1) return;
        Engine._instances.splice(idx, 1);
    }
}

export default Engine;