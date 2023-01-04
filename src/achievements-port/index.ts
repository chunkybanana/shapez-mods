import { createLogger } from "core/logging";
import { Mod } from "mods/mod";
import { SettingsState } from "states/settings";
import { T } from "translations";
import { makeDiv } from "core/utils";
import metadata from "./mod.json";
import { ModMetadata } from "mods/modloader";
import css from "./main.css";
import { HUDNotifications } from "game/hud/parts/notifications";
import { GameRoot } from "game/root";
import { AchievementsState } from "./state";
import { AchievementRegistry } from "./registry";
import { enumCategories } from "profile/application_settings";

const logger = createLogger("Achievement Library");

const notificationDuration = 20; // seconds
//let completedAchievements: Achievement[] = [];

type Achievement = {
    id: string;
    name: string;
    authorMod: string;
    description: string;
    icon: string;
    completed: boolean;
};

let probablyRoot: GameRoot | undefined = undefined;

class AchievementLibMod extends Mod {
    registry: Record<string, AchievementRegistry> = {};
    disabledSystems: string[] = [];
    init() {
        this.checkSettings();

        enumCategories["achievements"] = "achievements";

        this.modInterface.registerTranslations("en", {
            settings: {
                categories: {
                    achievements: "Achievements",
                },
            },
        });

        this.signals.appBooted.add(() => {
            this.app.stateMgr.register(AchievementsState);
            for (let system of Object.values(this.registry)) {
                if (system.disabled) continue;
                system.init(system);
            }
        });

        this.signals.gameInitialized.add((root) => (probablyRoot = root));

        // Load completed achievements upon entering the main menu
        this.signals.stateEntered.add((state) => {
            if (state.key === "MainMenuState") {
                for (let system in this.registry) {
                    for (let id in this.registry[system].achievements) {
                        if (
                            this.settings.completedAchievements.includes(
                                system +
                                    ":" +
                                    this.registry[system].achievements[id].id
                            )
                        ) {
                            this.registry[system].achievements[
                                id
                            ].completed = true;
                            logger.log(
                                `Completed Achievement ${
                                    system + ":" + id
                                } loaded.`
                            );
                        }
                    }
                }
            }
        });

        logger.log("init");

        this.modInterface.runAfterMethod(SettingsState, "onEnter", function () {
            const achievementButton = this.htmlElement.querySelector(
                "button[data-category-btn=achievements]"
            );
            if (achievementButton)
                achievementButton.addEventListener(
                    "click",
                    () => {
                        this.moveToStateAddGoBack("AchievementsState");
                    },
                    false
                );
        });
        globalThis.achievementsLibMod = this;

        this.modInterface.registerCss(
            css.replace("6s", notificationDuration + "s") // adjust duration of notification
        );
        this.modInterface.extendClass(HUDNotifications, ({ $super, $old }) => ({
            showAchievement(achievement: Achievement) {
                const element = makeDiv(
                    this.element,
                    null,
                    ["notification", "achievement-notification"],
                    `<img src="${achievement.icon}" /> ` + achievement.name
                );

                this.notificationElements.push({
                    element,
                    expireAt:
                        this.root.time.realtimeNow() + notificationDuration
                });
            }
        }));

        this.signals.gameSerialized.add(this.cacheAchievementProgress, this);
    }
    cacheAchievementProgress(root: GameRoot) {
        console.log("caching achievement progress bars");
        let cachedProgress = {};
        for (let id in this.registry) {
            let system = this.registry[id];
            if (system.disabled) continue; // don't cache progress for disabled systems
            let cache = (cachedProgress[id] = {});
            for (let achievement of system.getAllAchievements()) {
                if (/*!achievement.completed && */ achievement.getProgress) {
                    cache[achievement.id] = achievement.getProgress(root);
                }
            }
        }
        if (this.settings) this.settings.cachedProgress = cachedProgress;
        this.saveSettings();
    }
    addSystem(options: SystemCreationOptions) {
        let registry = new AchievementRegistry(options, this);
        registry.disabled = this.disabledSystems.includes(options.id);
        return (this.registry[options.id] = registry);
    }
    removeAchievement(id: string) {
        this.settings.completedAchievements = this.settings.completedAchievements.filter(
            (completed: string) => completed !== id
        );
        let [system, achievement] = id.split(":");
        if (this?.registry?.[system]?.achievements?.[achievement]?.completed) {
            this.registry[system].achievements[achievement].completed = false;
        }
        this.saveSettings();
    }
    checkSettings() {
        // Create default settings if corrupted
        this.settings ||= {}
        this.settings.completedAchievements ||= {};
        this.settings.cachedProgress ||= {};
        this.saveSettings();
    }
    showNotification(achievement: Achievement) {
        if (probablyRoot?.hud) {
            // @ts-ignore (notifications part doesn't exist)
            probablyRoot.hud.parts.notifications.showAchievement(achievement);
        }
    }
    disableSystem(id: string) {
        this.disabledSystems.push(id);
        if (this.registry[id]) this.registry[id].disabled = true;
    }
}

registerMod(AchievementLibMod, (metadata as any) as ModMetadata);
