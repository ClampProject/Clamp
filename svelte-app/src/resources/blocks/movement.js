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
                "type": "field_number",
                "name": "X",
                "check": "Number",
                "value": 320,
                "acceptsBlocks": true
            },
            {
                "type": "field_number",
                "name": "Y",
                "check": "Number",
                "value": 180,
                "acceptsBlocks": true
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
    // go to random spot
    registerBlock(`${categoryPrefix}gotorandom`, {
        message0: 'go to random spot',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, () => {
        const random = `Math.random()`;
        const code = `character.gotoXY(Math.round(${random} * 640), Math.round(${random} * 360));`;
        return `${code}\n`;
    })
    // set [x/y] to ()
    registerBlock(`${categoryPrefix}setxy`, {
        message0: 'set %1 to %2',
        args0: [
            {
                "type": "field_dropdown",
                "name": "XY",
                "options": [
                    [
                        "x",
                        "X"
                    ],
                    [
                        "y",
                        "Y"
                    ],
                ]
            },
            {
                "type": "field_number",
                "name": "POS",
                "check": "Number",
                "value": 80,
                "acceptsBlocks": true
            }
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const XY = block.getFieldValue('XY');
        const POS = javascriptGenerator.valueToCode(block, 'POS', javascriptGenerator.ORDER_ATOMIC);
        const code = `character.set${XY}(Number(${POS}));`;
        return `${code}\n`;
    })
    // change [x/y] to ()
    registerBlock(`${categoryPrefix}changexy`, {
        message0: 'change %1 by %2',
        args0: [
            {
                "type": "field_dropdown",
                "name": "XY",
                "options": [
                    [
                        "x",
                        "X"
                    ],
                    [
                        "y",
                        "Y"
                    ],
                ]
            },
            {
                "type": "field_number",
                "name": "POS",
                "check": "Number",
                "value": 80,
                "acceptsBlocks": true
            },
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const XY = block.getFieldValue('XY');
        const POS = javascriptGenerator.valueToCode(block, 'POS', javascriptGenerator.ORDER_ATOMIC);
        const code = `character.change${XY}(Number(${POS}));`;
        return `${code}\n`;
    })
}

export default register;
