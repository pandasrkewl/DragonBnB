import { createElement, createModal } from "../reusable/functions.js";

export function createReviewModal(trip, onReviewSubmitted) {

  let selectedRating = 0;

  const starsContainer = createElement("div", {
    className: "review-stars"
  });

  const stars = [];

  for (let i = 1; i <= 5; i++) {

    const star = createElement("button", {
      type: "button",
      className: "review-star",
      textContent: "☆"
    });

    star.addEventListener("click", () => {

      selectedRating = i;

      stars.forEach((currentStar, index) => {

        if (index < selectedRating) {
          currentStar.textContent = "★";
          currentStar.classList.add("selected");
        } else {
          currentStar.textContent = "☆";
          currentStar.classList.remove("selected");
        }

      });

    });

    stars.push(star);
    starsContainer.appendChild(star);
  }


  const reviewText = createElement("textarea", {
    className: "review-textarea",
    placeholder: "Share your experience..."
  });


  const error = createElement("p", {
    className: "booking-error",
    textContent: ""
  });


  const submitButton = createElement("button", {
    type: "button",
    className: "review-submit-button",
    textContent: "Submit review"
  });


  const content = createElement("div", {
    className: "review-modal-content"
  }, [
    createElement("p", {
      className: "review-property-name",
      textContent: trip.title
    }),

    createElement("p", {
      textContent: "How was your stay?"
    }),

    starsContainer,
    reviewText,
    error,
    submitButton
  ]);


  const modal = createModal(
    "Write a review",
    content
  );


  submitButton.addEventListener("click", async () => {

    error.textContent = "";

    if (selectedRating === 0) {
      error.textContent = "Please choose a star rating.";
      return;
    }

    try {

      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      const response = await fetch("/api/reviews", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          bookingId: trip.booking_id,
          rating: selectedRating,
          comment: reviewText.value
        })
      });


      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit review"
        );
      }


      trip.review_id = data.review.id;
      trip.review_rating = data.review.rating;
      trip.review_comment = data.review.comment;

      modal.remove();

      if (onReviewSubmitted) {
        onReviewSubmitted();
      } 

    } catch (reviewError) {

      console.error(
        "Error submitting review:",
        reviewError
      );

      error.textContent = reviewError.message;

      submitButton.disabled = false;
      submitButton.textContent = "Submit review";
    }

  });


  document.body.appendChild(modal);
}