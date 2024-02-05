import Blockly from 'blockly/core'

export default (workspace) => {
    workspace.registerButtonCallback("buttonPlaceholder", () => {
        window.playSound("metalpipe")
        alert('coming soon!')
    })
}