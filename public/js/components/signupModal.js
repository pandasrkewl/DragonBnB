import {
  createElement,
  createModal
} from "../reusable/functions.js";

import { createLoginModal } from "./loginModal.js";

export function createSignupModal() {
  const form = createElement("form", {
    className: "signup-form"
  });

  const errorMessage = createElement("p", {
    className: "signup-error",
    textContent: ""
  });

  const firstNameInput = createElement("input", {
    type: "text",
    name: "first_name",
    placeholder: "First name",
    required: "required"
  });

  const lastNameInput = createElement("input", {
    type: "text",
    name: "last_name",
    placeholder: "Last name",
    required: "required"
  });

  const emailInput = createElement("input", {
    type: "email",
    name: "email",
    placeholder: "Email",
    required: "required"
  });

  const passwordInput = createElement("input", {
    type: "password",
    name: "password",
    placeholder: "Password",
    required: "required"
  });

  const submitButton = createElement("button", {
    type: "submit",
    className: "signup-submit",
    textContent: "Create account"
  });

  const loginPrompt = createElement("p", {
    className: "auth-switch"
  });

  const loginText = createElement("span", {
    textContent: "Already have an account? "
  });

  const loginLink = createElement("a", {
    href: "#",
    className: "auth-switch-link",
    textContent: "Log in"
  });

loginPrompt.append(loginText, loginLink);

  form.append(
    firstNameInput,
    lastNameInput,
    emailInput,
    passwordInput,
    errorMessage,
    submitButton,
    loginPrompt
  );

  const modal = createModal("Create an account", form);

    loginLink.addEventListener("click", (event) => {
    event.preventDefault();

    modal.remove();
    document.body.appendChild(createLoginModal());
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.textContent = "";
    errorMessage.classList.remove("visible");

    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";

    const formData = new FormData(form);

    const data = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      host: false
    };

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to create account.");
      }

      modal.remove();
      window.location.reload();

    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.classList.add("visible");

      submitButton.disabled = false;
      submitButton.textContent = "Create account";
    }
  });

  return modal;
}