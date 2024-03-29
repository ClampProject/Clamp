<!-- Modified version of svelte-blockly -->
<!-- https://www.npmjs.com/package/svelte-blockly -->

<script context="module"></script>

<script>
    import { createEventDispatcher } from "svelte";
    import Blockly from "blockly/core.js";
    import registerDynamicCategories from "../../resources/categories";
    export let config = {};
    export let locale;
    export let workspace = undefined;
    export let transform = undefined;
    $: {
        // evaluate transform to establish a reactive dependency
        transform;
        applyTransform();
    }
    const dispatch = createEventDispatcher();
    let width, height;
    function initRoot(root, param) {
        function injectWorkspace(dom, { config, locale: { msg, rtl } }) {
            Blockly.setLocale(msg);
            workspace = Blockly.inject(root, {
                ...config,
                toolbox: '<xml><category name="Loading..." colour="100"></category></xml>',
                rtl,
            });
            registerDynamicCategories(workspace);
            workspace.updateToolbox(config.toolbox);
            workspace.refreshToolboxSelection();
            if (dom !== null) {
                try {
                    // don't record this reloading of the workspace for undo
                    Blockly.Events.recordUndo = false;
                    Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);
                    Blockly.Events.recordUndo = true;
                } catch (ex) {
                    console.warn(ex);
                }
            }
            workspace.addChangeListener(() => {
                dispatch("change");
            });
            // TODO this is a terrible hack, but there's no scroll event
            // translate is the most fundamental in a set of methods
            // that move and zoom the workspace
            // using an arrow function, so `this` is the component not the workspace
            const translate = workspace.translate.bind(workspace);
            workspace.translate = (x, y) => {
                translate(x, y);
                const { scrollX, scrollY, scale } = workspace;
                transform = { scrollX, scrollY, scale };
            };
            if (transform !== undefined) {
                applyTransform();
            } else {
                const { scrollX, scrollY, scale } = workspace;
                transform = { scrollX, scrollY, scale };
            }
        }
        injectWorkspace(null, param);
        return {
            update(param) {
                const dom = Blockly.Xml.workspaceToDom(workspace);
                workspace.dispose();
                injectWorkspace(dom, param);
            },
            destroy() {
                workspace.dispose();
                workspace = undefined;
            },
        };
    }
    function applyTransform() {
        if (workspace === undefined) return;
        const { scrollX, scrollY, scale } = transform;
        if (
            scrollX !== workspace.scrollX ||
            scrollY !== workspace.scrollY ||
            scale !== workspace.scale
        ) {
            workspace.setScale(scale);
            workspace.scroll(scrollX, scrollY);
        }
    }
    $: {
        // evaluate width & height to establish a reactive dependency
        width;
        height;
        if (workspace) {
            Blockly.svgResize(workspace);
        }
    }
    // TODO this breaks smooth scrolling; for now, transform is read-only
    // $: {
    // 	if (workspace && transform) {
    // 		const { scrollX, scrollY, scale } = transform;
    // 		workspace.scroll(scrollX, scrollY);
    // 		workspace.setScale(scale);
    // 	}
    // }
</script>

<div
    class="root"
    bind:offsetWidth={width}
    bind:offsetHeight={height}
    use:initRoot={{ config, locale }}
/>

<style>
    .root {
        width: 100%;
        height: 100%;
    }
</style>
