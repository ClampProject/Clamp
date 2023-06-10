import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';

const categoryPrefix = 'movement_';
const categoryColor = '#0bf';

function register() {
    // go to x: () y: ()
    registerBlock(`${categoryPrefix}gotoxy`, {
        message0: 'go to x: %1 y: %2',
        args0: [
            {
                "type": "input_value",
                "name": "X",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "Y",
                "check": "Number"
            }
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const X = javascriptGenerator.valueToCode(block, 'X', javascriptGenerator.ORDER_ATOMIC);
        const Y = javascriptGenerator.valueToCode(block, 'Y', javascriptGenerator.ORDER_ATOMIC);
        const code = `character.gotoXY(Number(${X}), Number(${Y}));`;
        return `${code}\n`;
    })
}

export default register;
