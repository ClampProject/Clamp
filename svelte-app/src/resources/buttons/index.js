import Blockly from 'blockly/core'

export default () => {
    Blockly.Workspace.registerButtonCallback("buttonPlaceholder", () => {
        alert('coming soon!')
    })
}