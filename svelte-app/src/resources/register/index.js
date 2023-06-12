import Blockly from 'blockly/core';
import javascriptGenerator from '../javascriptGenerator';
import convertArgToBlock from '../argBlocks'

export default (blockName, jsonData, compileFunction) => {
    // gsa: type isnt used by jsonInit tho 🗿
    // json data needs type to be the block name
    jsonData.type = blockName

    const blockObject = {
        init: function () {
            this.jsonInit(jsonData);
        }
    };

    // idk why i did it this way olo
    for (let message = 0; jsonData[`message${message}`]; message++) {
        if (jsonData[`args${message}`]) {
            const args = jsonData[`args${message}`]
            for (let idx = 0, arg; arg = args[idx]; idx++)
                args[idx] = convertArgToBlock(arg, jsonData.colour, blockName, blockObject)
        }
    }

    // register visual block
    Blockly.Blocks[blockName] = blockObject

    // register block compile function
    javascriptGenerator[blockName] = compileFunction;
}