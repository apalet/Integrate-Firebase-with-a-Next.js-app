// Firestore helpers for restaurants and reviews: one-time reads, live snapshots,
// URL filters/sort, sample data, and (stubbed) adding a review. Converts
// Firestore Timestamps to Dates so data can be passed to Client Components.

// Demo data used by "Add sample restaurants" in the Header
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

import {
  collection, // Reference to a Firestore collection (e.g. "restaurants")
  onSnapshot, // Live listener: re-runs a callback whenever matching docs change
  query, // Builds a query from a collection plus filters/sort
  getDocs, // One-time fetch of all documents matching a query
  doc, // Reference to a single document by id
  getDoc, // One-time fetch of a single document
  updateDoc, // Updates fields on an existing document
  orderBy, // Sort query results by a field
  Timestamp,
  runTransaction,
  where, // Filter query results by a field
  addDoc, // Creates a new document with an auto-generated id
  getFirestore,
} from "firebase/firestore";

// Client-side Firestore instance (browser SDK)
import { db } from "@/src/lib/firebase/clientApp";

// After an image is uploaded, save its public URL on the restaurant document
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Stub: later this will update avgRating/numRatings in the same transaction as a new review
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  return;
};

// Stub: later this will add a review under a restaurant and update its rating stats
export async function addReviewToRestaurant(db, restaurantId, review) {
  return;
}

// Add optional city/category/price filters and a sort (rating vs review count)
function applyQueryFilters(q, { category, city, price, sort }) {
  if (category) {
    q = query(q, where("category", "==", category));
  }
  if (city) {
    q = query(q, where("city", "==", city));
  }
  if (price) {
    // price is a string of $ characters; store/compare the count (e.g. "$$$" -> 3)
    q = query(q, where("price", "==", price.length));
  }
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  return q;
}

// retrieves a list of restaurants at server run time
export async function getRestaurants(db = db, filters = {}) {
  // Start with every restaurant, then apply URL search filters
  let q = query(collection(db, "restaurants"));

  q = applyQueryFilters(q, filters);
  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Same listing query as getRestaurants, but live: calls cb whenever the results change
export function getRestaurantsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "restaurants"));
  q = applyQueryFilters(q, filters);

  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    cb(results);
  });
}

// One-time fetch of a single restaurant by document id
export async function getRestaurantById(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  const docRef = doc(db, "restaurants", restaurantId);
  const docSnap = await getDoc(docRef);
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Changes made through the Firestore Database page now reflect in the web app in real time.
export function getRestaurantSnapshotById(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }

  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  const docRef = doc(db, "restaurants", restaurantId);
  return onSnapshot(docRef, (docSnap) => {
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}

// One-time fetch of reviews stored in the restaurant's "ratings" subcollection
export async function getReviewsByRestaurantId(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Live version of getReviewsByRestaurantId: calls cb whenever reviews change
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    cb(results);
  });
}

// Header helper: generate fake restaurants, then write each plus its ratings to Firestore
export async function addFakeRestaurantsAndReviews() {
  const data = await generateFakeRestaurantsAndReviews();
  for (const { restaurantData, ratingsData } of data) {
    try {
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
