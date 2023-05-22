// vercel's build doesnt work for some reason
// its related to js generator and how its imported
// so lets just import it the way that it wants
import pkg from 'blockly/javascript.js';
const { javascriptGenerator } = pkg;

export default javascriptGenerator;