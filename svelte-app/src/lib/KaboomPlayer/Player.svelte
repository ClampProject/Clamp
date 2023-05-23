<script>
    import { onMount } from "svelte";

    import Kaboom from "kaboom";

    import Engine from "../../resources/engine";
    import ClampEditorCommunicator from "../../resources/editorCommunicator";
    import FlagEmitter from "../../resources/engine/FlagEmitter.js";

    let canvas;
    let currentEngine;
    let isFullscreen = false;
    let kaboomEngine;

    function runCodeInEngine(code) {
        if (currentEngine) currentEngine.dispose();
        currentEngine = new Engine();
        currentEngine.on("SUSPEND", () => {
            currentEngine.dispose();
        });
        return new Function(
            "FlagEmitter",
            "Kaboom",
            "Engine",
            "ClampEditor",
            code
        )(
            new FlagEmitter(),
            kaboomEngine,
            currentEngine,
            ClampEditorCommunicator
        );
    }

    onMount(() => {
        isFullscreen = false;
        setInterval(() => {
            isFullscreen = document.fullscreenElement != null;
        }, 10);

        kaboomEngine = Kaboom({
            canvas: canvas,
            width: 640,
            height: 360,
            global: false,
        });

        Engine.on("UPDATE", (code) => {
            console.log(code);
            ClampEditorCommunicator.initializingCode = true;
            Engine.emitGlobal("CODE_INITIALIZE_UPDATE");
            runCodeInEngine(code);
        });
    });
</script>

<canvas bind:this={canvas} class={isFullscreen ? "fullscreen" : ""} />

<style>
    canvas {
        width: 640px;
        height: 360px;
    }
    .fullscreen {
        width: 100%;
        height: unset;
        max-height: calc(100% - 2.5rem);
    }
</style>
