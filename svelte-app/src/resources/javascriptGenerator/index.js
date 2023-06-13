// vercel's build doesnt work for some reason
// its related to js generator and how its imported
// so lets just import it the way that it wants
// this is also usefull for injecting functions
import pkg from 'blockly/javascript.js';
const { javascriptGenerator } = pkg;

const oldValueToCode = javascriptGenerator.valueToCode 
javascriptGenerator.valueToCode = function(block, name, order) {
    const code = oldValueToCode.apply(this, block, name, order)
    const input = block.getInput(name)
    const parentType = input.connection.check;
    const childType = input.connection.targetConnection.check;
    if (!parentType || Array.isArray(parentType)) return code
    if (parentType === childType) {
        // just add the type converter here olo
        switch (parentType) {
        case 'String':
            return `String(${code})`
        case 'Number':
            return `Number(${code})`
        case 'Boolean':
            return `((value) => 
                typeof value === 'string' && (value === 'true' || value === 'false') 
                    ? value === 'true' 
                    : Boolean(value))(${code})`
        }
    }
    return code
}

export default javascriptGenerator;