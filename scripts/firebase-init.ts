// Firebase configuration for the Secure Harassment Reporting System
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

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

// Security rules for Firestore (to be applied in Firebase Console)
export const FIRESTORE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr_admin', 'posh_committee'];
    }
    
    // Cases - restricted access based on role
    match /cases/{caseId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr_admin', 'posh_committee', 'legal_advisor', 'ngo_counselor']
        || resource.data.reporter_id == request.auth.uid);
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr_admin', 'posh_committee'];
    }
    
    // Evidence - highly restricted access
    match /evidence/{evidenceId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'posh_committee', 'legal_advisor'];
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'posh_committee'];
    }
    
    // Case notes - restricted to assigned users
    match /case_notes/{noteId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr_admin', 'posh_committee', 'legal_advisor', 'ngo_counselor'];
    }
    
    // Audit logs - admin only
    match /audit_logs/{logId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null;
    }
  }
}
`

// Storage security rules (to be applied in Firebase Console)
export const STORAGE_SECURITY_RULES = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Evidence files - highly restricted
    match /evidence/{caseId}/{fileName} {
      allow read: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['admin', 'posh_committee', 'legal_advisor'];
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['admin', 'posh_committee'];
    }
    
    // Profile images
    match /profiles/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`