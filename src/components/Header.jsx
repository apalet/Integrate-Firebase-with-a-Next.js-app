"use client"; // This component runs in the browser so it can listen to Firebase auth changes
// Site header: logo, Google sign-in/out, and a profile menu. On auth changes it
// updates the __session cookie so the server can see the same user, then reloads
// the page when the signed-in user actually changes.
import React, { useEffect } from "react";
import Link from "next/link"; // Next.js link for client-side navigation back to home
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
// Seeds Firestore with demo restaurants and reviews
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
// Helpers to store or clear the session cookie on the client
import { setCookie, deleteCookie } from "cookies-next";

// In order to pass the authentication state to the server, we'll use cookies.
// Whenever the authentication state changes in the client, we'll update the __session cookie.
function useUserSession(initialUser) {
  useEffect(() => {
    // Subscribe to Firebase ID token changes (sign-in, sign-out, refresh)
    return onIdTokenChanged(async (user) => {
      if (user) {
        // Signed in: copy the Firebase ID token into the __session cookie
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        // Signed out: remove the cookie so the server no longer sees a session
        await deleteCookie("__session");
      }
      // Skip reload if this is the same user the server already rendered
      if (initialUser?.uid === user?.uid) {
        return;
      }
      // Reload so server components re-render with the new auth state
      window.location.reload();
    });
  }, [initialUser]);

  return initialUser;
}

export default function Header({ initialUser }) {
  // Keep the header in sync with the user passed from the server
  const user = useUserSession(initialUser);

  const handleSignOut = (event) => {
    event.preventDefault();
    signOut();
  };

  const handleSignIn = (event) => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <header>
      {/* App logo and name; clicking returns to the home page */}
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>
      {user ? (
        <>
          {/* Signed-in profile: photo, name, and dropdown menu */}
          <div className="profile">
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {user.displayName}
            </p>

            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                <li>
                  {/* Dev helper: populate Firestore with sample data */}
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        // Signed-out state: Google sign-in button
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
