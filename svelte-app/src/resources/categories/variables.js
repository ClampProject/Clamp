import Blockly from 'blockly/core';
import State from '../state';
import Random from '../random';
import Emitter from '../emitter';

const createExtendableElement = (type) => {
    /**
     * @type {HTMLDivElement}
     */
    const element = document.createElement(type);
    const _setAttribute = element.setAttribute;
    const _setAttributeNS = element.setAttributeNS;

    element.setAttribute = (...args) => {
        _setAttribute.call(element, ...args);
        return element;
    };
    element.setAttributeNS = (...args) => {
        _setAttributeNS.call(element, ...args);
        return element;
    };

    element.setInnerHTML = (html) => {
        element.innerHTML = html;
        return element;
    };
    element.setInnerText = (text) => {
        element.innerText = text;
        return element;
    };

    return element;
};

export default (workspace) => {
    // variables
    workspace.registerToolboxCategoryCallback("variables", () => {
        const blockList = [];
        blockList.push(createExtendableElement('button')
            .setAttribute('text', 'Create variable')
            .setAttribute('callbackkey', 'registerVariable')
            .setAttribute('web-class', 'butcategory-variables'));

        const target = State.getTargetById(State.editingTarget);
        if (!target) return blockList;
        const projectVarIds = Object.keys(State.currentProject.variables);
        const varIds = Object.keys(target.variables);
        // get vars
        if (projectVarIds.length > 0) {
            blockList.push(createExtendableElement('block')
                .setAttribute('type', 'variables_getproj'));
        }
        if (varIds.length > 0) {
            blockList.push(createExtendableElement('block')
                .setAttribute('type', 'variables_get'));
        }
        // set vars
        if (projectVarIds.length > 0) {
            blockList.push(createExtendableElement('block')
                .setAttribute('type', 'variables_setproj'));
        }
        if (varIds.length > 0) {
            blockList.push(createExtendableElement('block')
                .setAttribute('type', 'variables_set'));
        }
        return blockList;
    });
};