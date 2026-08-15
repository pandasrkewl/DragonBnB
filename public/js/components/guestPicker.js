import { createElement } from "../reusable/functions.js";

export function createGuestPicker(initialGuests = {}, onChange=null) {
    const guestCounts = {
        adults: initialGuests.adults || 0,
        children: initialGuests.children || 0,
        infants: initialGuests.infants || 0,
        pets: initialGuests.pets || 0
    };

    const panel = createElement("div", {
        className: "guest-dropdown"
    });

    const counters = [
        { key: "adults", label: "Adults", detail: "Ages 13+" },
        { key: "children", label: "Children", detail: "Ages 2-12" },
        { key: "infants", label: "Infants", detail: "Under 2" },
        { key: "pets", label: "Service pets", detail: "Optional" }
    ];

    const rows = counters.map(({ key, label, detail }) => {
        const row = createElement("div", {
            className: "guest-row"
        });

        const textBlock = createElement("div", {
            className: "guest-copy"
        }, [
            createElement("span", {
                className: "guest-label",
                textContent: label
            }),
            createElement("span", {
                className: "guest-detail",
                textContent: detail
            })
        ]);

        const minusButton = createElement("button", {
            type: "button",
            className: "counter-btn",
            textContent: "−"
        });

        const value = createElement("span", {
            className: "counter-value",
            textContent: String(guestCounts[key])
        });

        const plusButton = createElement("button", {
            type: "button",
            className: "counter-btn counter-btn-plus",
            textContent: "+"
        });

        minusButton.addEventListener("click", () => {
            if (guestCounts[key] > 0) {
                guestCounts[key] -= 1;
                value.textContent = guestCounts[key];

                if (onChange) {
                    onChange(guestCounts);
                }
            }
        });

        plusButton.addEventListener("click", () => {
            guestCounts[key] += 1;
            value.textContent = guestCounts[key];

            if (onChange) {
                onChange(guestCounts);
            }
        });

        const counter = createElement("div", {
            className: "guest-counter"
        }, [
            minusButton,
            value,
            plusButton
        ]);

        row.append(textBlock, counter);

        return row;
    });

    rows.forEach(row => panel.appendChild(row));

    return {
        element: panel,
        guestCounts
    };
}