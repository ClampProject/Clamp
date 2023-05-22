import javascriptGenerator from '../javascriptGenerator';

class Compiler {
    constructor(workspace) {
        this.workspace = workspace;

        this.sprites = [];
        this.images = [];
        this.sounds = [];
    }

    setSprites(array) {
        this.sprites = array;
    }
    setImages(array) {
        this.images = array;
    }
    setSounds(array) {
        this.sounds = array;
    }

    /**
     * Generates code from the workspace and any set images and sounds.
     */
    compile() {
        const genCode = [javascriptGenerator.workspaceToCode(this.workspace)];
        const headerCode = [
            `/* THIS CODE WAS GENERATED BY CLAMP / BLOCKLY. IT IS NOT INTENDED TO BE READ BY HUMANS IN ITS FULL FORM. */`,
            `// Comments may still appear as they are useful internally.`,
            `const variables = {}; // all variables are stored here instead of a "const variable = 123" for each set block`,
            `// this is so we dont end up with a Scratch for Discord where setting a variable with the name "message" breaks everything`,
            `// im allowed to say that because i worked on S4D lolol`,
            `(async function() {`
        ];
        const setupCode = [
            `const sprites = {}; // object so we can use invalid characters for sprite names and still easily access them`
        ];
        const footerCode = [
            `})();`
        ];

        // initialize images
        this.images.forEach(image => {
            const variableName = JSON.stringify(image.name);
            const variableImage = JSON.stringify(image.image);

            setupCode.push(`await Kaboom.loadSprite(${variableName}, ${variableImage});`);
        });
        // initialize sounds
        this.sounds.forEach(sound => {
            const variableName = JSON.stringify(sound.name);
            const variableData = JSON.stringify(sound.data);

            setupCode.push(`await Kaboom.loadSound(${variableName}, ${variableData});`);
        });
        // initialize sprite code
        this.sprites.forEach(sprite => {
            // we need to clean all of these names to ensure they dont generate invalid code
            // so we use things like Number() and JSON.stringify() everywhere
            const variableName = JSON.stringify(sprite.name);

            const spriteData = {
                defaultLook: JSON.stringify(sprite.name),
                x: isNaN(Number(sprite.position.x)) ? 0 : Number(sprite.position.x),
                y: isNaN(Number(sprite.position.y)) ? 0 : Number(sprite.position.y),
                size: isNaN(Number(sprite.size)) ? 0 : Number(sprite.size),
                angle: isNaN(Number(sprite.angle)) ? 0 : Number(sprite.angle),
            };
            setupCode.push(`sprites[${variableName}] = Kaboom.add([
                Kaboom.sprite(${spriteData.defaultLook}),
                Kaboom.pos(${spriteData.x}, ${spriteData.y}),
                Kaboom.scale(${spriteData.size}),
                Kaboom.rotate(${spriteData.angle}),
            ]);`);
        });

        return [].concat(headerCode, setupCode, ['/* ok enough baby stuff LETS RUN SOME CODE */'], genCode, footerCode).join('\n');
    }
}

export default Compiler;