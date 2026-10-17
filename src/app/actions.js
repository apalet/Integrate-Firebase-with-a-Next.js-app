"use server";

import { addReviewToRestaurant } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

// This is a Server Action
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
// Replace the function below
export async function handleReviewFormSubmission(data) {
  // const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Note: retrieve the server app and current user from the serverApp.js file
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();
  const db = getFirestore(firebaseServerApp);

  await addReviewToRestaurant(db, data.get("restaurantId"), {
    text: data.get("text"),
    rating: data.get("rating"),

    // This came from a hidden form field.
    //The hidden form fields embed the ID of the restaurant, and user, so that the Next.js 
    // server action can access those values upon form submission.
    // userId: data.get("userId"),
    
    // Note: Instead of letting useid be passed from client in hidden form field, use the server-side
    // firebase auth result for currentUser.uid. This will be more secure since not relying on client-side code.
    userId: currentUser.uid,
  });
}
