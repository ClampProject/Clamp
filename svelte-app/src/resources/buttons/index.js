import Blockly from 'blockly/core'

export default () => {
    Blockly.registerButtonCallback("buttonPlaceholder", () => {
        alert('coming soon!')
    })
}