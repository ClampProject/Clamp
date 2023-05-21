<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function event() {
        dispatch("click");
    }
</script>

<button on:click={event}>
    <slot />
</button>

<style>
    button {
        height: 100%;

        display: flex;
        flex-direction: row;
        align-items: center;

        color: white;
        font-size: 24px;
        background: transparent;
        cursor: pointer;
    }
</style>
