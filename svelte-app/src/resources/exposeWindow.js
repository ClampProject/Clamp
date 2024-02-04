import BlobAndDataUrl from './blobanddataurl';
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

import javascriptGenerator from './javascriptGenerator';

export default (extraExports) => {
    if (!extraExports) extraExports = {};
    const Clamp = {
        Random,
        Emitter,
        BlobAndDataUrl,
        Communicator,
        FlagEmitter,
        InputDevice,
        MathPlus,
        State,

        javascriptGenerator,

        Compiler,
        xmlToCode,
        raw_randomNumberGen,
        raw_compileVarSection,

        registerBlock,
        convertArgToBlock,
        fileDialog,
        generateTransformCSS,
        preloadAudio,
        proxyFetch,
        ...extraExports
    };
    window.Clamp = Clamp;
}