"use client";

// Restaurant detail page client wrapper: keeps live Firestore data, photo uploads,
// and the review dialog. The server page passes the first restaurant payload here.

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic"; // Load ReviewDialog only on the client, not in the initial bundle
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js"; // Live listener for this restaurant doc
import { useUser } from "@/src/lib/getUser";
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx"; // Presentational UI (name, photo, reviews slot)
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";

const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

export default function Restaurant({
  id, // Restaurant document id from the URL
  initialRestaurant, // Server-fetched restaurant so the page can render immediately
  initialUserId,
  children, // Reviews (and anything else) rendered by the parent server page
}) {
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  const [isOpen, setIsOpen] = useState(false); // Whether the "Add your review" dialog is showing

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  async function handleRestaurantImage(target) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateRestaurantImage(id, image);
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }

  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" }); // Clear the form so the next open starts empty
  };

  useEffect(() => {
    // Subscribe to this restaurant; unsubscribe when the component unmounts or id changes
    return getRestaurantSnapshotById(id, (data) => {
      setRestaurantDetails(data);
    });
  }, [id]);

  return (
    <>
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </RestaurantDetails>
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
