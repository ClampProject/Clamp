// represents the user's device
// mouse info & other stuff will be detailed here

function clamp(num, min, max) {
    if (num < min) return min;
    if (num > max) return max;
    return num;
}

// we can use InputDevice up here AS LONG AS InputDevice ACTUALLY EXISTS BY THE TIME THESE RUN

// events
// MOUSE
function _mouseHandler(event) {
    const canvas = InputDevice._canvas;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(clamp((event.pageX - rect.left) / rect.width, 0, 1) * 640);
    const y = Math.round(clamp((event.pageY - rect.top) / rect.height, 0, 1) * 360);
    InputDevice._data.mousex = x;
    InputDevice._data.mousey = y;

    InputDevice._data.mousedown = event.buttons > 0;
}

class InputDevice {
    static get mouse() {
        return {
            x: InputDevice._data.mousex,
            y: InputDevice._data.mousey,
            down: InputDevice._data.mousedown,
        };
    };

    /**
     * @private Used internally.
     */
    static _data = {
        // mouse
        mousex: 0,
        mousey: 0,
        mousedown: false,
    };
    /**
     * @private Used internally.
     */
    static _canvas = null;
    /**
     * @private Used internally.
     */
    static _mountEvents() {
        window.addEventListener("mousedown", _mouseHandler);
        window.addEventListener("mousemove", _mouseHandler);
        window.addEventListener("mouseup", _mouseHandler);
    }
}

export default InputDevice;