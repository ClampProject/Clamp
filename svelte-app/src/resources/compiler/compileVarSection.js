/*
    SCRIPT: src/resources/compiler/compileVarSection.js
    DETAILS: This is the section that creates the compileVars API in the headerCode.
        This file is thrown into the JS Export with no checking,
        so syntax must be correct.
*/

const _compil__listLow = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const _compil__listHigh = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const _compil__listSym = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '@', '#', '$', '%', '&', '(', ')', '_', '-', '+', '=', '[', ']', '|'];
const _compil_list = [].concat(_compil__listLow, _compil__listHigh, _compil__listSym);

const compileVars = {};
compileVars._idx = 0;
compileVars.new = () => {
    let str = '';
    for (let i = 0; i < 100; i++) {
        str += _compil_list[Math.round(Math.random() * (_compil_list.length - 1))];
    };
    return str;
};
compileVars.next = () => {
    compileVars._idx++;
    return `v${compileVars._idx}`;
};