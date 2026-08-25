import { createElement } from "../reusable/functions.js";
import { createThreadHeader, createMessageBubble } from "./messagesUI.js";

export function createActiveThread(
  conversation,
  messages,
  currentUser,
  onSubmitMessage,
) {
  const headerUI = createThreadHeader(conversation, currentUser, () => {
    const sidebar = document.querySelector(".reservation-sidebar");
    if (sidebar) sidebar.classList.toggle("hidden");
  });

  const messagesArea = createElement("div", {
    className: "messages-scroll-area",
  });

  if (messages && messages.length > 0) {
    messages.forEach((msg) => {
      messagesArea.appendChild(createMessageBubble(msg, currentUser.id));
    });
  }

  const chatInputArea = createElement("form", { className: "chat-input-form" });

  const inputField = createElement("textarea", {
    className: "chat-input-field",
    placeholder: "Type a message...",
  });

  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatInputArea.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true }),
      );
    }
  });

  chatInputArea.append(inputField);
  chatInputArea.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = inputField.value.trim();
    if (text) {
      onSubmitMessage(text, messagesArea);
      inputField.value = "";
    }
  });

  const chatColumn = createElement("div", { className: "thread-main" }, [
    messagesArea,
    chatInputArea,
  ]);

  const threadBody = createElement(
    "div",
    { className: "thread-body-wrapper" },
    [chatColumn],
  );

  if (currentUser.host && conversation.booking_status === "pending") {
    const reservationPanel = createReservationPanel(
      conversation,
      async (status) => {
        try {
          const backendStatus =
            status === "accepted"
              ? "confirmed"
              : "rejected";

          const response = await fetch(
            `/api/bookings/${conversation.booking_id}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                status: backendStatus
              })
            }
          );

          const result = await response.json();

          if (!response.ok) {
            console.error(result.error);
            return;
          }

          reservationPanel.classList.add("hidden");

          if (result.message) {
            messagesArea.appendChild(
              createMessageBubble(
                result.message,
                currentUser.id
              )
            );

            messagesArea.scrollTop =
              messagesArea.scrollHeight;
          }

        } catch (error) {
          console.error(
            "Error updating reservation:",
            error
          );
        }
      }
    );
    reservationPanel.classList.add("hidden");
    threadBody.appendChild(reservationPanel);
  }

  return { headerUI, threadBody, messagesArea };
}

function createReservationPanel(conversation, onAction) {
  const panel = createElement("div", { className: "reservation-sidebar" });

  const avatar = createElement("img", {
    src:
      conversation.other_user_image || "/assets/placeholders/default_user.jpg",
    className: "reservation-avatar",
  });

  const title = createElement("h2", {
    textContent: `${conversation.guest_name || "Guest"} asked to stay ${conversation.nights || "X"} nights`,
  });

  const checkInStr = conversation.check_in_date
    ? new Date(conversation.check_in_date).toLocaleDateString()
    : "N/A";
  const checkOutStr = conversation.check_out_date
    ? new Date(conversation.check_out_date).toLocaleDateString()
    : "N/A";

  const details = createElement("div", { className: "reservation-details" }, [
    createElement("p", { textContent: `Guests: ${conversation.guests || 1}` }),
    createElement("p", { textContent: `Check-in: ${checkInStr}` }),
    createElement("p", { textContent: `Checkout: ${checkOutStr}` }),
    createElement("p", {
textContent: `Total: $${Number(conversation.total_price || 0).toFixed(2)}`,
    }),
  ]);

  const acceptBtn = createElement("button", {
    className: "btn accept-btn",
    textContent: "Accept",
  });
  const declineBtn = createElement("button", {
    className: "btn decline-btn",
    textContent: "Decline",
  });

  acceptBtn.addEventListener("click", () => onAction("accepted"));
  declineBtn.addEventListener("click", () => onAction("rejected"));

  panel.append(avatar, title, details, acceptBtn, declineBtn);
  return panel;
}
