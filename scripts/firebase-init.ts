import { initializeSampleData } from "@/lib/firestore-service"

// This script initializes the Firebase Firestore database with sample data
// Run this once to populate your database with initial data

async function initializeFirebaseData() {
  console.log("🌸 Initializing Firebase Firestore with sample data...")

  try {
    await initializeSampleData()
    console.log("✨ Firebase initialization completed successfully!")
    console.log("🎀 Your secure harassment reporting system is ready to use.")
  } catch (error) {
    console.error("❌ Error initializing Firebase data:", error)
  }
}

// Run the initialization
initializeFirebaseData()
