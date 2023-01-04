# Achievements mod lib

This library

- [Achievements mod lib](#achievements-mod-lib)
  - [Creating achievements](#creating-achievements)
    - [Accessing the API](#accessing-the-api)
    - [Creating a system](#creating-a-system)
    - [Adding achievements](#adding-achievements)
    - [Saving data](#saving-data)
    - [Spritesheets](#spritesheets)
    - [Typings](#typings)
  - [API](#api)
    - [`achievementsLibMod`](#achievementslibmod)
    - [`AchievementRegistry`](#achievementregistry)

---

## Creating achievements

---

### Accessing the API

There are several ways you can access the library's API:

-   Using the globally exposed `achievementsLibMod` object:
    `globalThis.achievementsLibMod`
-   Using the MODS variable:

```js
MODS.mods.find(mod => mod.metadata.id == "emanresu:achievements-port")`
```

-   Using the [Mod Extras](https://skimnerphi.net/mods/mod_extras/) `require`
    API (requires ME, untested):

```js
achievementsLib = ModExtras.require("emanresu:achievements-port");
```

---

### Creating a system

To create an achievement system, call the `addSystem` method of the API:

```js
api.addSystem ({
    id: "example-mod"
    name: "Example Mod",
    achievements: [],
    init : (system) => {
        // Add triggers here
    }
})
```

-   `id` is the ID of the system. It must be unique. It is used to save data.
-   `name` is the name of the system. It is used in the UI.
-   `achievements` is an (optional) array of achievements. See below for more
    information.
-   `init` is a function that is called to initialize the system. It should
    contain all code that adds achievement triggers and similar, to allow other
    mods to disable it. It's called after mods are done loading.

### Adding achievements

Achievements should look like this:

```js
{
    id: "example-achievement",
    name: "Example Achievement",
    description: "This is an example achievement",
    icon: "data:image/png,base64,...",
    getProgress (root) {
        return {
            percentage: 50,
            text: "50%"
        }
    }
}
```

-   `id` is the ID of the achievement. It must be unique.
-   `name` is the shown name of the achievement.
-   `description` is the shown description of the achievement.
-   `icon` is the icon of the achievement. It should be a base64-encoded PNG
    image.
-   `getProgress` is an optional function that takes the game root and returns
    the progress of the achievement. It should return an object with the
    following properties:
    -   `percentage` is the percentage of the achievement that is completed,
        between 1 and 100.
    -   `text` is the text shown in the progress bar.

`getProgress` is called every time the game is saved.

### Saving data

You may want to save data / statistics to keep track of the progress of the
player. For this, see the mod examples, or look at the way
[the vanilla mod](../achievements-patch/index.ts) does it.

### Spritesheets

If you have large amounts of achievements, you may want to use a spritesheet to
reduce the amount of images loaded. To do this, see
[how the vanilla mod ](../achievements-patch/achievements.ts) does it.

### Typings

Typings for the library can be found in the
[achievements.d.ts](achievements.d.ts) file.

## API

### `achievementsLibMod`

The API is exposed as the `achievementsLibMod` object, along with the other
methods above. It has the following methods:

-   `addSystem (options: SystemCreationOptions): AchievementRegistry` adds a
    system to the library.
-   `removeAchievement (id: string): void` uncompletes an achievement. `id`
    looks like `system-id:achievement-id`.
-   `disableSystem (id: string): void` disables a system. `id` is the ID of the
    system. This should be used to disable other mods for compatibility.

Along with some values:

-   `registry: Record<string, AchievementRegistry>` is an object containing all
    systems.
-   `disabledSystems: string[]` is an array containing the IDs of all disabled
    systems.

And some internal methods.

### `AchievementRegistry`

An achievement registry is an object containing all achievements of a system. It
has the following properties:

-   `addAchievements (...achievements: Achievement[]): void` adds achievements
    to the registry.
-   `getIsCompleted (id: string): boolean` returns whether an achievement is
    completed.
-   `completeAchievement (id: string, options?: CompletionArgs): void` completes
    an achievement.
-   `getAllAchievements (): Achievement[]` returns all achievements in the
    registry.
-   `getCompletedAchievements (): Achievement[]` returns all completed
    achievements in the registry.
-   `resetAchievement(id: string): void` uncompletes an achievement.
-   `resetAllAchievements(): void` uncompletes all achievements in the registry.
-   `achievements: Record<string, Achievement>` is an object containing all
    achievements in the registry.
-   `disabled` is a boolean indicating whether the registry is disabled.
    Disabled registries are not initialized, and their achievements cannot
    change while disabled.
