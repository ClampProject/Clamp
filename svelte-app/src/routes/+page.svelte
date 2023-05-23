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
    DarkTheme.fontStyle = {
        family: '"Comic Sans MS", Arial, Helvetica, sans-serif',
        weight: "600",
        size: 12,
    };

    import En from "blockly/msg/en";
    import "blockly/blocks";

    import BlocklyComponent from "svelte-blockly";

    import Compiler from "../resources/compiler";
    import Engine from "../resources/engine";
    import ClampEditorCommunicator from "../resources/editorCommunicator";

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
    let initializingCode = false;

    let editTarget = {};

    let playerArea;

    const tabs = {};
    let currentTab = "blocks";

    function playSound(name) {
        const audio = new Audio(`/sounds/${name}.mp3`);
        audio.play();
        audio.volume = 0.5;
    }

    onMount(() => {
        window.onbeforeunload = () => "";
        compiler = new Compiler(workspace);
    });

    Engine.on("CODE_INITIALIZE_UPDATE", () => {
        initializingCode = ClampEditorCommunicator.initializingCode;
    });

    function updateProgram() {
        playSound("confirm");
        const code = compiler.compile(workspace);
        Engine.update(code);
        lastGeneratedCode = code;
    }
    function switchTab(selectedTab) {
        playSound("tabswitch");
        currentTab = selectedTab;
        Object.getOwnPropertyNames(tabs).forEach((tabName) => {
            const tab = tabs[tabName];
            tab.dataset.active = false;
            if (tabName === selectedTab) {
                tab.dataset.active = true;
            }
        });
    }

    function runButtonClicked() {
        Engine.emitGlobal("RUN_BUTTON");
    }
    function stopButtonClicked() {
        Engine.emitGlobal("STOP_BUTTON");
    }
    function fullscreenButtonClicked() {
        try {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            playerArea.requestFullscreen();
        } catch (err) {
            console.log(
                "fullscreen button error, fullscreen may not be supported;",
                err
            );
        }
    }
    function suspendButtonClicked() {
        playSound("explode");
        Engine.emitGlobal("SUSPEND");
    }
</script>

<NavigationBar>
    <NavigationOption on:click={updateProgram}>
        <img
            alt="Pencil"
            src="/images/gui-icons/pencil-icon.png"
            width="16"
            style="margin-left:6px;margin-right:6px;"
        />
        <span style="margin-right:6px;">Update</span>
    </NavigationOption>
    <a
        href="/credits"
        target="_blank"
        style="height:100%;text-decoration:none;margin-left:6px"
    >
        <NavigationOption>
            <img
                alt="Info"
                src="/images/gui-icons/information-icon.png"
                width="16"
                style="margin-left:6px;margin-right:6px;"
            />
            <span style="margin-right:6px;">Credits</span>
        </NavigationOption>
    </a>
</NavigationBar>
<div class="main">
    <NavigationMargin />
    <div class="sides">
        <div class="left">
            <div class="aboveBlockly">
                <div class="tabs">
                    <button
                        on:click={() => switchTab("blocks")}
                        bind:this={tabs.blocks}
                        class="tab"
                        data-active="true"
                    >
                        <img alt="" src="/images/gui-icons/brick-icon.png" />
                        Blocks
                    </button>
                    <button
                        on:click={() => switchTab("images")}
                        bind:this={tabs.images}
                        class="tab"
                    >
                        <img alt="" src="/images/gui-icons/picture-icon.png" />
                        Images
                    </button>
                    <button
                        on:click={() => switchTab("sounds")}
                        bind:this={tabs.sounds}
                        class="tab"
                    >
                        <img alt="" src="/images/gui-icons/sound-icon.png" />
                        Sounds
                    </button>
                </div>
                <div class="details">
                    <!-- if we dont know the target yet, we can hide -->
                    {#if editTarget}
                        <img
                            alt="Edit"
                            src="/images/gui-icons/user-edit-icon.png"
                        />
                        <p>Editing {editTarget.name}</p>
                    {/if}
                    {#if initializingCode === true}
                        <img
                            alt="Updating"
                            src="/images/gui-icons/cog-icon.png"
                            style="margin-left:8px;"
                        />
                        <p>Updating...</p>
                    {/if}
                </div>
            </div>
            <!--
                we can afford to respawn images & sounds tab every time,
                not the blocks tab since it would break a lot of things
            -->
            <div
                class="blocklyWrapper"
                style={currentTab === "blocks" ? null : "display:none"}
            >
                <BlocklyComponent {config} locale={en} bind:workspace />
            </div>
            {#if currentTab === "images"}
                <div>
                    <img alt="lol" src="/images/gui-icons/bomb-icon.png" />
                </div>
            {:else if currentTab === "sounds"}
                <div class="soundsWrapper">
                    <p>soundss</p>
                </div>
            {/if}
        </div>
        <div class="right">
            <div class="playerComponents" bind:this={playerArea}>
                <div class="abovePlayer">
                    <button on:click={runButtonClicked} class="bar-button">
                        <img alt="Run" src="/images/gui-icons/run-icon.png" />
                    </button>
                    <button on:click={stopButtonClicked} class="bar-button">
                        <img alt="Stop" src="/images/gui-icons/stop-icon.png" />
                    </button>
                    <button
                        on:click={fullscreenButtonClicked}
                        class="bar-button"
                    >
                        <img
                            alt="Fullscreen"
                            src="/images/gui-icons/fullscreen-icon.png"
                        />
                    </button>
                    <button
                        on:click={suspendButtonClicked}
                        class="bar-button"
                        style="float:right"
                    >
                        <img
                            alt="Suspend"
                            src="/images/gui-icons/bomb-icon.png"
                        />
                    </button>
                </div>
                <KaboomPlayer />
            </div>
            <div class="belowPlayer">
                <div class="characters" />
            </div>
            <!-- <textarea
                value={lastGeneratedCode}
                disabled="true"
                style="width:100%;height:100%;border:0;padding:0;color:white;background:black;font-family:monospace"
            /> -->
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

        cursor: pointer;
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

    .soundsWrapper,
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

    .playerComponents {
        width: 100%;
        height: calc(2.5rem + 360px);
    }
    .abovePlayer {
        width: 100%;
        height: 2.5rem;
    }
    .belowPlayer {
        width: 100%;
        height: calc(100% - 360px - 2.5rem);
    }

    .bar-button {
        width: 2.5rem;
        height: 2.5rem;

        border: 0;
        border-radius: 12px;
        background: transparent;
        color: white;

        cursor: pointer;
    }
    .bar-button:focus,
    .bar-button:hover {
        background: rgba(140, 61, 214, 0.25);
    }
    .bar-button:active {
        background: rgba(140, 61, 214, 0.6);
    }
    .bar-button > img {
        width: 80%;
    }
</style>
