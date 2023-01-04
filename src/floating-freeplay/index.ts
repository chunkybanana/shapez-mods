import { Mod } from "mods/mod";
import metadata from "./mod.json";
import { RandomNumberGenerator } from "core/rng";
import { GameRoot } from "game/root";
import { ShapeDefinition } from "game/shape_definition";
import { getDisassembly } from "./tmam";
import { ModMetadata } from "mods/modloader";

class SIFloatingFreeplayMod extends Mod {
    init() {
        /*this.modInterface.extendClass(GameRoot, ({ $old }) => ({
            computeFreeplayShape(level) {
                const layers = [];
                const rng = new RandomNumberGenerator(
                    this.root.map.seed + "/" + level
                );
            }
        }));*/
        let shape = ShapeDefinition.fromShortKey(
            "CuCu----:----CuCu:--Cu----:----Cu--"
        );
        console.log(getDisassembly(shape));
    }
}

// Shape Validation rules:
// 01--:--

registerMod(SIFloatingFreeplayMod, (metadata as any) as ModMetadata);
