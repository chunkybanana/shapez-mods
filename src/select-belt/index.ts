import { Mod } from "mods/mod";
import { keyToKeyCode } from "game/key_action_mapper";
import metadata from "./mod.json";
import { SelectBeltHUDPart } from "./logic";
import { ModMetadata } from "mods/modloader";
import { GameHUD } from "game/hud/hud";

class SelectBeltMod extends Mod {
    init() {
        this.modInterface.registerIngameKeybinding({
            id: "select-belt",
            keyCode: keyToKeyCode("Z"),
            translation: "Selects the belt/wire under the cursor",
            modifiers: {
                shift: true
            }
        }); // Handler is called when the key is pressed
        this.modInterface.runAfterMethod(GameHUD, "initialize", function () {
            this.parts["selectBelt"] = new SelectBeltHUDPart(this.root);
            this.parts["selectBelt"].initialize();
        });
    }
}

registerMod(SelectBeltMod, (metadata as any) as ModMetadata);
