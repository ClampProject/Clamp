import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';

const categoryPrefix = 'actions_';
const categoryColor = '#fa4';

function flagImage(color) {
    return {
        "src": "/images/gui-icons/flag-" + color + "-icon.png",
        "width": 24,
        "height": 24,
        "alt": color + " flag"
    }
}

function register() {
    // wait () seconds
    registerBlock(`${categoryPrefix}waitSeconds`, {
        message0: 'wait %1 seconds',
        args0: [
            {
                "type": "input_value",
                "name": "TIME",
                "check": "Number"
            }
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TIME = javascriptGenerator.valueToCode(block, 'TIME', javascriptGenerator.ORDER_ATOMIC);
        const code = `await new Promise(resolve => setTimeout(() => resolve(), ${TIME} * 1000));`;
        return `${code}\n`;
    })
    // show message ()
    registerBlock(`${categoryPrefix}showmessage`, {
        message0: 'show message %1',
        args0: [
            {
                "type": "input_value",
                "name": "TEXT",
                "check": "String"
            }
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TEXT = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC);
        const code = `alert(String(${TEXT}));`;
        return `${code}\n`;
    })
    // when run clicked {}
    registerBlock(`${categoryPrefix}whenrunclicked`, {
        message0: 'when %1 clicked %2 %3',
        args0: [
            {
                "type": "field_image",
                "src": "/images/gui-icons/run-icon.png",
                "width": 24,
                "height": 24,
                "alt": "▶",
                "flipRtl": false
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "BLOCKS"
            }
        ],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const BLOCKS = javascriptGenerator.statementToCode(block, 'BLOCKS');
        const code = `Emitter.on("RUN_BUTTON", async () => { ${BLOCKS} });`;
        return `${code}\n`;
    })
    // when stop clicked {}
    registerBlock(`${categoryPrefix}whenstopclicked`, {
        message0: 'when %1 clicked %2 %3',
        args0: [
            {
                "type": "field_image",
                "src": "/images/gui-icons/stop-icon.png",
                "width": 24,
                "height": 24,
                "alt": "X",
                "flipRtl": false
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "BLOCKS"
            }
        ],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const BLOCKS = javascriptGenerator.statementToCode(block, 'BLOCKS');
        const code = `Emitter.on("STOP_BUTTON", async () => { ${BLOCKS} });`;
        return `${code}\n`;
    })

    // flag events

    // when flag fired {}
    registerBlock(`${categoryPrefix}onflagevent`, {
        message0: 'when %1 fired %2 %3',
        args0: [
            {
                "type": "field_dropdown",
                "name": "FLAG",
                "options": [
                    [flagImage("red"), "RED"],
                    [flagImage("orange"), "ORANGE"],
                    [flagImage("yellow"), "YELLOW"],
                    [flagImage("green"), "GREEN"],
                    [flagImage("blue"), "BLUE"],
                    [flagImage("purple"), "PURPLE"],
                    [flagImage("pink"), "PINK"],
                ]
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "BLOCKS"
            }
        ],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const FLAG = block.getFieldValue('FLAG');
        const BLOCKS = javascriptGenerator.statementToCode(block, 'BLOCKS');
        const code = `FlagEmitter.on(${JSON.stringify(FLAG)}, async () => { ${BLOCKS} });`;
        return `${code}\n`;
    })
    // fire ()
    registerBlock(`${categoryPrefix}fireflagevent`, {
        message0: 'fire %1',
        args0: [
            {
                "type": "field_dropdown",
                "name": "FLAG",
                "options": [
                    [flagImage("red"), "RED"],
                    [flagImage("orange"), "ORANGE"],
                    [flagImage("yellow"), "YELLOW"],
                    [flagImage("green"), "GREEN"],
                    [flagImage("blue"), "BLUE"],
                    [flagImage("purple"), "PURPLE"],
                    [flagImage("pink"), "PINK"],
                ]
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: categoryColor
    }, (block) => {
        const FLAG = block.getFieldValue('FLAG');
        const code = `FlagEmitter.fire(${JSON.stringify(FLAG)});`;
        return `${code}\n`;
    })
}

export default register;
