import Blockly from "blockly/core"

class CustomConstantProvider extends Blockly.zelos.ConstantProvider {
    init() {
        super.init()
        this.ROUNDEL = this.makeRoundel()
        this.ROUNDEDINVERTED = this.makeRoundedInverted()
    }

    makeRoundedInverted() {
        const maxWidth = this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH;
        const maxHeight = maxWidth * 2;

        function makeMainPath(blockHeight, up, right) {
            const remainingHeight = blockHeight > maxHeight ? blockHeight - maxHeight : 0;
            const height = blockHeight > maxHeight ? maxHeight : blockHeight;
            const radius = height / 2;
            return (
                Blockly.utils.svgPaths.lineOnAxis('h', (right ? 1 : -1) * radius) +
                Blockly.utils.svgPaths.arc(
                    'a',
                    '0 0,0',
                    radius,
                    Blockly.utils.svgPaths.point((up ? .5 : -.5) * radius, (up ? -1 : 1) * radius),
                ) +
                Blockly.utils.svgPaths.lineOnAxis('v', (right ? 1 : -1) * remainingHeight) +
                Blockly.utils.svgPaths.arc(
                    'a',
                    '0 0,0',
                    radius,
                    Blockly.utils.svgPaths.point((up ? -.5 : .5) * radius, (up ? -1 : 1) * radius),
                ) +
                Blockly.utils.svgPaths.lineOnAxis('h', (right ? -1 : 1) * radius)
            );
        }

        return {
            type: this.SHAPES.HEXAGONAL,
            isDynamic: true,
            width(height) {
                const halfHeight = height / 2;
                return halfHeight > maxWidth ? maxWidth : halfHeight;
            },
            height(height) {
                return height;
            },
            connectionOffsetY(connectionHeight) {
                return connectionHeight / 2;
            },
            connectionOffsetX(connectionWidth) {
                return -connectionWidth;
            },
            pathDown(height) {
                return makeMainPath(height, false, false);
            },
            pathUp(height) {
                return makeMainPath(height, true, false);
            },
            pathRightDown(height) {
                return makeMainPath(height, false, true);
            },
            pathRightUp(height) {
                return makeMainPath(height, false, true);
            },
        };
    }

    makeRoundel() {
        const maxWidth = this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH;
        const maxHeight = maxWidth * 2;

        function makeMainPath(blockHeight, up, right) {
            const remainingHeight = blockHeight > maxHeight ? blockHeight - maxHeight : 0;
            const height = blockHeight > maxHeight ? maxHeight : blockHeight;
            const radius = height / 2;
            return (
                Blockly.utils.svgPaths.arc(
                    'a',
                    '0 0,1',
                    radius,
                    Blockly.utils.svgPaths.point((up ? -.5 : .5) * radius, (up ? -.5 : .5) * radius),
                ) +
                Blockly.utils.svgPaths.lineOnAxis('h', (right ? .5 : -.5) * radius) +
                Blockly.utils.svgPaths.lineOnAxis('v', (up ? -1 : 1) * radius) +
                Blockly.utils.svgPaths.lineOnAxis('v', (right ? 1 : -1) * remainingHeight) +
                Blockly.utils.svgPaths.lineOnAxis('h', (right ? -.5 : .5) * radius) +
                Blockly.utils.svgPaths.arc(
                    'a',
                    '0 0,1',
                    radius,
                    Blockly.utils.svgPaths.point((up ? .5 : -.5) * radius, (up ? -.5 : .5) * radius),
                )
            );
        }

        return {
            type: this.SHAPES.ROUND,
            isDynamic: true,
            width(height) {
                const halfHeight = height / 2;
                return halfHeight > maxWidth ? maxWidth : halfHeight;
            },
            height(height) {
                return height;
            },
            connectionOffsetY(connectionHeight) {
                return connectionHeight / 2;
            },
            connectionOffsetX(connectionWidth) {
                return -connectionWidth;
            },
            pathDown(height) {
                return makeMainPath(height, false, false);
            },
            pathUp(height) {
                return makeMainPath(height, true, false);
            },
            pathRightDown(height) {
                return makeMainPath(height, false, true);
            },
            pathRightUp(height) {
                return makeMainPath(height, false, true);
            },
        };
    }

    /**
     * @param {Blockly.RenderedConnection} connection
     */
    shapeFor(connection) {
        let checks = connection.getCheck();
        if (!checks && connection.targetConnection) {
            checks = connection.targetConnection.getCheck();
        }
        if (connection.type == Blockly.ConnectionType.INPUT_VALUE || connection.type == Blockly.ConnectionType.OUTPUT_VALUE) {
            if (checks && checks.indexOf('JSONArray') !== -1) {
                return this.ROUNDEDINVERTED;
            } else if (checks && checks.indexOf('JSONObject') !== -1) {
                return this.ROUNDEL;
            }
        }
        return super.shapeFor(connection)
    }
}

class Renderer extends Blockly.zelos.Renderer {
    constructor() {
        super();
    }

    makeConstants_() {
        return new CustomConstantProvider();
    }
}

export default (Blockly) => {
    Blockly.blockRendering.unregister('custom_renderer') //weird bug
    Blockly.blockRendering.register('custom_renderer', Renderer)
};