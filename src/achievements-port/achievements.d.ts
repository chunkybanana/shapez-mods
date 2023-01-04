declare global {
    const achievementsLibMod: AchievementsAPI;
}

interface AchievementsAPI extends Mod {
    addSystem(options: SystemCreationOptions): AchievementSystem;
    registry: AchievementRegistryContainer;
    settings: {
        completedAchievements: string[];
        cachedProgress: Record<string, Record<string, AchievementProgress>>;
    };
    saveSettings(): void;
    showNotification(achievement: Achievement): void;
    removeAchievement(id: string): void;
}

interface SystemCreationOptions {
    id: string;
    name: string;
    achievements?: Achievement[];
    init: (system: AchievementRegistry) => void;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    completed?: boolean;
    getProgress?(root: GameRoot): AchievementProgress;
}

interface AchievementProgress {
    percentage: number;
    text: string;
}

interface CompletionArgs {
    save?: boolean;
    showDialog?: boolean;
}

type AchievementRegistryContainer = Record<string, AchievementRegistry>;

interface AchievementRegistry {
    achievements: Record<string, Achievement>;
    id: string;
    name: string;
    disabled: boolean;
    addAchievements(...achievements: Achievement[]): void;
    getIsCompleted(id: string): boolean;
    completeAchievement(id: string, args?: CompletionArgs): void;
    getAllAchievements(): Achievement[];
    getCompletedAchievements(): Achievement[];
    mod: AchievementsAPI;
}
