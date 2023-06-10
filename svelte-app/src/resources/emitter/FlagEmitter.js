class FlagEmitter {
    constructor(listeners) {
        this._listeners = [];
        if (Array.isArray(listeners)) {
            this._listeners = listeners;
        }
    }

    on(color, callback) {
        this._listeners.push({ color: color, callback: callback });
    }
    /**
     * Removes a flag listener from the flag color it is apart of.
     * @param {string} color The flag color that the listener is connected to
     * @param {Function} callback The listener function attached to that flag color
     * @returns nothin'
     */
    dropout(color, callback) {
        const idx = this._listeners.indexOf({ color: color, callback: callback });
        if (idx === -1) return;
        this._listeners.splice(idx, 1);
    }
    fire(color) {
        for (const listener of this._listeners) {
            if (listener.color === color) {
                listener.callback();
            }
        }
    }
}

export default FlagEmitter;