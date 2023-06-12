<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let style = "";

    function event() {
        dispatch("click");
    }
</script>

<button {style} on:click={event}>
    <slot />
</button>

<style>
    button {
        position: relative;

        height: 100%;

        display: flex;
        flex-direction: row;
        align-items: center;

        color: white;
        font-size: 18px;
        background: transparent;
        cursor: pointer;
        border: 0;
    }
    button:focus,
    button:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    button:active {
        background: rgba(255, 255, 255, 0.3);
    }
</style>
