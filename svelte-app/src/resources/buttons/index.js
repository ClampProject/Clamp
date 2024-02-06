import Blockly from 'blockly/core'
import State from '../state';
import Random from '../random';

export default (workspace) => {
    workspace.registerButtonCallback("registerVariable", () => {
        const character = State.getTargetById(State.editingTarget);
        const variableName = window.prompt("Variable name", "myVariable");
        if (variableName) {
            const randomID = Random.randomID();
            character.variables.push({
                id: randomID,
                name: variableName,
                value: 0
            });
        }
    });
}