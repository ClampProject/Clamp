import BlobAndDataUrl from './blobanddataurl';
import FileTypes from './blobanddataurl/filetypes.js';
import MagicNumbers from './blobanddataurl/magicNumbers.js';
import Communicator from './editorCommunicator';
import Emitter from './emitter';
import FlagEmitter from './emitter/FlagEmitter.js';
import InputDevice from './inputDevice';
import MathPlus from './mathPlus';
import Random from './random';
import State from './state';

import fileDialog from './fileDialog';
import convertArgToBlock from './argBlocks';
import registerBlock from './register';
import generateTransformCSS from './generateTransformCSS';
import preloadAudio from './preload';
import proxyFetch from './proxyFetch';

// compiler
import Compiler from './compiler';
import xmlToCode from './compiler/xmlToCode.js';
import raw_randomNumberGen from './compiler/randomNumberGen.js?raw';
import raw_compileVarSection from './compiler/compileVarSection.js?raw';
import compileVars from './compiler/compileVars.js';
import Precompile from './compiler/precompile.js';

import javascriptGenerator from './javascriptGenerator';

export default (extraExports, includeDefaults) => {
    if (typeof includeDefaults === 'undefined') includeDefaults = true;
    if (!extraExports) extraExports = {};
    if (!window.Clamp) window.Clamp = {};
    const Clamp = {
        Random,
        Emitter,
        BlobAndDataUrl,
        Communicator,
        FlagEmitter,
        InputDevice,
        MathPlus,
        State,

        FileTypes,
        MagicNumbers,
        javascriptGenerator,

        Compiler,
        Precompile,
        xmlToCode,
        compileVars,
        raw_randomNumberGen,
        raw_compileVarSection,

        registerBlock,
        convertArgToBlock,
        fileDialog,
        generateTransformCSS,
        preloadAudio,
        proxyFetch,
    };
    window.Clamp = {
        ...window.Clamp,
        ...extraExports,
        ...(includeDefaults ? Clamp : {})
    };
}