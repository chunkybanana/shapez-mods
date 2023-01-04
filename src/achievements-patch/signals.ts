import { BasicSerializableObject, types } from "savegame/serialization";
import { GameRoot } from "game/root";
import { ModInterface } from "mods/mod_interface";
import { HubGoals } from "game/hub_goals";
import { createLogger } from "core/logging";
import { BaseItem } from "game/base_item";
import { Entity } from "game/entity";
import { ShapeDefinition } from "game/shape_definition";
import { StorageComponent } from "game/components/storage";
import { enumAnalyticsDataSource } from "game/production_analytics";
import { globalConfig } from "core/config";
import { BeltSystem } from "game/systems/belt";

import {
    birdKey,
    notRocketKey,
    scissorsKey,
    rocketKey,
    logoKey,
    msLogoKey,
    oldLevel17Key,
    bpKey,
    getLayerCount,
    getMinLevel
} from "./utils";

// Some statistics to tell whether certain achievements are valid

const logger = createLogger("achievements-patch/signals");

export class AchievementPatchModStats extends BasicSerializableObject {
    placedTrash: boolean;
    placedTunnel: boolean;
    destroyedBuilding: boolean;
    placedBelts: number;
    placedBalancer: boolean;
    placedDoublePainter: boolean;
    purchasedUpgrade: boolean;
    placedWires: number;
    placedBlueprints: number;
    storedItemsTotal: number;
    producedLogo: boolean;
    placedInverseRotator: boolean;
    purchasedBeltUpgrade: boolean;
    trashedItems: number;
    longestBeltPath: number;
    static getSchema() {
        return {
            placedTrash: types.bool,
            placedTunnel: types.bool,
            destroyedBuilding: types.bool,
            placedBelts: types.uint,
            placedBalancer: types.bool,
            placedDoublePainter: types.bool,
            purchasedUpgrade: types.bool,
            placedWires: types.uint,
            placedBlueprints: types.uint,
            storedItemsTotal: types.uint,
            placedInverseRotator: types.bool,
            purchasedBeltUpgrade: types.bool,
            trashedItems: types.uint,
            longestBeltPath: types.uint
        };
    }
    static getId() {
        return "AchievementPatchModStats";
    }

    constructor() {
        super();
        this.placedTrash = false;
        this.placedTunnel = false;
        this.destroyedBuilding = false;
        this.placedBelts = 0;
        this.placedBalancer = false;
        this.placedDoublePainter = false;
        this.purchasedUpgrade = false;
        this.placedWires = 0;
        this.placedBlueprints = 0;
        this.storedItemsTotal = 0;
        this.producedLogo = false;
        this.placedInverseRotator = false;
        this.purchasedBeltUpgrade = false;
        this.trashedItems = 0;
        this.longestBeltPath = 0;
    }
}

let registerSignals = (
    root: GameRoot,
    data: AchievementPatchModStats,
    system: AchievementRegistry,
    modApi: ModInterface,
    mod: AchievementsAPI
) => {
    logger.log("Registering signals for ", system.name);

    modApi.runAfterMethod(HubGoals, "takeShapeByKey", (key, amount) => {
        if (
            key == root.gameMode?.getBlueprintShapeKey() &&
            amount <= root.hubGoals.getShapesStoredByKey(key) &&
            Number.isInteger(amount) &&
            amount >= 0
        ) {
            data.placedBlueprints += amount;
            if (data.placedBlueprints >= 1e6) {
                system.completeAchievement("place1mBps");
            }
            //logger.log("Placed blueprints: ", data.placedBlueprints);
        }
    });

    root.signals.itemProduced.add((item: BaseItem) => {
        const key = item.getAsCopyableKey();
        if (key === birdKey) {
            system.completeAchievement("bird");
        } else if (key === notRocketKey) {
            system.completeAchievement("notRocket");
        } else if (key === scissorsKey) {
            system.completeAchievement("scissors");
        } else if (key === logoKey) {
            data.producedLogo = true;
            system.completeAchievement("produceLogo");
            if (root.hubGoals.level < 18) {
                system.completeAchievement("logoBefore18");
            }
        } else if (key == rocketKey) {
            if (!data.producedLogo) {
                system.completeAchievement("rocketBeforeLogo");
            }
            system.completeAchievement("produceRocket");
        } else if (key == msLogoKey) {
            system.completeAchievement("produceMsLogo");
        } else if (key == oldLevel17Key) {
            system.completeAchievement("oldLevel17");
        }
    });

    let previousLevel = Date.now();
    root.signals.storyGoalCompleted.add((level: number) => {
        // @ts-ignore
        if (root.savegame.currentData.stats) {
            // @ts-ignore
            if (!root.savegame.currentData.stats.failedMam && level > 26)
                system.completeAchievement("mam");
            // @ts-ignore
            root.savegame.currentData.stats.failedMam = false;
        }

        if (level > 26) {
            let time = Date.now() - previousLevel; // This won't work after 2038, but we'll have bigger problems then

            if (time < 30000) {
                system.completeAchievement("freeplayLevel30s", { save: false });
            }
            if (time < 60000) {
                system.completeAchievement("freeplayLevel60s", { save: false });
            }
            if (time < 120000) {
                system.completeAchievement("freeplayLevel120s", {
                    save: false
                });
            }

            mod.saveSettings();
        }
        previousLevel = Date.now();

        if (level == 6 && !data.placedBalancer) {
            system.completeAchievement("lvl6NoBalancers");
        }

        if (level == 20) {
            if (!data.placedDoublePainter)
                system.completeAchievement("lvl20NoDoublePainter", {
                    save: false
                });

            system.completeAchievement("unlockWires");
        }

        if (level == 12) {
            if (!data.placedTrash)
                system.completeAchievement("lvl12NoTrash", { save: false });

            if (!data.purchasedUpgrade)
                system.completeAchievement("lvl12NoUpgrades", { save: false });

            if (!data.destroyedBuilding)
                system.completeAchievement("lvl12NoDestroying", {
                    save: false
                });

            if (!data.purchasedBeltUpgrade)
                system.completeAchievement("noBeltUpgradesUntilBp", {
                    save: false
                });

            if (root.time.now() < 30 * 60)
                system.completeAchievement("speedrunBp30", { save: false });

            if (root.time.now() < 60 * 60)
                system.completeAchievement("speedrunBp60", { save: false });

            if (root.time.now() < 120 * 60)
                system.completeAchievement("speedrunBp120", { save: false });

            mod.saveSettings();
        }
        if (level == 13) {
            if (!data.placedInverseRotator)
                system.completeAchievement("noInverseRotater");
        }

        if (level == 7 && !data.placedTunnel) {
            system.completeAchievement("lvl7NoTunnels");
        }

        if (level == 27 && !data.placedWires) {
            system.completeAchievement("lvl27NoWires");
        }

        if (level == 26) {
            system.completeAchievement("completeLvl26");
        }

        if (level == 50) {
            system.completeAchievement("level50");
        }

        if (level == 100) {
            system.completeAchievement("level100");
        }

        /*
        if (level >= 9000) {
            system.completeAchievement("level9000");
        }
        */
    });

    root.signals.entityManuallyPlaced.add((entity: Entity) => {
        const staticMapEntity = entity.components.StaticMapEntity;
        const building = staticMapEntity?.getMetaBuilding().getId();
        const variant = staticMapEntity?.getVariant();
        if (building === "trash") {
            data.placedTrash = true;
        } else if (building === "underground_belt") {
            data.placedTunnel = true;
        } /*else if (building === "wire") {
            data.placedWires++;
        } */ else if (
            building == "balancer"
        ) {
            data.placedBalancer = true;
        } else if (building == "painter" && variant == "double") {
            data.placedDoublePainter = true;
        } else if (building == "rotater" && variant == "ccw") {
            data.placedInverseRotator = true;
        }
    });

    root.signals.entityAdded.add((entity: Entity) => {
        // @ts-ignore
        if (root.savegame.currentData.stats)
            // @ts-ignore
            root.savegame.currentData.stats.failedMam = true;
        const id = entity.components.StaticMapEntity?.getMetaBuilding().getId();
        if (id === "belt") {
            data.placedBelts++;
            if (data.placedBelts >= 1e4) {
                system.completeAchievement("10kbelts");
            }
        } else if (id === "wire") {
            data.placedWires++;
            if (data.placedWires >= 5e3) {
                system.completeAchievement("place5000Wires");
            }
        }
    });

    root.signals.upgradePurchased.add((upgrade: string) => {
        data.purchasedUpgrade = true;
        if (upgrade == "belt" && root.hubGoals.getUpgradeLevel(upgrade) >= 14) {
            system.completeAchievement("beltsLvl15");
        }

        if (upgrade == "belt") {
            data.purchasedBeltUpgrade = true;
        }

        const minLevel = getMinLevel(root);

        if (minLevel >= 4) {
            system.completeAchievement("upgradesTier5");
        }
        if (minLevel >= 7) {
            system.completeAchievement("upgradesTier8");
        }
    });

    root.signals.entityDestroyed.add(() => {
        // @ts-ignore
        if (root.savegame.currentData.stats)
            // @ts-ignore
            root.savegame.currentData.stats.failedMam = true;
        data.destroyedBuilding = true;
        if (root.entityMgr.entities.length == 1 && root.hubGoals.level >= 27) {
            // Hub
            system.completeAchievement("noFactoryFreeplay");
        }
    });

    modApi.runAfterMethod(ShapeDefinition, "cloneAndStackWith", function (
        def
    ): ShapeDefinition {
        let count = getLayerCount(this, def);
        if (count >= 4) {
            system.completeAchievement("stack4Layers");
        }
        if (count >= 5) {
            system.completeAchievement("stack5thLayer");
        }
        return def;
    });

    modApi.runAfterMethod(StorageComponent, "takeItem", () => {
        system.completeAchievement("storeShape");
        data.storedItemsTotal++;
        if (data.storedItemsTotal >= 2e5) {
            system.completeAchievement("store200k");
        }
    });

    let getRate = (shape: string) =>
        root.productionAnalytics.getCurrentShapeRateRaw(
            enumAnalyticsDataSource.delivered,
            root.shapeDefinitionMgr.getShapeFromShortKey(shape)
        ) /
        // @ts-ignore
        globalConfig.analyticsSliceDurationSeconds;

    let isIrrelevantShape = (definition: ShapeDefinition) => {
        const levels = root.gameMode.getLevelDefinitions();
        for (let i = 0; i < levels.length; i++) {
            if (definition.cachedHash === levels[i].shape) {
                return false;
            }
        }

        const upgrades = root.gameMode.getUpgrades();
        for (let upgradeId in upgrades) {
            for (const tier in upgrades[upgradeId]) {
                const requiredShapes = upgrades[upgradeId][tier].required;
                for (let i = 0; i < requiredShapes.length; i++) {
                    if (definition.cachedHash === requiredShapes[i].shape) {
                        return false;
                    }
                }
            }
        }

        return true;
    };

    root.signals.shapeDelivered.add((def: ShapeDefinition) => {
        if (getRate(rocketKey) >= 10) {
            system.completeAchievement("throughputRocket10");
        }
        if (getRate(rocketKey) >= 20) {
            system.completeAchievement("throughputRocket20");
        }
        if (getRate(logoKey) >= 25) {
            system.completeAchievement("throughputLogo25");
        }
        if (getRate(logoKey) >= 50) {
            system.completeAchievement("throughputLogo50");
        }
        if (getRate(bpKey) >= 25) {
            system.completeAchievement("throughputBp25");
        }
        if (getRate(bpKey) >= 50) {
            system.completeAchievement("throughputBp50");
        }
        if (root.hubGoals.storedShapes[bpKey] >= 1e5) {
            system.completeAchievement("blueprint100k");
        }
        if (root.hubGoals.storedShapes[bpKey] >= 1e6) {
            system.completeAchievement("blueprint1m");
        }

        if (isIrrelevantShape(def)) {
            system.completeAchievement("irrelevantShape");
        }

        if (Object.keys(root.hubGoals.storedShapes).length >= 100) {
            system.completeAchievement("store100Unique");
        }
    });

    modApi.runAfterMethod(BeltSystem, "addEntityToPaths", function (
        entity: Entity
    ) {
        if (
            !system.getIsCompleted("belt500Tiles") &&
            (data.longestBeltPath = Math.max(
                data.longestBeltPath,
                entity.components.Belt.assignedPath.entityPath.length + 1
            )) >= 500
        ) {
            system.completeAchievement("belt500Tiles");
        }
    });

    let interval = setInterval(() => {
        let time = root?.time?.now?.();
        if (!root) clearInterval(interval);
        if (time >= 60 * 60) {
            system.completeAchievement("play1h");
        }
        if (time >= 10 * 60 * 60) {
            system.completeAchievement("play10h");
        }
        if (time >= 20 * 60 * 60) {
            system.completeAchievement("play20h");
        }
    }, 60000); // Every minute

    const signalAchievements = [
        "stackShape",
        "paintShape",
        "rotateShape",
        "cutShape",
        "placeBlueprint"
    ];

    let handleAchievement = (achiev: string, params: any) => {
        if (signalAchievements.includes(achiev)) {
            system.completeAchievement(achiev);
        }

        if (achiev == "placeBp1000" && params >= 1e3) {
            system.completeAchievement("placeBp1000");
        }

        if (achiev == "destroy1000" && params >= 1e3) {
            system.completeAchievement("destroy1000");
        }

        if (achiev == "mapMarkers15" && params >= 15) {
            system.completeAchievement("mapMarkers15");
        }

        if (achiev == "trash1000") {
            data.trashedItems += params;
            if (data.trashedItems >= 1e3) {
                system.completeAchievement("trash1000");
            }
        }
    };

    root.signals.achievementCheck.add(handleAchievement);

    root.signals.bulkAchievementCheck.add(
        (...args: FlatArray<[string, any][], 1>) => {
            for (let i = 0; i < args.length; i += 2) {
                handleAchievement(args[i], args[i + 1]);
            }
        }
    );

    root.signals.editModeChanged.add((layer: string) => {
        if (layer == "wires") {
            system.completeAchievement("openWires");
        }
    });
};

export { registerSignals };
