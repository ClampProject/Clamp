import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';
import State from '../state'; // local variables
import Random from '../random';

const categoryPrefix = 'variables_';
const categoryColor = '#f3a';

function getVariables() {
    const character = State.getTargetById(State.editingTarget);
    const menu = [];
    character.variables.forEach((variable) => {
        menu.push([variable.name, variable.id]);
    });
    return menu;
}

function register() {
    // change image to [images v]
    registerBlock(`${categoryPrefix}set`, {
        message0: 'set %1 to %2',
        args0: [
            {
                "type": "field_dropdown",
                "name": "VAR",
                "options": getVariables
            },
            {
                "type": "field_input",
                "name": "VALUE",
                "check": null,
                "text": "Hello!",
                "acceptsBlocks": true
            }
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const VAR = block.getFieldValue('VAR');
        const VALUE = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC);
        return `character.setVariable(${JSON.stringify(VAR)}, ${VALUE});\n`;
        
    })
}

export default register;
