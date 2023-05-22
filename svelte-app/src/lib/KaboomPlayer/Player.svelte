<script>
    import { onMount } from "svelte";

    import Kaboom from "kaboom";

    import Engine from "../../resources/engine";
    import FlagEmitter from "../../resources/engine/FlagEmitter.js";

    let canvas;

    function runCodeInEngine(code) {
        return new Function("FlagEmitter", "Kaboom", "Engine", code)(
            new FlagEmitter(),
            Kaboom,
            Engine
        );
    }

    onMount(() => {
        Kaboom({
            canvas: canvas,
            width: 640,
            height: 360,
            global: false,
        });

        Engine.on("UPDATE", (code) => {
            runCodeInEngine(code);
        });
    });
</script>

<canvas bind:this={canvas} />

<style>
    canvas {
        width: 640px;
        height: 360px;
    }
</style>
