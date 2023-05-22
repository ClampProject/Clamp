import Blockly from 'blockly/core';
import javascriptGenerator from '../javascriptGenerator';

export default (blockName, jsonData, compileFunction) => {
    // json data needs type to be the block name
    jsonData.type = blockName

    // register visual block
    Blockly.Blocks[blockName] = {
        init: function () {
            this.jsonInit(jsonData);
        }
    };

    // register block compile function
    javascriptGenerator[blockName] = compileFunction;
}