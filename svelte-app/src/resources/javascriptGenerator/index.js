// vercel's build doesnt work for some reason
// its related to js generator and how its imported
// so lets just import it the way that it wants
// this is also usefull for injecting functions
import pkg from 'blockly/javascript.js';
const { javascriptGenerator } = pkg;

javascriptGenerator.exportField = function(block, name, order) {
    const input = block.getFieldInput(name)
    const field = block.getField(name)
    if (!input && !field) {
        throw new TypeError(`cant export field name ${name} as it doesnt exist`)
    }
    if (input.getTargetBlockType() !== input.getConnectedBlock().type) {
        return javascriptGenerator.valueToCode(block, input.name, order)
    }
    return field.getValue()
}

export default javascriptGenerator;