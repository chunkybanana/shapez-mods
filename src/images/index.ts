import { Mod } from "mods/mod";

const METADATA = {
    id: "images",
    name: "Images",
    description: "Allows you to place images on the map",
    version: "0.0.1",
    author: "emanresu",
    website: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    settings: {} as any
};

class ImagesMod extends Mod {
    init() {
        // do stuff
    }
}

registerMod(ImagesMod, METADATA);
