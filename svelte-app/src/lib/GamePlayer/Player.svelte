<script>
    import { onMount } from "svelte";

    import GameEngine from "../../engine";

    import Emitter from "../../resources/emitter";
    import InputDevice from "../../resources/inputDevice";
    import ClampEditorCommunicator from "../../resources/editorCommunicator";
    import FlagEmitter from "../../resources/emitter/FlagEmitter.js";

    let canvas;
    let currentEmitter;
    let isFullscreen = false;
    let gameEngine;
    let transformStyle = "";

    function runCodeInEngine(code) {
        if (currentEmitter) currentEmitter.dispose();
        currentEmitter = new Emitter();
        currentEmitter.on("SUSPEND", () => {
            currentEmitter.dispose();
            if (gameEngine && !gameEngine.disposed) {
                gameEngine.dispose();
            }
        });
        return new Function(
            "FlagEmitter",
            "Engine",
            "Emitter",
            "ClampEditor",
            "InputDevice",
            code
        )(
            new FlagEmitter(),
            gameEngine,
            currentEmitter,
            ClampEditorCommunicator,
            InputDevice
        );
    }

    onMount(() => {
        isFullscreen = false;
        setInterval(() => {
            isFullscreen = document.fullscreenElement != null;

            const width = window.innerWidth;
            const height = window.innerHeight;

            const divisors = {
                w: 640 / width,
                h: 360 / height,
            };

            const multipliers = {
                w: divisors.w / (divisors.w * divisors.w),
                h: divisors.h / (divisors.h * divisors.h),
            };

            transformStyle = `scaleX(${multipliers.w}) scaleY(${multipliers.h})`;
        }, 10);

        InputDevice._canvas = canvas;
        InputDevice._mountEvents();

        const engineSettings = {
            parent: canvas,
            width: 640,
            height: 360,
        };

        Emitter.on("UPDATE", (code) => {
            console.log(code);
            if (gameEngine && !gameEngine.disposed) {
                gameEngine.dispose();
            }
            gameEngine = new GameEngine(engineSettings);
            ClampEditorCommunicator.initializingCode = true;
            Emitter.emitGlobal("CODE_INITIALIZE_UPDATE");
            runCodeInEngine(code);
        });
    });
</script>

<div
    bind:this={canvas}
    class={"canvas " + (isFullscreen ? "fullscreen" : "")}
    style={isFullscreen ? "transform:" + transformStyle : ""}
/>

<style>
    .canvas {
        position: relative;

        width: 640px;
        height: 360px;
        background: white;

        overflow: hidden;

        user-select: none;
        -ms-user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
    }
    .fullscreen {
        transform-origin: left top;
    }
</style>
