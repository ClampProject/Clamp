import Blockly from 'blockly/core';
import State from '../state';
import Random from '../random';
import Emitter from '../emitter';

export default (workspace) => {
    // variables
    workspace.registerButtonCallback("registerVariable", () => {
        const character = State.getTargetById(State.editingTarget);
        if (!character) return;
        const eventId = Random.randomID();
        Emitter.emit('DISPLAY_VARIABLE_MENU', {
            eventId,
            id: State.editingTarget,
            name: 'variable', // name of the object we are creating in the menu
            options: [
                { name: 'For this character', value: 'character' },
                { name: 'For the whole project', value: 'project' },
            ],
        });
        Emitter.on('CLOSE_VARIABLE_MENU', (result) => {
            if (!result) return;
            if (result.eventId !== eventId) return;
            if (result.id !== State.editingTarget) return;
            if (result.cancel) return;
            const variableName = result.name;
            if (!variableName) return;
            const variableType = result.type;
            if (!variableType) return;
            if (variableType !== 'character' && variableType !== 'project') return;
            const variableId = Random.randomID();
            if (variableType === 'project') {
                State.createVariable(variableName, 0);
                return;
            }
            character.variables[variableId] = {
                id: variableId,
                name: variableName,
                value: 0
            };
        });
    });
};