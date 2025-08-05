import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"
import { db, COLLECTIONS } from "./firebase"

// Types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: "posh_committee" | "legal_advisor" | "hr_admin" | "ngo_counselor" | "admin"
  organization: string
  status: "active" | "inactive"
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLogin?: Timestamp
  casesHandled?: number
}

export interface Case {
  id: string
  caseNumber: string
  title: string
  description: string
  status: "pending" | "investigating" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  isAnonymous: boolean
  reporterId?: string
  assignedTo?: string
  location: string
  incidentDate: Timestamp
  submittedAt: Timestamp
  resolvedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  evidenceCount?: number
  lastUpdate?: string
}

export interface Evidence {
  id: string
  caseId: string
  filename: string
  fileType: string
  fileSize: number
  filePath: string
  description: string
  isEncrypted: boolean
  accessLevel: "public" | "internal" | "restricted" | "confidential"
  uploadedBy?: string
  uploadedAt: Timestamp
  createdAt: Timestamp
}

export interface CaseNote {
  id: string
  caseId: string
  userId: string
  note: string
  isInternal: boolean
  createdAt: Timestamp
}

// User Service
export const userService = {
  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)
  },

  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as User) : null
  },

  async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, id)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.USERS, id))
  },

  async getByRole(role: string): Promise<User[]> {
    const q = query(collection(db, COLLECTIONS.USERS), where("role", "==", role))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)
  },
}

// Case Service
export const caseService = {
  async getAll(): Promise<Case[]> {
    const q = query(collection(db, COLLECTIONS.CASES), orderBy("submittedAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Case)
  },

  async getById(id: string): Promise<Case | null> {
    const docRef = doc(db, COLLECTIONS.CASES, id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Case) : null
  },

  async create(caseData: Omit<Case, "id" | "createdAt" | "updatedAt" | "submittedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CASES), {
      ...caseData,
      submittedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, caseData: Partial<Case>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CASES, id)
    await updateDoc(docRef, {
      ...caseData,
      updatedAt: Timestamp.now(),
    })
  },

  async getByStatus(status: string): Promise<Case[]> {
    const q = query(collection(db, COLLECTIONS.CASES), where("status", "==", status), orderBy("submittedAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Case)
  },

  async getUrgentCases(): Promise<Case[]> {
    const q = query(
      collection(db, COLLECTIONS.CASES),
      where("priority", "in", ["high", "urgent"]),
      where("status", "!=", "resolved"),
      orderBy("status"),
      orderBy("submittedAt", "desc"),
      limit(10),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Case)
  },

  async getStats(): Promise<{
    total: number
    pending: number
    investigating: number
    resolved: number
    urgent: number
  }> {
    const allCases = await this.getAll()
    return {
      total: allCases.length,
      pending: allCases.filter((c) => c.status === "pending").length,
      investigating: allCases.filter((c) => c.status === "investigating").length,
      resolved: allCases.filter((c) => c.status === "resolved").length,
      urgent: allCases.filter((c) => c.priority === "urgent" && c.status !== "resolved").length,
    }
  },
}

// Evidence Service
export const evidenceService = {
  async getAll(): Promise<Evidence[]> {
    const q = query(collection(db, COLLECTIONS.EVIDENCE), orderBy("uploadedAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Evidence)
  },

  async getByCaseId(caseId: string): Promise<Evidence[]> {
    const q = query(collection(db, COLLECTIONS.EVIDENCE), where("caseId", "==", caseId), orderBy("uploadedAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Evidence)
  },

  async create(evidenceData: Omit<Evidence, "id" | "createdAt" | "uploadedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVIDENCE), {
      ...evidenceData,
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.EVIDENCE, id))
  },
}

// Case Notes Service
export const caseNotesService = {
  async getByCaseId(caseId: string): Promise<CaseNote[]> {
    const q = query(collection(db, COLLECTIONS.CASE_NOTES), where("caseId", "==", caseId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CaseNote)
  },

  async create(noteData: Omit<CaseNote, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CASE_NOTES), {
      ...noteData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },
}

// Initialize sample data
export const initializeSampleData = async () => {
  try {
    // Check if data already exists
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
    if (!usersSnapshot.empty) {
      console.log("Sample data already exists")
      return
    }

    // Create sample users
    const sampleUsers = [
      {
        email: "admin@system.com",
        name: "System Administrator",
        phone: "+91 98765 43210",
        role: "admin" as const,
        organization: "System",
        status: "active" as const,
        casesHandled: 0,
      },
      {
        email: "priya.sharma@company.com",
        name: "Dr. Priya Sharma",
        phone: "+91 98765 43211",
        role: "posh_committee" as const,
        organization: "Mumbai Office",
        status: "active" as const,
        casesHandled: 12,
      },
      {
        email: "meera.gupta@legalaid.org",
        name: "Advocate Meera Gupta",
        phone: "+91 87654 32109",
        role: "legal_advisor" as const,
        organization: "Legal Aid Society",
        status: "active" as const,
        casesHandled: 8,
      },
      {
        email: "rajesh.kumar@company.com",
        name: "Rajesh Kumar",
        phone: "+91 76543 21098",
        role: "hr_admin" as const,
        organization: "Delhi Office",
        status: "active" as const,
        casesHandled: 15,
      },
      {
        email: "sunita.reddy@ngo.org",
        name: "Sunita Reddy",
        phone: "+91 65432 10987",
        role: "ngo_counselor" as const,
        organization: "Women Support NGO",
        status: "inactive" as const,
        casesHandled: 6,
      },
    ]

    for (const user of sampleUsers) {
      await userService.create(user)
    }

    // Create sample cases
    const sampleCases = [
      {
        caseNumber: "CASE001",
        title: "Inappropriate Comments",
        description: "Repeated inappropriate comments during team meetings",
        status: "investigating" as const,
        priority: "high" as const,
        isAnonymous: false,
        location: "Mumbai Office",
        incidentDate: Timestamp.fromDate(new Date("2024-01-10T14:30:00+05:30")),
        evidenceCount: 3,
        lastUpdate: "2 hours ago",
      },
      {
        caseNumber: "CASE002",
        title: "Unwanted Physical Contact",
        description: "Inappropriate physical contact in workplace",
        status: "pending" as const,
        priority: "urgent" as const,
        isAnonymous: true,
        location: "Delhi Office",
        incidentDate: Timestamp.fromDate(new Date("2024-01-12T16:45:00+05:30")),
        evidenceCount: 5,
        lastUpdate: "1 day ago",
      },
      {
        caseNumber: "CASE003",
        title: "Discriminatory Behavior",
        description: "Gender-based discrimination in project assignments",
        status: "resolved" as const,
        priority: "medium" as const,
        isAnonymous: false,
        location: "Bangalore Office",
        incidentDate: Timestamp.fromDate(new Date("2024-01-05T09:15:00+05:30")),
        evidenceCount: 2,
        lastUpdate: "5 days ago",
      },
    ]

    for (const caseData of sampleCases) {
      await caseService.create(caseData)
    }

    // Create sample evidence
    const casesSnapshot = await getDocs(collection(db, COLLECTIONS.CASES))
    const cases = casesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const sampleEvidence = [
      {
        caseId: cases[0]?.id || "",
        filename: "recording_001.mp3",
        fileType: "audio",
        fileSize: 2400000,
        filePath: "/evidence/case001/recording_001.mp3",
        description: "Audio recording of inappropriate comments during meeting",
        isEncrypted: true,
        accessLevel: "restricted" as const,
      },
      {
        caseId: cases[0]?.id || "",
        filename: "screenshot_001.png",
        fileType: "image",
        fileSize: 1200000,
        filePath: "/evidence/case001/screenshot_001.png",
        description: "Screenshot of inappropriate messages",
        isEncrypted: true,
        accessLevel: "restricted" as const,
      },
      {
        caseId: cases[1]?.id || "",
        filename: "witness_statement.pdf",
        fileType: "document",
        fileSize: 856000,
        filePath: "/evidence/case002/witness_statement.pdf",
        description: "Witness statement document",
        isEncrypted: true,
        accessLevel: "confidential" as const,
      },
      {
        caseId: cases[1]?.id || "",
        filename: "security_footage.mp4",
        fileType: "video",
        fileSize: 15700000,
        filePath: "/evidence/case002/security_footage.mp4",
        description: "Security camera footage",
        isEncrypted: true,
        accessLevel: "confidential" as const,
      },
    ]

    for (const evidence of sampleEvidence) {
      if (evidence.caseId) {
        await evidenceService.create(evidence)
      }
    }

    console.log("Sample data initialized successfully")
  } catch (error) {
    console.error("Error initializing sample data:", error)
  }
}
