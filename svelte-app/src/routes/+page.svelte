<script>
    // Components
    import NavigationBar from "$lib/NavigationBar/NavigationBar.svelte";
    import NavigationMargin from "$lib/NavigationBar/NavigationMargin.svelte";
    import NavigationOption from "$lib/NavigationBar/NavigationOption.svelte";

    import BlocklyComponent from "$lib/BlocklyComponent/Blockly.svelte";
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
    <BlocklyComponent />
</div>

<style>
    .main {
        position: absolute;
        left: 0px;
        top: 0px;
    }
</style>
