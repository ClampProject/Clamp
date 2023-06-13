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
    // [true/false]
    registerBlock(`${categoryPrefix}bools`, {
        message0: '%1',
        args0: [
            {
                "type": "field_dropdown",
                "name": "BOOL",
                "options": [
                    ["true", "true"],
                    ["false", "false"]
                ]
            }
        ],
        output: ["Boolean"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const BOOL = block.getFieldValue('BOOL');
        const code = `${BOOL}`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })

    // STRINGS

    // join () and () together
    registerBlock(`${categoryPrefix}join`, {
        message0: 'join %1 and %2 together',
        args0: [
            {
                "type": "field_input",
                "name": "TEXT1",
                "check": null,
                "text": "Hello ",
                "acceptsBlocks": true
            },
            {
                "type": "field_input",
                "name": "TEXT2",
                "check": null,
                "text": "world!",
                "acceptsBlocks": true
            }
        ],
        output: ["String"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TEXT1 = javascriptGenerator.valueToCode(block, 'TEXT1', javascriptGenerator.ORDER_ATOMIC);
        const TEXT2 = javascriptGenerator.valueToCode(block, 'TEXT2', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT1} + ${TEXT2}`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // length of ()
    registerBlock(`${categoryPrefix}lengthof`, {
        message0: 'length of %1',
        args0: [
            {
                "type": "field_input",
                "name": "TEXT1",
                "check": null,
                "text": "Hello world!",
                "acceptsBlocks": true
            }
        ],
        output: ["Number"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TEXT1 = javascriptGenerator.valueToCode(block, 'TEXT1', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT1}.length`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // letter () of ()
    registerBlock(`${categoryPrefix}letterof`, {
        message0: 'letter %1 of %2',
        args0: [
            {
                "type": "field_number",
                "name": "INDEX",
                "check": "Number",
                "value": 1,
                "acceptsBlocks": true
            },
            {
                "type": "field_input",
                "name": "TEXT",
                "check": null,
                "text": "Hello world!",
                "acceptsBlocks": true
            }
        ],
        output: ["String"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const INDEX = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC);
        const TEXT = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT}.charAt(${INDEX} - 1)`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // letters from () to () in ()
    registerBlock(`${categoryPrefix}lettersfromtoin`, {
        message0: 'letters from %1 to %2 in %3',
        args0: [
            {
                "type": "field_number",
                "name": "INDEX1",
                "check": "Number",
                "value": 1,
                "acceptsBlocks": true
            },
            {
                "type": "field_number",
                "name": "INDEX2",
                "check": "Number",
                "value": 4,
                "acceptsBlocks": true
            },
            {
                "type": "field_input",
                "name": "TEXT",
                "check": null,
                "text": "Hello!",
                "acceptsBlocks": true
            }
        ],
        output: ["String"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const INDEX1 = javascriptGenerator.valueToCode(block, 'INDEX1', javascriptGenerator.ORDER_ATOMIC);
        const INDEX2 = javascriptGenerator.valueToCode(block, 'INDEX2', javascriptGenerator.ORDER_ATOMIC);
        const TEXT = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT}.substring(${INDEX1} - 1, ${INDEX2})`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // () includes ()?
    registerBlock(`${categoryPrefix}includes`, {
        message0: '%1 includes %2?',
        args0: [
            {
                "type": "field_input",
                "name": "TEXT1",
                "check": null,
                "text": "Hello!",
                "acceptsBlocks": true
            },
            {
                "type": "field_input",
                "name": "TEXT2",
                "check": null,
                "text": "H",
                "acceptsBlocks": true
            }
        ],
        output: ["Boolean"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TEXT1 = javascriptGenerator.valueToCode(block, 'TEXT1', javascriptGenerator.ORDER_ATOMIC);
        const TEXT2 = javascriptGenerator.valueToCode(block, 'TEXT2', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT1}.includes(${TEXT2})`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // [index/last index] of () in ()
    registerBlock(`${categoryPrefix}indexofin`, {
        message0: '%1 of %2 in %3',
        args0: [
            {
                "type": "field_dropdown",
                "name": "TYPE",
                "options": [
                    ["index", "indexOf"],
                    ["last index", "lastIndexOf"]
                ]
            },
            {
                "type": "field_input",
                "name": "LOOKING",
                "check": null,
                "text": "world!",
                "acceptsBlocks": true
            },
            {
                "type": "field_input",
                "name": "TEXT",
                "check": null,
                "text": "Hello world!",
                "acceptsBlocks": true
            }
        ],
        output: ["Number"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TYPE = block.getFieldValue('TYPE');
        const LOOKING = javascriptGenerator.valueToCode(block, 'LOOKING', javascriptGenerator.ORDER_ATOMIC);
        const TEXT = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT}.${TYPE}(${LOOKING}) + 1`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // () [starts/ends] with ()?
    registerBlock(`${categoryPrefix}startsendswith`, {
        message0: '%1 %2 with %3?',
        args0: [
            {
                "type": "field_input",
                "name": "TEXT1",
                "check": null,
                "text": "Hello",
                "acceptsBlocks": true
            },
            {
                "type": "field_dropdown",
                "name": "TYPE",
                "options": [
                    ["starts", "startsWith"],
                    ["ends", "endsWith"]
                ]
            },
            {
                "type": "field_input",
                "name": "TEXT2",
                "check": null,
                "text": "H",
                "acceptsBlocks": true
            }
        ],
        output: ["Boolean"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TYPE = block.getFieldValue('TYPE');
        const TEXT1 = javascriptGenerator.valueToCode(block, 'TEXT1', javascriptGenerator.ORDER_ATOMIC);
        const TEXT2 = javascriptGenerator.valueToCode(block, 'TEXT2', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT1}.${TYPE}(${TEXT2})`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })

    // replace [first/all] ()'s with () in ()
    registerBlock(`${categoryPrefix}replacechars`, {
        message0: 'replace %1 %2 with %3 in %4',
        args0: [
            {
                "type": "field_dropdown",
                "name": "TYPE",
                "options": [
                    ["first", "replace"],
                    ["all", "replaceAll"]
                ]
            },
            {
                "type": "field_input",
                "name": "REPLACE",
                "check": null,
                "text": "world",
                "acceptsBlocks": true
            },
            {
                "type": "field_input",
                "name": "WITH",
                "check": null,
                "text": "people",
                "acceptsBlocks": true
            },
            {
                "type": "field_input",
                "name": "TEXT",
                "check": null,
                "text": "Hello world!",
                "acceptsBlocks": true
            }
        ],
        output: ["String"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TYPE = block.getFieldValue('TYPE');
        const TEXT = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC);
        const REPLACE = javascriptGenerator.valueToCode(block, 'REPLACE', javascriptGenerator.ORDER_ATOMIC);
        const WITH = javascriptGenerator.valueToCode(block, 'WITH', javascriptGenerator.ORDER_ATOMIC);

        const code = `${TEXT}.${TYPE}(${REPLACE}, ${WITH})`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // convert () to [UPPERCASE/lowercase]
    registerBlock(`${categoryPrefix}casingstring`, {
        message0: 'convert %1 to %2',
        args0: [
            {
                "type": "field_input",
                "name": "TEXT",
                "check": null,
                "text": "Hello world!",
                "acceptsBlocks": true
            },
            {
                "type": "field_dropdown",
                "name": "CASING",
                "options": [
                    ["UPPERCASE", "toUpperCase"],
                    ["lowercase", "toLowerCase"]
                ]
            }
        ],
        output: ["String"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const CASING = block.getFieldValue('CASING');
        const TEXT = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC);
        const code = `${TEXT}.${CASING}()`;
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })

    // ADVANCED MATH

    // () [mod/^/root/log] ()
    registerBlock(`${categoryPrefix}doublemathoperations`, {
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
                "name": "TYPE",
                "options": [
                    ["mod", "mod"],
                    ["^", "pow"],
                    ["root", "root"],
                    ["log", "log"]
                ]
            },
            {
                "type": "field_number",
                "name": "Y",
                "check": "Number",
                "value": 2,
                "acceptsBlocks": true
            }
        ],
        output: ["Number"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TYPE = block.getFieldValue('TYPE');
        const X = javascriptGenerator.valueToCode(block, 'X', javascriptGenerator.ORDER_ATOMIC);
        const Y = javascriptGenerator.valueToCode(block, 'Y', javascriptGenerator.ORDER_ATOMIC);

        let code = '0';
        switch (TYPE) {
            case 'mod':
                code = `${X} % ${Y}`;
                break;
            case 'pow':
                code = `${X} ** ${Y}`;
                break;
            case 'root':
                code = `${X} ** 1 / ${Y}`;
                break;
            case 'log':
                code = `Math.log(${Y}) % Math.log(${X})`;
                break;
        }
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
    // [round/absolute/floor/ceiling/square root/sin/cos/tan/asin/acos/atan/log/exponentialize/natural logarithm of] ()
    registerBlock(`${categoryPrefix}advancedoperations`, {
        message0: '%1 %2',
        args0: [
            {
                "type": "field_dropdown",
                "name": "TYPE",
                "options": [
                    ["round", "round"],
                    ["absolute", "abs"],
                    ["floor", "floor"],
                    ["ceiling", "ceil"],
                    ["square root", "sqrt"],
                    ["sin", "sin"],
                    ["cos", "cos"],
                    ["tan", "tan"],
                    ["asin", "asin"],
                    ["acos", "acos"],
                    ["atan", "atan"],
                    ["log", "log"],
                    ["exponentialize", "exp"],
                    ["natural logarithm of", "ln"]
                ]
            },
            {
                "type": "field_number",
                "name": "X",
                "check": "Number",
                "value": 4.5,
                "acceptsBlocks": true
            }
        ],
        output: ["Number"],
        inputsInline: true,
        colour: categoryColor
    }, (block) => {
        const TYPE = block.getFieldValue('TYPE');
        const X = javascriptGenerator.valueToCode(block, 'X', javascriptGenerator.ORDER_ATOMIC);

        let code = '0';
        switch (TYPE) {
            case 'sin':
                code = `Math.round(Math.sin((Math.PI * ${X}) / 180) * 1e10) / 1e10`;
                break;
            case 'cos':
                code = `Math.round(Math.cos((Math.PI * ${X}) / 180) * 1e10) / 1e10`;
                break;
            case 'tan':
                code = `MathPlus.tanDeg(${X})`;
                break;
            case 'asin':
                code = `(Math.asin(${X}) * 180) / Math.PI`;
                break;
            case 'acos':
                code = `(Math.acos(${X}) * 180) / Math.PI`;
                break;
            case 'atan':
                code = `(Math.atan(${X}) * 180) / Math.PI`;
                break;
            case 'ln':
                code = `Math.log(${X})`;
                break;
            case 'log':
                code = `Math.log(${X}) / Math.LN10`;
                break;
            default:
                code = `Math.${TYPE}(${X})`
        }
        return [`(${code})`, javascriptGenerator.ORDER_NONE];
    })
}

export default register;
