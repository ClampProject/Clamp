// we have a global & local emitter for the runtime
// global emitter sends updates & events
// local emitter handles events
class Emitter {
    constructor() {
        this._listeners = [];
        Emitter._instances.push(this);
    }

    /**
     * All event listeners are in this array.
     */
    static _listeners = [];
    /**
     * Any Emitters created by new Emitter() will be here unless they are disposed of.
     */
    static _instances = [];

    /**
     * Emits the "UPDATE" event with the provided code.
     * @param {string} code 
     */
    static update(code) {
        Emitter.emit("UPDATE", code);
    }

    static on(event, callback) {
        Emitter._listeners.push({ event: event, func: callback });
    }
    /**
     * Removes an event listener from the event type it is apart of.
     * @param {string} event The event type that is being removed
     * @param {Function} callback The listener function attached to that event type
     * @returns nothin'
     */
    static dropout(event, callback) {
        const idx = Emitter._listeners.indexOf({ event: event, func: callback });
        if (idx === -1) return;
        Emitter._listeners.splice(idx, 1);
    }
    static emit(event, ...data) {
        for (const listener of Emitter._listeners) {
            if (listener.event === event) {
                listener.func(...data);
            }
        }
    }

    /**
     * Like static emit(), but it also runs for all instances created with new Emitter().
     * @param {string} event The type of event you are firing. Only listeners with this type will recieve the event.
     * @param  {...any} data Any data you want to send.
     */
    static emitGlobal(event, ...data) {
        for (const listener of Emitter._listeners) {
            if (listener.event === event) {
                listener.func(...data);
            }
        }
        for (const instance of Emitter._instances) {
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
        for (const listener of Emitter._listeners) {
            if (listener.event === event) {
                listener.func(...data);
            }
        }
    }
    /**
     * Like emit(), but it also runs for all instances created with new Emitter() and any listeners put in the static on() function will also recieve it.
     * @param {string} event The type of event you are firing. Only listeners with this type will recieve the event.
     * @param  {...any} data Any data you want to send.
     */
    emitGlobal(...args) {
        // we dont actually need to redefine emitGlobal
        // we can just call the static property from here
        Emitter.emitGlobal(...args);
        // this doesnt work inside the compiler since it doesnt have access to the class,
        // but it works here since it does have access to the instance which CAN access the class
    }

    /**
     * Deletes all event listeners and stops it from recieving any emitGlobal() events.
     * @returns nothing lol
     */
    dispose() {
        this._listeners = [];
        const idx = Emitter._instances.indexOf(this);
        if (idx === -1) return;
        Emitter._instances.splice(idx, 1);
    }
}

export default Emitter;