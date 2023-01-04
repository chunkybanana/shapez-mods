import { ShapeDefinition, ShapeLayer } from "game/shape_definition";

type Odometer = number[] & { index?: number };

const odometerPatterns: Odometer[] = [
    [0, 0, -1, -1],
    [0, 0, 0, -1],
    [0, 0, 0, 0],
    [-1, 0, 0, -1],
    [-1, 0, 0, 0],
    [-1, -1, 0, 0]
].map((pattern: Odometer, index) => {
    pattern.index = index;
    return pattern;
});

let isSudoku = (arr) => arr.sort().join("") === "0123"; // Don't need to use numeric sort.

export function getDisassembly(shape: ShapeDefinition) {
    let binaryParts: boolean[][] = shape.layers.map((layer: ShapeLayer) =>
        layer.map((x) => !!x)
    );
    let binaryIndices = binaryParts
        .map((layer: boolean[]) =>
            layer
                .map((x, i) => [x, i])
                .filter(([x, i]: [boolean, number]) => x)
                .map(([_, i]: [boolean, number]) => i)
        )
        .map((v: number[]) => (v.length ? v : [-1])); // -1 is a placeholder for empty layers
    let maxLengths = binaryIndices.map((v) => v.length);

    let odometers = Array(3)
        .fill(0)
        .map((_) => structuredClone(odometerPatterns[0]));

    let toIndices = (odometer: Odometer) =>
        odometer.map((x: number, i: number) =>
            x == -1 ? 0 : binaryIndices[i][x]
        );

    let increment = () => {
        let incremented = false;
        for (let i = 0; i < odometers.length; i++) {
            let odometer = odometers[i];
            do {
                for (let layer = 0; layer < odometer.length; layer++) {
                    if (odometer[layer] == -1) continue;
                    odometer[layer]++;
                    if (odometer[layer] < maxLengths[layer]) {
                        incremented = true;
                        break;
                    }
                    odometer[layer] = 0;
                }
            } while (isSudoku(toIndices(odometer))); // no sudoku pieces allowed
            if (incremented) break;
            else {
                odometers[i] = structuredClone(
                    odometerPatterns[odometer.index + 1]
                );
                odometer = odometers[i];
                if (odometer) {
                    // If undefined, we're out of bounds
                    incremented = true;
                    break;
                }
                odometers[i] = structuredClone(odometerPatterns[0]);
            }
        }
    };

    let odometerCache = new Map();
    let toShape = (odometer: Odometer) => {
        let cached = odometerCache.get(odometer);
        if (cached) return cached;
        odometer = toIndices(odometer);
        let layers = shape.layers.map((layer: ShapeLayer, i: number) =>
            layer.map((x, j) => (odometer[i] == j ? x : null))
        );
        let result = new ShapeDefinition({ layers });
        console.log(layers, result);
        odometerCache.set(odometer, result);
        return result;
    };

    console.log(JSON.stringify(odometers));
    for (let i = 0; i < 20; i++) {
        increment();
        console.log(
            JSON.stringify(odometers[0]),
            toIndices(odometers[0]),
            toShape(odometers[0]),
            shape
        );
    }
}
