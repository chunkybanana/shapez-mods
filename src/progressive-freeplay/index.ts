import { gMetaBuildingRegistry } from "core/global_registries";
import { RandomNumberGenerator } from "core/rng";
import { enumColors } from "game/colors";
import { HubGoals } from "game/hub_goals";
import { enumNotificationType } from "game/hud/parts/notifications";
import { HUDUnlockNotification } from "game/hud/parts/unlock_notification";
import { defaultBuildingVariant } from "game/meta_building";
import {
    enumSubShape,
    ShapeDefinition,
    ShapeLayer
} from "game/shape_definition";
import { ShapeDefinitionManager } from "game/shape_definition_manager";
import { enumHubGoalRewards } from "game/tutorial_goals";
import { enumHubGoalRewardsToContentUnlocked } from "game/tutorial_goals_mappings";
import { Mod } from "mods/mod";
import { SOUNDS } from "platform/sound";
import { T } from "translations";
import metadata from "./mod.json";
import translations from "./translations";
import images from "./tutorial/images";

const LEVEL_INTERVAL = 10;
let getLevelInterval = (level: number) => ((level - 26) / LEVEL_INTERVAL) | 0;
const interval_count = 7;
const BASE_SHAPES = ["RuRuRuRu", "CuCuCuCu", "SuSuSuSu", "WuWuWuWu"];
const BASE_QUADS = ["Ru------", "Cu------", "Su------", "Wu------"];
const COLORS = [
    enumColors.red,
    enumColors.green,
    enumColors.blue,
    enumColors.yellow,
    enumColors.purple,
    enumColors.white,
    enumColors.cyan
];
const FULL_COLORS = COLORS.concat(enumColors.uncolored);

const SYMMETRIES = [
    [
        // horizontal axis
        [0, 3],
        [1, 2]
    ],
    [
        // vertical axis
        [0, 1],
        [2, 3]
    ],
    [
        // diagonal axis
        [0, 2],
        [1],
        [3]
    ],
    [
        // other diagonal axis
        [1, 3],
        [0],
        [2]
    ]
];

class ProgressiveFreeplayMod extends Mod {
    init() {
        this.modInterface.registerTranslations("en", translations);
        this.modInterface.extendClass(HubGoals, ({ $super, $old }) => ({
            computeNextGoal() {
                const storyIndex = this.level - 1;
                const levels = this.root.gameMode.getLevelDefinitions();
                if (storyIndex < levels.length) {
                    const { shape, required, reward, throughputOnly } = levels[
                        storyIndex
                    ];
                    this.currentGoal = {
                        definition: this.root.shapeDefinitionMgr.getShapeFromShortKey(
                            shape
                        ),
                        required,
                        reward,
                        throughputOnly
                    };
                    return;
                }

                console.log("goal");
                let required = 4;
                let interval = getLevelInterval(storyIndex);
                if (interval == 3) required = 8;
                if (interval >= 4) required = 16;
                this.currentGoal = {
                    definition: this.computeFreeplayShape(this.level),
                    required,
                    reward: enumHubGoalRewards.no_reward_freeplay, // TODO: Add a new reward
                    throughputOnly: true
                };
            },
            generateShape(
                rng: RandomNumberGenerator,
                { pieceCount = 4, allowMissing = true, layerCount = 4 }
            ) {
                // Code stolen from the original generateShape function
                const colors = this.generateRandomColorSet(rng, true);

                let pickedSymmetry = null; // pairs of quadrants that must be the same
                let availableShapes = [
                    enumSubShape.rect,
                    enumSubShape.circle,
                    enumSubShape.star
                ];
                if (rng.next() < 0.5) {
                    pickedSymmetry = [
                        // radial symmetry
                        [0, 2],
                        [1, 3]
                    ];
                    availableShapes.push(enumSubShape.windmill); // windmill looks good only in radial symmetry
                } else {
                    pickedSymmetry = rng.choice(SYMMETRIES);
                }

                const randomColor = () => rng.choice(colors);
                const randomShape = () => rng.choice(availableShapes);
                const layers = [];
                for (let i = 0; i < layerCount; ++i) {
                    const layer: ShapeLayer = [null, null, null, null];
                    for (let j = 0; j < pickedSymmetry.length; ++j) {
                        const group = pickedSymmetry[j];
                        const shape = randomShape();
                        const color = randomColor();
                        for (let k = 0; k < group.length; ++k) {
                            const quad = group[k];

                            if (quad < pieceCount)
                                layer[quad] = {
                                    subShape: shape,
                                    color
                                };
                        }
                    }
                    layers.push(layer);
                }
                return this.root.shapeDefinitionMgr.registerOrReturnHandle(
                    new ShapeDefinition({ layers })
                );
            },
            computeFreeplayShape(level: number) {
                const rng = new RandomNumberGenerator(
                    this.root.map.seed + "/" + level
                );
                const interval = getLevelInterval(level);

                let shape = this.root.shapeDefinitionMgr.getShapeFromShortKey(
                    rng.choice(BASE_SHAPES)
                );

                // Uncut painted shapes

                let color: enumColors = rng.choice(FULL_COLORS);

                if (interval == 1) {
                    // Painted shapes
                    color = rng.choice(COLORS);
                } else if (interval == 2) {
                    // Painted shapes, 50% chance of grey
                    color =
                        level !== 26 + 2 * LEVEL_INTERVAL && rng.next() < 0.5
                            ? rng.choice(COLORS)
                            : enumColors.uncolored;
                }

                if (interval > 0) shape = shape.cloneAndPaintWith(color);

                if (interval == 3) {
                    // Cut in half
                    shape = shape.cloneFilteredByQuadrants([0, 1]);
                } else if (interval == 4) {
                    // Quartered
                    shape = shape.cloneFilteredByQuadrants([0]);
                }

                if (interval > 4) {
                    let layerCount = 1;
                    if (interval == 8) layerCount = 2;
                    if (interval == 9) layerCount = 4;
                    if (interval >= 10)
                        layerCount = Math.min(
                            4,
                            interval - 10 + 4 - rng.nextIntRange(0, 3)
                        );

                    shape = this.generateShape(rng, {
                        pieceCount: interval == 5 ? 2 : 4, // 2 parts for 5, 4 parts for 6+
                        layerCount,
                        allowMissing: false
                    });
                }

                return this.root.shapeDefinitionMgr.registerOrReturnHandle(
                    shape
                );
            }
        }));
        this.modInterface.extendClass(
            HUDUnlockNotification,
            ({ $super, $old }) => ({
                showForLevel(level: number, reward: enumHubGoalRewards) {
                    this.root.soundProxy.playUi(SOUNDS.levelComplete);

                    const levels = this.root.gameMode.getLevelDefinitions();
                    // Don't use getIsFreeplay() because we want the freeplay level up to show

                    // If the level is a story level, show the normal level up notification
                    if (
                        level > levels.length - 1 &&
                        (level - 26) % LEVEL_INTERVAL !== 0 &&
                        getLevelInterval(level) !== 0
                    ) {
                        this.root.hud.signals.notification.dispatch(
                            T.ingame.notifications.freeplayLevelComplete.replace(
                                "<level>",
                                String(level)
                            ),
                            enumNotificationType.success
                        );
                        return;
                    }

                    this.root.app.gameAnalytics.noteMinor(
                        "game.level.complete-" + level
                    );

                    this.root.app.inputMgr.makeSureAttachedAndOnTop(
                        this.inputReciever
                    );
                    this.elemTitle.innerText = T.ingame.levelCompleteNotification.levelTitle.replace(
                        "<level>",
                        ("" + level).padStart(2, "0")
                    );

                    const rewardName = T.storyRewards[reward].title;

                    let html = `
                    <div class="rewardName">
                        ${T.ingame.levelCompleteNotification.unlockText.replace(
                            "<reward>",
                            rewardName
                        )}
                    </div>

                    <div class="rewardDesc">
                        ${T.storyRewards[reward].desc}
                    </div>

                    `;

                    if (level <= levels.length) {
                        html += "<div class='images'>";
                        const gained =
                            enumHubGoalRewardsToContentUnlocked[reward];
                        if (gained) {
                            gained.forEach(([metaBuildingClass, variant]) => {
                                const metaBuilding = gMetaBuildingRegistry.findByClass(
                                    metaBuildingClass
                                );
                                html += `<div class="buildingExplanation" data-icon="building_tutorials/${
                                    metaBuilding.getId() +
                                    (variant === defaultBuildingVariant
                                        ? ""
                                        : "-" + variant)
                                }.png"></div>`;
                            });
                        }
                        html += "</div>";
                    } else {
                        const interval = getLevelInterval(level);
                        html += `<div class='images'><img src=${images[interval]}></div>`;
                    }

                    this.elemContents.innerHTML = html;
                    this.visible = true;

                    if (this.buttonShowTimeout) {
                        clearTimeout(this.buttonShowTimeout);
                    }

                    this.element
                        .querySelector("button.close")
                        .classList.remove("unlocked");

                    if (this.root.app.settings.getAllSettings().offerHints) {
                        this.buttonShowTimeout = setTimeout(
                            () =>
                                this.element
                                    .querySelector("button.close")
                                    .classList.add("unlocked"),
                            1500 // G_IS_DEV ? 100 : 1500
                        );
                    } else {
                        this.element
                            .querySelector("button.close")
                            .classList.add("unlocked");
                    }
                }
            })
        );
    }
}
// @ts-ignore
registerMod(ProgressiveFreeplayMod, metadata);
