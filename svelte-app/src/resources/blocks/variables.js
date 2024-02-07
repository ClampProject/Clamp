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
function getProjectVariables() {
    const project = State.currentProject;
    const menu = [];
    for (const variableId in project.variables) {
        const variable = project.variables[variableId];
        menu.push([variable.name, variableId]);
    }
    return menu.length > 0 ? menu : [['', '']];
}

function register() {
    // project [var v]
    registerBlock(`${categoryPrefix}getproj`, {
        message0: '%2 %1',
        args0: [
            {
                "type": "field_grid_dropdown",
                "name": "VAR",
                "options": getProjectVariables
            },
            {
                "type": "field_image",
                "src": "/images/gui-icons/application-edit-icon.png",
                "width": 24,
                "height": 24,
                "alt": "my",
                "flipRtl": false
            },
        ],
        output: [null],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const VAR = block.getFieldValue('VAR');
        const code = `variables[${JSON.stringify(VAR)}]`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    });
    // set project [var v] to (value)
    registerBlock(`${categoryPrefix}setproj`, {
        message0: 'set %3 %1 to %2',
        args0: [
            {
                "type": "field_grid_dropdown",
                "name": "VAR",
                "options": getProjectVariables
            },
            {
                "type": "field_input",
                "name": "VALUE",
                "check": null,
                "text": "Hello!",
                "acceptsBlocks": true
            },
            {
                "type": "field_image",
                "src": "/images/gui-icons/application-edit-icon.png",
                "width": 24,
                "height": 24,
                "alt": "my",
                "flipRtl": false
            },
        ],
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const VAR = block.getFieldValue('VAR');
        const VALUE = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC);
        return `variables[${JSON.stringify(VAR)}] = (${VALUE});\n`;
    });
    // my [var v]
    registerBlock(`${categoryPrefix}get`, {
        message0: '%2 %1',
        args0: [
            {
                "type": "field_grid_dropdown",
                "name": "VAR",
                "options": getVariables
            },
            {
                "type": "field_image",
                "src": "/images/gui-icons/user-edit-icon.png",
                "width": 24,
                "height": 24,
                "alt": "my",
                "flipRtl": false
            },
        ],
        output: [null],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const VAR = block.getFieldValue('VAR');
        const code = `character.variables[${JSON.stringify(VAR)}].value`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    });
    // set my [var v] to (value)
    registerBlock(`${categoryPrefix}set`, {
        message0: 'set %3 %1 to %2',
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
            },
            {
                "type": "field_image",
                "src": "/images/gui-icons/user-edit-icon.png",
                "width": 24,
                "height": 24,
                "alt": "my",
                "flipRtl": false
            },
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
