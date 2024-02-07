<script>
    import Emitter from "../../resources/emitter";
    export let workspace;
    
    function playSound(name) {
        const audio = new Audio(`/sounds/${name}.mp3`);
        audio.play();
        audio.volume = 0.5;
    }

    let inDisplay = false;
    let currentDisplay = {
        eventId: '_',
        id: "_", // target ID
        name: 'variable', // name of the object we are creating in the menu
        hasOptions: true,
        options: [
            { name: 'For this character', value: 'character' },
            { name: 'For the whole project', value: 'project' },
        ],
    };
    const queue = [];

    let varName = '';
    let varType = '';

    const evaluateState = () => {
        if (queue.length <= 0) {
            inDisplay = false;
            currentDisplay = {};
            return;
        }
        inDisplay = true;
        currentDisplay = queue[0];
        currentDisplay.hasOptions = currentDisplay.options && currentDisplay.options[0];
        if (currentDisplay.hasOptions && !varType) {
            varType = currentDisplay.options[0].value;
        }
    };

    Emitter.on('DISPLAY_VARIABLE_MENU', (display) => {
        queue.push(display);
        evaluateState();
    });
    const closeMenu = (cancel) => {
        playSound('tabswitch');
        if (!cancel) {
            if (varName.trim().length <= 0) {
                return alert(`You need to set a name for this ${currentDisplay.name}!`);
            }
            if (!varType && currentDisplay.hasOptions) {
                return alert(`You need to select a type for this ${currentDisplay.name}!`);
            }
        }
        const result = {
            eventId: currentDisplay.eventId,
            id: currentDisplay.id,
            cancel,
            name: varName,
            type: varType,
        };
        Emitter.emitGlobal('CLOSE_VARIABLE_MENU', result);
        workspace.refreshToolboxSelection();
        varName = '';
        varType = '';
        queue.splice(0, 1);
        evaluateState();
    };
</script>

{#if inDisplay}
    <div class="modal">
        <div class="modal-title">
            <h1>Create {currentDisplay.name}</h1>
        </div>
        <div class="modal-contents">
            <p>
                <label>
                    Name:
                    <input type="text" size="50" bind:value={varName}>
                </label>
            </p>
            {#if currentDisplay.hasOptions}
                <div>
                    {#each currentDisplay.options as option}
                        <label>
                            <input
                                type="radio"
                                value={option.value}
                                bind:group={varType}
                            >
                            {option.name}
                        </label>
                    {/each}
                </div>
            {/if}
        </div>
        <div class="modal-footer">
            <button class="modal-exit" on:click={() => closeMenu(false)}>
                Create
            </button>
            <button class="modal-exit gray" on:click={() => closeMenu(true)}>
                Cancel
            </button>
        </div>
    </div>
    <div class="backing" />
{/if}

<style>
    .modal {
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
    input[type="text"] {
        padding: 4px;
    }

    .modal-title {
        width: 90%;
        height: 88px;

        display: flex;
        flex-direction: column;
        align-items: center;

        border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    }
    .modal-contents {
        width: calc(100% - 16px);
        height: calc(90% - 104px);
        padding: 8px;
        overflow: auto;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .modal-footer {
        width: 90%;
        height: 10%;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        border-top: 1px solid rgba(255, 255, 255, 0.5);
    }

    .modal-exit {
        width: 50%;
        height: 75%;
        margin: 0 8px;

        background: rgb(163,0,232);
        background: linear-gradient(0deg, rgba(163,0,232,1) 49%, rgba(191,41,255,1) 50%);
        color: white;
        border: 1px solid white;
        border-radius: 8px;

        font-size: 20px;
        cursor: pointer;
    }
    .modal-exit:active {
        background: rgb(140,0,201);
        background: linear-gradient(0deg, rgba(140,0,201,1) 48%, rgb(158, 34, 211) 49%);
    }

    .gray {
        filter: grayscale(1);
    }
</style>