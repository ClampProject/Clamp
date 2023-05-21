<script>
    import { onMount } from "svelte";

    // Components
    import NavigationBar from "$lib/NavigationBar/NavigationBar.svelte";
    import NavigationMargin from "$lib/NavigationBar/NavigationMargin.svelte";
    import NavigationOption from "$lib/NavigationBar/NavigationOption.svelte";

    // Toolbox
    import Toolbox from "$lib/Toolbox/Toolbox.xml?raw";

    // import Blockly from "blockly/core";
    import DarkTheme from "@blockly/theme-dark";

    import En from "blockly/msg/en";
    import "blockly/blocks";

    import BlocklyComponent from "svelte-blockly";
    import Compiler from "../resources/compiler";

    // Blocks
    import registerGeneric from "../resources/blocks/generic.js";
    registerGeneric();

    import registerMovement from "../resources/blocks/movement.js";
    registerMovement();

    const en = {
        rtl: false,
        msg: {
            ...En,
        },
    };

    const config = {
        toolbox: Toolbox,
        collapse: true,
        comments: true,
        scrollbars: true,
        disable: false,
        theme: DarkTheme,
        renderer: "zelos",
        zoom: {
            controls: true,
            wheel: true,
            startScale: 0.8,
            maxScale: 4,
            minScale: 0.25,
            scaleSpeed: 1.1,
        },
    };

    let workspace;
    let compiler;
    let lastGeneratedCode = "";

    function playSound(name) {
        const audio = new Audio(`/sounds/${name}.mp3`);
        audio.play();
        audio.volume = 0.5;
    }

    onMount(() => {
        window.onbeforeunload = () => "";
        compiler = new Compiler(workspace);
    });

    function updateProgram() {
        playSound("confirm");
        lastGeneratedCode = compiler.compile(workspace);
        alert(lastGeneratedCode);
    }
</script>

<NavigationBar>
    <NavigationOption on:click={updateProgram}>
        <img
            alt="RunIcon"
            src="/images/gui-icons/arrow-rotate-anticlockwise-icon.png"
            width="24"
        />
        Update
    </NavigationOption>
    <a href="/credits" target="_blank">
        <NavigationOption>Credits</NavigationOption>
    </a>
</NavigationBar>
<div class="main">
    <NavigationMargin />
    <div class="blocklyWrapper">
        <BlocklyComponent {config} locale={en} bind:workspace />
    </div>
</div>

<style>
    .main {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
    }

    .blocklyWrapper {
        width: 60%;
        height: calc(100% - 3.25rem - 8px);
    }
</style>
