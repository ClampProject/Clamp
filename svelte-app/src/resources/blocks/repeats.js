import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';

import compileVars from '../compiler/compileVars';
import Precompile from '../compiler/precompile';

const categoryPrefix = 'repeats_';
const categoryColor = '#0ad';
const repeatDelayTime = 1000 / 60; // how much time before the next iteration in a loop

const repeatDelayIfEnabled = () => {
    if (!Precompile.forceLoopPauses) return '';
    return `await new Promise(resolve => setTimeout(() => resolve(), ${repeatDelayTime}));`;
};

function register() {
    // do {} () times
    registerBlock(`${categoryPrefix}dotimes`, {
        message0: 'do %1 %2 %3 times',
        args0: [
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "BLOCKS"
            },
            {
                "type": "field_number",
                "name": "ITERATIONS",
                "check": "Number",
                "value": 4,
                "acceptsBlocks": true
            }
        ],
        message1: '%1',
        args1: [
            {
                "type": "field_image",
                "src": "/images/gui-icons/loop-icon.png",
                "width": 24,
                "height": 24,
                "alt": "↺",
                "flipRtl": false
            },
        ],
        lastDummyAlign1: "RIGHT",
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const ITERATIONS = javascriptGenerator.valueToCode(block, 'ITERATIONS', javascriptGenerator.ORDER_ATOMIC);
        const BLOCKS = javascriptGenerator.statementToCode(block, 'BLOCKS');
        // compileVars.next() is a "random" variable name (just has a different index each use)
        const variable = compileVars.next();
        const code = `for (var ${variable} = 0; ${variable} < Number(${ITERATIONS}); ${variable}++) { ${BLOCKS} ${repeatDelayIfEnabled()} };`;
        return `${code}\n`;
    })
    // repeat {} until <>
    registerBlock(`${categoryPrefix}repeatuntil`, {
        message0: 'repeat %1 %2 until %3',
        args0: [
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "BLOCKS"
            },
            {
                "type": "input_value",
                "name": "CONDITION",
                "check": "Boolean"
            }
        ],
        message1: '%1',
        args1: [
            {
                "type": "field_image",
                "src": "/images/gui-icons/loop-icon.png",
                "width": 24,
                "height": 24,
                "alt": "↺",
                "flipRtl": false
            },
        ],
        lastDummyAlign1: "RIGHT",
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const CONDITION = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_ATOMIC);
        const BLOCKS = javascriptGenerator.statementToCode(block, 'BLOCKS');
        const code = `while ((!(${CONDITION ? CONDITION : 'false'})) && !character.disposed) { ${BLOCKS} ${repeatDelayIfEnabled()} };`;
        return `${code}\n`;
    })
    // forever
    registerBlock(`${categoryPrefix}forever`, {
        message0: 'forever %1 %2',
        args0: [
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "BLOCKS"
            },
        ],
        message1: '%1',
        args1: [
            {
                "type": "field_image",
                "src": "/images/gui-icons/loop-icon.png",
                "width": 24,
                "height": 24,
                "alt": "↺",
                "flipRtl": false
            },
        ],
        lastDummyAlign1: "RIGHT",
        previousStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const BLOCKS = javascriptGenerator.statementToCode(block, 'BLOCKS');
        const code = `while (!character.disposed) { ${BLOCKS} ${repeatDelayIfEnabled()} };`;
        return `${code}\n`;
    })
}

export default register;
