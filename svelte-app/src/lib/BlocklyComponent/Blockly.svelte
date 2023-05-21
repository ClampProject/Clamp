<script>
    import { onMount } from "svelte";
    import Blockly from "blockly";

    let Component;

    onMount(() => {
        Blockly.inject(Component, {
            collapse: true,
            comments: true,
            scrollbars: true,
            disable: false,
        });
    });
</script>

<div bind:this={Component} />

<style>
    div {
        width: 1280px;
        height: 720px;
    }
</style>
