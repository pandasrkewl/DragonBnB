import { createElement } from "../reusable/functions.js";

export function createBookingHeader() {
    const header = createElement("header", {
        className: "main-header"
    });

    const logoImg = createElement("img", {
        src: "/assets/icons/logo.svg",
        alt: "DrexelBNB Logo",
        className: "logo-icon"
    });

    const logoSpan = createElement("span", {
        className: "logo-text",
        textContent: "DrexelBNB"
    });

    const logoLink = createElement("a", {
        href: "/",
        className: "logo"
    }, [
        logoImg,
        logoSpan
    ]);

    header.append(logoLink);

    return header;
}