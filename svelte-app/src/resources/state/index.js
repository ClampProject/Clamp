import Random from '../random';
import Emitter from '../emitter';
import BlobAndDataUrl from '../blobanddataurl';
import proxyFetch from '../proxyFetch';

// this js file contains project details like what characters exist and their workspaces
const defaultState = {
    characters: [
        {
            name: "Apple",
            id: "_default_apple",
            startCostume: "_hardcoded_apple",
            position: {
                x: 320,
                y: 180
            },
            size: 100,
            angle: 0,
            visible: true,
            costumes: [
                "_hardcoded_apple",
            ],
            sounds: [
                "_hardcoded_explode",
            ],
            xml: ""
        }
    ],
    images: [
        {
            name: "Apple",
            id: "_hardcoded_apple",
            image: "https://clamp-coding.vercel.app/images/apple.png"
        }
    ],
    sounds: [
        {
            name: "Explode",
            id: "_hardcoded_explode",
            data: "https://clamp-coding.vercel.app/sounds/explode.mp3"
        }
    ],
    // should match the default state provided in compiler/precompile.js
    settings: {
        forceLoopPauses: true,
    },
    customData: {} // custom scripts can add data here
};

class ProjectState {
    /**
     * A default project state object.
     * Use this if you need to reset the project to default.
     */
    static default = defaultState;

    /**
     * The current project state.
     * Object contains all images, sounds and characters in the project.
     */
    static currentProject = JSON.parse(JSON.stringify(defaultState));
    /**
     * The ID of the character being edited in the editor.
     */
    static editingTarget = defaultState.characters[0].id;

    /**
     * Converts a project state to a string. Used for saving projects.
     * @param {ProjectState} state The state to stringify
     * @returns A string version of the state
     */
    static serializeProject(state) {
        const origin = {
            characters: []
        };
        // these we can use from state directly
        origin.images = state.images;
        origin.sounds = state.sounds;
        origin.settings = state.settings;
        origin.customData = state.customData;
        // characters have a workspace property that we cannot save
        for (const character of state.characters) {
            // create a new character and get properties from character into it
            const newCharacter = {};
            for (const prop in character) {
                if (prop === "workspace" || prop === "xml") {
                    // dont save this property
                    continue;
                }
                newCharacter[prop] = character[prop];
            }
            origin.characters.push(newCharacter);
        }
        // convert to string
        const project = JSON.stringify(origin);
        return project;
    }
    /**
     * Loads a project state. The state must be valid or problems will occur.
     * The state parameter will be modified by Clamp in runtime, so clone it before this function if you need it elsewhere.
     * @param {ProjectState} state The project state to load (likely a serialized project but parsed into a JSON object)
     * @param {{id:WorkspaceXML}} workspaces An object containing id:WorkspaceXML pairs.
     */
    static loadProject(state, workspaces) {
        ProjectState.currentProject = state;
        for (const id in workspaces) {
            const target = ProjectState.getTargetById(id);
            if (!target) continue;
            target.xml = workspaces[id];
            ProjectState.editingTarget = ProjectState.currentProject.characters[0].id;
            Emitter.emitGlobal("EDITING_TARGET_UPDATED");
        }
    }

    /**
     * Returns the target object in the currentProject state with the specified ID.
     * @param {string} id 
     * @returns Target with the specified ID
     */
    static getTargetById(id) {
        const characters = ProjectState.currentProject.characters.filter(char => {
            if (char.id === id) return true;
            return false;
        });
        // we can always choose 0 since there will be only 1 result
        // if there is more than 1, we have a corrupted/externally modified project
        return characters[0];
    }
    /**
     * Returns the image object in the currentProject state with the specified costume ID. 
     * @param {string} targetId The target ID with the costume
     * @param {string} costumeId The costume ID of the costume wanted
     * @returns Costume with the specified ID
     */
    static getTargetCostumeById(targetId, costumeId) {
        const character = ProjectState.getTargetById(targetId);
        if (!character) return;

        const costumes = character.costumes.filter(costume => {
            if (costume.id === costumeId) return true;
            return false;
        });
        // we can always choose 0 since there will be only 1 result
        // if there is more than 1, we have a corrupted/externally modified project
        return costumes[0];
    }
    /**
     * Returns the sound object in the currentProject state with the specified sound ID. 
     * @param {string} targetId The target ID with the costume
     * @param {string} soundId The sound ID of the sound wanted
     * @returns Sound with the specified ID
     */
    static getTargetSoundById(targetId, soundId) {
        const character = ProjectState.getTargetById(targetId);
        if (!character) return;

        const sounds = character.sounds.filter(sound => {
            if (sound.id === soundId) return true;
            return false;
        });
        // we can always choose 0 since there will be only 1 result
        // if there is more than 1, we have a corrupted/externally modified project
        return sounds[0];
    }

    /**
     * Gets the image object in the current project with the specified ID.
     * @param {string} id 
     * @returns Image object
     */
    static getImageById(id) {
        return ProjectState._getObjectById("image", id);
    }
    /**
     * Gets the sound object in the current project with the specified ID.
     * @param {string} id 
     * @returns sound object
     */
    static getSoundById(id) {
        return ProjectState._getObjectById("sound", id);
    }

    /**
     * Add an image to the image list.
     * @param {string} name The image name.
     * @param {string} url The URL of the image. Can be a Data URI or Website URL.
     * @returns The image object that was added to the image list.
     */
    static async createImage(name, url) {
        try {
            const res = await proxyFetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const blob = BlobAndDataUrl.arrayBufferToBlob(arrayBuffer);
            const dataUrl = await BlobAndDataUrl.blobToDataURL(blob);
            url = dataUrl;
        } catch {
            // we'll just use the url then...
        }
        const project = ProjectState.currentProject;
        const imageObject = {
            name: name,
            id: `_user_image_${name.toLowerCase().replace(/[^0-9A-Za-z]+/gmi, "-")}:${Random.randomID()}`,
            image: url
        };
        project.images.push(imageObject);
        return imageObject;
    }
    /**
     * Add an sound to the sound list.
     * @param {string} name The sound name.
     * @param {string} url The URL of the sound. Can be a Data URI or Website URL.
     * @returns The sound object that was added to the sound list.
     */
    static async createSound(name, url) {
        try {
            const res = await proxyFetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const blob = BlobAndDataUrl.arrayBufferToBlob(arrayBuffer);
            const dataUrl = await BlobAndDataUrl.blobToDataURL(blob);
            url = dataUrl;
        } catch {
            // we'll just use the url then...
        }
        const project = ProjectState.currentProject;
        const soundObject = {
            name: name,
            id: `_user_sound_${name.toLowerCase().replace(/[^0-9A-Za-z]+/gmi, "-")}:${Random.randomID()}`,
            data: url
        };
        project.sounds.push(soundObject);
        return soundObject;
    }

    /**
     * Adds an image to the costume list of a character.
     * @param {string} characterId 
     * @param {string} imageId 
     */
    static addImageToCharacter(characterId, imageId) {
        const character = ProjectState.getTargetById(characterId);
        if (!character) return;

        character.costumes.push(imageId);
    }
    /**
     * Adds a sound to the sound list of a character.
     * @param {string} characterId 
     * @param {string} soundId 
     */
    static addSoundToCharacter(characterId, soundId) {
        const character = ProjectState.getTargetById(characterId);
        if (!character) return;

        character.sounds.push(soundId);
    }

    /**
     * Internal use only.
     */
    static _getObjectById(type, id) {
        switch (type) {
            case 'image':
                const images = ProjectState.currentProject.images.filter(image => {
                    if (image.id === id) return true;
                    return false;
                });
                return images[0];
            case 'sound':
                const sounds = ProjectState.currentProject.sounds.filter(sound => {
                    if (sound.id === id) return true;
                    return false;
                });
                return sounds[0];
        }
    }
}

export default ProjectState;