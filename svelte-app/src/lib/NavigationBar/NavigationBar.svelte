<div>
    <img
        src="/images/icon.png"
        alt="Clamp Logo"
        class="logo-margin"
        style="height: 100%;"
    />
    <img
        src="/images/code.png"
        alt="Clamp Coding Logo"
        class="logo-margin"
        style="height: 100%;"
    />
    <slot />
</div>

<style>
    div {
        width: 100%;
        height: 3.25rem;
        /* overflow: hidden; */

        z-index: 100;
        padding: 4px;

        position: fixed;
        left: 0px;
        top: 0px;

        display: flex;
        flex-direction: row;
        align-items: center;

        background: #363636;
    }

    .logo-margin {
        margin-right: 8px;
    }
</style>
