<script>
    // Components
    import NavigationBar from "$lib/NavigationBar/NavigationBar.svelte";
    import NavigationMargin from "$lib/NavigationBar/NavigationMargin.svelte";
    import NavigationOption from "$lib/NavigationBar/NavigationOption.svelte";
    // Toolbox
    import Toolbox from "$lib/Toolbox/Toolbox.xml?raw";

    import Blockly from "blockly/core";
    import DarkTheme from "@blockly/theme-dark";

    import En from "blockly/msg/en";
    import "blockly/blocks";
    import "blockly/javascript";

    import BlocklyComponent from "svelte-blockly";

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
    };

    let workspace;
    let code = "";
</script>

<NavigationBar>
    <NavigationOption>
        <img
            alt="RunIcon"
            src="/images/gui-icons/arrow-rotate-anticlockwise-icon.png"
            width="24"
        />
        Compile
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
