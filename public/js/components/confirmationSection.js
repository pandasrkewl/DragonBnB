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

    const confirmationPaySummary = createElement("p", {
        className: "confirmation-pay-summary",
        textContent: `Pay $${bookingDetails.total.toFixed(2)} now`
    });

    const confirmationPayChangeButton = createElement("button", {
        className: "confirmation-change-button",
        type: "button",
        textContent: "Change"
    });

    const confirmationPayCompletedContent = createElement("div", {
        className: "confirmation-pay-completed-content"
    });

    confirmationPayCompletedContent.append(
        confirmationPaySummary,
        confirmationPayChangeButton
    );

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

        if (!response.ok) {
        document.body.appendChild(createLoginModal());
        return;
        }

        confirmationPayContainer.classList.add("completed");
        cardForm.classList.remove("collapsed");
        cardForm.classList.add("open");

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
        confirmationPayCompletedContent,
        confirmationPayContainerNow,
        confirmationPayNextContainer
    );

    const paymentMethodContainer = createElement("div", {
        className: "confirmation-step-container"
    });

    confirmationPayChangeButton.addEventListener("click", () => {
        confirmationPayContainer.classList.remove("completed");

        cardForm.classList.add("collapsed");
        cardForm.classList.remove("open");
    });

    const paymentMethodTitle = createElement("h3", {
        className: "confirmation-step-title",
        textContent: "2. Add a payment method"
    });

    const cardForm = createElement("div", {
        className: "card-form collapsed"    
    });

    const cardNumberInput = createElement("input", {
        className: "card-input",
        type: "text",
        placeholder: "Card number",
        maxlength: "19"
    });

    const cardDetailsRow = createElement("div", {
        className: "card-details-row"
    });

    const expirationInput = createElement("input", {
        className: "card-input",
        type: "text",
        placeholder: "MM/YY",
        maxlength: "5"
    });

    const cvvInput = createElement("input", {
        className: "card-input",
        type: "password",
        placeholder: "CVV",
        maxlength: "4"
    });

    cardNumberInput.addEventListener("input", () => {
    let value = cardNumberInput.value.replace(/\D/g, "");
    value = value.slice(0, 16);

    cardNumberInput.value = value
        .replace(/(.{4})/g, "$1 ")
        .trim();
    });

    expirationInput.addEventListener("input", () => {
        let value = expirationInput.value.replace(/\D/g, "");
        value = value.slice(0, 4);

        if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }

        expirationInput.value = value;
    });

    cvvInput.addEventListener("input", () => {
        cvvInput.value = cvvInput.value
            .replace(/\D/g, "")
            .slice(0, 4);
    });

    cardDetailsRow.append(
        expirationInput,
        cvvInput
    );

    const paymentMethodNextButton = createElement("button", {
        className: "confirmation-pay-next-button",
        type: "button",
        textContent: "Next"
    });

    const paymentError = createElement("p", {
        className: "payment-error",
        textContent: ""
    });

    const paymentMethodSummary = createElement("p", {
        className: "payment-method-summary",
        textContent: ""
    });

    const paymentMethodChangeButton = createElement("button", {
        className: "confirmation-change-button",
        type: "button",
        textContent: "Change"
    });

    paymentMethodChangeButton.addEventListener("click", () => {
        paymentMethodContainer.classList.remove("completed");

        cardForm.classList.remove("collapsed");
        cardForm.classList.add("open");
    });

    const paymentMethodCompletedContent = createElement("div", {
        className: "payment-method-completed-content"
    });

    paymentMethodCompletedContent.append(
        paymentMethodSummary,
        paymentMethodChangeButton
    );

    cardForm.append(
        cardNumberInput,
        cardDetailsRow,
        paymentError,
        paymentMethodNextButton
    );

    paymentMethodContainer.append(
        paymentMethodTitle,
        paymentMethodCompletedContent,
        cardForm
    );


    const messageHostContainer = createElement("div", {
        className: "confirmation-step-container"
    });

    const messageHostTitle = createElement("h3", {
        className: "confirmation-step-title",
        textContent: "3. Write a message to the host"
    });

    const messageHostDescription = createElement("p", {
        className: "message-host-description",
        textContent: "Before you can continue, let your host know a little about your trip and why their place is a good fit."
    });

    const messageHostContent = createElement("div", {
        className: "message-host-content collapsed"
    });

    paymentMethodNextButton.addEventListener("click", () => {
        const cardNumber = cardNumberInput.value.replace(/\s/g, "");
        const expiration = expirationInput.value.trim();
        const cvv = cvvInput.value.trim();

        if (
            cardNumber.length !== 16 ||
            expiration.length !== 5 ||
            cvv.length < 3
        ) {
            paymentError.textContent = "Enter valid card details.";
            return;
        }

        paymentError.textContent = "";

        const lastFour = cardNumber.slice(-4);

        paymentMethodSummary.textContent = `Card ending in ${lastFour}`;


        paymentMethodContainer.classList.add("completed");

        cardForm.classList.add("collapsed");
        cardForm.classList.remove("open");

        messageHostContent.classList.remove("collapsed");
        messageHostContent.classList.add("open");
    });

    const messageHostTextarea = createElement("textarea", {
        className: "message-host-textarea",
        placeholder: "Example: Hi! I'm visiting for a few days and your place looks like a great fit for my trip."
    });

    const messageHostNextButton = createElement("button", {
        className: "confirmation-pay-next-button",
        type: "button",
        textContent: "Next"
    });

    const messageHostSummary = createElement("p", {
        className: "message-host-summary",
        textContent: ""
    });

    const messageHostChangeButton = createElement("button", {
        className: "confirmation-change-button",
        type: "button",
        textContent: "Change"
    });

    messageHostChangeButton.addEventListener("click", () => {
        messageHostContainer.classList.remove("completed");

        messageHostContent.classList.remove("collapsed");
        messageHostContent.classList.add("open");

        reviewReservationContent.classList.add("collapsed");
        reviewReservationContent.classList.remove("open");    
    });

    const messageHostCompletedContent = createElement("div", {
        className: "message-host-completed-content"
    });

    messageHostCompletedContent.append(
        messageHostSummary,
        messageHostChangeButton
    );

    messageHostContent.append(
        messageHostDescription,
        messageHostTextarea,
        messageHostNextButton
    );

    messageHostContainer.append(
        messageHostTitle,
        messageHostCompletedContent,
        messageHostContent
    );

    const reviewReservationContainer = createElement("div", {
        className: "confirmation-step-container"
    });

    const reviewReservationContent = createElement("div", {
        className: "review-reservation-content collapsed"
    });

    const reviewReservationDescription = createElement("p", {
        className: "review-reservation-description",
        textContent: "The host has 24 hours to confirm your booking. You’ll be charged after the request is accepted."
    });

    const confirmBookingButton = createElement("button", {
        className: "request-booking-button",
        type: "button",
        textContent: "Request to book"
    });

    confirmBookingButton.addEventListener("click", () => {
        console.log("Booking requested");

        
    });

    messageHostNextButton.addEventListener("click", () => {
        const message = messageHostTextarea.value.trim();

        if (!message) {
            return;
        }

        messageHostSummary.textContent = "Message added";

        messageHostContainer.classList.add("completed");

        messageHostContent.classList.add("collapsed");
        messageHostContent.classList.remove("open");

        reviewReservationContent.classList.remove("collapsed");
        reviewReservationContent.classList.add("open");
    });

    const reviewReservationTitle = createElement("h3", {
        className: "confirmation-step-title",
        textContent: "4. Review your request"
    });

    reviewReservationContent.append(
        reviewReservationDescription,
        confirmBookingButton
    );

    reviewReservationContainer.append(
        reviewReservationTitle,
        reviewReservationContent
    );


    confirmationContainer.append(
        confirmationContainerTitle,
        confirmationPayContainer,
        paymentMethodContainer,
        messageHostContainer,
        reviewReservationContainer
    );

    return confirmationContainer;
}