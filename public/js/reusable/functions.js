export function createElement(tag, attributes = {}, children = []) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'id') {
            el.id = value;
        } else if (key === 'textContent') {
            el.textContent = value;
        } else {
            el.setAttribute(key, value);
        }
    }

    children.forEach((child) => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child) {
            el.appendChild(child);
        }
    });

    return el;
}

export function createModal(titleText, bodyElement) {
    const overlay = createElement('div', {
        className: 'modal-overlay',
    });
    const modal = createElement('div', {
        className: 'modal',
    });
    const closeButton = createElement('button', {
        className: 'modal-close',
        textContent: '×',
    });
    const title = createElement('h2', {
        className: 'modal-title',
        textContent: titleText,
    });
    modal.append(closeButton, title, bodyElement);
    overlay.append(modal);
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });
    return overlay;
}
