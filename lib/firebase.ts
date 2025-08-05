import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Connect to emulators in development
// if (process.env.NODE_ENV === "development") {
//   try {
//     connectFirestoreEmulator(db, "localhost", 8080)
//     connectAuthEmulator(auth, "http://localhost:9099")
//     connectStorageEmulator(storage, "localhost", 9199)
//   } catch (error) {
//     console.log("Emulators already connected")
//   }
// }

export default app

// Firestore collections
export const COLLECTIONS = {
  USERS: "users",
  CASES: "cases",
  EVIDENCE: "evidence",
  CASE_NOTES: "case_notes",
  AUDIT_LOGS: "audit_logs",
  ORGANIZATIONS: "organizations",
  NOTIFICATIONS: "notifications",
}
