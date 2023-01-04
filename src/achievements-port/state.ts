import { TextualGameState } from "core/textual_game_state";
import defaultAchievementIcon from "./default.png";

// Don't look at this code if you value your sanity
export class AchievementsState extends TextualGameState {
    achievementsLib: AchievementsAPI;
    achievements: AchievementRegistryContainer;
    constructor() {
        super("AchievementsState");
        this.achievementsLib = globalThis.achievementsLibMod;
        this.achievements = this.achievementsLib.registry;
    }

    getStateHeaderTitle() {
        return "Achievements";
    }

    internalGetFullHtml() {
        return `
            <div class="headerBar">
                <h1><button class="backButton"></button> ${this.getStateHeaderTitle()}</h1>
            </div>
            <div class="tabs">
                ${this.getTabContentHTML()}
            </div>
            <div class="container">

                    ${this.getInnerHTML()}
            </div>
        `;
    }

    getMainContentHTML() {
        if (Object.keys(this.achievements).length == 0) {
            return `
                <div class="achievStats noAchievements">
                    <p>You have 0 added achievements!</p>
                </div>
            `;
        }
        let content = "";
        for (let registry of Object.values(this.achievements)) {
            // create tab
            let tabHtml = `<div class="achievementTabContent${
                content ? "" : " ach-visible"
            }" data-maintabname="${registry.id}">`;
            let achievesByCompletion = [[], []];

            registry
                .getAllAchievements()
                .forEach((a) =>
                    achievesByCompletion[a.completed ? 1 : 0].push(a)
                );

            let subHeadingTitles = ["Incomplete", "Completed"];

            // For now, just use the old achievement system

            for (let index in achievesByCompletion) {
                if (achievesByCompletion[index].length == 0) continue;
                tabHtml += `<h2>${subHeadingTitles[index]}</h2>`;
                for (let achievement of achievesByCompletion[index]) {
                    let icon = achievement.icon || defaultAchievementIcon;
                    //let completed = achievement.completed ? "completed" : "";
                    let progressBar = "";
                    if (!achievement.completed && achievement.getProgress) {
                        let progress = this.achievementsLib.settings
                            .cachedProgress?.[registry.id]?.[achievement.id];
                        let percentage = progress?.percentage || 0;
                        let text = progress?.text || "";
                        progressBar = `<div class="progress-bar">
                            <div class="progress-bar-inner" style="width: ${Math.min(
                                percentage,
                                100
                            )}%"></div><span class="progress-bar-text">${text}</span>
                        </div>`;
                    }
                    tabHtml += `
                    <div class="achiev completed">
                        <img class="achievementIcon" src="${icon}" />
                        <div class="mainInfo">
                            <span class="name">${achievement.name}</span>
                            <span class="description">${achievement.description}</span>
                        </div>
                        ${progressBar}
                    </div>
                `;
                }
            }
            tabHtml += "</div>";
            content += tabHtml;
        }

        return content;
    }

    getTabContentHTML() {
        let str = "";
        for (let registry of Object.values(this.achievements)) {
            let tabHtml = `<span class="achievementTab ${
                registry.disabled ? "disabledTab" : ""
            }" title="${registry.name} ${
                registry.disabled ? "(disabled)" : ""
            }" data-tabname="${registry.id}">${registry.name} (${
                registry.getCompletedAchievements().length
            }/${registry.getAllAchievements().length})</span>`;
            str += tabHtml;
        }
        return str.replace("achievementTab", "achievementTab activeTab"); // make first tab active, if there is one
    }

    getDefaultPreviousState() {
        return "MainMenuState";
    }

    onEnter(): void {
        let tabs = document.querySelectorAll(".achievementTab");
        for (let tab of tabs) {
            tab.addEventListener("click", (e) => {
                let tabName = (e.target as HTMLElement).dataset.tabname;
                let tabContents = document.querySelectorAll(
                    ".achievementTabContent"
                );
                for (let tabContent of tabContents) {
                    tabContent.classList.remove("ach-visible");
                    if (
                        (tabContent as HTMLElement).dataset.maintabname ==
                        tabName
                    ) {
                        tabContent.classList.add("ach-visible");
                    }
                }
                for (let tab of tabs) {
                    tab.classList.remove("activeTab");
                }
                (e.target as HTMLElement).classList.add("activeTab");
            });
        }
    }
}
