import registerBlock from '../register';

const categoryPrefix = 'appearance_';
const categoryColor = '#f3a';

function register() {
    // show me
    registerBlock(`${categoryPrefix}showCharacter`, {
        message0: 'show character',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, () => {
        const code = `character.show();`;
        return `${code}\n`;
    })
    // hide me
    registerBlock(`${categoryPrefix}hideCharacter`, {
        message0: 'hide character',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
        colour: categoryColor
    }, () => {
        const code = `character.hide();`;
        return `${code}\n`;
    })
}

export default register;
