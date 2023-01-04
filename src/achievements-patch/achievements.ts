import { formatBigNumber } from "core/utils";
import { GameRoot } from "game/root";
import spritesheet from "./spritesheet.png";

import {
    getRate,
    bpKey,
    rocketKey,
    logoKey,
    createProgress,
    getMinLevel
} from "./utils";

let getAchievements = new Promise((res) => {
    let img = new Image();
    img.src = spritesheet;
    img.onload = () => res(img);
}).then((img: HTMLImageElement) => {
    location.href;
    let canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    let ctx = canvas.getContext("2d");

    function getTile(x: number, y: number) {
        ctx.drawImage(img, 64 * x, 64 * y, 64, 64, 0, 0, 64, 64);
        return canvas.toDataURL();
    }

    const achievements = [
        {
            id: "blueprint100k",
            name: "Blueprints are the future",
            description: "Have 100k blueprints stored in the hub",
            icon: getTile(0, 0),
            getProgress(root: GameRoot) {
                return createProgress(
                    root.hubGoals.getShapesStoredByKey(bpKey),
                    1e5
                );
            }
        },
        {
            id: "play10h",
            name: "It's been a long time",
            description: "Play for 10 hours",
            icon: getTile(1, 0),
            getProgress(root: GameRoot) {
                return createProgress(root.time.now() / 3600, 10);
            }
        },
        {
            id: "play1h",
            name: "Getting into it",
            description: "Play for 1 hour",
            icon: getTile(2, 0),
            getProgress(root: GameRoot) {
                return createProgress(root.time.now() / 3600, 1);
            }
        },
        {
            id: "blueprint1m",
            name: "I'll use it later",
            description: "Have 1 million blueprints stored in the hub",
            icon: getTile(3, 0),
            getProgress(root: GameRoot) {
                return createProgress(
                    root.hubGoals.getShapesStoredByKey(bpKey),
                    1e6
                );
            }
        },
        {
            id: "play20h",
            name: "Addicted",
            description: "Play for 20 hours",
            icon: getTile(4, 0),
            getProgress(root: GameRoot) {
                return createProgress(root.time.now() / 3600, 20);
            }
        },
        {
            id: "throughputBp25",
            name: "Efficiency 1",
            description: "Deliver 25 blueprints per second",
            icon: getTile(5, 0),
            getProgress(root: GameRoot) {
                return createProgress(getRate(root, bpKey), 25);
            }
        },
        {
            id: "belt500Tiles",
            name: "I need trains",
            description: "secret",
            icon: getTile(6, 0),
            getProgress(root: GameRoot) {
                return createProgress(
                    // @ts-ignore
                    root.achievementPatchModStats.longestBeltPath,
                    500
                );
            }
        },
        {
            id: "throughputBp50",
            name: "Efficiency 2",
            description: "Deliver 50 blueprints per second",
            icon: getTile(7, 0),

            getProgress(root: GameRoot) {
                return createProgress(getRate(root, bpKey), 50);
            }
        },
        {
            id: "place5000Wires",
            name: "Computer Guy",
            description: "Place 5000 wires",
            icon: getTile(0, 1),
            getProgress(root: GameRoot) {
                return createProgress(
                    // @ts-ignore
                    root.achievementPatchModStats.placedWires,
                    5000
                );
            }
        },
        {
            id: "placeBlueprint",
            name: "Now it's easy",
            description: "Place a blueprint",
            icon: getTile(1, 1)
        },
        {
            id: "noBeltUpgradesUntilBp",
            name: "It's so slow",
            description: "Complete level 12 without any belt upgrades",
            icon: getTile(2, 1)
        },
        {
            id: "throughputLogo25",
            name: "Branding Specialist 1",
            description: "Deliver 25 logos per second",
            icon: getTile(3, 1),
            getProgress(root: GameRoot) {
                return createProgress(getRate(root, logoKey), 25);
            }
        },
        {
            id: "throughputLogo50",
            name: "Branding Specialist 2",
            description: "Deliver 50 logos per second",
            icon: getTile(4, 1),
            getProgress(root: GameRoot) {
                return createProgress(getRate(root, logoKey), 25);
            }
        },
        {
            id: "placeBp1000",
            name: "Copypasta",
            description: "Place 1000 buildings at once",
            icon: getTile(5, 1)
        },
        {
            id: "cutShape",
            name: "Cutter",
            description: "Cut a shape",
            icon: getTile(6, 1)
        },
        {
            id: "darkMode",
            name: "My eyes no longer hurt",
            description: "Enable dark mode",
            icon: getTile(7, 1)
        },
        {
            id: "destroy1000",
            name: "Perfectionist",
            description: "Destroy 1000 buildings at once",
            icon: getTile(0, 2)
        },
        {
            id: "logoBefore18",
            name: "A bit early?",
            description: "secret",
            icon: getTile(1, 2)
        },
        {
            id: "mapMarkers15",
            name: "GPS",
            description: "secret",
            icon: getTile(2, 2)
        },
        {
            id: "throughputRocket10",
            name: "Preparing to launch",
            description: "Deliver 10 rockets per second",
            icon: getTile(3, 2),
            getProgress(root: GameRoot) {
                return createProgress(getRate(root, rocketKey), 10);
            }
        },
        {
            id: "produceLogo",
            name: "The logo!",
            description: "Produce the logo",
            icon: getTile(4, 2)
        },
        {
            id: "level100",
            name: "Is this the end?",
            description: "Reach level 100",
            icon: getTile(5, 2),
            getProgress(root: GameRoot) {
                return createProgress(root.hubGoals.level - 1, 100);
            }
        },
        {
            id: "unlockWires",
            name: "Wires",
            description: "Beat level 20, unlocking wires",
            icon: getTile(6, 2),
            getProgress(root: GameRoot) {
                return createProgress(root.hubGoals.level - 1, 20);
            }
        },
        {
            id: "completeLvl26",
            name: "Freedom!",
            description: "Complete level 26, unlocking freeplay",
            icon: getTile(7, 2),
            getProgress(root: GameRoot) {
                return createProgress(root.hubGoals.level - 1, 26);
            }
        },
        {
            id: "upgradesTier5",
            name: "Faster",
            description: "Have all upgrades at tier 5",
            icon: getTile(0, 3),
            getProgress(root: GameRoot) {
                return createProgress(getMinLevel(root) + 1, 5);
            }
        },
        {
            id: "level50",
            name: "Can't Stop",
            description: "Reach level 50",
            icon: getTile(1, 3),
            getProgress(root: GameRoot) {
                return createProgress(root.hubGoals.level, 50);
            }
        },
        {
            id: "upgradesTier8",
            name: "Even faster",
            description: "Have all upgrades at tier 8",
            icon: getTile(2, 3),
            getProgress(root: GameRoot) {
                return createProgress(getMinLevel(root) + 1, 8);
            }
        },
        {
            id: "mam",
            name: "Make Anything Machine",
            description:
                "Beat any level after level 26 without modifying your factory",
            icon: getTile(3, 3)
        },
        {
            id: "oldLevel17",
            name: "Memories from the past",
            description: "secret",
            icon: getTile(4, 3)
        },
        {
            id: "noInverseRotater",
            name: "King of Inefficiency",
            description: "Use no inverse rotater until level 14",
            icon: getTile(5, 3)
        },
        {
            id: "irrelevantShape",
            name: "Oops",
            description: "secret",
            icon: getTile(6, 3)
        },
        {
            id: "openWires",
            name: "The next dimension",
            description: "Open the wires layer",
            icon: getTile(7, 3)
        },
        {
            id: "paintShape",
            name: "Painter",
            description: "Paint a shape",
            icon: getTile(0, 4)
        },
        {
            id: "produceRocket",
            name: "To the moon!",
            description: "Produce the rocket shape",
            icon: getTile(1, 4)
        },
        {
            id: "rotateShape",
            name: "Rotater",
            description: "Rotate a shape",
            icon: getTile(2, 4)
        },
        {
            id: "speedrunBp120",
            name: "Not an idle game",
            description: "Reach and complete level 12 in under 120 minutes",
            icon: getTile(3, 4)
        },
        {
            id: "speedrunBp60",
            name: "Speedrun Novice",
            description: "Reach and complete level 12 in under 60 minutes",
            icon: getTile(5, 4)
        },
        {
            id: "speedrunBp30",
            name: "Speedrun Master",
            description: "Reach and complete level 12 in under 30 minutes",
            icon: getTile(4, 4)
        },
        {
            id: "produceMsLogo",
            name: "I've seen that before...",
            description: "secret",
            icon: getTile(6, 4)
        },
        {
            id: "throughputRocket20",
            name: "SpaceY",
            description: "Deliver 20 rockets per second",
            icon: getTile(7, 4),
            getProgress(root: GameRoot) {
                return createProgress(getRate(root, rocketKey), 20);
            }
        },
        {
            id: "stackShape",
            name: "Wait, they stack?",
            description: "Stack a shape",
            icon: getTile(0, 5)
        },
        {
            id: "stack4Layers",
            name: "Stack Overflow",
            description: "Produce a shape with 4 layers",
            icon: getTile(1, 5)
        },
        {
            id: "storeShape",
            name: "I'm a hoarder",
            description: "Store a shape",
            icon: getTile(2, 5)
        },
        {
            id: "store100Unique",
            name: "It's a mess",
            description: "Store 100 unique shapes in the hub",
            icon: getTile(3, 5),
            getProgress(root: GameRoot) {
                return createProgress(
                    Object.keys(root.hubGoals.storedShapes).length,
                    100
                );
            }
        },
        {
            id: "trash1000",
            name: "Get rid of them",
            description: "Trash 1000 shapes",
            icon: getTile(4, 5),
            getProgress(root: GameRoot) {
                return createProgress(
                    // @ts-ignore
                    root.achievementPatchModStats.trashedItems,
                    1000
                );
            }
        },
        {
            id: "10kbelts",
            name: "Belts go brrr",
            description: "Place 10k belts",
            icon: getTile(5, 5),
            getProgress(root: GameRoot) {
                return createProgress(
                    // @ts-ignore
                    root.achievementPatchModStats.placedBelts,
                    10000
                );
            }
        },
        {
            id: "freeplayLevel120s",
            name: "It's an improvement",
            description: "Beat a freeplay level in under 120 seconds",
            icon: getTile(6, 5)
        },
        {
            id: "place1mBps",
            name: "I've finally used it",
            description: "Spend 1 million blueprints",
            icon: getTile(7, 5),
            getProgress(root: GameRoot) {
                return createProgress(
                    // @ts-ignore
                    root.achievementPatchModStats.placedBlueprints,
                    1e6
                );
            }
        },
        {
            id: "store200k",
            name: "True hoarder",
            description: "Store 200k shapes in storages",
            icon: getTile(0, 6),
            getProgress(root: GameRoot) {
                return createProgress(
                    // @ts-ignore
                    root.achievementPatchModStats.storedItemsTotal,
                    2e5
                );
            }
        },
        {
            id: "freeplayLevel30s",
            name: "Automation master",
            description: "Beat a freeplay level in under 30 seconds",
            icon: getTile(1, 6)
        },
        {
            id: "stack5thLayer",
            name: "The forbidden layer",
            description: "secret",
            icon: getTile(2, 6)
        },
        {
            id: "freeplayLevel60s",
            name: "I am speed",
            description: "Beat a freeplay level in under 60 seconds",
            icon: getTile(3, 6)
        },
        // Too hard?
        /*{
            id: "level9000",
            name: "It's over 9000!",
            description: "Reach level 9000",
            icon: getTile(4, 6)
        },*/
        {
            id: "beltsLvl15",
            name: "Belts go brrrrrrrrrrrrrrrrrrr",
            description: "Upgrade belts to level 15",
            icon: getTile(5, 6),
            getProgress(root: GameRoot) {
                return createProgress(root.hubGoals.upgradeLevels.belt, 15);
            }
        },
        {
            id: "bird",
            name: "Flappy Bird",
            description: "Produce the bird shape",
            icon: getTile(6, 6)
        },
        {
            id: "lvl6NoBalancers",
            name: "Unbalanced",
            description: "Complete level 6 without using any balancers",
            icon: getTile(7, 6)
        },
        {
            id: "lvl12NoDestroying",
            name: "Environmentalist",
            description: "Complete level 12 without destroying any buildings",
            icon: getTile(0, 7)
        },
        {
            id: "lvl20NoDoublePainter",
            name: "Emperor of inefficiency",
            description: "Complete level 20 without using any double painters",
            icon: getTile(1, 7)
        },
        {
            id: "noFactoryFreeplay",
            name: "True perfectionist",
            description:
                "Have a completely empty factory at any point after beating level 26",
            icon: getTile(2, 7)
        },
        {
            id: "lvl12NoTrash",
            name: "Reduce, reuse, recycle",
            description: "Complete level 12 without using any trash",
            icon: getTile(3, 7)
        },
        {
            id: "notRocket",
            name: "You will not go to space today",
            description: "secret",
            icon: getTile(4, 7)
        },
        {
            id: "lvl7NoTunnels",
            name: "Do you enjoy pain?",
            description: "Complete level 7 without using any tunnels",
            icon: getTile(5, 7)
        },
        {
            id: "lvl12NoUpgrades",
            name: "It's even slower",
            description: "Complete level 12 without buying any upgrades",
            icon: getTile(6, 7)
        },
        {
            id: "lvl27NoWires",
            name: "DIY",
            description: "Complete level 27 manually, without using any wires",
            icon: getTile(7, 7)
        },
        {
            id: "rocketBeforeLogo",
            name: "A lot early?",
            description:
                "Produce the rocket shape before producing the logo shape",
            icon: getTile(8, 0)
        },
        {
            id: "scissors",
            name: "The other cutter",
            description: "Produce the scissors shape",
            icon: getTile(8, 1)
        }
    ];
    return achievements;
});

export { getAchievements };
