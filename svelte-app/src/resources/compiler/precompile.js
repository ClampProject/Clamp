// this info is modified just before the compiler starts compiling the workspaces
// note: the resources/state/index.js file should match the default value saved here

// the reason why this file should be used instead of checking state each time, is so blocks can edit these without messing with the settings menu,
// like "run without forced loop pauses {}"
class Precompile {
    static forceLoopPauses = true;
    static forceConditionalPauses = true;
}

export default Precompile;