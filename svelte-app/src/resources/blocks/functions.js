import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';

const categoryPrefix = 'functions_';
const categoryColor = '#833bff';

function register() {
    // define func
    registerBlock(`${categoryPrefix}define`, {
        message0: 'define %1 %2',
        args0: [
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "BLOCKS"
            }
        ],
        output: "Function",
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const BLOCKS = javascriptGenerator.statementToCode(block, 'BLOCKS');
        return [`(async () => { ${BLOCKS} })`, javascriptGenerator.ORDER_NONE];
    })
    // execute
    registerBlock(`${categoryPrefix}execute_a`, {
        message0: 'execute %1',
        args0: [
            {
                "type": "input_value",
                "name": "FUNC",
                "check": "Function"
            }
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const FUNC = javascriptGenerator.valueToCode(block, 'FUNC', javascriptGenerator.ORDER_ATOMIC);
        const code = `${FUNC}();`;
        return `${code}\n`;
    })
    registerBlock(`${categoryPrefix}execute_b`, {
        message0: 'execute %1',
        args0: [
            {
                "type": "input_value",
                "name": "FUNC",
                "check": "Function"
            }
        ],
        output: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const FUNC = javascriptGenerator.valueToCode(block, 'FUNC', javascriptGenerator.ORDER_ATOMIC);
        return [`(${FUNC}())`, javascriptGenerator.ORDER_NONE];
    })
}

export default register;
