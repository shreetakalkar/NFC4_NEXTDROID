import aiResponse from "@/ai/summarise";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export default async function storeSeverityIndex(uid: string, description: string): Promise<boolean> {
  console.log(`Starting storeSeverityIndex for case: ${uid}`);
  console.log(`Description: ${description}`);

  // 1. Validate function inputs immediately
  if (!uid || typeof uid !== 'string') {
    console.error("Invalid input: A valid 'uid' string is required.");
    return false;
  }
  if (!description || typeof description !== 'string') {
    console.error("Invalid input: A valid 'description' string is required.");
    return false;
  }

  try {
    // Check if document exists first
    const docRef = doc(db, "cases", uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`Document with ID ${uid} does not exist in cases collection`);
      return false;
    }

    console.log("Calling AI service...");
    
    // 2. Add a timeout to handle a slow or non-responsive AI service
    const aiPromise = aiResponse(description);
    const severityObj = await Promise.race([
      aiPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out")), 10000) // Increased timeout
      ),
    ]);

    console.log("AI Response received:", severityObj);

    // 3. More comprehensive validation of the AI response structure and data types
    if (
      severityObj &&
      typeof severityObj === 'object' &&
      typeof severityObj.priority === 'string' &&
      typeof severityObj.score === 'number'
    ) {
      console.log("AI response validation passed. Updating Firestore...");
      
      // The setDoc operation with merge: true
      await setDoc(
        docRef,
        {
          priority: severityObj.priority,
          panicScore: severityObj.score,
        },
        { merge: true }
      );
      
      console.log("Severity index stored successfully for case:", uid);
      console.log("Priority:", severityObj.priority);
      console.log("Panic Score:", severityObj.score);
      
      // Verify the update worked
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        const updatedData = updatedDoc.data();
        console.log("Verification - Updated document data:", {
          priority: updatedData.priority,
          panicScore: updatedData.panicScore
        });
      }
      
      return true;
    } else {
      console.error("Invalid AI response structure:", severityObj);
      console.error("Expected: { priority: string, score: number }");
      return false;
    }
  } catch (error) {
    console.error(`Error storing severity index for case ${uid}:`, error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return false;
  }
}

// Helper function to test the AI response independently
export async function testAIResponse(description: string) {
  console.log("Testing AI response for description:", description);
  try {
    const result = await aiResponse(description);
    console.log("AI Response:", result);
    console.log("Type of result:", typeof result);
    console.log("Priority type:", typeof result?.priority);
    console.log("Score type:", typeof result?.score);
    return result;
  } catch (error) {
    console.error("AI Response test failed:", error);
    return null;
  }
}