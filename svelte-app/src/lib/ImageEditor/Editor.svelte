<script>
    import State from "../../resources/state";
    import BlobAndDataUrl from "../../resources/blobanddataurl";
    import Emitter from "../../resources/emitter";

    import proxyFetch from "../../resources/proxyFetch";

    import FileSaver from "file-saver";
    import fileDialog from "../../resources/fileDialog";

    import ImageLibrary from "./library.json";

    let selectedCostume = "";
    let selectedCostumeType = "bitmap"; // can be bitmap, vector, or animated
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

    function playSound(name) {
        const audio = new Audio(`/sounds/${name}.mp3`);
        audio.play();
        audio.volume = 0.5;
    }

    function updateCostumeType() {
        selectedCostumeType = "bitmap";
        if (!selectedCostume) return;
        const costumeObject = State.getImageById(selectedCostume);
        // .image is either a url or data url btw
        const url = costumeObject.image;
        if (!url) return;
        proxyFetch(url)
            .then(res => {
                if (!res.ok) return;
                const contentType = res.headers.get("Content-Type");
                switch (contentType) {
                    case 'image/apng':
                    case 'image/gif':
                        selectedCostumeType = 'animated';
                        break;
                    case 'image/svg+xml':
                        selectedCostumeType = 'vector';
                        break;
                }
            });
    }

    function selectCostume(id) {
        const character = State.getTargetById(target);
        if (!character) return;
        const idx = character.costumes.indexOf(id);
        if (idx === -1) return;

        playSound("tabswitch");
        selectedCostume = id;
        updateCostumeType();
        reloadComponent();
    }

    async function newCostume() {
        playSound("confirm");
        const imageObject = await State.createImage(
            "Image",
            "https://clamp-coding.vercel.app/images/empty64.png"
        );
        State.addImageToCharacter(target, imageObject.id);
        selectedCostume = imageObject.id;
        updateCostumeType();
        reloadComponent();
        reloadEditorComponents();
    }
    function importCostume() {
        playSound("tabswitch");
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
            fr.onload = async () => {
                // file readed lets make image
                const dataUrl = fr.result;
                const imageObject = await State.createImage(costumeName, dataUrl);

                // add image to character
                State.addImageToCharacter(target, imageObject.id);
                selectedCostume = imageObject.id;
                updateCostumeType();
                reloadComponent();
                reloadEditorComponents();

                playSound("confirm");
            };
            // read file
            fr.readAsDataURL(file);
        });
    }

    function deleteCostume(costumeId, skipConfirm) {
        const character = State.getTargetById(target);
        if (!character) return;

        if (!skipConfirm) {
            if (!confirm("Do you want to delete this costume?")) return;
        }

        // remove costume from costume list
        const idx = character.costumes.indexOf(costumeId);
        if (idx === -1) return;
        character.costumes.splice(idx, 1);
        State.deleteImage(costumeId);
        if (selectedCostume === costumeId) {
            selectedCostume = character.costumes[0];
        }
        updateCostumeType();

        if (character.startCostume === costumeId) {
            character.startCostume = character.costumes[0];
        }

        playSound("explode");

        reloadComponent();
        reloadEditorComponents();

        // if (costumeId.startsWith("_hardcoded")) return;
    }

    function downloadBlob(blob, fileName) {
        FileSaver.saveAs(blob, fileName);
    }
    async function exportCostume() {
        playSound("tabswitch");

        if (!selectedCostume) return;
        const costumeObject = State.getImageById(selectedCostume);
        const costumeNameFiltered = `${costumeObject.name.replace(/[^0-9a-zA-Z-]+/gim, "_")}`;
        // .image is either a url or data url btw
        const url = costumeObject.image;
        if (!url) return;

        if (url.startsWith("data:")) {
            // data url, no need to fetch when we have the data
            const blob = BlobAndDataUrl.base64DataURLtoBlob(url);
            const fileType = await BlobAndDataUrl.fileTypeFromBlob(blob);
            const fileName = `${costumeNameFiltered}.${fileType}`;
            downloadBlob(blob, fileName);
            return;
        }
        // url, we need to fetch the image data
        try {
            const response = await proxyFetch(url);
            if (!response.ok) throw new Error(`Response status code ${response.status};`);
            const blob = await response.blob();
            const fileType = await BlobAndDataUrl.fileTypeFromBlob(blob);
            const fileName = `${costumeNameFiltered}.${fileType}`;
            downloadBlob(blob, fileName);
        } catch (err) {
            alert("Failed to download the image.");
            throw err;
        }
    }
    // image libraru
    let isImageLibraryOpen = false;
    function openCostumeLibrary() {
        playSound("tabswitch");
        isImageLibraryOpen = true;
    }
    async function importLibraryImage(image) {
        playSound("confirm");
        const imageObject = await State.createImage(image.name, image.image);
        State.addImageToCharacter(target, imageObject.id);
        selectedCostume = imageObject.id;
        updateCostumeType();
        reloadComponent();
        reloadEditorComponents();
    }
</script>

{#if isImageLibraryOpen}
    <div class="library">
        <div class="library-title">
            <h1>Images</h1>
        </div>
        <div class="library-contents">
            {#each ImageLibrary as image}
                <button
                    class="library-item"
                    on:click={() => importLibraryImage(image)}
                >
                    <img
                        src={image.image}
                        alt={image.name}
                        title={image.name}
                        class="library-image"
                    />
                    <p style="margin-block:0">{image.name}</p>
                </button>
            {/each}
        </div>
        <div class="library-footer">
            <button
                class="library-exit"
                on:click={() => {
                    isImageLibraryOpen = false;
                    playSound("tabswitch");
                }}
            >
                Cancel
            </button>
        </div>
    </div>
    <div class="backing" />
{/if}
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
            <!-- Choose Library Image Button -->
            <div class="costume-preview-div">
                <button class="box" on:click={() => openCostumeLibrary()}>
                    <img
                        alt={"Find an Image from a Library"}
                        title={"Find an Image from a Library"}
                        class="image-preview"
                        style="width:32px;height:32px;image-rendering: pixelated;"
                        src={"/images/gui-icons/folder-magnify-icon.png"}
                    />
                </button>
                <p class="costume-name">Find</p>
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
        {#if selectedCostumeType === 'vector'}
            <!-- TODO: Add support for Vector-based images. -->
            <p><i>This image is vector-based. This format is not yet supported, and will become a bitmap when edited.</i></p>
        {:else if selectedCostumeType === 'animated'}
            <p><i>This image may be animated. Animated images will become static images when edited.</i></p>
        {/if}
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
        width: 100%;
        height: calc(90% - 88px);

        overflow: auto;

        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        align-items: baseline;
        align-content: flex-start;
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

    .library-item {
        width: 128px;

        margin: 6px;

        border: white 4px solid;
        background: transparent;
        color: white;

        cursor: pointer;
    }
    .library-item:focus,
    .library-item:hover {
        font-weight: bold;
    }
    .library-item:active {
        background: rgba(255, 255, 255, 0.15);
        font-weight: bold;
    }
    .library-image {
        width: 100px;
        height: 100px;

        margin: 4px;

        object-fit: contain;
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
        padding: 4px 8px;
        background: rgb(163,0,232);
        background: linear-gradient(0deg, rgba(163,0,232,1) 49%, rgba(191,41,255,1) 50%);
        color: white;
        border: 1px solid white;
        border-radius: 8px;
        font-size: 20px;
        cursor: pointer;
    }
    .export-button:active {
        background: rgb(140,0,201);
        background: linear-gradient(0deg, rgba(140,0,201,1) 48%, rgb(158, 34, 211) 49%);
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
