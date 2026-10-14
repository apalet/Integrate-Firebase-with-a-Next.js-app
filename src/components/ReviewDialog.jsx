"use client";

// Modal for writing a restaurant review. Stars + text are collected in a form
// that posts via a Next.js Server Action; hidden fields send restaurant and user ids.

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

import { useEffect, useLayoutEffect, useRef } from "react";
import RatingPicker from "@/src/components/RatingPicker.jsx"; // Star rating input included in the form
import { handleReviewFormSubmission } from "@/src/app/actions.js"; // Server Action that writes the review to Firestore

const ReviewDialog = ({
  isOpen, // Parent toggles whether the native <dialog> is shown
  handleClose,
  review, // Controlled review state from the parent (at least { text })
  onChange,
  userId,
  id, // Restaurant document id
}) => {
  const dialog = useRef(); // Points at the <dialog> so we can call showModal()/close()

  // dialogs only render their backdrop when called with `showModal`
  useLayoutEffect(() => {
    if (isOpen) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [isOpen, dialog]);

  const handleClick = (e) => {
    // close if clicked outside the modal
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleReviewFormSubmission} // Submit runs on the server, not a client fetch
        onSubmit={() => {
          handleClose(); // Close the modal as soon as the user submits
        }}
      >
        <header>
          <h3>Add your review</h3>
        </header>
        <article>
          <RatingPicker />

          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          {/* Not shown in the UI; the Server Action needs these ids in FormData */}
          <input type="hidden" name="restaurantId" value={id} />
          <input type="hidden" name="userId" value={userId} />
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog;
