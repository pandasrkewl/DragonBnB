import {
  createElement,
  createModal
} from "../reusable/functions.js";

import { createSignupModal } from "./signupModal.js";

export function createLoginModal() {
  const form = createElement("form", {
    className: "login-form"
  });

  const errorMessage = createElement("p", {
    className: "login-error",
    textContent: ""
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
    className: "login-submit",
    textContent: "Log in"
  });

  const signupPrompt = createElement("p", {
    className: "auth-switch"
  });

  const signupText = createElement("span", {
    textContent: "Don't have an account? "
  });

  const signupLink = createElement("a", {
    href: "#",
    className: "auth-switch-link",
    textContent: "Sign up"
  });

  signupPrompt.append(signupText, signupLink);

  form.append(
    emailInput,
    passwordInput,
    errorMessage,
    submitButton,
    signupPrompt
  );

  const modal = createModal("Log in", form);

  signupLink.addEventListener("click", (event) => {
    event.preventDefault();

    modal.remove();
    document.body.appendChild(createSignupModal());
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.textContent = "";
    errorMessage.classList.remove("visible");

    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    const formData = new FormData(form);

    const data = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to log in.");
      }

      modal.remove();
      window.location.reload();

    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.classList.add("visible");

      submitButton.disabled = false;
      submitButton.textContent = "Log in";
    }
  });

  return modal;
}