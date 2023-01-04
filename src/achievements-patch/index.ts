import { Mod } from "mods/mod";
import metadata from "./mod.json";
import { getAchievements } from "./achievements";
import { AchievementPatchModStats, registerSignals } from "./signals";
import { GameState } from "core/game_state";

class AchievementsPatchMod extends Mod {
    async init() {
        let api: AchievementsAPI = globalThis.achievementsLibMod;

        api.addSystem({
            id: "vanilla",
            name: "shapez",
            achievements: await getAchievements,
            init: (system) => {
                this.signals.gameInitialized.add((root) => {
                    root.achievementPatchModStats = new AchievementPatchModStats();
                    registerSignals(
                        root,
                        root.achievementPatchModStats,
                        system,
                        this.modInterface,
                        globalThis.achievementsLibMod
                    );
                });

                this.signals.stateEntered.add((state: GameState) => {
                    if (
                        state.key == "InGameState" &&
                        // @ts-ignore
                        this.app.settings?.currentData?.settings?.theme ===
                            "dark"
                    ) {
                        system.completeAchievement("darkMode");
                    }
                });
            }
        });

        this.signals.gameSerialized.add((root, data) => {
            data.modExtraData[
                "achievement-mod-patch"
            ] = root.achievementPatchModStats.serialize();
        });

        this.signals.gameDeserialized.add((root, data) => {
            const errorText = root.achievementPatchModStats.deserialize(
                data.modExtraData["achievement-mod-patch"]
            );
            if (errorText)
                console.log(
                    "Error deserializing achievement-mod-patch: " + errorText
                );
        });

        /*let otherSystem = api.addSystem({
            id: "plantz",
            name: "plantz",
            achievements: [achievements[0]],
            init () {}
        });*/
    }
}
// @ts-ignore
registerMod(AchievementsPatchMod, metadata);
