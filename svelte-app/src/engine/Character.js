import generateTransformCSS from "../resources/generateTransformCSS";

class Character {
    constructor(id, { parent, image, position, size, rotation, origin, hidden, displayHitbox }) {
        this.id = id;
        this._engine = parent;
        this.disposed = false;

        this.currentImage = image;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.origin = origin;
        // these work but i dont want to clutter the block list
        // make these into addon blocks
        this.stretch = { x: 1, y: 1 };
        this.skew = { x: 0, y: 0 };
        this.hidden = hidden;
        this.displayHitbox = displayHitbox;

        // assign to parent character list
        this._engine.characters[this.id] = this;

        /*

        PROPERTIES THAT WILL EXIST ON UPDATE

        this._element

        */

        // for event handling
        this._handlers = [];

        // apply these things
        this.updateCharacter();
    }

    // EVENT HANDLING
    onEvent(type, func) {
        this._handlers.push({ type: type, callback: func });
    }
    dropoutEvent(type, func) {
        const handler = { type: type, callback: func };
        const idx = this._handlers.indexOf(handler);
        if (idx === -1) return;
        this._handlers.splice(idx, 1);
    }
    fireEvent(type, ...args) {
        for (const handler of this._handlers) {
            if (handler.type === type) {
                handler.callback(...args);
            }
        }
    }

    // CHARACTER STUFF

    // MOVEMENT

    /**
     * Moves the character to the specified location.
     * @param {number} x 
     * @param {number} y 
     */
    gotoXY(x, y) {
        if (!this.position) {
            this.position = {};
        }

        // if x is an object,
        // we likely have { x:number, y:number }
        if (typeof x !== "number") {
            this.position = x;
            return;
        }

        this.position.x = x;
        this.position.y = y;

        this.updateCharacter();
    }

    /**
     * Moves the character on the x axis only.
     * @param {number} x 
     */
    setX(x) {
        if (!this.position) {
            this.position = {};
        }

        this.position.x = x;

        this.updateCharacter();
    }
    /**
     * Moves the character on the y axis only.
     * @param {number} y 
     */
    setY(y) {
        if (!this.position) {
            this.position = {};
        }

        this.position.y = y;

        this.updateCharacter();
    }

    /**
     * Changes the character's position on the x axis only.
     * @param {number} x 
     */
    changeX(x) {
        if (!this.position) {
            this.position = {};
        }

        this.position.x += x;

        this.updateCharacter();
    }
    /**
     * Changes the character's position on the y axis only.
     * @param {number} y 
     */
    changeY(y) {
        if (!this.position) {
            this.position = {};
        }

        this.position.y += y;

        this.updateCharacter();
    }

    // ROTATION

    /**
     * Sets the direction to this angle.
     * @param {number} angle 
     */
    rotateTo(angle) {
        this.rotation = angle;
        this.updateCharacter();
    }
    /**
     * Rotates the direction by this angle.
     * @param {number} angle 
     */
    rotateBy(angle) {
        if (typeof this.rotation === "undefined") {
            this.rotation = 0;
        }
        this.rotation += angle;
        this.updateCharacter();
    }

    // DISPLAY

    /**
     * hide this character
     */
    hide() {
        this.hidden = true;
        this.updateCharacter();
    }

    /**
     * show this character
     */
    show() {
        this.hidden = false;
        this.updateCharacter();
    }

    /**
     * hide this character
     */
    hideHitbox() {
        this.displayHitbox = true;
        this.updateCharacter();
    }

    /**
     * show this character
     */
    showHitbox() {
        this.displayHitbox = false;
        this.updateCharacter();
    }

    // INTERNAL USE FUNCTIONS BELOW
    // probably

    /**
     * Updates the character to match any changes in it's properties.
     * Also creates the elements needed for displaying this character if they don't exist.
     */
    updateCharacter() {
        if (!this._element) {
            this._element = new Image();
            this._element.draggable = false;
            const image = this._engine.images[this.currentImage];
            // image is already loaded in browser
            // so this should be instant
            this._element.src = image.src;
            this._engine._parent.append(this._element);
            // assign dom events
            this.assignDOMEvents(this._element);
        }

        this.styleCharacter();
    }

    /**
     * Assigns required DOM events to the specified character element.
     */
    assignDOMEvents(element) {
        // click
        element.addEventListener("click", () => {
            this.fireEvent("CLICKED");
        });
    }

    styleCharacter() {
        if (!this._element)
            throw new Error("No element exists to style");

        // cleaner code lol
        const style = this._element.style;

        // positioning
        style.position = "absolute";
        style.left = "0px";
        style.top = "0px";

        // transform
        style.transformOrigin = `${this.origin.x} ${this.origin.y}`;
        style.transform = generateTransformCSS({
            translate: {
                x: this.position.x,
                y: this.position.y,
                origin: this.origin
            },
            scale: {
                x: this.size * this.stretch.x,
                y: this.size * this.stretch.y,
            },
            skew: this.skew,
            rotate: (0 - this.rotation)
        });

        // display styles
        style.display = this.hidden ? 'none' : '';
        console.log(this.displayHitbox);
        style.boxShadow = this.displayHitbox ? '0 0 0 1px red' : '';
    }

    /**
     * Dispose of this character & it's elements.
     */
    dispose() {
        if (this._element) {
            this._element.remove();
        }
    }
}

export default Character;