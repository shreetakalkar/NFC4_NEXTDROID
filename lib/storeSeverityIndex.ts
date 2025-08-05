import aiResponse from "@/ai/summarise";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export default async function storeSeverityIndex(uid: string, description: string): Promise<boolean> {
  console.log(`Starting storeSeverityIndex for case: ${uid}`);
  console.log(`Description: ${description}`);

  if (!uid || typeof uid !== 'string') {
    console.error("Invalid input: A valid 'uid' string is required.");
    return false;
  }
  if (!description || typeof description !== 'string') {
    console.error("Invalid input: A valid 'description' string is required.");
    return false;
  }

  try {
    const docRef = doc(db, "cases", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error(`Document with ID ${uid} does not exist in cases collection`);
      return false;
    }

    console.log("Calling AI service...");

    const aiPromise = aiResponse(description);
    const severityObj = await Promise.race([
      aiPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out")), 10000)
      ),
    ]);

    console.log("AI Response received:", severityObj);

    if (
      severityObj &&
      typeof severityObj === 'object' &&
      typeof severityObj.priority === 'string' &&
      typeof severityObj.score === 'number'
    ) {
      await setDoc(
        docRef,
        {
          priority: severityObj.priority,
          panicScore: severityObj.score,
        },
        { merge: true }
      );

      console.log("Severity index stored successfully for case:", uid);

      return true;
    } else {
      console.error("Invalid AI response structure:", severityObj);
      return false;
    }
  } catch (error) {
    console.error(`Error storing severity index for case ${uid}:`, error);
    return false;
  }
}
