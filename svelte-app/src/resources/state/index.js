import Random from '../random';

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
            costumes: [
                "_hardcoded_apple",
            ],
            sounds: [
                "_hardcoded_explode",
            ],
            workspace: null
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
    ]
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
    static currentProject = defaultState;
    /**
     * The ID of the character being edited in the editor.
     */
    static editingTarget = defaultState.characters[0].id;

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
    static createImage(name, url) {
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
    static createSound(name, url) {
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