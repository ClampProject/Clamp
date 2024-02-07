<div class="modal">
    <div class="modal-title">
        <h1>Settings</h1>
    </div>
    <div class="modal-contents" />
    <div class="modal-footer">
        <button class="modal-exit">
            OK
        </button>
    </div>
</div>
<div class="backing" />

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
        flex-wrap: nowrap;
        flex-direction: column;
        align-items: flex-start;
    }
    .modal-footer {
        width: 90%;
        height: 10%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        border-top: 1px solid rgba(255, 255, 255, 0.5);
    }

    .modal-exit {
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
    .modal-exit:active {
        background: rgb(140,0,201);
        background: linear-gradient(0deg, rgba(140,0,201,1) 48%, rgb(158, 34, 211) 49%);
    }
</style>