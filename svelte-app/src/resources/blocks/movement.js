import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';

const categoryPrefix = 'movement_';
const categoryColor = '#0bf';

function register() {
    registerBlock(`${categoryPrefix}test`, {
        message0: 'test %1',
        args0: [
            {
                "type": "input_statement",
                "name": "BLOCKS"
            }
        ],
        output: "Function",
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        return `()=>{}`;
    })
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
        const code = `character.gotoXY(${X}, ${Y});`;
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
        const code = `character.set${XY}(${POS});`;
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
        const code = `character.change${XY}(${POS});`;
        return `${code}\n`;
    })

    // rotation

    // rotate to ()
    // (degrees symbol is added by angle field)
    registerBlock(`${categoryPrefix}rotateto`, {
        message0: 'rotate to %1',
        args0: [
            {
                "type": "field_angle",
                "name": "ANGLE",
                "check": "Number",
                "angle": 0,
                "acceptsBlocks": true
            },
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const ANGLE = javascriptGenerator.valueToCode(block, 'ANGLE', javascriptGenerator.ORDER_ATOMIC);
        const code = `character.rotateTo(${ANGLE});`;
        return `${code}\n`;
    })
    // turn [left/right] by ()
    // (degrees symbol is added by angle field)
    registerBlock(`${categoryPrefix}turndirby`, {
        message0: 'turn %1 by %2',
        args0: [
            {
                "type": "field_dropdown",
                "name": "DIR",
                "options": [
                    [
                        {
                            "src": "/images/gui-icons/arrow-rotate-right.png",
                            "width": 24,
                            "height": 24,
                            "alt": "Right"
                        },
                        "-"
                    ],
                    [
                        {
                            "src": "/images/gui-icons/arrow-rotate-left.png",
                            "width": 24,
                            "height": 24,
                            "alt": "Left"
                        },
                        "+"
                    ]
                ]
            },
            {
                "type": "field_angle",
                "name": "ANGLE",
                "check": "Number",
                "angle": 12,
                "acceptsBlocks": true
            },
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const DIR = block.getFieldValue('DIR');
        const ANGLE = javascriptGenerator.valueToCode(block, 'ANGLE', javascriptGenerator.ORDER_ATOMIC);
        const code = `character.rotateBy(0 ${DIR} ${ANGLE});`;
        return `${code}\n`;
    })
    // rotate to a random direction
    registerBlock(`${categoryPrefix}rotaterandom`, {
        message0: 'rotate to a random direction',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, () => {
        const code = `character.rotateTo(Math.round(Math.random() * 360));`;
        return `${code}\n`;
    })

    // RETURN BLOCKS

    // [x/y] position
    registerBlock(`${categoryPrefix}getxy`, {
        message0: '%1 position',
        args0: [
            {
                "type": "field_dropdown",
                "name": "AXIS",
                "options": [
                    ["x", "x"],
                    ["y", "y"]
                ]
            },
        ],
        output: ["Number"],
        colour: categoryColor
    }, (block) => {
        const AXIS = block.getFieldValue('AXIS');
        const code = `character.position[${JSON.stringify(AXIS)}]`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // rotation
    registerBlock(`${categoryPrefix}getrotation`, {
        message0: 'rotation',
        output: ["Number"],
        colour: categoryColor
    }, () => {
        const code = `character.rotation`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
}

export default register;
