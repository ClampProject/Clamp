<script>
    import { onMount } from "svelte";

    // Components
    import NavigationBar from "$lib/NavigationBar/NavigationBar.svelte";
    import NavigationMargin from "$lib/NavigationBar/NavigationMargin.svelte";
    import NavigationOption from "$lib/NavigationBar/NavigationOption.svelte";
    import GamePlayer from "$lib/GamePlayer/Player.svelte";
    import SoundEditor from "$lib/SoundEditor/Editor.svelte";
    import ImageEditor from "$lib/ImageEditor/Editor.svelte";

    // Toolbox
    import Toolbox from "$lib/Toolbox/Toolbox.xml?raw";

    import JSZip from "jszip";

    // import Blockly from "blockly/core";
    import Blockly from "blockly/core";
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

    import State from "../resources/state";
    import Emitter from "../resources/emitter";
    import Compiler from "../resources/compiler";
    import ClampEditorCommunicator from "../resources/editorCommunicator";

    import preload from "../resources/preload";

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

    let editTarget = State.editingTarget;

    let playerArea;

    const tabs = {};
    let currentTab = "blocks";

    const characterTabs = {};
    let currentCharacterTab = "properties";

    function playSound(name) {
        const audio = new Audio(`/sounds/${name}.mp3`);
        audio.play();
        audio.volume = 0.5;
    }

    onMount(() => {
        preload([
            "/sounds/confirm.mp3",
            "/sounds/explode.mp3",
            "/sounds/tabswitch.mp3",
        ]);

        window.onbeforeunload = () => "";
        compiler = new Compiler(workspace);
        const editingTarget = State.getTargetById(editTarget);
        if (editingTarget) {
            editingTarget.workspace = workspace;
        }
    });

    Emitter.on("CODE_INITIALIZE_UPDATE", () => {
        initializingCode = ClampEditorCommunicator.initializingCode;
    });

    function updateProgram() {
        playSound("confirm");
        const code = compiler.compile(workspace);
        Emitter.update(code);
        lastGeneratedCode = code;
    }
    function switchTab(selectedTab) {
        playSound("tabswitch");
        currentTab = selectedTab;
        for (const tabName in tabs) {
            const tab = tabs[tabName];
            tab.dataset.active = false;
            if (tabName === selectedTab) {
                tab.dataset.active = true;
            }
        }
    }
    function switchCharacterTab(selectedTab) {
        playSound("tabswitch");
        currentCharacterTab = selectedTab;
        for (const tabName in characterTabs) {
            const tab = characterTabs[tabName];
            tab.dataset.active = false;
            if (tabName === selectedTab) {
                tab.dataset.active = true;
            }
        }
    }

    async function runButtonClicked() {
        Emitter.emitGlobal("RUN_BUTTON");
    }
    function stopButtonClicked() {
        Emitter.emitGlobal("STOP_BUTTON");
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
        Emitter.emitGlobal("SUSPEND");
    }

    let fileMenu;
    function showFileMenu() {
        playSound("tabswitch");

        if (fileMenu.style.display == "none") {
            fileMenu.style.display = "";
            return;
        }
        fileMenu.style.display = "none";
    }

    /*
      TODO: file saving & loading
    */
    function downloadProject() {
        playSound("tabswitch");

        // data
        const target = State.getTargetById(editTarget);
        const xml = Blockly.Xml.domToText(
            Blockly.Xml.workspaceToDom(workspace)
        );

        // zip
        const zip = new JSZip();
        zip.file(
            "README.txt",
            "This file is not meant to be opened!\nBe careful as you can permanently break your project!"
        );

        // workspaces
        const workspaces = zip.folder("workspaces");
        workspaces.file(target.id + ".xml", xml);

        // do the rest of this

        // images
        // const images = zip.folder("images");
    }
    function loadProject() {
        playSound("tabswitch");
    }
</script>

<NavigationBar>
    <NavigationOption on:click={showFileMenu}>
        <img
            alt="File"
            src="/images/gui-icons/page-white-icon.png"
            width="16"
            style="margin-left:6px;margin-right:6px;"
        />
        <span style="margin-right:6px;">File</span>
        <!-- menu below -->
        <div bind:this={fileMenu} style="display:none" class="dialog-menu">
            <NavigationOption on:click={loadProject}>
                <img
                    alt="Import"
                    src="/images/gui-icons/page-white-put-icon.png"
                    width="16"
                    style="margin-left:6px;margin-right:6px;"
                />
                <span style="margin-right:6px;">Import</span>
            </NavigationOption>
            <NavigationOption on:click={downloadProject}>
                <img
                    alt="Save"
                    src="/images/gui-icons/disk-icon.png"
                    width="16"
                    style="margin-left:6px;margin-right:6px;"
                />
                <span style="margin-right:6px;">Download</span>
            </NavigationOption>
        </div>
    </NavigationOption>

    <input class="project-name" type="text" placeholder="Project Name..." />
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
        on:click={() => playSound("tabswitch")}
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
                        <p>Editing {State.getTargetById(editTarget).name}</p>
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
                <div class="imagesWrapper">
                    <ImageEditor target={editTarget} />
                </div>
            {:else if currentTab === "sounds"}
                <div class="soundsWrapper">
                    <SoundEditor target={editTarget} />
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
                <GamePlayer />
            </div>
            <div class="belowPlayer">
                <div class="characterTabSelection">
                    <button
                        on:click={() => switchCharacterTab("properties")}
                        bind:this={characterTabs.properties}
                        class="tab"
                        data-active="true"
                    >
                        <img alt="" src="/images/gui-icons/bricks-icon.png" />
                        Properties
                    </button>
                    <button
                        on:click={() => switchCharacterTab("characters")}
                        bind:this={characterTabs.characters}
                        class="tab"
                    >
                        <img alt="" src="/images/gui-icons/group-icon.png" />
                        Characters
                    </button>
                </div>
                <div class="characterTabWrapper">
                    {#if currentCharacterTab == "properties"}
                        <div class="properties">
                            <div style="height:8px" />
                            <label>
                                Start as
                                <select>
                                    <option>Apple</option>
                                </select>
                                costume
                            </label>
                            <div style="display:flex;flex-direction:row">
                                <div>
                                    X:
                                    <input
                                        type="number"
                                        value="320"
                                        style="width:64px"
                                    />
                                </div>
                                <div style="margin-left:6px">
                                    Y:
                                    <input
                                        type="number"
                                        value="180"
                                        style="width:64px"
                                    />
                                </div>
                            </div>
                            <div style="display:flex;flex-direction:row">
                                Resized to
                                <input
                                    type="number"
                                    value="100"
                                    style="width:64px"
                                />
                                %
                            </div>
                            <div style="display:flex;flex-direction:row">
                                Looking towards
                                <input
                                    type="number"
                                    value="0"
                                    style="width:64px"
                                />
                                °
                            </div>
                            <label>
                                <input type="checkbox" />
                                Has Gravity?
                            </label>
                        </div>
                    {/if}
                    {#if currentCharacterTab == "characters"}
                        <div class="characters" />
                    {/if}
                </div>
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

        min-width: 1220px;
    }

    .project-name {
        width: 236px;
        height: 80%;

        font-size: 20px;

        border-radius: 4px;
        border: 3px dashed rgba(255, 255, 255, 0.5);
        background: transparent;
        color: white;
    }
    .project-name:active,
    .project-name:focus {
        border-radius: 0px;
        border: 3px solid rgba(0, 0, 0, 0.5);
        outline: none;
        background: white;
        color: black;
    }

    .dialog-menu {
        position: absolute;
        left: 0px;
        top: 100%;

        background: #222;
        border: 4px solid white;
        padding: 2px;

        z-index: 10000;
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
    .characterTabSelection {
        height: 22px;

        display: flex;
        flex-direction: row;
        align-items: stretch;
        flex-wrap: nowrap;
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
    .imagesWrapper,
    .blocklyWrapper {
        position: relative;
        width: 100%;
        height: calc(100% - 2.5rem);
    }

    .characterTabWrapper {
        width: 100%;
        height: calc(100% - 22px);
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

    .properties {
        display: flex;
        flex-direction: column;
    }
</style>
