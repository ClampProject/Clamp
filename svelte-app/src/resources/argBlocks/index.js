import Blockly from 'blockly/core';
import javascriptGenerator from '../javascriptGenerator';

// cloned from https://github.com/google/blockly/blob/a6d6393748776a0945cca98444275d2fb2b55640/core/block.ts#L1085
Blockly.Block.prototype.getField = function(name) {
    if (typeof name !== 'string') {
        throw new TypeError(
            'Block.prototype.getField expects a string ' +
            'with the field name but received ' +
            (name === undefined ? 'nothing' : name + ' of type ' + typeof name) +
            ' instead'
        );
    }
    for (let i = 0, input; (input = this.inputList[i]); i++) {
        // added so that field inputs redirect to the target field rather then giving up
        // since the field doesnt actualy exist on this block
        if (input.fieldName === name && input.getTargetBlockType() === input.getConnectedBlock().type) {
            return input.getTargetField()
        }
        for (let j = 0, field; (field = input.fieldRow[j]); j++) {
            if (field.name === name) {
                return field;
            }
        }
    }
    return null;
}
Blockly.Block.prototype.getFieldInput = function(name) {
    for (let i = 0, input; (input = this.inputList[i]); i++) {
        if (input.fieldName === name) {
            return input
        }
    }
    return null
}
Blockly.Input.prototype.getTargetField = function() {
    if (!this.fieldName) return null
    return this.connection.targetConnection.sourceBlock_.inputList[0].fieldRow[0]
}
Blockly.Input.prototype.getConnectedBlock = function() {
    return this.connection.targetConnection.sourceBlock_
}
Blockly.Input.prototype.getTargetBlockType = function() {
    if (!this.fieldName) return null
    return `${this.getSourceBlock()}_${this.fieldName}`
}


export default (arg, color, name, block) => {
    // the arg has nothing to do with this function at all so we just give it back
    if (!arg.acceptsBlocks) return arg

    switch (arg.type) {
    case 'field_angle':
    case 'field_input':
    case 'field_number':
        color = '#fff'
    case 'field_dropdown': {
        const newBlockName = `${name}_${arg.name}`
        Blockly.Blocks[newBlockName] = {
            init: function () {
                this.jsonInit({
                    message0: '%1',
                    args0: [arg],
                    output: arg.check,
                    inputsInline: true,
                    colour: color
                });
            }
        };

        javascriptGenerator[newBlockName] = (block) => {
            const value = block.getFieldValue(arg.name);
            return [JSON.stringify(value), javascriptGenerator.ORDER_NONE];
        }

        const oldInit = block.init
        block.init = function() {
            oldInit.apply(this)
            const input = this.getInput(arg.name)
            input.fieldName = arg.name;
            const newBlock = this.workspace.newBlock(newBlockName)
            const blockConnection = newBlock.outputConnection
            newBlock.setShadow(true)
            newBlock.initSvg()
            newBlock.render()
            blockConnection.connect(input.connection)
        }
        return {
            type: 'input_value',
            name: arg.name,
            check: arg.check
        }
    }
    // we dont have anything to do with this so we do nothing to it
    default:
        return arg
    }
}