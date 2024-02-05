export default (Blockly, config) => {
    // patch Blockly to fix zooming with the toolbox
    Blockly.VerticalFlyout.prototype.getFlyoutScale = function () {
        return config.zoom.startScale;
    };
    // patch Blockly to add a max width to the toolbox
    // note, some code for handling RTL is removed here
    // some code for something about Workspace with no scrollbars where this is permanently open on the left. is also removed
    Blockly.VerticalFlyout.prototype.reflowInternal_ = function () {
        this.workspace_.scale = this.getFlyoutScale();
        let flyoutWidth = 0;
        const blocks = this.workspace_.getTopBlocks(false);
        for (let i = 0, block; (block = blocks[i]); i++) {
            let width = block.getHeightWidth().width;
            if (block.outputConnection) {
                width -= this.tabWidth_;
            }
            flyoutWidth = Math.max(flyoutWidth, width);
        }
        for (let i = 0, button; (button = this.buttons_[i]); i++) {
            flyoutWidth = Math.max(flyoutWidth, button.width);
        }
        flyoutWidth += this.MARGIN * 1.5 + this.tabWidth_;
        flyoutWidth *= this.workspace_.scale;
        flyoutWidth += Blockly.Scrollbar.scrollbarThickness;

        flyoutWidth = Math.min(
            flyoutWidth,
            250
        );

        if (this.width_ !== flyoutWidth) {
            for (let i = 0, block; (block = blocks[i]); i++) {
                if (this.rectMap_.has(block)) {
                    this.moveRectToBlock_(this.rectMap_.get(block), block);
                }
            }

            this.width_ = flyoutWidth;
            this.position();
            this.targetWorkspace.resizeContents();
            this.targetWorkspace.recordDragTargets();
        }
    };
};