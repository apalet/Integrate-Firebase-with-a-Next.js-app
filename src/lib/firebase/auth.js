// Thin wrappers around Firebase Auth for this app: Google popup sign-in, sign-out,
// and listeners for sign-in state / ID token changes (used by Header to keep the
// session cookie in sync).

import {
  GoogleAuthProvider, // Google sign-in method used by signInWithGoogle()
  signInWithPopup, // Opens a popup so the user can sign in with Google
  onAuthStateChanged as _onAuthStateChanged, // Firebase observer; aliased so we can wrap it below
  onIdTokenChanged as _onIdTokenChanged, // Firebase token observer; aliased so we can wrap it below
} from "firebase/auth"; // Firebase Auth SDK (provider, popup sign-in, and auth listeners)

// Client-side Firebase Auth instance (browser SDK)
import { auth } from "@/src/lib/firebase/clientApp";

// Adds an observer for changes to the user's sign-in state.
// Header (and others) can pass a callback; this wires it to our app's auth instance.
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

// Adds an observer for changes to the user's ID token.
// Used to keep the __session cookie in sync when the token refreshes or the user signs in/out.
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

// Creates a Google authentication provider instance.
export async function signInWithGoogle() {
  // Google is the only sign-in method this app uses
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider); //Starts a dialog-based authentication flow.
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

// Signs out the user.
export async function signOut() {
  try {
    // Firebase Auth sign-out; Header's token listener then clears the session cookie
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}
