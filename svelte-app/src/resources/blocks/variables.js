import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';
import State from '../state'; // local variables
import Random from '../random';
import '@blockly/field-grid-dropdown';

const categoryPrefix = 'variables_';
const categoryColor = '#4CBEFF';

function getVariables() {
    const character = State.getTargetById(State.editingTarget);
    const menu = [];
    for (const variableId in character.variables) {
        const variable = character.variables[variableId];
        menu.push([variable.name, variableId]);
    }
    return menu.length > 0 ? menu : [[ '', '' ]];
}

function register() {
    // [var v]
    registerBlock(`${categoryPrefix}get`, {
        message0: '%1',
        args0: [
            {
                "type": "field_grid_dropdown",
                "name": "VAR",
                "options": getVariables
            }
        ],
        output: [null],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const VAR = block.getFieldValue('VAR');
        const code = `character.variables[${JSON.stringify(VAR)}]`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    });
    // set [var v] to (value)
    registerBlock(`${categoryPrefix}set`, {
        message0: 'set %1 to %2',
        args0: [
            {
                "type": "field_grid_dropdown",
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
    });
}

export default register;
