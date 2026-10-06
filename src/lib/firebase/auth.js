import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase/clientApp";

// Adds an observer for changes to the user's sign-in state.
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

// Adds an observer for changes to the user's ID token.
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

// Creates a Google authentication provider instance.
export async function signInWithGoogle() {
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
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}
