import { javascriptGenerator } from 'blockly/javascript';
import registerBlock from '../register';

const categoryPrefix = 'generic_';
const categoryColor = '#fff';

function register() {
    registerBlock(`${categoryPrefix}number`, {
        message0: '%1',
        args0: [
            {
                "type": "field_number",
                "name": "NUMBER",
                "value": 0
            }
        ],
        output: "Number",
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const NUMBER = block.getFieldValue('NUMBER');
        const code = `Number(${NUMBER})`;
        return [code, javascriptGenerator.ORDER_NONE];
    })
}

export default register;
