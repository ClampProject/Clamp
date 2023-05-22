<script>
    import { onMount } from "svelte";

    // Components
    import NavigationBar from "$lib/NavigationBar/NavigationBar.svelte";
    import NavigationMargin from "$lib/NavigationBar/NavigationMargin.svelte";
    import NavigationOption from "$lib/NavigationBar/NavigationOption.svelte";
    import KaboomPlayer from "$lib/KaboomPlayer/Player.svelte";

    // Toolbox
    import Toolbox from "$lib/Toolbox/Toolbox.xml?raw";

    // import Blockly from "blockly/core";
    import DarkTheme from "@blockly/theme-dark";
    // this gives event blocks a little bump at the top
    DarkTheme.startHats = true;

    import En from "blockly/msg/en";
    import "blockly/blocks";

    import BlocklyComponent from "svelte-blockly";

    import Compiler from "../resources/compiler";
    import Engine from "../resources/engine";

    // Blocks
    import registerGeneric from "../resources/blocks/generic.js";
    registerGeneric();

    import registerMovement from "../resources/blocks/movement.js";
    import registerActions from "../resources/blocks/actions.js";
    registerMovement();
    registerActions();

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
        const code = compiler.compile(workspace);
        Engine.update(code);
        lastGeneratedCode = code;
    }
</script>

<NavigationBar>
    <NavigationOption on:click={updateProgram}>
        <img
            alt="UpdateIcon"
            src="/images/gui-icons/pencil-icon.png"
            width="16"
            style="margin-left:6px;margin-right:6px;"
        />
        <span style="margin-right:6px;"> Update </span>
    </NavigationOption>
    <a
        href="/credits"
        target="_blank"
        style="height:100%;text-decoration:none;margin-left:6px"
    >
        <NavigationOption>Credits</NavigationOption>
    </a>
</NavigationBar>
<div class="main">
    <NavigationMargin />
    <div class="sides">
        <div class="left">
            <div class="aboveBlockly">
                <div class="tabs">
                    <button class="tab" data-active="true">
                        <img alt="" src="/images/gui-icons/brick-icon.png" />
                        Blocks
                    </button>
                    <button class="tab">
                        <img alt="" src="/images/gui-icons/picture-icon.png" />
                        Images
                    </button>
                    <button class="tab">
                        <img alt="" src="/images/gui-icons/sound-icon.png" />
                        Sounds
                    </button>
                </div>
                <div class="details">
                    <img
                        alt="Edit"
                        src="/images/gui-icons/user-edit-icon.png"
                    />
                    <p>Editing Character1</p>
                </div>
            </div>
            <div class="blocklyWrapper">
                <BlocklyComponent {config} locale={en} bind:workspace />
            </div>
        </div>
        <div class="right">
            <KaboomPlayer />
            <textarea
                value={lastGeneratedCode}
                disabled="true"
                style="width:100%;height:100%;border:0;padding:0;color:white;background:black;font-family:monospace"
            />
        </div>
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

    .sides {
        width: 100%;
        height: calc(100% - 3.25rem - 8px);

        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .left {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
    }
    .right {
        width: 640px;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .tabs {
        height: 100%;

        display: flex;
        flex-direction: row;
        align-items: stretch;
        flex-wrap: nowrap;
        justify-content: space-between;
    }

    .tab {
        display: flex;
        flex-direction: row;
        align-items: center;

        border-radius: 8px;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        border: 1px solid #868686;
        border-bottom: 0px;
        background: transparent;
        color: white;
    }
    .tab:focus,
    .tab:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    .tab[data-active="true"] {
        background: rgba(255, 255, 255, 0.2);
    }
    .tab > img {
        margin-right: 6px;
    }

    .details {
        margin-left: 6px;

        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .details > img {
        margin-right: 6px;
    }

    .blocklyWrapper {
        width: 100%;
        height: calc(100% - 2.5rem);
    }
    .aboveBlockly {
        width: 100%;
        height: 2.5rem;

        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>
