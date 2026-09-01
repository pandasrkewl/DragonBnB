export function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "boolean") {
      if (value) {
        el.setAttribute(key, key);
      } else {
        el.removeAttribute(key);
      }
      continue;
    }

    if (key === "className") {
      el.className = value;
    } else if (key === "id") {
      el.id = value;
    }
    else if (key === "textContent") {
      el.textContent = value;
    } else {
      el.setAttribute(key, value);
    }
  }

  children.forEach((child) => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  });

  return el;
}

export function createModal(titleText, bodyElement) {
    const overlay = createElement("div", {
        className: "modal-overlay"
    });
    const modal = createElement("div", {
        className: "modal"
    });
    const closeButton = createElement("button", {
        className: "modal-close",
        textContent: "×"
    });
    const title = createElement("h2", {
        className: "modal-title",
        textContent: titleText
    });
    modal.append(
        closeButton,
        title,
        bodyElement
    );
    overlay.append(modal);
    closeButton.addEventListener("click", () => {
        overlay.remove();
    });
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });
    return overlay;
}

// In-page replacement for window.confirm(). Resolves true when the confirm
// button is clicked, false when cancelled / dismissed.
export function createConfirmModal({
    title = "Are you sure?",
    message = "",
    confirmText = "Confirm",
    cancelText = "Never mind",
    danger = false,
} = {}) {
    return new Promise((resolve) => {
        let settled = false;

        const finish = (result) => {
            if (settled) {
                return;
            }
            settled = true;
            overlay.remove();
            resolve(result);
        };

        const messageEl = createElement("p", {
            className: "confirm-modal-message",
            textContent: message,
        });

        const cancelButton = createElement("button", {
            type: "button",
            className: "confirm-modal-cancel",
            textContent: cancelText,
        });

        const confirmButton = createElement("button", {
            type: "button",
            className: danger
                ? "confirm-modal-confirm danger"
                : "confirm-modal-confirm",
            textContent: confirmText,
        });

        cancelButton.addEventListener("click", () => finish(false));
        confirmButton.addEventListener("click", () => finish(true));

        const actions = createElement("div", {
            className: "confirm-modal-actions",
        }, [cancelButton, confirmButton]);

        const body = createElement("div", {
            className: "confirm-modal-body",
        }, [messageEl, actions]);

        const overlay = createModal(title, body);

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                finish(false);
            }
        });

        const closeButton = overlay.querySelector(".modal-close");
        if (closeButton) {
            closeButton.addEventListener("click", () => finish(false));
        }

        document.body.appendChild(overlay);
        confirmButton.focus();
    });
}