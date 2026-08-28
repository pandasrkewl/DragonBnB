import { createElement } from "../reusable/functions.js";

export function createDatePicker(initialCheckIn = null, initialCheckOut = null, onChange = null, disabledRanges=[]) {
    const checkIn = createElement("input", {
        type: "text",
        className: "date-input",
        placeholder: "Check in"
    });

    const checkOut = createElement("input", {
        type: "text",
        className: "date-input",
        placeholder: "Check out"
    });

    const panel = createElement("div", {
        className: "date-picker-grid"
    }, [
        createElement("label", {
            className: "date-field"
        }, [
            createElement("span", {
                textContent: "Check in"
            }),
            checkIn
        ]),

        createElement("label", {
            className: "date-field"
        }, [
            createElement("span", {
                textContent: "Check out"
            }),
            checkOut
        ])
    ]);

    const checkOutCalendar = flatpickr(checkOut, {
        minDate: "today",
        defaultDate: initialCheckOut
    });

    const checkInCalendar = flatpickr(checkIn, {
        minDate: "today",
        defaultDate: initialCheckIn,

        onChange(selectedDates) {
            const selectedCheckIn = selectedDates[0];

            if (!selectedCheckIn) {
                return;
            }

            const minimumCheckOut = new Date(selectedCheckIn);
            minimumCheckOut.setDate(minimumCheckOut.getDate() + 1);

            checkOutCalendar.set("minDate", minimumCheckOut);

            if (onChange) {
                onChange({
                    checkIn: checkIn.value,
                    checkOut: checkOut.value,
                    disable: disabledRanges
                });
            }
        },
        disable: disabledRanges
    });

    if (initialCheckIn) {
        const minimumCheckOut = new Date(`${initialCheckIn}T00:00:00`);
        minimumCheckOut.setDate(minimumCheckOut.getDate() + 1);

        checkOutCalendar.set("minDate", minimumCheckOut);
    }

    checkOutCalendar.config.onChange.push(() => {
        if (onChange) {
            onChange({
                checkIn: checkIn.value,
                checkOut: checkOut.value,
                disable: disabledRanges
            });
        }
    });

    return {
        element: panel,
        checkIn,
        checkOut,
        checkInCalendar,
        checkOutCalendar
    };
}