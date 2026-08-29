import { createElement } from "../reusable/functions.js";

export function createConversationList(conversations, activeConvoId, onSelect) {
  const listContainer = createElement("div", { className: "convo-list" });

  if (!conversations || conversations.length === 0) {
    listContainer.appendChild(
      createElement("p", {
        className: "no-convos-text",
        textContent: "No past conversations.",
      }),
    );
    return listContainer;
  }

  conversations.forEach((convo) => {
    const isActive = convo.id === activeConvoId;

    const avatar = createElement("img", {
      src: convo.other_user_image || "/assets/placeholders/default_user.jpg",
      className: "convo-avatar",
    });

    const title = createElement("div", {
      className: "convo-title",
      textContent: convo.other_user_name || "User",
    });

    const textChildren = [title];

    if (convo.property_title) {
      textChildren.push(
        createElement("div", {
          className: "convo-property",
          textContent: convo.property_title,
        }),
      );
    }

    const textContainer = createElement(
      "div",
      { className: "convo-text-wrapper" },
      textChildren,
    );

    const date = createElement("div", {
      className: "convo-date",
      textContent: formatDate(convo.last_updated),
    });

    const card = createElement(
      "div",
      {
        className: `convo-card ${isActive ? "active" : ""}`,
      },
      [avatar, textContainer, date],
    );

    card.addEventListener("click", () => onSelect(convo.id));
    listContainer.appendChild(card);
  });

  return listContainer;
}

export function createThreadHeader(
  conversation,
  currentUser,
  onToggleReservation,
) {
  const isHost = currentUser.id === conversation.host_id;

  const targetAvatar = isHost
    ? conversation.guest_image || "/assets/placeholders/default_user.jpg"
    : conversation.host_image || "/assets/placeholders/default_user.jpg";

  const targetName = isHost
    ? conversation.guest_name || "Guest"
    : conversation.host_name || "Host";

  const avatar = createElement("img", {
    src: targetAvatar,
    className: "thread-header-avatar",
  });

  const userName = createElement("h2", {
    className: "thread-header-title",
    textContent: targetName,
  });

  const subText = createElement("span", {
    className: "thread-header-details",
    textContent: conversation.property_title || "",
  });

  const titleContainer = createElement(
    "div",
    { className: "thread-title-container" },
    [userName, subText],
  );

  const headerInfo = createElement("div", { className: "thread-header-info" }, [
    avatar,
    titleContainer,
  ]);

  const headerChildren = [headerInfo];

  if (isHost && conversation.booking_status === "pending") {
    const rightBtn = createElement("button", {
      className: "show-reservation-btn",
      textContent: "Show reservation",
    });

    if (onToggleReservation) {
      rightBtn.addEventListener("click", onToggleReservation);
    }

    const actionsContainer = createElement(
      "div",
      { className: "thread-header-actions" },
      [rightBtn],
    );
    headerChildren.push(actionsContainer);
  }

  return createElement("div", { className: "thread-header" }, headerChildren);
}

export function createMessageBubble(message, currentUserId) {
  const isMine = message.sender_id === currentUserId;
  const rawText = message.message || "";

  let bubbleContent;

  try {
    const parsed = JSON.parse(rawText);

    if (parsed.type === "reservation_request") {
      const statusTitle = createElement("h4", {
        textContent: "Reservation REQUESTED",
        className: "reservation-status-pending",
      });

      const propertyText = createElement("p", {
        textContent: parsed.property,
      });

      const datesText = createElement("p", {
        textContent: `${parsed.startDate} - ${parsed.endDate}`,
      });

      const priceText = createElement("p", {
        textContent: `Total: $${Number(parsed.total).toFixed(2)}`,
      });

      const children = [
        statusTitle,
        propertyText,
        datesText,
        priceText      
      ];

      if (parsed.image) {
        const imageElement = createElement("img", {
          src: parsed.image,
          className: "reservation-card-image",
        });
        children.push(imageElement);
      }

      bubbleContent = createElement(
        "div",
        {
          className: `message-bubble reservation-card ${
            isMine ? "mine" : "theirs"
          }`,
        },
        children,
      );
    }
    else if (parsed.type === "reservation_action") {
      const statusTitle = createElement("h4", {
        textContent: `Reservation ${parsed.status.toUpperCase()}`,
        className: `reservation-status-${parsed.status}`,
      });
      const propertyText = createElement("p", { textContent: parsed.property });
      const datesText = createElement("p", { textContent: parsed.dates });

      const children = [statusTitle, propertyText, datesText];

      if (parsed.image) {
        const imageElement = createElement("img", {
          src: parsed.image,
          className: "reservation-card-image",
        });
        children.push(imageElement);
      }

      bubbleContent = createElement(
        "div",
        {
          className: `message-bubble reservation-card ${isMine ? "mine" : "theirs"}`,
        },
        children,
      );
    } else {
      throw new Error("Not a reservation action");
    }
  } catch (e) {
    bubbleContent = createElement("div", {
      className: `message-bubble ${isMine ? "mine" : "theirs"}`,
      textContent: rawText,
    });
  }

  const timestamp = createElement("div", {
    className: "message-timestamp",
    textContent: formatTime(message.created_at),
  });

  const wrapper = createElement(
    "div",
    { className: `message-wrapper ${isMine ? "mine" : "theirs"}` },
    [bubbleContent, timestamp],
  );

  if (!isMine) {
    const avatar = createElement("img", {
      src: message.sender_image || "/assets/placeholders/default_user.jpg",
      className: "message-avatar",
    });
    return createElement("div", { className: "message-row theirs" }, [
      avatar,
      wrapper,
    ]);
  }

  return createElement("div", { className: "message-row mine" }, [wrapper]);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTime(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
