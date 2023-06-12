<script>
    import State from "../../resources/state";
    import BlobAndDataUrl from "../../resources/blobanddataurl";
    import Emitter from "../../resources/emitter";

    import proxyFetch from "../../resources/proxyFetch";

    import FileSaver from "file-saver";
    import fileDialog from "file-dialog";

    let selectedCostume = "";
    // target is an ID, not the character object
    export let target;

    // svelte doesnt have a reload component thing yet
    // so just do this lol
    let _reloadComponent = 1;
    function reloadComponent() {
        _reloadComponent = 0;
        setTimeout(() => {
            _reloadComponent = 1;
        }, 1);
    }
    function reloadEditorComponents() {
        Emitter.emit("RELOAD_IMAGE_COMPONENTS");
    }

    function selectCostume(id) {
        selectedCostume = id;
        reloadComponent();
    }

    function newCostume() {
        const imageObject = State.createImage(
            "Image",
            "https://clamp-coding.vercel.app/images/empty64.png"
        );
        State.addImageToCharacter(target, imageObject.id);
        selectedCostume = imageObject.id;
        reloadComponent();
        reloadEditorComponents();
    }
    function importCostume() {
        // ask for file input
        fileDialog({ accept: "image/*" }).then((files) => {
            if (!files) return;
            const file = files[0];

            // create costume name
            const costumeNameIdx = file.name.lastIndexOf(".");
            const costumeName = file.name.substring(0, costumeNameIdx);

            // fr?!? 💀
            const fr = new FileReader();
            fr.onerror = () => {
                alert("Failed to import the image.");
            };
            fr.onload = () => {
                // file readed lets make image
                const dataUrl = fr.result;
                const imageObject = State.createImage(costumeName, dataUrl);

                // add image to character
                State.addImageToCharacter(target, imageObject.id);
                selectedCostume = imageObject.id;
                reloadComponent();
                reloadEditorComponents();
            };
            // read file
            fr.readAsDataURL(file);
        });
    }

    function deleteCostume(costumeId, skipConfirm) {
        if (!skipConfirm) {
            if (!confirm("Do you want to delete this costume?")) return;
        }

        const character = State.getTargetById(target);
        if (!character) return;

        // remove costume from costume list
        const idx = character.costumes.indexOf(costumeId);
        if (idx == -1) return;
        character.costumes.splice(idx, 1);
        selectedCostume = character.costumes[0];

        if (character.startCostume === costumeId) {
            character.startCostume = character.costumes[0];
        }

        reloadComponent();
        reloadEditorComponents();

        // if (costumeId.startsWith("_hardcoded")) return;
    }

    function downloadBlob(blob, fileName) {
        FileSaver.saveAs(blob, fileName);
    }
    function exportCostume() {
        if (!selectedCostume) return;
        const costumeObject = State.getImageById(selectedCostume);
        // .image is either a url or data url btw
        const url = costumeObject.image;
        if (!url) return;

        if (url.startsWith("data:")) {
            // data url, no need to fetch when we have the data
            const blob = BlobAndDataUrl.dataURLtoBlob(url);
            downloadBlob(
                blob,
                `${costumeObject.name.replace(/[^0-9a-zA-Z-]+/gim, "_")}.png`
            );
        } else {
            // url, we need to fetch the image data
            proxyFetch(url)
                .then((response) => {
                    if (!response.ok) {
                        alert("Failed to download the image.");
                        return;
                    }
                    response
                        .blob()
                        .then((blob) => {
                            downloadBlob(
                                blob,
                                `${costumeObject.name.replace(
                                    /[^0-9a-zA-Z-]+/gim,
                                    "_"
                                )}.png`
                            );
                        })
                        .catch(() => alert("Failed to download the image."));
                })
                .catch(() => alert("Failed to download the image."));
        }
    }
</script>

{#if _reloadComponent}
    <div class="main">
        <p style="margin-left:8px">• {State.getTargetById(target).name}</p>
        <div class="image-list">
            <!-- New Image Button -->
            <div class="costume-preview-div">
                <button class="box" on:click={() => newCostume()}>
                    <img
                        alt={"New Image"}
                        title={"New Image"}
                        class="image-preview"
                        style="width:32px;height:32px;image-rendering: pixelated;"
                        src={"/images/gui-icons/add-icon.png"}
                    />
                </button>
                <p class="costume-name">New</p>
            </div>
            <!-- Import Image Button -->
            <div class="costume-preview-div">
                <button class="box" on:click={() => importCostume()}>
                    <img
                        alt={"Import an Image"}
                        title={"Import an Image"}
                        class="image-preview"
                        style="width:32px;height:32px;image-rendering: pixelated;"
                        src={"/images/gui-icons/page-white-put-icon.png"}
                    />
                </button>
                <p class="costume-name">Import</p>
            </div>
            {#each State.getTargetById(target).costumes as costumeId}
                <div class="costume-preview-div">
                    <button
                        class="box"
                        data-selected={selectedCostume === costumeId}
                        on:click={() => selectCostume(costumeId)}
                    >
                        <button
                            class="delete-image-button"
                            style={State.getTargetById(target).costumes
                                .length <= 1
                                ? "cursor: not-allowed"
                                : ""}
                            on:click={(event) =>
                                State.getTargetById(target).costumes.length <= 1
                                    ? null
                                    : deleteCostume(costumeId, event.shiftKey)}
                        >
                            <!-- svelte-ignore a11y-img-redundant-alt -->
                            <img
                                src="/images/gui-icons/cancel-icon.png"
                                alt="Delete this Image"
                                title="Delete this Image"
                                style={State.getTargetById(target).costumes
                                    .length <= 1
                                    ? "filter: grayscale(1)"
                                    : ""}
                            />
                        </button>
                        <img
                            alt={State.getImageById(costumeId).name}
                            title={State.getImageById(costumeId).name}
                            class="image-preview"
                            src={State.getImageById(costumeId).image}
                        />
                    </button>
                    <p class="costume-name">
                        {State.getImageById(costumeId).name}
                    </p>
                </div>
            {/each}
        </div>
        <button class="export-button" on:click={exportCostume}>
            Download Image
        </button>
    </div>
{/if}

<style>
    .main {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
    }

    .image-list {
        width: 100%;
        overflow-x: auto;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .costume-preview-div {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: calc(5.5em + 32px);
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

    .image-preview {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .costume-name {
        width: 60%;
        color: white;
        text-align: center;
        margin-block: 0;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .export-button {
        margin: 8px;
        border: 0;
        border-radius: 8px;
        background: #b200fe;
        color: white;
        font-size: 20px;
        cursor: pointer;
    }
    .export-button:active {
        background: #d26aff;
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
</style>
