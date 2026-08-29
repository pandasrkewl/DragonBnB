import { createNavbar } from "../components/navbar.js";

const navbarContainer = document.getElementById("navbar-container");

async function loadProfile() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      throw new Error("Unable to load user.");
    }

    const user = await response.json();

    if (!user) {
      window.location.href = "/";
      return;
    }

    // -------------------------
    // NAVBAR
    // -------------------------

    const navbar = createNavbar({
      userMode: "tenant",
      isRegisteredHost: user.host ?? false,
    });

    navbarContainer.appendChild(navbar);


    // -------------------------
    // PROFILE INFORMATION
    // -------------------------

    document.getElementById("profile-name").textContent =
      `${user.first_name} ${user.last_name}`;

    document.getElementById("profile-email").textContent =
      user.email;


    // -------------------------
    // DATE OF BIRTH
    // -------------------------

    const dobElement = document.getElementById("profile-dob");
    const dobButton = document.getElementById("dob-button");

    if (user.date_of_birth) {
      dobElement.textContent = formatDate(user.date_of_birth);
      dobButton.textContent = "Edit";
    } else {
      dobElement.textContent = "Add date of birth";
      dobButton.textContent = "Add";
    }

    dobButton.addEventListener("click", () => {
      openDobModal(user);
    });


    // -------------------------
    // FULL NAME
    // -------------------------

    const nameButton = document.getElementById("name-button");

    nameButton.addEventListener("click", () => {
      openNameModal(user);
    });


    // -------------------------
    // PASSWORD
    // -------------------------

    const passwordButton =
      document.getElementById("password-button");

    passwordButton.addEventListener("click", () => {
      openPasswordModal();
    });

  } catch (error) {
    console.error("Error loading profile:", error);
  }
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}


// =========================================================
// FULL NAME MODAL
// =========================================================

function openNameModal(user) {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "profile-modal";

  modal.innerHTML = `
    <button class="modal-close" type="button">&times;</button>

    <h2>Edit your name</h2>

    <div class="profile-modal-form">

      <label>
        First name
        <input
          type="text"
          id="edit-first-name"
          value="${user.first_name || ""}"
        >
      </label>

      <label>
        Last name
        <input
          type="text"
          id="edit-last-name"
          value="${user.last_name || ""}"
        >
      </label>

      <p class="profile-modal-error"></p>

      <button
        type="button"
        class="profile-save-button"
        id="save-name">
        Save
      </button>

    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal
    .querySelector(".modal-close")
    .addEventListener("click", () => {
      overlay.remove();
    });

  modal
    .querySelector("#save-name")
    .addEventListener("click", async () => {

      const firstName =
        modal.querySelector("#edit-first-name").value.trim();

      const lastName =
        modal.querySelector("#edit-last-name").value.trim();

      const error =
        modal.querySelector(".profile-modal-error");

      if (!firstName || !lastName) {
        error.textContent = "Both names are required.";
        return;
      }

      try {

        const response = await fetch("/api/profile/name", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to update name."
          );
        }

        user.first_name = firstName;
        user.last_name = lastName;

        document.getElementById("profile-name").textContent =
          `${firstName} ${lastName}`;

        overlay.remove();

      } catch (err) {
        modal.querySelector(".profile-modal-error").textContent =
          err.message;
    }
    });
}


// =========================================================
// DATE OF BIRTH MODAL
// =========================================================

function openDobModal(user) {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "profile-modal";

  modal.innerHTML = `
    <button class="modal-close" type="button">&times;</button>

    <h2>
      ${user.date_of_birth ? "Edit date of birth" : "Add date of birth"}
    </h2>

    <div class="profile-modal-form">

      <label>
        Date of birth

        <input
          type="date"
          id="edit-dob"
          value="${user.date_of_birth || ""}"
        >
      </label>

      <p class="profile-modal-error"></p>

      <button
        type="button"
        class="profile-save-button"
        id="save-dob">
        Save
      </button>

    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal
    .querySelector(".modal-close")
    .addEventListener("click", () => {
      overlay.remove();
    });

  modal
    .querySelector("#save-dob")
    .addEventListener("click", async () => {

      const dob =
        modal.querySelector("#edit-dob").value;

      const error =
        modal.querySelector(".profile-modal-error");

      if (!dob) {
        error.textContent = "Please select a date.";
        return;
      }

      try {

        const response = await fetch("/api/profile/dob", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            date_of_birth: dob
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to update date of birth."
          );
        }

        user.date_of_birth = dob;

        document.getElementById("profile-dob").textContent =
          formatDate(dob);

        document.getElementById("dob-button").textContent =
          "Edit";

        overlay.remove();

      } catch (err) {
        error.textContent = err.message;
      }
    });
}


// =========================================================
// CHANGE PASSWORD MODAL
// =========================================================

function openPasswordModal() {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "profile-modal";

  modal.innerHTML = `
    <button class="modal-close" type="button">&times;</button>

    <h2>Change password</h2>

    <div class="profile-modal-form">

      <label>
        Current password
        <input
          type="password"
          id="current-password"
          autocomplete="current-password"
        >
      </label>

      <label>
        New password
        <input
          type="password"
          id="new-password"
          autocomplete="new-password"
        >
      </label>

      <label>
        Confirm new password
        <input
          type="password"
          id="confirm-password"
          autocomplete="new-password"
        >
      </label>

      <p class="profile-modal-error"></p>

      <button
        type="button"
        class="profile-save-button"
        id="save-password">
        Change password
      </button>

    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal
    .querySelector(".modal-close")
    .addEventListener("click", () => {
      overlay.remove();
    });

  modal
    .querySelector("#save-password")
    .addEventListener("click", async () => {

      const currentPassword =
        modal.querySelector("#current-password").value;

      const newPassword =
        modal.querySelector("#new-password").value;

      const confirmPassword =
        modal.querySelector("#confirm-password").value;

      const error =
        modal.querySelector(".profile-modal-error");

      if (!currentPassword || !newPassword || !confirmPassword) {
        error.textContent = "Please fill in all fields.";
        return;
      }

      if (newPassword !== confirmPassword) {
        error.textContent = "New passwords do not match.";
        return;
      }

      if (newPassword.length < 8) {
        error.textContent =
          "New password must be at least 8 characters.";
        return;
      }

      try {

        const response = await fetch("/api/profile/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to change password."
          );
        }

        overlay.remove();

        alert("Password changed successfully.");

      } catch (err) {
        error.textContent = err.message;
      }
    });
}


loadProfile();