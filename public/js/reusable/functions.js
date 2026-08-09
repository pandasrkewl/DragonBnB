export function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
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