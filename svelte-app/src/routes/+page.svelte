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
    import ImageLibrary from "$lib/ImageEditor/library.json";
    import { saveFormatVersion } from "../resources/state/download";

    // import Blockly from "blockly/core";
    import Blockly from "blockly/core";
    import DarkTheme from "@blockly/theme-dark";
    import * as ContinuousToolboxPlugin from "@blockly/continuous-toolbox";
    import Patches from "../patches";

    // this gives event blocks a little bump at the top
    DarkTheme.startHats = true;
    const fontName = localStorage.getItem('clamp:editorFont');
    DarkTheme.fontStyle = {
        family: `"${fontName || 'Arial'}", Arial, Helvetica, sans-serif`,
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
    import registerControls from "../resources/blocks/controls.js";
    registerMovement();
    registerAppearance();
    registerActions();
    registerConditions();
    registerRepeats();
    registerOperations();
    registerControls();

    import registerButtons from "../resources/buttons"
    onMount(() => {
        registerButtons(workspace)
    })
    
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
        renderer: "custom_renderer",
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

    Patches.Blockly.ToolboxFlyout(Blockly, config);
    Patches.Blockly.FlyoutButton(Blockly);
    Patches.Blockly.Renderer(Blockly);
    
    let workspace;
    let compiler;
    let playerArea;
    let lastGeneratedCode = "";
    let initializingCode = false;
    
    let editTarget = State.editingTarget;
    
    const tabs = {};
    let currentTab = "blocks";

    const characterTabs = {};
    let currentCharacterTab = "properties";

    function playSound(name) {
        const audio = new Audio(`/sounds/${name}.mp3`);
        audio.play();
        audio.volume = 0.5;
    }
    
    // expose a bunch of internal functions & classes, eventually for custom scripts to use
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
            getPlayerArea: () => playerArea,
            getEditorTab: () => currentTab,
            getEditorCharacterTab: () => currentCharacterTab,

            onMount,
            exposeWindow,
            playSound,

            registerGeneric,
            registerMovement,
            registerAppearance,
            registerActions,
            registerConditions,
            registerRepeats,
            registerOperations,
            registerControls,
        }, true);
    });

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
        workspace.addChangeListener((...args) => {
            const editingTarget = State.getTargetById(editTarget);
            const dom = Blockly.Xml.workspaceToDom(workspace);
            editingTarget.xml = Blockly.Xml.domToText(dom);
            // fixes problems with certain blocks not working when not attached to anything
            Blockly.Events.disableOrphans(...args);
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
        const code = compiler.compile();
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
        updateProgram();
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

        State.createClampZip(State.currentProject, "blob", {
            projectName,
            fileName,
            time: Date.now()
        }).then((blob) => {
            FileSaver.saveAs(blob, fileName);
        });
    }
    function loadProject() {
        playSound("tabswitch");

        fileDialog({ accept: ".clamp" }).then((files) => {
            if (!files) return;
            const file = files[0];
            const fileName = file.name;

            // returning false means we should stop loading
            const formatVerFound = (version) => {
                const alertMessage = `This project was saved in a newer version of Clamp, and may not work here.`
                    + "\nThe site may become unstable or unusable. Do you still want to try loading this file?"
                    + "\n"
                    + `\n(file is v${version}, while you are using v${saveFormatVersion})`;
                if (saveFormatVersion < version) {
                    return confirm(alertMessage);
                }
                return true;
            };
            State.loadClampZip(file.arrayBuffer(), formatVerFound)
                .then((loaded) => {
                    if (!loaded) return;
                    // set project name
                    const projectNameIdx = fileName.lastIndexOf(".clamp");
                    projectName = fileName.substring(0, projectNameIdx);
                })
                .catch((err) => {
                    alert(err);
                    throw err;
                });
        });
    }
    
    // settings menu handler
    let isShowingSettingsMenu = false;
    let settingsMenuList;
    function updateSettingsList(deleting) {
        if (deleting) {
            return Emitter.emitGlobal('EDITOR_SETTINGS_CLOSING', settingsMenuList);
        }
        setTimeout(() => {
            Emitter.emitGlobal('EDITOR_SETTINGS_OPENED', settingsMenuList);
        });
    }

    // register settings menu items
    (() => {
        let settingsElements;
        const createElements = () => {
            const div = document.createElement('div');
            div.style.width = "100%";
            // customEditorFont
            const customEditorFont = div.appendChild(document.createElement('label'));
            customEditorFont.innerHTML = '<div><h2>Custom Editor Font</h2><p>Changes the font for the editor. <b>Font will only apply after refreshing the page.</b></p></div>';
            customEditorFont.style.margin = "8px 0";
            customEditorFont.style.display = 'flex';
            customEditorFont.style.alignItems = "center";
            customEditorFont.style.justifyContent = "space-between";
            const customEditorFontSelect = customEditorFont.appendChild(document.createElement('input'));
            customEditorFontSelect.value = localStorage.getItem('clamp:editorFont');
            customEditorFontSelect.style = 'margin-right:8px;';
            customEditorFontSelect.onchange = () => {
                const fontName = customEditorFontSelect.value || 'Arial';
                localStorage.setItem('clamp:editorFont', fontName);
                console.log('updated font to', fontName);
            };
            // forceLoopPauses
            const forceLoopPauses = div.appendChild(document.createElement('label'));
            forceLoopPauses.innerHTML = '<div><h2>Force Loops to pause</h2><p>Used if loops have a chance to repeat forever. Wait blocks will be required inside of forever loops (and loops that may repeat forever) if this is disabled.</p></div>';
            forceLoopPauses.style.margin = "8px 0";
            forceLoopPauses.style.display = 'flex';
            forceLoopPauses.style.alignItems = "center";
            forceLoopPauses.style.justifyContent = "space-between";
            const forceLoopPausesCheckbox = forceLoopPauses.appendChild(document.createElement('input'));
            forceLoopPausesCheckbox.checked = State.currentProject.settings.forceLoopPauses;
            forceLoopPausesCheckbox.type = 'checkbox';
            forceLoopPausesCheckbox.style = 'width:48px;height:48px;margin-right:8px;';
            forceLoopPausesCheckbox.onclick = () => {
                State.currentProject.settings.forceLoopPauses = forceLoopPausesCheckbox.checked;
            };
            // forceConditionalPauses
            const forceConditionalPauses = div.appendChild(document.createElement('label'));
            forceConditionalPauses.innerHTML = '<div><h2>Force Conditional Pauses</h2><p>Used if blocks can wait for a statement to be true, but have a chance to wait forever. If this is disabled, the page will freeze when a block is waiting forever.</p></div>';
            forceConditionalPauses.style.margin = "8px 0";
            forceConditionalPauses.style.display = 'flex';
            forceConditionalPauses.style.alignItems = "center";
            forceConditionalPauses.style.justifyContent = "space-between";
            const forceConditionalPausesCheckbox = forceConditionalPauses.appendChild(document.createElement('input'));
            forceConditionalPausesCheckbox.checked = State.currentProject.settings.forceConditionalPauses;
            forceConditionalPausesCheckbox.type = 'checkbox';
            forceConditionalPausesCheckbox.style = 'width:48px;height:48px;margin-right:8px;';
            forceConditionalPausesCheckbox.onclick = () => {
                State.currentProject.settings.forceConditionalPauses = forceConditionalPausesCheckbox.checked;
            };
            return div;
        };
        Emitter.on('EDITOR_SETTINGS_OPENED', (settingsMenuList) => {
            if (!settingsElements) settingsElements = createElements();
            settingsMenuList.appendChild(settingsElements);
        });
        Emitter.on('EDITOR_SETTINGS_CLOSING', () => {
            if (settingsElements) {
                settingsElements.remove();
            }
        });
    })();

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
        workspace.refreshToolboxSelection();

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
    async function newCharacter() {
        playSound("tabswitch");
        // create a costume
        const randomIdx = Math.round(Math.random() * (ImageLibrary.length - 1));
        const targetImageObject = ImageLibrary[randomIdx];
        const imageObject = await State.createImage(targetImageObject.name, targetImageObject.image);
        // create a character
        const characterNum = State.currentProject.characters.length;
        const character = State.generateCharacter(`Character${characterNum}`, null, null, [
            imageObject.id
        ]);
        State.createCharacter(character);
        playSound("confirm");
        // reload since character list updated and svelte doesnt know that
        reloadCharactersComponent();
    }
    function switchCharacter(id) {
        const character = State.getTargetById(id);
        if (!character) return;
        playSound("tabswitch");
        State.editingTarget = id;
        editTarget = id;
        Emitter.emitGlobal("EDITING_TARGET_UPDATED");
        reloadCharactersComponent();
    }
    function renameCharacter(id, name) {
        const character = State.getTargetById(id);
        if (!character) return;
        character.name = name;
        reloadCharactersComponent();
    }
    function deleteCharacter(id, showConfirm) {
        const character = State.getTargetById(id);
        if (!character) return;

        if (!showConfirm) {
            if (!confirm("Do you want to delete this character?")) return;
        }
        
        State.deleteCharacter(id, true);
        playSound("explode");

        if (State.editingTarget === id) {
            switchCharacter(State.currentProject.characters[0].id);
        } else {
            reloadCharactersComponent();
        }
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

    <NavigationOption on:click={() => {
        if (isShowingSettingsMenu) {
            // we wont be after click
            updateSettingsList(true);
        }
        isShowingSettingsMenu = !isShowingSettingsMenu;
        if (isShowingSettingsMenu) {
            // we were just shown
            updateSettingsList(false);
        }
        playSound("tabswitch");
    }}>
        <img
            alt="Gear"
            src="/images/gui-icons/cog-icon.png"
            width="16"
            style="margin-left:6px;margin-right:6px;"
        />
        <span style="margin-right:6px;">Settings</span>
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
    {#if isShowingSettingsMenu}
        <div class="library">
            <div class="library-title">
                <h1>Settings</h1>
            </div>
            <div class="library-contents" bind:this={settingsMenuList} />
            <div class="library-footer">
                <button
                    class="library-exit"
                    on:click={() => {
                        updateSettingsList(true);
                        isShowingSettingsMenu = false;
                        playSound("tabswitch");
                    }}
                >
                    OK
                </button>
            </div>
        </div>
        <div class="backing" />
    {/if}
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
                            title="Suspend Program"
                            src="/images/gui-icons/bomb-icon.png"
                        />
                        <div>
                            Suspend
                        </div>
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
                                        on:click={() => switchCharacter(character.id)}
                                    >
                                        <!-- del button -->
                                        <button
                                            class="delete-image-button"
                                            style={State.currentProject.characters
                                                .length <= 1
                                                ? "cursor: not-allowed"
                                                : ""}
                                            on:click={(event) =>
                                                State.currentProject.characters.length <= 1
                                                    ? null
                                                    : deleteCharacter(character.id, event.shiftKey)}
                                        >
                                            <!-- svelte-ignore a11y-img-redundant-alt -->
                                            <img
                                                src="/images/gui-icons/cancel-icon.png"
                                                alt="Delete this Character"
                                                title="Delete this Character"
                                                style={State.currentProject.characters
                                                    .length <= 1
                                                    ? "filter: grayscale(1)"
                                                    : ""}
                                            />
                                        </button>
                                        <!-- image -->
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
    .bar-button > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 10px;
    }

    .properties {
        margin-left: 6px;
        display: flex;
        flex-direction: column;
    }
    .characters {
        width: 100%;
        height: 100%;
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        align-content: flex-start;
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

    .delete-image-button {
        position: absolute;
        top: -12px;
        right: -12px;
        width: 24px;
        height: 24px;

        background: transparent;
        border: 0;

        cursor: pointer;
    }
    .delete-image-button > img {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 24px;
        height: 24px;
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

    /* settings menu */
    .library {
        position: absolute;
        left: 10%;
        top: 10%;
        width: 80%;
        height: 80%;

        display: flex;
        flex-direction: column;
        align-items: center;

        background: #222;
        border: white 4px solid;

        z-index: 80000;
    }
    .backing {
        position: absolute;
        left: 0%;
        top: 0%;
        width: 100%;
        height: 100%;

        background: rgba(0, 0, 0, 0.5);

        z-index: 70000;
    }

    .library-title {
        width: 90%;
        height: 88px;

        display: flex;
        flex-direction: column;
        align-items: center;

        border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    }
    .library-contents {
        width: calc(100% - 16px);
        height: calc(90% - 104px);
        padding: 8px;

        overflow: auto;

        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        align-items: flex-start;
    }
    .library-footer {
        width: 90%;
        height: 10%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        border-top: 1px solid rgba(255, 255, 255, 0.5);
    }

    .library-exit {
        width: 50%;
        height: 75%;

        background: rgb(163,0,232);
        background: linear-gradient(0deg, rgba(163,0,232,1) 49%, rgba(191,41,255,1) 50%);
        color: white;
        border: 1px solid white;
        border-radius: 8px;

        font-size: 20px;

        cursor: pointer;
    }
    .library-exit:active {
        background: rgb(140,0,201);
        background: linear-gradient(0deg, rgba(140,0,201,1) 48%, rgb(158, 34, 211) 49%);
    }
</style>
