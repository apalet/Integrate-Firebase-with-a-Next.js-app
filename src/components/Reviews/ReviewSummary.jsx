// import { googleAI, gemini } from '@genkit-ai/googleai';
import { genkit } from "genkit";
import { googleAI, gemini } from '@genkit-ai/googleai';
// import { vertexAI } from '@genkit-ai/vertexai';
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

// Implement the review summary component with generative AI
export async function GeminiSummary({ restaurantId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByRestaurantId(
    getFirestore(firebaseServerApp),
    restaurantId
  );

  const reviewSeparator = "@";
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://genkit.dev/docs/get-started/
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance using option 1.
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini('gemini-3.8-flash'), // O el modelo flash estable actual
    });
    const { text } = await ai.generate(prompt);
  
    // // Configure a Genkit instance using option 2.
    // const ai = genkit({
    //   plugins: [vertexAI({ location: 'us-central1' })],
    //   model: 'vertexai/gemini-2.5-flash', // set default model
    // });
    // const { text } = await ai.generate(prompt);

    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Error summarizing reviews.</p>;
  }
}

export function GeminiSummarySkeleton() {
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
