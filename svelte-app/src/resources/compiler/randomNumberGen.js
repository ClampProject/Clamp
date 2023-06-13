/*
    SCRIPT: src/resources/compiler/randomNumberGen.js
    DETAILS: Generates a random number between a min and max.
        This file is thrown into the JS Export with no checking,
        so syntax must be correct.
*/

function randomNumberGen(min, max) {
    // swap if min is larger
    if (min > max) {
        let _v = max;
        max = min;
        min = _v;
    }
    // math
    const difference = max - min;
    const random = Math.random() * difference;
    return min + random;
};