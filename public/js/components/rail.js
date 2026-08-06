import {createElement} from "../reusable/functions.js"

export function createRail({
    rail_id = "popular-rail",
    rail_name = "Popular stays near Drexel"
}) {
    const section = createElement("div", { className: "section" });
    const category = createElement("h1", { className: "category", textContent: rail_name })
    const rail = createElement("div", { className: "rail", id: rail_id })

    section.append(category, rail);
    return section;
}