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
    import * as FileSaver from "file-saver";
    import fileDialog from "../resources/fileDialog";

    // import Blockly from "blockly/core";
    import Blockly from "blockly/core";
    import DarkTheme from "@blockly/theme-dark";
    import * as ContinuousToolboxPlugin from "@blockly/continuous-toolbox";
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
    let blocklyToolboxIsVisible = true;

    import State from "../resources/state";
    import Emitter from "../resources/emitter";
    import Compiler from "../resources/compiler";
    import ClampEditorCommunicator from "../resources/editorCommunicator";

    import preload from "../resources/preload";

    // Blocks
    import registerGeneric from "../resources/blocks/generic.js";
    registerGeneric();

    import registerMovement from "../resources/blocks/movement.js";
    import registerAppearance from "../resources/blocks/appearance.js";
    import registerActions from "../resources/blocks/actions.js";
    import registerConditions from "../resources/blocks/conditions.js";
    import registerRepeats from "../resources/blocks/repeats.js";
    import registerOperations from "../resources/blocks/operations.js";
    registerMovement();
    registerAppearance();
    registerActions();
    registerConditions();
    registerRepeats();
    registerOperations();
    
    import exposeWindow from "../resources/exposeWindow";

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
        plugins: {
            toolbox: ContinuousToolboxPlugin.ContinuousToolbox,
            flyoutsVerticalToolbox: ContinuousToolboxPlugin.ContinuousFlyout,
            metricsManager: ContinuousToolboxPlugin.ContinuousMetrics,
        },
    };

    // patch Blockly to fix zooming with the toolbox
    Blockly.VerticalFlyout.prototype.getFlyoutScale = function() {
      return config.zoom.startScale;
    };
    // patch Blockly to add a max width to the toolbox
    // note, some code for handling RTL is removed here
    // some code for something about Workspace with no scrollbars where this is permanently open on the left. is also removed
    Blockly.VerticalFlyout.prototype.reflowInternal_ = function() {
      this.workspace_.scale = this.getFlyoutScale();
      let flyoutWidth = 0;
      const blocks = this.workspace_.getTopBlocks(false);
      for (let i = 0, block; (block = blocks[i]); i++) {
        let width = block.getHeightWidth().width;
        if (block.outputConnection) {
          width -= this.tabWidth_;
        }
        flyoutWidth = Math.max(flyoutWidth, width);
      }
      for (let i = 0, button; (button = this.buttons_[i]); i++) {
        flyoutWidth = Math.max(flyoutWidth, button.width);
      }
      flyoutWidth += this.MARGIN * 1.5 + this.tabWidth_;
      flyoutWidth *= this.workspace_.scale;
      flyoutWidth += Blockly.Scrollbar.scrollbarThickness;
      
      flyoutWidth = Math.min(
        flyoutWidth,
        250
      );

      if (this.width_ !== flyoutWidth) {
        for (let i = 0, block; (block = blocks[i]); i++) {
          if (this.rectMap_.has(block)) {
            this.moveRectToBlock_(this.rectMap_.get(block), block);
          }
        }
        
        this.width_ = flyoutWidth;
        this.position();
        this.targetWorkspace.resizeContents();
        this.targetWorkspace.recordDragTargets();
      }
    };

    let workspace;
    let compiler;
    let lastGeneratedCode = "";
    let initializingCode = false;

    let editTarget = State.editingTarget;

    let playerArea;
    
    onMount(() => {
        exposeWindow({
            Blockly,
            DarkTheme,
            JSZip,
            FileSaver,
            config,
            en,
            Toolbox,

            getWorkspace: () => workspace,
            getCompiler: () => compiler,
            getGeneratedCode: () => lastGeneratedCode,

            onMount,
            exposeWindow,
            registerGeneric,
            registerMovement,
            registerAppearance,
            registerActions,
            registerConditions,
            registerRepeats,
            registerOperations,
        });
    });

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
        console.log("ignore the warnings above we dont care about those");

        preload([
            "/sounds/confirm.mp3",
            "/sounds/explode.mp3",
            "/sounds/tabswitch.mp3",
        ]);

        window.onbeforeunload = () => "";
        compiler = new Compiler(workspace);
        // update editing target xml
        workspace.addChangeListener(() => {
            const editingTarget = State.getTargetById(editTarget);
            const dom = Blockly.Xml.workspaceToDom(workspace);
            editingTarget.xml = Blockly.Xml.domToText(dom);
        });

        // debug
        // window.addEventListener("keypress", () => {
        //     console.log(State.currentProject);
        // });
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

    let projectName = "";
    function downloadProject() {
        playSound("tabswitch");

        // generate file name
        let filteredProjectName = projectName.replace(/[^a-z0-9\-]+/gim, "_");
        let fileName = filteredProjectName + ".clamp";
        if (!filteredProjectName) {
            fileName = "MyProject.clamp";
        }

        // data
        const projectData = State.serializeProject(State.currentProject);

        // zip
        const zip = new JSZip();
        zip.file(
            "README.txt",
            "This file is not meant to be opened!" +
                "\nBe careful as you can permanently break your project!"
        );

        // workspaces
        const workspaces = zip.folder("workspaces");
        for (const character of State.currentProject.characters) {
            workspaces.file(character.id + ".xml", character.xml);
        }

        // data
        const data = zip.folder("data");
        data.file("project.json", projectData);

        // download
        zip.generateAsync({ type: "blob" }).then((blob) => {
            FileSaver.saveAs(blob, fileName);
        });
    }
    function loadProject() {
        playSound("tabswitch");

        fileDialog({ accept: ".clamp" }).then((files) => {
            if (!files) return;
            const file = files[0];

            // set project name
            const projectNameIdx = file.name.lastIndexOf(".clamp");
            projectName = file.name.substring(0, projectNameIdx);

            JSZip.loadAsync(file.arrayBuffer()).then(async (zip) => {
                console.log("loaded zip file...");

                // get project json from the data folder
                const dataFolder = zip.folder("data");
                const projectJsonString = await dataFolder
                    .file("project.json")
                    .async("string");
                const projectJson = JSON.parse(projectJsonString);

                // get project workspace xml stuffs
                const workspacesFolder = zip.folder("workspaces");
                const fileNames = [];
                workspacesFolder.forEach((_, file) => {
                    const fileName = file.name.replace("workspaces/", "");
                    fileNames.push(fileName);
                });
                // console.log(fileNames); // debug
                const idWorkspacePairs = {};
                for (const fileName of fileNames) {
                    const idx = fileName.lastIndexOf(".xml");
                    const id = fileName.substring(0, idx);
                    // assign to pairs
                    idWorkspacePairs[id] = await workspacesFolder
                        .file(fileName)
                        .async("string");
                }
                // console.log(idWorkspacePairs); // debug

                // laod
                console.log(projectJson); // debug
                State.loadProject(projectJson, idWorkspacePairs);
            });
        });
    }

    // editing target changes
    Emitter.on("EDITING_TARGET_UPDATED", () => {
        // update editing target
        editTarget = State.editingTarget;
        // update workspace to editing target workspace
        const target = State.getTargetById(editTarget);
        const xml = target.xml;
        const dom = Blockly.utils.xml.textToDom(xml);
        // clear workspace so we dont duplicate blocks
        workspace.clear();
        // set workspace
        Blockly.Xml.domToWorkspace(dom, workspace);

        // reload components
        reloadCharactersComponent();
        reloadPropertiesComponent();
    });

    // reloading character list on update
    // svelte doesnt have a reload component thing yet
    // so just do this lol
    let _reloadCharactersComponent = 1;
    function reloadCharactersComponent() {
        _reloadCharactersComponent = 0;
        setTimeout(() => {
            _reloadCharactersComponent = 1;
        }, 1);
    }
    // reload properties component
    let _reloadPropertiesComponent = 1;
    function reloadPropertiesComponent() {
        _reloadPropertiesComponent = 0;
        setTimeout(() => {
            _reloadPropertiesComponent = 1;
        }, 1);
    }
    // reload components on other menus being changed
    Emitter.on("RELOAD_IMAGE_COMPONENTS", () => {
        reloadCharactersComponent();
        reloadPropertiesComponent();
    });

    // character list
    function newCharacter() {
        // reload since character list updated and svelte doesnt know that
        reloadCharactersComponent();
    }

    // properties menu
    function switchCostume(e) {
        playSound("tabswitch");
        const idx = e.target.selectedIndex;
        const target = State.getTargetById(editTarget);
        target.startCostume = target.costumes[idx];
        reloadCharactersComponent();
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
            <NavigationOption
                style="height:48px;width:100%"
                on:click={loadProject}
            >
                <img
                    alt="Import"
                    src="/images/gui-icons/page-white-put-icon.png"
                    width="16"
                    style="margin-left:6px;margin-right:6px;"
                />
                <span style="margin-right:6px;">Import</span>
            </NavigationOption>
            <NavigationOption
                style="height:48px;width:100%"
                on:click={downloadProject}
            >
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

    <input
        class="project-name"
        type="text"
        placeholder="Project Name..."
        style="margin-left:4px;margin-right:4px"
        bind:value={projectName}
    />

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
                <!-- the toolbox takes up a lot of space so theres a button to hide it -->
                <button
                    on:click={() => {
                        blocklyToolboxIsVisible = !blocklyToolboxIsVisible;
                        workspace
                            .getFlyout()
                            .setContainerVisible(blocklyToolboxIsVisible);
                    }}
                    class="hide-toolbox"
                >
                    <img
                        src={blocklyToolboxIsVisible
                            ? "/images/gui-icons/arrow-rotate-left.png"
                            : "/images/gui-icons/arrow-rotate-right.png"}
                        alt="Hide Toolbox"
                    />
                </button>
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
                    {#if currentCharacterTab == "properties" && _reloadPropertiesComponent}
                        <div class="properties">
                            <p style="margin-block:5px">
                                • {State.getTargetById(editTarget).name}
                            </p>
                            <label>
                                Start as
                                <select
                                    on:change={switchCostume}
                                    value={State.getTargetById(editTarget)
                                        .startCostume}
                                >
                                    {#each State.getTargetById(editTarget).costumes as costumeID}
                                        <option value={costumeID}>
                                            {State.getImageById(costumeID).name}
                                        </option>
                                    {/each}
                                </select>
                                image
                            </label>
                            <div style="display:flex;flex-direction:row">
                                <div>
                                    X:
                                    <input
                                        type="number"
                                        value={State.getTargetById(editTarget)
                                            .position.x}
                                        on:change={(event) => {
                                            playSound("tabswitch");
                                            const target =
                                                State.getTargetById(editTarget);
                                            target.position.x =
                                                event.target.value;
                                            reloadPropertiesComponent();
                                        }}
                                        style="width:64px"
                                    />
                                </div>
                                <div style="margin-left:6px">
                                    Y:
                                    <input
                                        type="number"
                                        value={State.getTargetById(editTarget)
                                            .position.y}
                                        on:change={(event) => {
                                            playSound("tabswitch");
                                            const target =
                                                State.getTargetById(editTarget);
                                            target.position.y =
                                                event.target.value;
                                            reloadPropertiesComponent();
                                        }}
                                        style="width:64px"
                                    />
                                </div>
                            </div>
                            <div style="display:flex;flex-direction:row">
                                Size:
                                <input
                                    type="number"
                                    style="width:64px;margin-left:4px"
                                    value={State.getTargetById(editTarget).size}
                                    on:change={(event) => {
                                        playSound("tabswitch");
                                        const target =
                                            State.getTargetById(editTarget);
                                        target.size = event.target.value;
                                        reloadPropertiesComponent();
                                    }}
                                />
                                %
                            </div>
                            <div style="display:flex;flex-direction:row">
                                Rotated
                                <input
                                    type="number"
                                    style="width:64px;margin-left:4px;margin-right:4px"
                                    value={State.getTargetById(editTarget)
                                        .angle}
                                    on:change={(event) => {
                                        playSound("tabswitch");
                                        const target =
                                            State.getTargetById(editTarget);
                                        target.angle = event.target.value;
                                        reloadPropertiesComponent();
                                    }}
                                />
                                °
                            </div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={State.getTargetById(editTarget)
                                        .visible}
                                    on:change={(event) => {
                                        playSound("tabswitch");
                                        const target =
                                            State.getTargetById(editTarget);
                                        target.visible = event.target.checked;
                                        reloadPropertiesComponent();
                                    }}
                                />
                                Is Showing?
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={State.getTargetById(editTarget)
                                        .visibleHitbox}
                                    on:change={(event) => {
                                        playSound("tabswitch");
                                        const target =
                                            State.getTargetById(editTarget);
                                        target.visibleHitbox = event.target.checked;
                                        reloadPropertiesComponent();
                                    }}
                                />
                                Display Hitbox?
                            </label>
                        </div>
                    {/if}
                    {#if currentCharacterTab == "characters" && _reloadCharactersComponent}
                        <div class="characters">
                            {#each State.currentProject.characters as character}
                                <div class="character-preview-div">
                                    <button
                                        class="box"
                                        data-selected={editTarget ===
                                            character.id}
                                        on:click={() => newCharacter()}
                                    >
                                        <img
                                            alt={character.name}
                                            title={character.name}
                                            class="character-image-preview"
                                            src={State.getImageById(
                                                character.startCostume
                                            ).image}
                                        />
                                    </button>
                                    <p class="character-preview-name">
                                        {character.name}
                                    </p>
                                </div>
                            {/each}
                            <div class="character-preview-div">
                                <button
                                    class="box"
                                    on:click={() => newCharacter()}
                                >
                                    <img
                                        alt={"New"}
                                        title={"Create a new Character"}
                                        class="character-image-preview"
                                        style="width:32px;height:32px;image-rendering: pixelated;"
                                        src={"/images/gui-icons/add-icon.png"}
                                    />
                                </button>
                                <p class="character-preview-name">New</p>
                            </div>
                        </div>
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

    .hide-toolbox {
        position: absolute;
        bottom: 0px;
        left: 0px;

        width: 32px;
        height: 32px;
        margin: 0;
        padding: 0;

        background: transparent;
        border: 0;
        border-radius: 0;

        z-index: 100000;

        cursor: pointer;
    }
    .hide-toolbox > img {
        position: absolute;
        bottom: 0px;
        left: 0px;

        width: 32px;
        height: 32px;
        margin: 0;
        padding: 0;

        image-rendering: pixelated;
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
        margin-left: 6px;
        display: flex;
        flex-direction: column;
    }
    .characters {
        width: 100%;
        overflow-x: auto;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .character-preview-div {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: calc(5.5em + 32px);
    }
    .character-image-preview {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .character-preview-name {
        width: 60%;
        color: white;
        text-align: center;
        margin-block: 0;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .box {
        position: relative;
        width: 5.5em;
        height: 5.5em;
        padding: 8px;
        border: 4px solid rgba(255, 255, 255, 0.25);
        border-radius: 16px;
        background: transparent;
        margin: 8px;
        cursor: pointer;
    }
    .box:focus,
    .box:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    .box:active {
        background: rgba(255, 255, 255, 0.25);
    }
    .box[data-selected="true"] {
        border: 4px solid #b200fe;
    }
</style>
