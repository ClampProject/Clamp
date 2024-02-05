import * as Blockly from 'blockly/core';

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Combination text + drop-down field
 * @author tmickel@mit.edu (Tim Mickel)
 */

export class FieldTextDropdown extends Blockly.FieldTextInput {
    /**
     * Class for a combination text + drop-down field.
     * @param {string} text The initial content of the text field.
     * @param {(!Array.<!Array.<string>>|!Function)} menuGenerator An array of
     *     options for a dropdown list, or a function which generates these options.
     * @param {Function=} opt_validator An optional function that is called
     *     to validate any constraints on what the user entered.  Takes the new
     *     text as an argument and returns the accepted text or null to abort
     *     the change.
     * @param {RegExp=} opt_restrictor An optional regular expression to restrict
     *     typed text to. Text that doesn't match the restrictor will never show
     *     in the text field.
     * @extends {Blockly.FieldTextInput}
     * @constructor
     */
    constructor (text, menuGenerator, opt_validator, opt_restrictor) {
        super(text || '', opt_validator, opt_restrictor);
        this.menuGenerator_ = menuGenerator;
        this.dropdownValue_ = false;
    };

    /**
     * Construct a FieldTextDropdown from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} element A JSON object with options.
     * @returns {!Blockly.FieldTextDropdown} The new field instance.
     * @package
     * @nocollapse
     */
    static fromJson (element) {
        var field =
            new FieldTextDropdown(element['text'], element['options']);
        if (typeof element['spellcheck'] == 'boolean') {
            field.setSpellcheck(element['spellcheck']);
        }
        return field;
    };

    /**
     * Install this text drop-down field on a block.
     */
    init () {
        if (this.fieldGroup_) {
            // Text input + dropdown has already been initialized once.
            return;
        }
        super.init.call(this);
        // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
        // Positioned on render, after text size is calculated.
        if (!this.arrow_) {
            /** @type {Number} */
            this.arrowSize_ = 12;
            /** @type {Number} */
            this.arrowX_ = 0;
            /** @type {Number} */
            this.arrowY_ = 11;
            this.arrow_ = Blockly.utils.dom.createSvgElement('image',
                {
                    'height': this.arrowSize_ + 'px',
                    'width': this.arrowSize_ + 'px',
                    'style': 'filter: brightness(0)'
                });
            this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
                'xlink:href', './block-menu-arrow.svg');
            this.arrow_.style.cursor = 'pointer';
            this.fieldGroup_.appendChild(this.arrow_);
            this.mouseUpWrapper_ =
                Blockly.browserEvents.bind(this.arrow_, 'mouseup', this, this.showDropdown_);
        }
        // Prevent the drop-down handler from changing the field colour on open.
        this.disableColourChange_ = true;
    };

    /**
     * Close the input widget if this input is being deleted.
     */
    dispose () {
        if (this.mouseUpWrapper_) {
            Blockly.browserEvents.unbind(this.mouseUpWrapper_);
            this.mouseUpWrapper_ = null;
            Blockly.Touch.clearTouchIdentifier();
        }
        super.dispose.call(this);
    };

    /**
     * Runs when an item is run.
     */
    onItemSelected (_, menuItem) {
        this.setValue(menuItem.getValue())
    }

    /**
     * Return a list of the options for this dropdown.
     * @return {!Array.<!Array>} Array of option tuples:
     *     (human-readable text or image, language-neutral name).
     */
    getOptions () {
        if (typeof this.menuGenerator_ === 'function') {
            return this.menuGenerator_.call(this);
        }
        return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
    };

    /**
     * If the drop-down isn't open, show the text editor.
     */
    showEditor_ () {
        if (!this.dropDownOpen_) {
            super.showEditor_.call(this, null, null,
                true, function () {
                    // When the drop-down arrow is clicked, hide text editor and show drop-down.
                    Blockly.WidgetDiv.hide();
                    this.showDropdown_();
                    Blockly.Touch.clearTouchIdentifier();
                });
        }
    };

    /**
     * Return a list of the options for this dropdown.
     * See: Blockly.FieldDropDown.prototype.getOptions_.
     * @return {!Array.<!Array.<string>>} Array of option tuples:
     *     (human-readable text, language-neutral name).
     * @private
     */
    getOptions_ = Blockly.FieldDropdown.prototype.getOptions;

    /**
     * Create the dropdown menu.
     * @private
     */
    showDropdown_ = Blockly.FieldDropdown.prototype.showEditor_;

    /**
     * @return {boolean} True if the option list is generated by a function.
     *     Otherwise false.
     */
    isOptionListDynamic = Blockly.FieldDropdown.prototype.isOptionListDynamic
}

Blockly.fieldRegistry.register('field_text_dropdown', FieldTextDropdown);