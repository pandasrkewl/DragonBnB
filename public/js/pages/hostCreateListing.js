import { createNavbar } from "../components/navbar.js";
import { createElement, createModal } from "../reusable/functions.js";

const navBarContainer = document.getElementById("navbar-container");
const listingGrid = document.getElementById("listing-grid");
const createListingButton = document.getElementById("create-listing-btn");

const navElement = createNavbar({
  userMode: "host",
  activeHostTab: 2,
});
navBarContainer.appendChild(navElement);

// CREATE LISTING FORM
function createListingForm() {
  const form = createElement("form", {
    className: "create-listing-form"
  });

  // Property type
  const propertyTypeLabel = createElement("label", {
    textContent: "What type of property is it?"
  });

  const propertyType = createElement("select", {
    name: "property_type",
    required: "required"
  });

  propertyType.append(
    createElement("option", {
      value: "",
      textContent: "Select property type"
    }),
    createElement("option", {
      value: "House",
      textContent: "House"
    }),
    createElement("option", {
      value: "Apartment",
      textContent: "Apartment"
    }),
    createElement("option", {
      value: "Room",
      textContent: "Room"
    }),
    createElement("option", {
      value: "Hotel",
      textContent: "Hotel"
    })
  );

  // Title
  const titleLabel = createElement("label", {
    textContent: "Listing title"
  });

  const title = createElement("input", {
    type: "text",
    name: "title",
    placeholder: "Property title",
    required: "required"
  });

  // Description
  const descriptionLabel = createElement("label", {
    textContent: "Describe your property"
  });

  const description = createElement("textarea", {
    name: "description",
    placeholder: "Tell guests about your property",
    required: "required"
  });

  // Address
  const addressLabel = createElement("label", {
    textContent: "Street address"
  });

  const address = createElement("input", {
    type: "text",
    name: "address_line_1",
    placeholder: "Street address",
    autocomplete: "off",
    required: "required"
  });

  const addressSuggestions = createElement("div", {
    className: "suggestion-list address-suggestion-list"
  });

  const addressField = createElement(
    "div",
    { className: "address-field" },
    [address, addressSuggestions]
  );

  let addressDebounceTimer = null;

  address.addEventListener("input", () => {
    clearTimeout(addressDebounceTimer);
    const query = address.value.trim();

    if (query.length < 4) {
      addressSuggestions.classList.remove("open");
      addressSuggestions.replaceChildren();
      return;
    }

    addressDebounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          return;
        }

        const results = await response.json();
        addressSuggestions.replaceChildren();

        if (!results.length) {
          addressSuggestions.classList.remove("open");
          return;
        }

        results.forEach((result) => {
          const item = createElement("button", {
            type: "button",
            className: "suggestion-item",
            textContent: result.display_name
          });

          item.addEventListener("click", () => {
            const details = result.address || {};
            address.value = [details.house_number, details.road].filter(Boolean).join(" ") || address.value;
            city.value = details.city || details.town || details.village || city.value;
            state.value = details.state || state.value;
            postalCode.value = details.postcode || postalCode.value;
            country.value = details.country || country.value;

            addressSuggestions.classList.remove("open");
            addressSuggestions.replaceChildren();
          });

          addressSuggestions.appendChild(item);
        });

        addressSuggestions.classList.add("open");
      } catch (error) {
        console.error("Address autocomplete failed:", error);
      }
    }, 450);
  });

  const addressLine2 = createElement("input", {
    type: "text",
    name: "address_line_2",
    placeholder: "Apartment, suite, unit, etc. (optional)"
  });

  const city = createElement("input", {
    type: "text",
    name: "city",
    placeholder: "City",
    required: "required"
  });

  const state = createElement("input", {
    type: "text",
    name: "state",
    placeholder: "State",
    required: "required"
  });

  const postalCode = createElement("input", {
    type: "text",
    name: "postal_code",
    placeholder: "ZIP code",
    required: "required"
  });

  const country = createElement("input", {
    type: "text",
    name: "country",
    value: "United States",
    placeholder: "Country",
    required: "required"
  });

  // Guests
  const guestsLabel = createElement("label", {
    textContent: "Maximum guests"
  });

  const guests = createElement("input", {
    type: "number",
    name: "max_guests",
    min: "1",
    placeholder: "Maximum guests",
    required: "required"
  });

  // Bedrooms
  const bedroomsLabel = createElement("label", {
    textContent: "Bedrooms"
  });

  const bedrooms = createElement("input", {
    type: "number",
    name: "bedrooms",
    min: "0",
    placeholder: "Bedrooms",
    required: "required"
  });

  // Beds
  const bedsLabel = createElement("label", {
    textContent: "Beds"
  });

  const beds = createElement("input", {
    type: "number",
    name: "beds",
    min: "0",
    placeholder: "Beds",
    required: "required"
  });

  // Bathrooms
  const bathroomsLabel = createElement("label", {
    textContent: "Bathrooms"
  });

  const bathrooms = createElement("input", {
    type: "number",
    name: "bathrooms",
    min: "0",
    step: "0.5",
    placeholder: "Bathrooms",
    required: "required"
  });

  // Pets
  const petsAllowed = createElement("input", {
    type: "checkbox",
    name: "pets_allowed"
  });

  const petsLabel = createElement(
    "label",
    {},
    [
      petsAllowed,
      " Pets allowed"
    ]
  );

  // Check-in / Check-out
  const checkInLabel = createElement("label", {
    textContent: "Check-in time"
  });

  const checkInTime = createElement("input", {
    type: "time",
    name: "check_in_time"
  });

  const checkOutLabel = createElement("label", {
    textContent: "Check-out time"
  });

  const checkOutTime = createElement("input", {
    type: "time",
    name: "check_out_time"
  });

  // Amenities
  const amenitiesTitle = createElement("h3", {
    textContent: "What does your place offer?"
  });

  const amenitiesContainer = createElement("div", {
    className: "checkbox-grid"
  });

  const amenityOptions = [
    "Wifi",
    "Kitchen",
    "Air conditioning",
    "Heating",
    "Washer",
    "Dryer",
    "TV",
    "Free parking on premises",
    "Smoke alarm",
    "Carbon monoxide alarm",
    "Dedicated workspace",
    "Patio or balcony",
    "Pool",
    "Hot tub"
  ];

  const amenityCheckboxes = [];

  amenityOptions.forEach((amenityName) => {
    const checkbox = createElement("input", {
      type: "checkbox",
      value: amenityName
    });

    amenityCheckboxes.push(checkbox);

    const label = createElement(
      "label",
      {},
      [
        checkbox,
        ` ${amenityName}`
      ]
    );

    amenitiesContainer.appendChild(label);
  });

  // Price
  const priceLabel = createElement("label", {
    textContent: "Price per night"
  });

  const price = createElement("input", {
    type: "number",
    name: "price_per_night",
    min: "1",
    step: "0.01",
    placeholder: "Price per night",
    required: "required"
  });

  // Images
  const imageLabel = createElement("label", {
    textContent: "Property photos"
  });

  const images = createElement("input", {
    type: "file",
    name: "images",
    accept: "image/*",
    multiple: "multiple"
  });

  // Error message
  const errorMessage = createElement("p", {
    className: "create-listing-error",
    textContent: ""
  });

  // Submit button
  const submitButton = createElement("button", {
    type: "submit",
    className: "primary-btn",
    textContent: "Create Listing"
  });


  form.append(
    propertyTypeLabel,
    propertyType,

    titleLabel,
    title,

    descriptionLabel,
    description,

    addressLabel,
    addressField,
    addressLine2,
    city,
    state,
    postalCode,
    country,

    guestsLabel,
    guests,

    bedroomsLabel,
    bedrooms,

    bedsLabel,
    beds,

    bathroomsLabel,
    bathrooms,

    petsLabel,

    checkInLabel,
    checkInTime,

    checkOutLabel,
    checkOutTime,

    amenitiesTitle,
    amenitiesContainer,

    priceLabel,
    price,

    imageLabel,
    images,

    errorMessage,
    submitButton
  );


  const modal = createModal(
    "Create Your Listing",
    form
  );


  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.textContent = "";

    submitButton.disabled = true;
    submitButton.textContent = "Creating Listing...";

    const selectedAmenities = amenityCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    const data = {
      property_type: propertyType.value,
      title: title.value,
      description: description.value,
      address_line_1: address.value,
      address_line_2: addressLine2.value || null,
      city: city.value,
      state: state.value,
      postal_code: postalCode.value,
      country: country.value,
      max_guests: Number(guests.value),
      bedrooms: Number(bedrooms.value),
      beds: Number(beds.value),
      bathrooms: Number(bathrooms.value),
      pets_allowed: petsAllowed.checked,
      check_in_time: checkInTime.value || null,
      check_out_time: checkOutTime.value || null,
      price_per_night: Number(price.value)
    };

    try {
      // Create property
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to create listing"
        );
      }
      const property = result;
      // Upload images
      if (images.files.length > 0) {
        const imageFormData = new FormData();

        for (const image of images.files) {
          imageFormData.append("images", image);
        }

        const imageResponse = await fetch(
          `/api/properties/${property.id}/images`,
          {
            method: "POST",
            body: imageFormData
          }
        );

        if (!imageResponse.ok) {
          throw new Error(
            "Property created, but images failed to upload"
          );
        }
      }
      // Save amenities
      if (selectedAmenities.length > 0) {
        const amenitiesResponse = await fetch(
          `/api/properties/${property.id}/amenities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              amenities: selectedAmenities
            })
          }
        );

        if (!amenitiesResponse.ok) {
          throw new Error(
            "Property created, but amenities failed to save"
          );
        }
      }
      modal.remove();
      await loadListings();
    } catch (error) {
      console.error("Error creating listing:", error);
      errorMessage.textContent = error.message;
      submitButton.disabled = false;
      submitButton.textContent = "Create Listing";
    }
  });
  return modal;
}
// CREATE LISTING BUTTON
createListingButton.addEventListener("click", () => {
  document.body.appendChild(
    createListingForm()
  );
});
// EDIT LISTING
async function openEditListingModal(propertySummary) {
  try {
    const response = await fetch(
      `/api/properties/${propertySummary.id}`
    );
    if (!response.ok) {
      throw new Error("Failed to load property");
    }
    const property = await response.json();
    const form = createElement("form", {
      className: "create-listing-form"
    });

    // Property type
    const propertyTypeLabel = createElement("label", {
      textContent: "Property type"
    });

    const propertyType = createElement("select");

    const propertyTypes = [
      "House",
      "Apartment",
      "Room",
      "Hotel"
    ];

    propertyTypes.forEach((type) => {
      const option = createElement("option", {
        value: type,
        textContent: type
      });

      if (type === property.property_type) {
        option.selected = true;
      }

      propertyType.appendChild(option);
    });

    // Title
    const titleLabel = createElement("label", {
      textContent: "Title"
    });

    const title = createElement("input", {
      type: "text",
      value: property.title,
      required: "required"
    });


    // Description

    const descriptionLabel = createElement("label", {
      textContent: "Description"
    });

    const description = createElement("textarea", {
      required: "required"
    });

    description.value = property.description || "";

    // Address
    const addressLabel = createElement("label", {
      textContent: "Street address"
    });

    const address = createElement("input", {
      type: "text",
      value: property.address_line_1,
      required: "required"
    });

    const addressLine2Label = createElement("label", {
      textContent: "Address line 2"
    });

    const addressLine2 = createElement("input", {
      type: "text",
      value: property.address_line_2 || "",
      placeholder: "Apartment, suite, unit, etc. (optional)"
    });

    const cityLabel = createElement("label", {
      textContent: "City"
    });

    const city = createElement("input", {
      type: "text",
      value: property.city,
      required: "required"
    });

    const stateLabel = createElement("label", {
      textContent: "State"
    });

    const state = createElement("input", {
      type: "text",
      value: property.state,
      required: "required"
    });

    const postalCodeLabel = createElement("label", {
      textContent: "ZIP Code"
    });

    const postalCode = createElement("input", {
      type: "text",
      value: property.postal_code,
      required: "required"
    });

    const countryLabel = createElement("label", {
      textContent: "Country"
    });

    const country = createElement("input", {
      type: "text",
      value: property.country,
      required: "required"
    });

    // Guests
    const guestsLabel = createElement("label", {
      textContent: "Maximum guests"
    });

    const guests = createElement("input", {
      type: "number",
      min: "1",
      value: property.max_guests,
      required: "required"
    });

    // Bedrooms
    const bedroomsLabel = createElement("label", {
      textContent: "Bedrooms"
    });

    const bedrooms = createElement("input", {
      type: "number",
      min: "0",
      value: property.bedrooms,
      required: "required"
    });

    // Beds
    const bedsLabel = createElement("label", {
      textContent: "Beds"
    });

    const beds = createElement("input", {
      type: "number",
      min: "0",
      value: property.beds,
      required: "required"
    });

    // Bathrooms
    const bathroomsLabel = createElement("label", {
      textContent: "Bathrooms"
    });

    const bathrooms = createElement("input", {
      type: "number",
      min: "0",
      step: "0.5",
      value: property.bathrooms,
      required: "required"
    });

    // Pets
    const petsAllowed = createElement("input", {
      type: "checkbox"
    });

    petsAllowed.checked = property.pets_allowed;

    const petsLabel = createElement(
      "label",
      {},
      [
        petsAllowed,
        " Pets allowed"
      ]
    );

    // Check-in / Check-out
    const checkInLabel = createElement("label", {
      textContent: "Check-in time"
    });

    const checkInTime = createElement("input", {
      type: "time"
    });

    if (property.check_in_time) {
      checkInTime.value =
        property.check_in_time.substring(0, 5);
    }

    const checkOutLabel = createElement("label", {
      textContent: "Check-out time"
    });

    const checkOutTime = createElement("input", {
      type: "time"
    });

    if (property.check_out_time) {
      checkOutTime.value =
        property.check_out_time.substring(0, 5);
    }

    // Price
    const priceLabel = createElement("label", {
      textContent: "Price per night"
    });

    const price = createElement("input", {
      type: "number",
      min: "1",
      step: "0.01",
      value: property.price_per_night,
      required: "required"
    });

    // Save button
    const saveButton = createElement("button", {
      type: "submit",
      className: "primary-btn",
      textContent: "Save Changes"
    });
    form.append(
      propertyTypeLabel,
      propertyType,

      titleLabel,
      title,

      descriptionLabel,
      description,

      addressLabel,
      address,

      addressLine2Label,
      addressLine2,

      cityLabel,
      city,

      stateLabel,
      state,

      postalCodeLabel,
      postalCode,

      countryLabel,
      country,

      guestsLabel,
      guests,

      bedroomsLabel,
      bedrooms,

      bedsLabel,
      beds,

      bathroomsLabel,
      bathrooms,

      petsLabel,

      checkInLabel,
      checkInTime,

      checkOutLabel,
      checkOutTime,

      priceLabel,
      price,

      saveButton
    );

    const modal = createModal(
      "Edit Listing",
      form
    );

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      saveButton.disabled = true;
      saveButton.textContent = "Saving...";

      const data = {
        property_type: propertyType.value,
        title: title.value,
        description: description.value,
        address_line_1: address.value,
        address_line_2: addressLine2.value || null,
        city: city.value,
        state: state.value,
        postal_code: postalCode.value,
        country: country.value,
        max_guests: Number(guests.value),
        bedrooms: Number(bedrooms.value),
        beds: Number(beds.value),
        bathrooms: Number(bathrooms.value),
        pets_allowed: petsAllowed.checked,
        check_in_time: checkInTime.value || null,
        check_out_time: checkOutTime.value || null,
        price_per_night: Number(price.value)
      };

      try {
        const updateResponse = await fetch(
          `/api/properties/${property.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          }
        );

        const result = await updateResponse.json();

        if (!updateResponse.ok) {
          throw new Error(
            result.error || "Failed to update property"
          );
        }

        modal.remove();

        await loadListings();

      } catch (error) {
        console.error("Error updating property:", error);

        alert(error.message);

        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";
      }
    });


    document.body.appendChild(modal);

  } catch (error) {
    console.error("Error opening edit listing:", error);

    alert("Unable to edit listing.");
  }
}

// DELETE PROPERTY
async function deleteProperty(propertyId) {
  try {
    const response = await fetch(
      `/api/properties/${propertyId}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Failed to delete property"
      );
    }

    await loadListings();

  } catch (error) {
    console.error("Error deleting property:", error);

    alert(error.message);
  }
}

// LOAD HOST LISTINGS
async function loadListings() {
  try {
    const response = await fetch("/api/host/properties");
    if (!response.ok) {
      const result = await response.json();
      throw new Error(
        result.error || "Failed to load listings"
      );
    }

    const properties = await response.json();

    listingGrid.innerHTML = "";

    if (properties.length === 0) {
      const message = document.createElement("p");

      message.textContent =
        "You don't have any listings yet.";

      listingGrid.appendChild(message);

      return;
    }
    properties.forEach((property) => {

      // Card
      const card = createElement("article", {
        className: `listing-card${property.has_bookings ? " listing-card--locked" : ""}`,
        style: "cursor: pointer;"
      });

      // Image
      const image = createElement("img", {
        src: property.image_url || "../assets/placeholders/default_home.jpg",
        alt: property.title
      });

      // Content
      const content = createElement("div", {
        className: "listing-content"
      });

      // Title
      const title = createElement("h3", {
        textContent: property.title
      });

      // Price
      const price = createElement("p", {
        className: "price",
        textContent: `$${Number(property.price_per_night).toFixed(2)} / night`
      });

      // Location
      const location = createElement("p", {
        textContent: `${property.city}, ${property.state}`
      });

      // Property type
      const type = createElement("p", {
        textContent: property.property_type
      });

      // Buttons
      const buttonGroup = createElement("div", {
        className: "button-group"
      });


      // View button
      const viewButton = createElement("button", {
        className: "view-btn",
        textContent: "View"
      });
      viewButton.addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.href =
          `/listing.html?id=${property.id}`;
      });


      // Edit button
      const editButton = createElement("button", {
        textContent: "Edit",
        disabled: property.has_bookings,
        title: property.has_bookings
          ? "This property cannot be edited because it has bookings"
          : ""
      });
      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (property.has_bookings) {
          return;
        }
        openEditListingModal(property);
      });

      // Delete button
      const deleteButton = createElement("button", {
        textContent: "Delete",
        className: "delete-btn",
        disabled: property.has_bookings,
        title: property.has_bookings
          ? "This property cannot be deleted because it has bookings"
          : ""
      });
      deleteButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (property.has_bookings) {
          return;
        }
        const confirmed = confirm(
          `Are you sure you want to delete "${property.title}"?`
        );
        if (!confirmed) {
          return;
        }
        await deleteProperty(property.id);
      });

      buttonGroup.append(
        viewButton,
        editButton,
        deleteButton
      );

      content.append(
        title,
        price,
        location,
        type,
        buttonGroup
      );

      card.append(
        image,
        content
      );

      card.addEventListener("click", () => {
        window.location.href =
          `/listing.html?id=${property.id}`;
      });
      listingGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading listings:", error);
    listingGrid.innerHTML = "";
    const message = document.createElement("p");
    message.textContent =
      "Unable to load your listings.";
    listingGrid.appendChild(message);
  }
}
loadListings();