<script>
    import State from "../../resources/state";

    export let target;

    function playSoundId(soundId) {
        const sound = State.getSoundById(soundId);
        if (!sound) return;

        const player = new Audio(sound.data);
        player.play();
        player.onended = player.remove;
    }
</script>

<div class="main">
    <p style="margin-left:8px">• {State.getTargetById(target).name}</p>
    {#each State.getTargetById(target).sounds as soundId}
        <button on:click={() => playSoundId(soundId)}>
            <p>Play {State.getSoundById(soundId).name}</p>
        </button>
    {/each}
</div>

<style>
    .main {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
    }
</style>
