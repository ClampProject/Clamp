import AudioEngine from "./AudioEngine";
import Character from "./Character";

class Engine {
    static Character = Character;

    /**
     * Create a new game engine instance which displays all game content.
     * @param {object} options Options to create this engine with.
     */
    constructor({ parent, width, height }) {
        // put classes here for fancy "new Class.Class()" code
        this.Character = Character;

        // no
        this.disposed = false;

        this._parent = parent;
        this.screen = {
            width: width,
            height: height
        };

        this.images = {};
        this.sounds = {};

        // this list gets added to for each new Engine.Character
        this.characters = {};

        this.audioEngine = new AudioEngine();
    }

    /**
     * Creates a new image and assigns it to an ID.
     * @param {string} id The ID to give this image.
     * @param {string} src The URL or URI of this image.
     * @returns Promise that will resolve with an Image object if loaded, null if failed.
     */
    createImage(id, src) {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            }
            image.onerror = () => {
                resolve();
            }

            image.src = src;
            this.images[id] = image;
        });
    }
    /**
     * Creates an audio source and assigns it to an ID.
     * @param {string} id The ID to give this audio source.
     * @param {string} src The URL or URI of this audio source.
     * @returns {AudioEngine.AudioSource}
     */
    createSound(id, src) {
        const source = this.audioEngine.createSource(src);
        this.sounds[id] = source;
        return source;
    }

    /**
     * Removes everything that was created by this engine.
     * 
     * Technically you can dispose of an engine and reuse it again,
     * but it's probably easier to just make a new one after this function.
     */
    dispose() {
        console.log('disposing');
        this.disposed = true;

        // dispose of the audio engine (which disposes of all sounds)
        this.audioEngine.dispose();

        // remove images
        for (const id in this.images) {
            this.images[id].remove();
        }

        // remove characters
        for (const id in this.characters) {
            this.characters[id].dispose();
        }

        // reset lists
        this.images = {};
        this.sounds = {};
        this.characters = {};
    }
}

export default Engine;