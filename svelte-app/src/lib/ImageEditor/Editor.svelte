<script>
    import State from "../../resources/state";

    export let target;
</script>

<div class="main">
    <p>{State.getTargetById(target).name} images</p>
    {#each State.getTargetById(target).costumes as costumeId}
        <img
            alt={costumeId}
            title={costumeId}
            src={State.getImageById(costumeId).image}
        />
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
