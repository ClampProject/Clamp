// vite doesnt seem to support importing files as Data URL yet
// we can import as regular URL, but thats literally what we are trying to avoid here
import _hardcoded_apple from './_hardcoded_apple.txt?raw';
import _hardcoded_explode from './_hardcoded_explode.txt?raw';

// export as a function since it means we dont need to use JSON.stringify and JSON.parse to deep clone the default state
export default () => {
    return {
        characters: [
            {
                name: "Apple",
                id: "_default_apple",
                startCostume: "_hardcoded_apple",
                position: {
                    x: 320,
                    y: 180
                },
                variables: {},
                size: 100,
                angle: 0,
                visible: true,
                costumes: [
                    "_hardcoded_apple",
                ],
                sounds: [
                    "_hardcoded_explode",
                ],
                xml: "<xml></xml>"
            }
        ],
        images: [
            {
                name: "Apple",
                id: "_hardcoded_apple",
                image: _hardcoded_apple
            }
        ],
        sounds: [
            {
                name: "Explode",
                id: "_hardcoded_explode",
                data: _hardcoded_explode
            }
        ],
        variables: {},
        // should match the default state provided in compiler/precompile.js
        settings: {
            forceLoopPauses: true,
            forceConditionalPauses: true,
        },
        customData: {} // custom scripts can add data here
    };
};