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
}

export default register;
