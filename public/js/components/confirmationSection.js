import { createElement } from "../reusable/functions.js";
import { createLoginModal } from "./loginModal.js";


export function createConfirmationSection(bookingDetails) {
    const confirmationContainer = createElement("div", {
        className: "confirmation-container"
    });

    const confirmationContainerTitle = createElement("h2", {
        className: "confirmation-container-title",
        textContent: "Confirm and Pay"
    });

    const confirmationPayContainer = createElement("div", {
        className: "confirmation-pay-container"
    });

    const confirmationPayContainerText = createElement("h3", {
        className: "confirmation-pay-container-title",
        textContent: "1. Choose when to pay"
    });

    const confirmationPayContainerNow = createElement("label", {
        className: "confirmation-pay-option"
    });

    const confirmationPayContainerNowText = createElement("span", {
        className: "confirmation-pay-container-now-text",
        textContent: `Pay $${bookingDetails.total.toFixed(2)} now`
    });

    const confirmationPayContainerNowRadio = createElement("input", {
        className: "confirmation-pay-radio",
        type: "radio",
        name: "payment-time",
        value: "now",
        checked: true
    });

    confirmationPayContainerNow.append(
        confirmationPayContainerNowText,
        confirmationPayContainerNowRadio
    );


    const confirmationPayContainerMonthly = createElement("label", {
        className: "confirmation-pay-option"
    });

    const confirmationPayNextContainer = createElement("div", {
        className: "confirmation-pay-next-container"
    });

    const confirmationPayNextButton = createElement("button", {
        className: "confirmation-pay-next-button",
        type: "button"
    });

    confirmationPayNextButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/me");
            const user = await response.json();

            if (!user) {
                document.body.appendChild(createLoginModal());
                return;
            }

            console.log("Logged in user:", user);

        } catch (error) {
            console.error("Error checking login:", error);
        }
    });

    const confirmationPayNextContainerText = createElement("p", {
        className: "confirmation-pay-next-container-text",
        textContent: "Next"
    });

    confirmationPayNextButton.append(
        confirmationPayNextContainerText
    );

    confirmationPayNextContainer.append(
        confirmationPayNextButton
    );


    confirmationPayContainer.append(
        confirmationPayContainerText,
        confirmationPayContainerNow,
        confirmationPayContainerMonthly,
        confirmationPayNextContainer
    );


    const paymentMethodContainer = createElement("div", {
        className: "confirmation-step-container"
    });

    const paymentMethodTitle = createElement("h3", {
        className: "confirmation-step-title",
        textContent: "2. Add a payment method"
    });

    paymentMethodContainer.append(
        paymentMethodTitle
    );


    const reviewReservationContainer = createElement("div", {
        className: "confirmation-step-container"
    });

    const reviewReservationTitle = createElement("h3", {
        className: "confirmation-step-title",
        textContent: "3. Review your reservation"
    });

    reviewReservationContainer.append(
        reviewReservationTitle
    );


    confirmationContainer.append(
        confirmationContainerTitle,
        confirmationPayContainer,
        paymentMethodContainer,
        reviewReservationContainer
    );

    return confirmationContainer;
}