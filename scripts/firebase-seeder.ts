import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore"
import { COLLECTIONS, db } from "./firebase-config"

// Sample data
const sampleUsers = [
  {
    email: "admin@system.com",
    name: "System Administrator",
    phone: "+91 98765 43210",
    role: "admin",
    organization: "System Administration",
    status: "active",
    casesHandled: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    email: "priya.sharma@company.com",
    name: "Dr. Priya Sharma",
    phone: "+91 98765 43211",
    role: "posh_committee",
    organization: "Mumbai Office",
    status: "active",
    casesHandled: 12,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLogin: Timestamp.fromDate(new Date("2024-01-15T09:30:00Z")),
  },
  {
    email: "meera.gupta@legalaid.org",
    name: "Advocate Meera Gupta",
    phone: "+91 87654 32109",
    role: "legal_advisor",
    organization: "Legal Aid Society",
    status: "active",
    casesHandled: 8,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLogin: Timestamp.fromDate(new Date("2024-01-14T16:45:00Z")),
  },
  {
    email: "rajesh.kumar@company.com",
    name: "Rajesh Kumar",
    phone: "+91 76543 21098",
    role: "hr_admin",
    organization: "Delhi Office",
    status: "active",
    casesHandled: 15,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLogin: Timestamp.fromDate(new Date("2024-01-15T11:20:00Z")),
  },
  {
    email: "sunita.reddy@ngo.org",
    name: "Sunita Reddy",
    phone: "+91 65432 10987",
    role: "ngo_counselor",
    organization: "Women Support NGO",
    status: "inactive",
    casesHandled: 6,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLogin: Timestamp.fromDate(new Date("2024-01-10T14:30:00Z")),
  },
  {
    email: "kavya.patel@company.com",
    name: "Dr. Kavya Patel",
    phone: "+91 98765 43212",
    role: "posh_committee",
    organization: "Bangalore Office",
    status: "active",
    casesHandled: 9,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLogin: Timestamp.fromDate(new Date("2024-01-14T10:15:00Z")),
  },
  {
    email: "anita.singh@legalaid.org",
    name: "Advocate Anita Singh",
    phone: "+91 87654 32110",
    role: "legal_advisor",
    organization: "Women's Legal Aid",
    status: "active",
    casesHandled: 11,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLogin: Timestamp.fromDate(new Date("2024-01-15T08:45:00Z")),
  },
]

const sampleCases = [
  {
    caseNumber: "CASE001",
    title: "Inappropriate Comments",
    description: "Repeated inappropriate comments during team meetings causing discomfort to female colleagues",
    status: "investigating",
    priority: "high",
    isAnonymous: false,
    location: "Mumbai Office - Conference Room A",
    incidentDate: Timestamp.fromDate(new Date("2024-01-10T14:30:00+05:30")),
    submittedAt: Timestamp.fromDate(new Date("2024-01-15T10:30:00+05:30")),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    evidenceCount: 3,
    lastUpdate: "2 hours ago",
  },
  {
    caseNumber: "CASE002",
    title: "Unwanted Physical Contact",
    description: "Inappropriate physical contact in workplace elevator and common areas",
    status: "pending",
    priority: "urgent",
    isAnonymous: true,
    location: "Delhi Office - Building B",
    incidentDate: Timestamp.fromDate(new Date("2024-01-12T16:45:00+05:30")),
    submittedAt: Timestamp.fromDate(new Date("2024-01-14T15:45:00+05:30")),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    evidenceCount: 5,
    lastUpdate: "1 day ago",
  },
  {
    caseNumber: "CASE003",
    title: "Discriminatory Behavior",
    description: "Gender-based discrimination in project assignments and promotion opportunities",
    status: "resolved",
    priority: "medium",
    isAnonymous: false,
    location: "Bangalore Office - HR Department",
    incidentDate: Timestamp.fromDate(new Date("2024-01-05T09:15:00+05:30")),
    submittedAt: Timestamp.fromDate(new Date("2024-01-10T09:15:00+05:30")),
    resolvedAt: Timestamp.fromDate(new Date("2024-01-14T17:30:00+05:30")),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    evidenceCount: 2,
    lastUpdate: "5 days ago",
  },
  {
    caseNumber: "CASE004",
    title: "Verbal Harassment",
    description: "Persistent verbal harassment and inappropriate jokes targeting female employees",
    status: "investigating",
    priority: "high",
    isAnonymous: false,
    location: "Chennai Office - Marketing Department",
    incidentDate: Timestamp.fromDate(new Date("2024-01-08T11:20:00+05:30")),
    submittedAt: Timestamp.fromDate(new Date("2024-01-12T14:20:00+05:30")),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    evidenceCount: 4,
    lastUpdate: "3 hours ago",
  },
  {
    caseNumber: "CASE005",
    title: "Cyberbullying",
    description: "Inappropriate messages and cyberbullying through company communication channels",
    status: "pending",
    priority: "medium",
    isAnonymous: true,
    location: "Remote Work - Digital Platforms",
    incidentDate: Timestamp.fromDate(new Date("2024-01-13T20:30:00+05:30")),
    submittedAt: Timestamp.fromDate(new Date("2024-01-15T09:00:00+05:30")),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    evidenceCount: 6,
    lastUpdate: "6 hours ago",
  },
]

const sampleOrganizations = [
  {
    name: "Mumbai Office",
    address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
    contactPerson: "Dr. Priya Sharma",
    contactEmail: "priya.sharma@company.com",
    contactPhone: "+91 98765 43211",
    type: "corporate",
    status: "active",
    createdAt: Timestamp.now(),
  },
  {
    name: "Delhi Office",
    address: "Connaught Place, New Delhi, Delhi 110001",
    contactPerson: "Rajesh Kumar",
    contactEmail: "rajesh.kumar@company.com",
    contactPhone: "+91 76543 21098",
    type: "corporate",
    status: "active",
    createdAt: Timestamp.now(),
  },
  {
    name: "Legal Aid Society",
    address: "High Court Complex, Mumbai, Maharashtra 400032",
    contactPerson: "Advocate Meera Gupta",
    contactEmail: "meera.gupta@legalaid.org",
    contactPhone: "+91 87654 32109",
    type: "legal",
    status: "active",
    createdAt: Timestamp.now(),
  },
  {
    name: "Women Support NGO",
    address: "Jubilee Hills, Hyderabad, Telangana 500033",
    contactPerson: "Sunita Reddy",
    contactEmail: "sunita.reddy@ngo.org",
    contactPhone: "+91 65432 10987",
    type: "ngo",
    status: "active",
    createdAt: Timestamp.now(),
  },
]

// Seeder functions
async function seedUsers() {
  console.log("🌸 Seeding users...")
  const usersCollection = collection(db, COLLECTIONS.USERS)

  for (const user of sampleUsers) {
    try {
      const docRef = await addDoc(usersCollection, user)
      console.log(`✨ Created user: ${user.name} (ID: ${docRef.id})`)
    } catch (error) {
      console.error(`❌ Error creating user ${user.name}:`, error)
    }
  }
}

async function seedCases() {
  console.log("🌸 Seeding cases...")
  const casesCollection = collection(db, COLLECTIONS.CASES)

  for (const caseData of sampleCases) {
    try {
      const docRef = await addDoc(casesCollection, caseData)
      console.log(`✨ Created case: ${caseData.caseNumber} (ID: ${docRef.id})`)
    } catch (error) {
      console.error(`❌ Error creating case ${caseData.caseNumber}:`, error)
    }
  }
}

async function seedEvidence() {
  console.log("🌸 Seeding evidence...")

  // First, get all cases to link evidence
  const casesSnapshot = await getDocs(collection(db, COLLECTIONS.CASES))
  const cases = casesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const sampleEvidence = [
    {
      caseId: cases[0]?.id || "",
      filename: "recording_001.mp3",
      fileType: "audio",
      fileSize: 2400000,
      filePath: "/evidence/case001/recording_001.mp3",
      description: "Audio recording of inappropriate comments during team meeting",
      isEncrypted: true,
      accessLevel: "restricted",
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
    {
      caseId: cases[0]?.id || "",
      filename: "screenshot_001.png",
      fileType: "image",
      fileSize: 1200000,
      filePath: "/evidence/case001/screenshot_001.png",
      description: "Screenshot of inappropriate messages in team chat",
      isEncrypted: true,
      accessLevel: "restricted",
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
    {
      caseId: cases[0]?.id || "",
      filename: "witness_statement_001.pdf",
      fileType: "document",
      fileSize: 856000,
      filePath: "/evidence/case001/witness_statement_001.pdf",
      description: "Written witness statement from colleague",
      isEncrypted: true,
      accessLevel: "confidential",
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
    {
      caseId: cases[1]?.id || "",
      filename: "security_footage.mp4",
      fileType: "video",
      fileSize: 15700000,
      filePath: "/evidence/case002/security_footage.mp4",
      description: "Security camera footage from elevator incident",
      isEncrypted: true,
      accessLevel: "confidential",
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
    {
      caseId: cases[1]?.id || "",
      filename: "medical_report.pdf",
      fileType: "document",
      fileSize: 1100000,
      filePath: "/evidence/case002/medical_report.pdf",
      description: "Medical examination report",
      isEncrypted: true,
      accessLevel: "confidential",
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
    {
      caseId: cases[3]?.id || "",
      filename: "email_thread.pdf",
      fileType: "document",
      fileSize: 750000,
      filePath: "/evidence/case004/email_thread.pdf",
      description: "Email thread containing inappropriate communications",
      isEncrypted: true,
      accessLevel: "restricted",
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
    {
      caseId: cases[4]?.id || "",
      filename: "chat_screenshots.zip",
      fileType: "archive",
      fileSize: 3200000,
      filePath: "/evidence/case005/chat_screenshots.zip",
      description: "Screenshots of inappropriate messages from various platforms",
      isEncrypted: true,
      accessLevel: "restricted",
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
  ]

  const evidenceCollection = collection(db, COLLECTIONS.EVIDENCE)

  for (const evidence of sampleEvidence) {
    if (evidence.caseId) {
      try {
        const docRef = await addDoc(evidenceCollection, evidence)
        console.log(`✨ Created evidence: ${evidence.filename} (ID: ${docRef.id})`)
      } catch (error) {
        console.error(`❌ Error creating evidence ${evidence.filename}:`, error)
      }
    }
  }
}

async function seedOrganizations() {
  console.log("🌸 Seeding organizations...")
  const organizationsCollection = collection(db, COLLECTIONS.ORGANIZATIONS)

  for (const org of sampleOrganizations) {
    try {
      const docRef = await addDoc(organizationsCollection, org)
      console.log(`✨ Created organization: ${org.name} (ID: ${docRef.id})`)
    } catch (error) {
      console.error(`❌ Error creating organization ${org.name}:`, error)
    }
  }
}

async function seedCaseNotes() {
  console.log("🌸 Seeding case notes...")

  // Get cases and users for linking
  const casesSnapshot = await getDocs(collection(db, COLLECTIONS.CASES))
  const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
  const cases = casesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const sampleNotes = [
    {
      caseId: cases[0]?.id || "",
      userId: users[1]?.id || "", // Dr. Priya Sharma
      note: "Initial investigation started. Interviewed the complainant and gathered preliminary evidence.",
      isInternal: true,
      createdAt: Timestamp.fromDate(new Date("2024-01-15T11:00:00+05:30")),
    },
    {
      caseId: cases[0]?.id || "",
      userId: users[2]?.id || "", // Advocate Meera Gupta
      note: "Legal review completed. Case has strong grounds for disciplinary action.",
      isInternal: true,
      createdAt: Timestamp.fromDate(new Date("2024-01-15T15:30:00+05:30")),
    },
    {
      caseId: cases[1]?.id || "",
      userId: users[3]?.id || "", // Rajesh Kumar
      note: "Urgent case requiring immediate attention. Security footage has been secured.",
      isInternal: true,
      createdAt: Timestamp.fromDate(new Date("2024-01-14T16:00:00+05:30")),
    },
    {
      caseId: cases[2]?.id || "",
      userId: users[1]?.id || "", // Dr. Priya Sharma
      note: "Case resolved successfully. Appropriate disciplinary action taken and policies updated.",
      isInternal: false,
      createdAt: Timestamp.fromDate(new Date("2024-01-14T17:45:00+05:30")),
    },
  ]

  const notesCollection = collection(db, COLLECTIONS.CASE_NOTES)

  for (const note of sampleNotes) {
    if (note.caseId && note.userId) {
      try {
        const docRef = await addDoc(notesCollection, note)
        console.log(`✨ Created case note for case: ${note.caseId} (ID: ${docRef.id})`)
      } catch (error) {
        console.error(`❌ Error creating case note:`, error)
      }
    }
  }
}

async function seedAuditLogs() {
  console.log("🌸 Seeding audit logs...")

  const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
  const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const sampleAuditLogs = [
    {
      userId: users[0]?.id || "",
      action: "USER_LOGIN",
      resourceType: "authentication",
      resourceId: users[0]?.id || "",
      details: { loginMethod: "email", success: true },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      createdAt: Timestamp.fromDate(new Date("2024-01-15T09:00:00+05:30")),
    },
    {
      userId: users[1]?.id || "",
      action: "CASE_CREATED",
      resourceType: "case",
      resourceId: "CASE001",
      details: { caseNumber: "CASE001", priority: "high" },
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      createdAt: Timestamp.fromDate(new Date("2024-01-15T10:30:00+05:30")),
    },
    {
      userId: users[2]?.id || "",
      action: "EVIDENCE_UPLOADED",
      resourceType: "evidence",
      resourceId: "recording_001.mp3",
      details: { filename: "recording_001.mp3", fileSize: 2400000, encrypted: true },
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      createdAt: Timestamp.fromDate(new Date("2024-01-15T11:15:00+05:30")),
    },
  ]

  const auditLogsCollection = collection(db, COLLECTIONS.AUDIT_LOGS)

  for (const log of sampleAuditLogs) {
    try {
      const docRef = await addDoc(auditLogsCollection, log)
      console.log(`✨ Created audit log: ${log.action} (ID: ${docRef.id})`)
    } catch (error) {
      console.error(`❌ Error creating audit log:`, error)
    }
  }
}

// Check if data already exists
async function checkExistingData() {
  console.log("🔍 Checking for existing data...")

  const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
  const casesSnapshot = await getDocs(collection(db, COLLECTIONS.CASES))

  if (!usersSnapshot.empty || !casesSnapshot.empty) {
    console.log("⚠️  Data already exists in the database.")
    console.log(`📊 Found ${usersSnapshot.size} users and ${casesSnapshot.size} cases.`)

    const proceed = process.argv.includes("--force")
    if (!proceed) {
      console.log("💡 Use --force flag to seed anyway: npm run seed -- --force")
      return false
    }
  }

  return true
}

// Main seeder function
async function runSeeder() {
  console.log("🌸✨ Firebase Firestore Seeder for Secure Harassment Reporting System ✨🌸")
  console.log("=".repeat(80))

  try {
    const shouldProceed = await checkExistingData()
    if (!shouldProceed) {
      return
    }

    console.log("🚀 Starting database seeding process...")

    // Seed in order due to dependencies
    await seedOrganizations()
    await seedUsers()
    await seedCases()
    await seedEvidence()
    await seedCaseNotes()
    await seedAuditLogs()

    console.log("=".repeat(80))
    console.log("🎉 Database seeding completed successfully!")
    console.log("🌸 Your secure harassment reporting system is ready to use.")
    console.log("💖 Empowering women with safe reporting mechanisms.")
  } catch (error) {
    console.error("❌ Error during seeding process:", error)
    process.exit(1)
  }
}

// Run the seeder
if (require.main === module) {
  runSeeder()
}

export { runSeeder }