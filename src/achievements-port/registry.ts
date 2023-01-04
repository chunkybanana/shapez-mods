import { createLogger } from "core/logging";

export type AchievementContainer = {
    [key: string]: Achievement;
};

type arbitraryFunc = (...args: any[]) => any;

export class AchievementRegistry {
    achievements: AchievementContainer = {};
    id: string;
    name: string;
    mod: AchievementsAPI;
    disabled: boolean = false;
    logger: {
        warn: arbitraryFunc;
        log: arbitraryFunc;
        error: arbitraryFunc;
    };
    init: (sys: AchievementRegistry) => void;
    constructor(options: SystemCreationOptions, mod: AchievementsAPI) {
        this.id = options.id;
        this.name = options.name;
        this.mod = mod;
        this.init = options.init;
        this.addAchievements(...(options.achievements ?? []));
        this.logger = createLogger("achievements/systems/" + options.id);
    }
    addAchievements(...achievements: Achievement[]) {
        for (let achievement of achievements) {
            achievement.completed = false;
            this.achievements[achievement.id] = achievement;
        }
    }
    getIsCompleted(id: string) {
        return this.achievements[id]?.completed;
    }
    completeAchievement(id: string, args: CompletionArgs) {
        if (this.disabled) return;
        if (!this.achievements[id]) {
            this.logger.warn(`Achievement ${id} does not exist`);
            return;
        }

        this.achievements[id].completed = true;
        if (
            !this.mod.settings.completedAchievements.includes(
                this.id + ":" + id
            )
        ) {
            this.logger.log("completed", id);
            this.mod.settings.completedAchievements.push(this.id + ":" + id);
            if (args?.save !== false) this.mod.saveSettings();
            if (args?.showDialog !== false)
                this.mod.showNotification(this.achievements[id]);
        }
    }
    getAllAchievements() {
        return Object.values(this.achievements);
    }
    getCompletedAchievements() {
        return Object.values(this.achievements).filter(
            (achievement) => achievement?.completed
        );
    }
    resetAchievement(achievement: Achievement, save = true) {
        if (!this.achievements[achievement.id]) return;
        this.achievements[achievement.id].completed = false;
        this.mod.removeAchievement(this.id + ":" + achievement?.id);
        if (this.mod.settings.cachedProgress[this.id][achievement.id])
            this.mod.settings.cachedProgress[this.id][achievement.id] = {
                percentage: 0,
                text: ""
            };
        if (save) this.mod.saveSettings();
    }
    resetAllAchievements() {
        for (let achievement of this.getAllAchievements()) {
            this.resetAchievement(achievement, false);
        }
        this.mod.saveSettings();
    }
}
