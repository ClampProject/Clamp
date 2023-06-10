class AudioSource {
    constructor(src) {
        this.src = src;
    }

    dispose() {
        // idk
    }
}

class AudioEngine {
    static AudioSource = AudioSource;

    constructor() {
        this._audioContext = new AudioContext();

        this.sources = [];
    }

    createSource(src) {
        const source = new AudioSource(src);
        this.sources.push(source);
        return source;
    }

    /**
     * Dispose of all audio content created by this AudioEngine.
     */
    dispose() {
        this._audioContext.close();

        for (const source of this.sources) {
            source.dispose();
        }
    }
}

export default AudioEngine;