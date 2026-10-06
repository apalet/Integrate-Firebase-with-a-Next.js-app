// Server-only: reads the __session cookie and creates a Firebase app authenticated
// as that user (or anonymous if there is no token). page.js uses this to query
// Firestore on the server with the same identity as the browser.

// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

// Next.js helper to read request cookies (including the __session token from Header)
import { cookies } from "next/headers";
// initializeApp: default Firebase app; initializeServerApp: server instance with a user token
import { initializeServerApp, initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth"; // Auth API attached to the server Firebase app

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
export async function getAuthenticatedAppForUser() {
  // ID token stored by Header's useUserSession when the user signs in
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  const firebaseServerApp = initializeServerApp(
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    initializeApp(),
    {
      authIdToken,
    }
  );

  // Auth for this server app; wait until Firebase has resolved signed-in vs signed-out
  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  // page.js uses firebaseServerApp for Firestore; currentUser is the signed-in user (or null)
  return { firebaseServerApp, currentUser: auth.currentUser };
}
