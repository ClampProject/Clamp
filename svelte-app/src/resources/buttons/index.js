import Blockly from 'blockly/core'

export default (workspace) => {
    workspace.registerButtonCallback("buttonPlaceholder", () => {
        alert('coming soon!');
    })
}