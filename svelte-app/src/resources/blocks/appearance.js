import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';
import State from '../state';

const categoryPrefix = 'appearance_';
const categoryColor = '#f3a';

const getImageMenu = () => {
    const menu = [];
    const emptyMenu = [[ '', '' ]];
    const character = State.getTargetById(State.editingTarget);
    for (const costumeId of character.costumes) {
        const image = State.getImageById(costumeId);
        menu.push([ String(image ? image.name : costumeId), costumeId ]);
    }
    if (menu.length <= 0) return emptyMenu;
    return menu;
};

function register() {
    // change image to [images v]
    registerBlock(`${categoryPrefix}menu_imageMenu`, {
        message0: '%1',
        args0: [
            {
                "type": "field_dropdown",
                "name": "IMAGE",
                "options": getImageMenu
            },
        ],
        output: ["String"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const IMAGE = block.getFieldValue('IMAGE');
        const code = `${JSON.stringify(IMAGE)}`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // change image to [images v]
    registerBlock(`${categoryPrefix}changeImage`, {
        message0: 'change image to %1',
        args0: [
            {
                "type": "input_value",
                "name": "IMAGE",
            },
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const IMAGE = javascriptGenerator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC);
        const code = `character.changeImage(String(${IMAGE}));`;
        return `${code}\n`;
    })
    // show me
    registerBlock(`${categoryPrefix}showCharacter`, {
        message0: 'show character',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, () => {
        const code = `character.show();`;
        return `${code}\n`;
    })
    // hide me
    registerBlock(`${categoryPrefix}hideCharacter`, {
        message0: 'hide character',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, () => {
        const code = `character.hide();`;
        return `${code}\n`;
    })
}

export default register;
