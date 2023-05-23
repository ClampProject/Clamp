// this js file contains project details like what characters exist and their workspaces
const defaultState = {
    characters: [
        {
            name: "Apple",
            id: "_default_apple",
            startCostume: "_hardcoded_apple",
            position: {
                x: 320,
                y: 180
            },
            size: 100,
            angle: 0
        }
    ],
    images: [
        {
            name: "Apple",
            id: "_hardcoded_apple",
            image: "https://kaboomjs.com/sprites/apple.png"
        }
    ],
    sounds: [
        {
            name: "Explode",
            id: "_hardcoded_explode",
            data: "https://clamp-project.vercel.app/sounds/explode.mp3"
        }
    ]
};

class ProjectState {
    static default = defaultState;
}

export default ProjectState;