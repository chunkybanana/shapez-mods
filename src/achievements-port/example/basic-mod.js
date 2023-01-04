// @ts-nocheck
const METADATA = {
    website: "https://example.com",
    author: "example",
    name: "Basic Achievements Example",
    version: "1.0.0",
    id: "achievements-port-example-basic-mod",
    description: "A basic example for the achievements mod",
    minimumGameVersion: ">=1.5.0",
    // If your mod saves data, you should set this to false
    doesNotAffectSavegame: true,
};

class Mod extends shapez.Mod {
    init() {
        let api = achievementsLibMod;
        api.addSystem({
            name: "example",
            id: "example",
            achievements: [
                {
                    name: "example",
                    id: "example",
                    description: "Example achievement",
                    icon: "", // If no icon is specified, the default icon will be used
                    getProgress(root) {
                        let val = Math.random() * 100;
                        return {
                            text: `${val}/100`,
                            percentage: val,
                        }
                    }
                }
            ],
            init: (sys) => {
                // This is called when the system is initialized
                this.signals.gameInitialized.add((root) => {
                    // This is called when the game is initialized

                    // You may want to use this to setup listeners or stats
                });
            }
        })
    }
}
