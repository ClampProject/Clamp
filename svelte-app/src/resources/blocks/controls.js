import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';

const categoryPrefix = 'controls_';
const categoryColor = '#bc55ff';

function register() {
    // mouse pressed
    registerBlock(`${categoryPrefix}mousepressed`, {
        message0: 'mouse button %1 pressed?',
        args0: [
            {
                "type": "field_dropdown",
                "name": "BUTTON",
                "options": [
                    ["left", "leftdown"],
                    ["right", "rightdown"],
                    ["middle", "middledown"]
                ]
            },
        ],
        output: ["Boolean"],
        colour: categoryColor
    }, (block) => {
        const BUTTON = block.getFieldValue('BUTTON');
        const code = `InputDevice.mouse[${JSON.stringify(BUTTON)}]`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })

    // mouse x
    registerBlock(`${categoryPrefix}mousex`, {
        message0: 'mouse x',
        args0: [],
        output: ["Number"],
        colour: categoryColor
    }, (block) => {
        const code = `InputDevice.mouse.x`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })

    // mouse y
    registerBlock(`${categoryPrefix}mousey`, {
        message0: 'mouse y',
        args0: [],
        output: ["Number"],
        colour: categoryColor
    }, (block) => {
        const code = `InputDevice.mouse.y`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
}

export default register;
