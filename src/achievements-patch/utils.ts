import { enumAnalyticsDataSource } from "game/production_analytics";
import { GameRoot } from "game/root";
import { globalConfig } from "core/config";
import { ShapeDefinition } from "game/shape_definition";
import { formatBigNumber } from "core/utils";

let getRate = (root: GameRoot, key: string) => {
    return (
        root.productionAnalytics.getCurrentShapeRateRaw(
            enumAnalyticsDataSource.delivered,
            root.shapeDefinitionMgr.getShapeFromShortKey(key)
        ) /
        // @ts-ignore
        globalConfig.analyticsSliceDurationSeconds
    );
};

export { getRate };

const birdKey = "Sr------:--Cg--Cg:Sb--Sb--:--Cw--Cw";
const notRocketKey = "CbCuCbCu:SrCrSrCr:CwCwCwCw";
const scissorsKey = "Sr------:--CgCgCg:--Sb----:Cw--CwCw";
const rocketKey = "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw";
const logoKey = "RuCw--Cw:----Ru--";
const msLogoKey = "RgRyRbRr";
const oldLevel17Key = "WrRgWrRg:CwCrCwCr:SgSgSgSg";
const bpKey = "CbCbCbRb:CwCwCwCw";

export {
    birdKey,
    notRocketKey,
    scissorsKey,
    rocketKey,
    logoKey,
    msLogoKey,
    oldLevel17Key,
    bpKey
};

// Gets the number of layers stacking two shapes would produce before translation
// I used to have some smart code here but it wasn't smart enough
// So I've copied over the regular stacking code - Does the work twice but it's cached so it's fine
let getLayerCount = (def1: ShapeDefinition, def2: ShapeDefinition) => {
    const bottomShapeLayers = def1.layers;
    const bottomShapeHighestLayerByQuad = [-1, -1, -1, -1];

    for (let layer = bottomShapeLayers.length - 1; layer >= 0; --layer) {
        const shapeLayer = bottomShapeLayers[layer];
        for (let quad = 0; quad < 4; ++quad) {
            const shapeQuad = shapeLayer[quad];
            if (
                shapeQuad !== null &&
                bottomShapeHighestLayerByQuad[quad] < layer
            ) {
                bottomShapeHighestLayerByQuad[quad] = layer;
            }
        }
    }

    const topShapeLayers = def2.layers;
    const topShapeLowestLayerByQuad = [4, 4, 4, 4];

    for (let layer = 0; layer < topShapeLayers.length; ++layer) {
        const shapeLayer = topShapeLayers[layer];
        for (let quad = 0; quad < 4; ++quad) {
            const shapeQuad = shapeLayer[quad];
            if (shapeQuad !== null && topShapeLowestLayerByQuad[quad] > layer) {
                topShapeLowestLayerByQuad[quad] = layer;
            }
        }
    }

    /**
     * We want to find the number `layerToMergeAt` such that when the top shape is placed at that
     * layer, the smallest gap between shapes is only 1. Instead of doing a guess-and-check method to
     * find the appropriate layer, we just calculate all the gaps assuming a merge at layer 0, even
     * though they go negative, and calculating the number to add to it so the minimum gap is 1 (ends
     * up being 1 - minimum).
     */
    const gapsBetweenShapes = [];
    for (let quad = 0; quad < 4; ++quad) {
        gapsBetweenShapes.push(
            topShapeLowestLayerByQuad[quad] -
                bottomShapeHighestLayerByQuad[quad]
        );
    }
    const smallestGapBetweenShapes = Math.min(...gapsBetweenShapes);
    // Can't merge at a layer lower than 0
    const layerToMergeAt = Math.max(1 - smallestGapBetweenShapes, 0);
    return layerToMergeAt + topShapeLayers.length;
};

export { getLayerCount };

let createProgress = (numerator: number, denominator: number) => {
    return {
        percentage: (numerator / denominator) * 100,
        text: formatBigNumber(numerator) + "/" + formatBigNumber(denominator)
    };
};

export { createProgress };

let getMinLevel = (root: GameRoot) =>
    Math.min(
        ...(Object.keys(root.gameMode?.getUpgrades()).map((name: string) =>
            root.hubGoals.getUpgradeLevel(name)
        ) as number[])
    );

export { getMinLevel };
