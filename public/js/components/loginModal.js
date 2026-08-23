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

  signupLink.addEventListener("click", () => {
    modal.remove();
    document.body.appendChild(createSignupModal());
  });

  return modal;
}