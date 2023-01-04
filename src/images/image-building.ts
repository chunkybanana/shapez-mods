import { MetaBuilding } from "game/meta_building";
import { Vector } from "core/vector";
/*
 * Due to technical limitations, images must have specific sizes. Several different sizes are supported.
 * */

export const enumImageVariants = {
    v1x1: "1x1",
    v2x2: "2x2",
    v3x3: "3x3",
    v4x4: "4x4",
    v8x8: "8x8",
    v2x1: "2x1",
    v3x2: "3x2",
    v2x3: "2x3",
    v1x2: "1x2"
};

export const enumImageSizes = {
    "1x1": new Vector(1, 1),
    "2x2": new Vector(2, 2),
    "3x3": new Vector(3, 3),
    "4x4": new Vector(4, 4),
    "8x8": new Vector(8, 8),
    "2x1": new Vector(2, 1),
    "3x2": new Vector(3, 2),
    "2x3": new Vector(2, 3),
    "1x2": new Vector(1, 2)
};

export class ImageBuilding extends MetaBuilding {
    constructor() {
        super("image_building");
    }
    getSprite() {
        return null;
    }
    getBlueprintSprite() {
        return null;
    }
    getDimensions(variant: keyof typeof enumImageVariants) {
        return enumImageSizes[variant];
    }
}
