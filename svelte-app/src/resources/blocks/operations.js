import javascriptGenerator from '../javascriptGenerator';
import registerBlock from '../register';

const categoryPrefix = 'operations_';
const categoryColor = '#1d4';

function register() {
    // () [+/-/×/÷] ()
    registerBlock(`${categoryPrefix}mathoperations`, {
        message0: '%1 %2 %3',
        args0: [
            {
                "type": "field_number",
                "name": "X",
                "check": "Number",
                "value": 1,
                "acceptsBlocks": true
            },
            {
                "type": "field_dropdown",
                "name": "OPERATION",
                "options": [
                    ["+", "+"],
                    ["-", "-"],
                    ["×", "*"],
                    ["÷", "/"]
                ]
            },
            {
                "type": "field_number",
                "name": "Y",
                "check": "Number",
                "value": 2,
                "acceptsBlocks": true
            },
        ],
        output: ["Number"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const OPERATION = block.getFieldValue('OPERATION');
        const X = javascriptGenerator.valueToCode(block, 'X', javascriptGenerator.ORDER_ATOMIC);
        const Y = javascriptGenerator.valueToCode(block, 'Y', javascriptGenerator.ORDER_ATOMIC);
        const code = `${X} ${OPERATION} ${Y}`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // random [number/decimal number] between () and ()
    registerBlock(`${categoryPrefix}randomnumber`, {
        message0: 'random %1 between %2 and %3',
        args0: [
            {
                "type": "field_dropdown",
                "name": "TYPE",
                "options": [
                    ["number", "Math.round"],
                    ["decimal number", "0 + "]
                ]
            },
            {
                "type": "field_number",
                "name": "MIN",
                "check": "Number",
                "value": 1,
                "acceptsBlocks": true
            },
            {
                "type": "field_number",
                "name": "MAX",
                "check": "Number",
                "value": 10,
                "acceptsBlocks": true
            },
        ],
        output: ["Number"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TYPE = block.getFieldValue('TYPE');
        const MIN = javascriptGenerator.valueToCode(block, 'MIN', javascriptGenerator.ORDER_ATOMIC);
        const MAX = javascriptGenerator.valueToCode(block, 'MAX', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TYPE}(randomNumberGen(${MIN}, ${MAX}))`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // () [=/≠/</>/≤/≥] ()
    // this block shouldnt be static
    registerBlock(`${categoryPrefix}equaloperations`, {
        message0: '%1 %2 %3',
        args0: [
            {
                "type": "field_number",
                "name": "X",
                "check": ["Number", "String"],
                "value": 1,
                "acceptsBlocks": true
            },
            {
                "type": "field_dropdown",
                "name": "OPERATION",
                "options": [
                    ["=", "=="],
                    ["≠", "!="],
                    ["<", "<"],
                    [">", ">"],
                    ["≤", "<="],
                    ["≥", ">="]
                ]
            },
            {
                "type": "field_number",
                "name": "Y",
                "check": ["Number", "String"],
                "value": 2,
                "acceptsBlocks": true
            },
        ],
        output: ["Boolean"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const OPERATION = block.getFieldValue('OPERATION');
        const X = javascriptGenerator.valueToCode(block, 'X', javascriptGenerator.ORDER_ATOMIC);
        const Y = javascriptGenerator.valueToCode(block, 'Y', javascriptGenerator.ORDER_ATOMIC);
        const shouldNumber = (OPERATION !== "!=") && (OPERATION !== "==")
        const code = `${shouldNumber ? "Number" : ""}(${X}) ${OPERATION} ${shouldNumber ? "Number" : ""}(${Y})`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // () [and/or] ()
    registerBlock(`${categoryPrefix}andor`, {
        message0: '%1 %2 %3',
        args0: [
            {
                "type": "input_value",
                "name": "X",
                "check": "Boolean"
            },
            {
                "type": "field_dropdown",
                "name": "OPERATION",
                "options": [
                    ["and", "&&"],
                    ["or", "||"]
                ]
            },
            {
                "type": "input_value",
                "name": "Y",
                "check": "Boolean"
            },
        ],
        output: ["Boolean"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const OPERATION = block.getFieldValue('OPERATION');
        const X = javascriptGenerator.valueToCode(block, 'X', javascriptGenerator.ORDER_ATOMIC);
        const Y = javascriptGenerator.valueToCode(block, 'Y', javascriptGenerator.ORDER_ATOMIC);
        const code = `(${X ? X : 'false'}) ${OPERATION} (${Y ? Y : 'false'})`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // not ()
    registerBlock(`${categoryPrefix}not`, {
        message0: 'not %1',
        args0: [
            {
                "type": "input_value",
                "name": "CONDITION",
                "check": "Boolean"
            }
        ],
        output: ["Boolean"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const CONDITION = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_ATOMIC);
        const code = `(!(${CONDITION ? CONDITION : 'false'}))`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
}

export default register;
