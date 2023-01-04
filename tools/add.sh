mkdir src/$1
name=$(gsed -E "s/(-|^)(.)/\U\2/g" <<< $1)
spacedname=$(gsed -E "s/(-|^)(.)/ \U\2/g" <<< $1)
echo '{
    "entry": "./index.ts",
    "name": "'$spacedname'",
    "description": "Try to take over the world!",
    "version": "1.0.0",
    "id": "'$1'"
}' > src/$1/mod.json
echo 'import { Mod } from "mods/mod";
import metadata from "./mod.json";

class '$name'Mod extends Mod {
    init() {
        // do stuff
    }
}
// @ts-ignore
registerMod('$name'Mod, metadata);' > src/$1/index.ts