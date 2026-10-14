// Called from Restaurant.jsx when the user picks a photo: upload the file to
// Firebase Storage, then save the public download URL on the restaurant
// document in Firestore so the UI can display it.

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp"; // Client-side Firebase Storage instance

import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

// This function updates an existing restaurant document in Cloud Firestore with an updated image URL.
export async function updateRestaurantImage(restaurantId, image) {
  try {
    if (!restaurantId) {
      throw new Error("No restaurant ID has been provided.");
    }

    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }

    const publicImageUrl = await uploadImage(restaurantId, image);
    await updateRestaurantImageReference(restaurantId, publicImageUrl);

    return publicImageUrl; // Restaurant.jsx uses this to update local state immediately
  } catch (error) {
    console.error("Error processing request:", error);
  }
}

async function uploadImage(restaurantId, image) {
  // Path in the Storage bucket: one folder per restaurant, file named as uploaded
  const filePath = `images/${restaurantId}/${image.name}`;
  const newImageRef = ref(storage, filePath);
  await uploadBytesResumable(newImageRef, image); // Upload the File/Blob; waits until complete

  return await getDownloadURL(newImageRef); // HTTPS URL anyone can use to load the image
}
