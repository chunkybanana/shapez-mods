import declogger from "./declogger.png";
import colorfilter from "./colorfilter.png";
import shapefilter from "./shapefilter.png";
import microfilter from "./microfilter.png";
import microfilterReadout from "./microfilter-readout.png";

import decloggerbp from "./declogger-bp.png";
import colorfilterbp from "./colorfilter-bp.png";
import shapefilterbp from "./shapefilter-bp.png";
import microfilterbp from "./microfilter-bp.png";
import microfilterReadoutbp from "./microfilter-readout-bp.png";

import microfilter_tutorial from "./tutorial/microfilter-tutorial.png";
import declogger_tutorial from "./tutorial/declogger-tutorial.png";
import colorfilter_tutorial from "./tutorial/colorfilter-tutorial.png";
import shapefilter_tutorial from "./tutorial/shapefilter-tutorial.png";

import { Mod } from "mods/mod";
import metadata from "./mod.json";
import { MetaFilterBuilding } from "game/buildings/filter";
import { defaultBuildingVariant } from "game/meta_building";
import { enumDirection, Vector } from "core/vector";
import { enumPinSlotType } from "game/components/wired_pins";
import { FilterSystem } from "game/systems/filter";
import { globalConfig } from "core/config";
import { BaseItem } from "game/base_item";
import { Entity } from "game/entity";
import { WireNetwork } from "game/systems/wire";
import { BOOL_TRUE_SINGLETON, isTruthyItem } from "game/items/boolean_item";
import { BeltUnderlaysComponent } from "game/components/belt_underlays";
import { ItemProcessorOverlaysSystem } from "game/systems/item_processor_overlays";
import { gComponentRegistry } from "core/global_registries";
import { MODS } from "mods/modloader";
import { smoothPulse } from "core/utils";

const enumFilterVariants = {
    color: "color",
    shape: "shape",
    declogger: "declogger",
    micro: "micro"
};

class MicroFiltersMod extends Mod {
    init() {
        const filterReadoutMod = this.modLoader.modLoadQueue.find(
            (mod) => mod.meta.id == "filter-readout"
        );
        let cachedIntegratedDisplay = null;
        let getIntegratedDisplay = () =>
            cachedIntegratedDisplay ||
            (cachedIntegratedDisplay = filterReadoutMod
                ? gComponentRegistry.findById("IntegratedDisplay")
                : null);

        let variantInfo = [
            {
                variant: "micro",
                name: "Micro Filter",
                description:
                    "Filter items by a signal on the wires layer, destroying rejected items.",
                tutorialImageBase64: microfilter_tutorial,
                regularSpriteBase64: filterReadoutMod
                    ? microfilterReadout
                    : microfilter,
                blueprintSpriteBase64: filterReadoutMod
                    ? microfilterReadoutbp
                    : microfilterbp
            },
            {
                variant: "color",
                name: "Color Filter",
                description: "Filters out and destroys non-color items",
                tutorialImageBase64: colorfilter_tutorial,
                regularSpriteBase64: colorfilter,
                blueprintSpriteBase64: colorfilterbp
            },
            {
                variant: "shape",
                name: "Shape Filter",
                description: "Filters out and destroys non-shape items",
                tutorialImageBase64: shapefilter_tutorial,
                regularSpriteBase64: shapefilter,
                blueprintSpriteBase64: shapefilterbp
            },
            {
                variant: "declogger",
                name: "Declogger",
                description:
                    "Destroys items when it can't eject them, stopping a belt from clogging",
                tutorialImageBase64: declogger_tutorial,
                regularSpriteBase64: declogger,
                blueprintSpriteBase64: decloggerbp
            }
        ];

        for (let {
            variant,
            name,
            description,
            tutorialImageBase64,
            regularSpriteBase64,
            blueprintSpriteBase64
        } of variantInfo) {
            this.modInterface.addVariantToExistingBuilding(
                // @ts-ignore
                MetaFilterBuilding,
                variant,
                {
                    name,
                    description,
                    tutorialImageBase64,
                    regularSpriteBase64,
                    blueprintSpriteBase64,
                    dimensions: new Vector(1, 1),
                    isUnlocked(root) {
                        return true;
                    }
                }
            );
        }
        this.modInterface.extendClass(
            MetaFilterBuilding,
            ({ $old, $super }) => ({
                setupEntityComponents(entity: Entity) {
                    $old.setupEntityComponents(entity);
                    entity.addComponent(
                        new BeltUnderlaysComponent({
                            underlays: [
                                {
                                    pos: new Vector(0, 0),
                                    direction: enumDirection.top
                                }
                            ]
                        })
                    );
                },
                updateVariants(entity: Entity, _: number, variant: string) {
                    if (!enumFilterVariants[variant]) {
                        if (
                            filterReadoutMod &&
                            variant == "default" &&
                            // @ts-ignore
                            !entity.components.IntegratedDisplay
                        )
                            entity.addComponent(new (getIntegratedDisplay())());
                        return $old.updateVariants(entity, variant);
                    }
                    entity.components.ItemEjector.setSlots([
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.top
                        }
                    ]);
                    if (variant != "micro") {
                        entity.components.WiredPins.setSlots([]);
                        if (
                            filterReadoutMod &&
                            // @ts-ignore
                            entity.components.IntegratedDisplay
                        )
                            entity.removeComponent(getIntegratedDisplay());
                    } else {
                        entity.components.WiredPins.setSlots([
                            {
                                pos: new Vector(0, 0),
                                direction: enumDirection.bottom,
                                type: enumPinSlotType.logicalAcceptor
                            }
                        ]);
                        if (
                            filterReadoutMod &&
                            // @ts-ignore
                            !entity.components.IntegratedDisplay
                        )
                            entity.addComponent(new (getIntegratedDisplay())());
                    }
                }
            })
        );
        this.modInterface.extendClass(FilterSystem, ({ $old, $super }) => ({
            update() {
                // Copy-pasted from the original update function, I vaguely understand what it does
                // Annoyingly, due to the way the game is structured, I can't just call the original function
                const progress =
                    this.root.dynamicTickrate.deltaSeconds *
                    this.root.hubGoals.getBeltBaseSpeed() *
                    // @ts-ignore
                    globalConfig.itemSpacingOnBelts;

                const requiredProgress = 1 - progress;

                for (let i = 0; i < this.allEntities.length; ++i) {
                    const entity: Entity = this.allEntities[i];
                    const filterComp = entity.components.Filter;
                    const ejectorComp = entity.components.ItemEjector;
                    const variant = entity.components.StaticMapEntity.getVariant();

                    if (variant == defaultBuildingVariant) {
                        // Process payloads
                        const slotsAndLists = [
                            filterComp.pendingItemsToLeaveThrough,
                            filterComp.pendingItemsToReject
                        ];
                        for (
                            let slotIndex = 0;
                            slotIndex < slotsAndLists.length;
                            ++slotIndex
                        ) {
                            const pendingItems = slotsAndLists[slotIndex];

                            for (let j = 0; j < pendingItems.length; ++j) {
                                const nextItem = pendingItems[j];
                                // Advance next item
                                nextItem.progress = Math.min(
                                    requiredProgress,
                                    nextItem.progress + progress
                                );
                                // Check if it's ready to eject
                                if (
                                    nextItem.progress >=
                                    requiredProgress - 1e-5
                                ) {
                                    if (
                                        ejectorComp.tryEject(
                                            slotIndex,
                                            nextItem.item
                                        )
                                    ) {
                                        pendingItems.shift();
                                    }
                                }
                            }
                        }
                    } else if (variant == "declogger") {
                        const pendingItems =
                            filterComp.pendingItemsToLeaveThrough;

                        for (let j = 0; j < pendingItems.length; ++j) {
                            const nextItem = pendingItems[j];
                            // Advance next item
                            nextItem.progress = Math.min(
                                requiredProgress,
                                nextItem.progress + progress
                            );
                            // Check if it's ready to eject
                            if (nextItem.progress >= requiredProgress - 1e-5) {
                                ejectorComp.tryEject(0, nextItem.item);
                                pendingItems.shift(); // Remove it whether it was ejected or not
                            }
                        }
                    } else {
                        const pendingItems =
                            filterComp.pendingItemsToLeaveThrough;

                        for (let j = 0; j < pendingItems.length; ++j) {
                            const nextItem = pendingItems[j];
                            // Advance next item
                            nextItem.progress = Math.min(
                                requiredProgress,
                                nextItem.progress + progress
                            );
                            // Check if it's ready to eject
                            if (nextItem.progress >= requiredProgress - 1e-5) {
                                if (ejectorComp.tryEject(0, nextItem.item))
                                    pendingItems.shift();
                            }
                        }

                        filterComp.pendingItemsToReject = [];
                    }
                }
            },
            tryAcceptItem(entity: Entity, slot: number, item: BaseItem) {
                const variant = entity.components.StaticMapEntity.getVariant();
                if (!enumFilterVariants[variant]) {
                    return $old.tryAcceptItem(entity, slot, item);
                }

                const filterComp = entity.components.Filter;

                if (variant == "declogger") {
                    // Accept everything
                    filterComp.pendingItemsToLeaveThrough.push({
                        item,
                        progress: 0
                    });
                    return true;
                }

                if (variant == "micro") {
                    // Require a signal
                    const network = entity.components.WiredPins.slots[0]
                        .linkedNetwork as WireNetwork;
                    if (!network || !network.hasValue()) return false;
                }

                const filters = {
                    color: (item: BaseItem) => item._type == "color",
                    shape: (item: BaseItem) => item._type == "shape",
                    micro: (item: BaseItem) => {
                        const network = entity.components.WiredPins.slots[0]
                            .linkedNetwork as WireNetwork;
                        if (!network || !network.hasValue()) {
                            // Filter is not connected
                            return false;
                        }
                        const value = network.currentValue;
                        return (
                            item.equals?.(value) ||
                            value.equals(BOOL_TRUE_SINGLETON)
                        );
                    }
                };
                const filter = filters[variant];

                let listToCheck;
                if (filter(item)) {
                    listToCheck = filterComp.pendingItemsToLeaveThrough;
                } else {
                    listToCheck = filterComp.pendingItemsToReject;
                }

                if (listToCheck.length >= 2) {
                    return false;
                }

                listToCheck.push({
                    item,
                    progress: 0
                });
                return true;
            }
        }));

        if (!filterReadoutMod) {
            this.modInterface.replaceMethod(
                ItemProcessorOverlaysSystem,
                "drawConnectedSlotRequirement",
                function ($old, [parameters, entity, { drawIfFalse = true }]) {
                    if (
                        ["color", "shape", "declogger"].includes(
                            entity.components.StaticMapEntity.getVariant()
                        )
                    ) {
                        // Don't draw the slot requirement
                        return;
                    }
                    return $old(parameters, entity, { drawIfFalse });
                }
            );
        }
    }
}

// @ts-ignore
registerMod(MicroFiltersMod, metadata);
