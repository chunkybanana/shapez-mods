import { enumMouseButton } from "game/camera";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { Vector } from "core/vector";
import { KEYMAPPINGS } from "game/key_action_mapper";
import { GameRoot } from "game/root";
import { HUDMassSelector } from "game/hud/parts/mass_selector";
import { MetaWireBuilding } from "game/buildings/wire";
import { Entity } from "game/entity";
import { MetaBeltBuilding } from "game/buildings/belt";
import { STOP_PROPAGATION } from "core/signal";

// shamelessly stolen from dengr
function getMassSelector(root: GameRoot) {
    if (!("massSelector" in root.hud.parts)) {
        // Can't select in current game mode
        return null;
    }

    const massSelector: HUDMassSelector = root.hud.parts["massSelector"] as any; // ugh
    return massSelector;
}
// Also shamelessly stolen from dengr
function isWireEntity(entity: Entity) {
    const staticComp = entity.components.StaticMapEntity;
    if (staticComp === undefined) {
        // Some sort of custom (non-building) entity
        return false;
    }

    return staticComp.getMetaBuilding() instanceof MetaWireBuilding;
}
function isBeltEntity(entity: Entity) {
    const staticComp = entity.components.StaticMapEntity;
    if (staticComp === undefined) {
        // Some sort of custom (non-building) entity
        return false;
    }

    return staticComp.getMetaBuilding() instanceof MetaBeltBuilding;
}
const cardinalVectors = [
    new Vector(1, 0),
    new Vector(0, 1),
    new Vector(-1, 0),
    new Vector(0, -1)
];
function getAdjacentTiles(pos: Vector) {
    return cardinalVectors.map((v) => pos.add(v));
}

export class SelectBeltHUDPart extends BaseHUDPart {
    initialize(): void {
        this.root.camera.downPreHandler.add(this.onMouseDown, this);
    }
    onMouseDown(pos: Vector, button: enumMouseButton) {
        if (
            button === enumMouseButton.left &&
            this.root.keyMapper.getBinding(KEYMAPPINGS.mods["select-belt"])
                .pressed
        ) {
            const massSelector = getMassSelector(this.root);
            if (massSelector === null) {
                return;
            }

            const worldPos = this.root.camera.screenToWorld(pos);
            let toSelect;

            const tile = this.root.map.getTileContent(
                worldPos.toTileSpace(),
                this.root.currentLayer
            );
            if (!tile) return;
            if (isWireEntity(tile) && tile.components.Wire?.linkedNetwork) {
                toSelect = this.findConnectedWires(worldPos.toTileSpace());
            } else if (isBeltEntity(tile)) {
                toSelect = tile.components.Belt.assignedPath.entityPath;
            } else return;

            for (let entity of toSelect) {
                massSelector.selectedUids.add(entity.uid);
            }
            return STOP_PROPAGATION;
        }
    }
    findConnectedWires(position: Vector) {
        let wirePositions = new Set(); // Stored as strings
        let wires = [];
        let toSearch: Vector[] = [position];

        let limit = 0;
        const tile = this.root.map.getTileContent(
            position,
            this.root.currentLayer
        );
        const variant = tile.components.Wire?.variant;

        const queueLimit = Infinity; // 10000; // Just in case
        while (toSearch.length > 0 && limit++ < queueLimit) {
            let nextSearch = [];
            for (let pos of toSearch) {
                for (let adjPos of getAdjacentTiles(pos)) {
                    const tile = this.root.map.getTileContent(
                        adjPos,
                        this.root.currentLayer
                    );

                    if (
                        tile &&
                        isWireEntity(tile) &&
                        !wirePositions.has(adjPos.toString()) &&
                        tile.components.Wire?.variant === variant
                    ) {
                        wirePositions.add(adjPos.toString());
                        wires.push(tile);
                        nextSearch.push(adjPos);
                    }
                }
            }
            toSearch = nextSearch;
        }
        return wires;
    }
}
