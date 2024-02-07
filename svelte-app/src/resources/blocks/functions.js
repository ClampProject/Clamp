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
}

export default register;
