"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Eye, MessageSquare, MapPin, Calendar, Heart, FileText, Link as LinkIcon, Loader2, AlertCircle,
} from "lucide-react"


type CaseStatus = "pending" | "investigating" | "resolved"
type CasePriority = "low" | "medium" | "high" | "urgent"

interface Case {
  id: string
  name: string
  description: string
  status: CaseStatus
  priority: CasePriority
  isAnonymous: boolean
  location: string
  createdAt: Date
  incidentDate: Date
  attachments: string[]
  feedback?: string
}

interface CasesListProps {
  searchQuery?: string
  statusFilter?: "all" | CaseStatus
}

// -------------------- Main Component --------------------
export function CasesList({
  searchQuery = "",
  statusFilter = "all",
}: CasesListProps) {
  const { t } = useTranslation()
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const casesCollectionRef = collection(db, "cases")
        // Optional: Query to order documents, e.g., by creation date descending
        const q = query(casesCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q)
        
        const casesFromDb = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          // IMPORTANT: Convert Firestore Timestamps to JS Date objects
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            status: data.status,
            priority: data.priority,
            isAnonymous: data.isAnonymous,
            location: data.location,
            attachments: data.attachments || [],
            feedback: data.feedback,
            createdAt: data.createdAt?.toDate(), // Safely call .toDate()
            incidentDate: data.incidentDate?.toDate(), // Safely call .toDate()
          } as Case
        })
        setCases(casesFromDb)
      } catch (err) {
        console.error("Firebase fetch error:", err)
        setError(t("common.error_fetching_cases"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [t]) // Re-run if `t` function changes (on language switch) to update error messages

  const getStatusColor = (status: CaseStatus) => {
    if(status)
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
  }

  const getPriorityColor = (priority: CasePriority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "medium": return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300";
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  }

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        {t("common.loading_cases")}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-10 text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    )
  }
  
  if (!isLoading && filteredCases.length === 0) {
      return (
        <div className="text-center p-10 text-muted-foreground">
          {t("common.no_cases_found")}
        </div>
      )
  }

  return (
    <div className="space-y-4 p-4">
      {filteredCases.map((case_) => (
        <Card key={case_.id} className="hover:shadow-lg transition-all border-pink-100 dark:border-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800/30">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{case_.name}</CardTitle>
                  <Badge className={getPriorityColor(case_.priority)}>{t(`priority.${case_.priority}`)}</Badge>
                  <Badge className={getStatusColor(case_.status)}>{t(`status : ${case_.status}`)}</Badge>
                  {case_.isAnonymous && <Badge variant="outline" className="border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-300">{t("cases.anonymous")}</Badge>}
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">{case_.description}</CardDescription>
              </div>
              {case_.incidentDate && (
                <div className="text-sm text-muted-foreground text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{case_.incidentDate.toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between flex-wrap gap-4 items-center">
              <div className="flex gap-4 text-sm text-muted-foreground items-center flex-wrap">
                {case_.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{t("cases.submitted")}: {case_.createdAt.toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{case_.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{case_.attachments.length} {t("cases.attachments_items")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedCase(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedCase(case_)} className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20">
                      <Eye className="h-4 w-4 mr-2" />
                      {t("cases.view_evidence")}
                    </Button>
                  </DialogTrigger>
                  {selectedCase && selectedCase.id === case_.id && (
                    <DialogContent className="max-w-2xl">
                      {/* Dialog Content remains the same as previous versions */}
                    </DialogContent>
                  )}
                </Dialog>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t("cases.contact")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}