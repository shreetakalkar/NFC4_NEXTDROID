"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MessageSquare, Clock, MapPin, Calendar, Heart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { caseService, type Case } from "@/lib/firestore-service"

interface CasesListProps {
  searchQuery: string
  statusFilter: string
}

export function CasesList({ searchQuery, statusFilter }: CasesListProps) {
  const { t } = useTranslation()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const fetchedCases = await caseService.getAll()
        setCases(fetchedCases)
      } catch (error) {
        console.error("Error fetching cases:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "investigating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
      case "medium":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300"
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-pink-200 rounded w-3/4"></div>
              <div className="h-3 bg-pink-100 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-pink-100 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredCases.map((case_) => (
        <Card
          key={case_.id}
          className="hover:shadow-lg transition-all duration-200 border-pink-100 dark:border-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800/30"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{case_.title}</CardTitle>
                  <Badge className={getPriorityColor(case_.priority)}>{t(`priority.${case_.priority}`)}</Badge>
                  <Badge className={getStatusColor(case_.status)}>{t(`status.${case_.status}`)}</Badge>
                  {case_.isAnonymous && (
                    <Badge
                      variant="outline"
                      className="border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-300"
                    >
                      {t("cases.anonymous")}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">{case_.description}</CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{case_.lastUpdate || "Recently"}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{case_.submittedAt.toDate().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{case_.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>
                    {case_.evidenceCount || 0} {t("cases.evidence_items")}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCase(case_)}
                      className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("cases.view_details")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-pink-600" />
                        <span>{case_.title}</span>
                      </DialogTitle>
                      <DialogDescription>Case ID: {case_.caseNumber}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">{t("cases.status")}</label>
                          <Select defaultValue={case_.status}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t("status.pending")}</SelectItem>
                              <SelectItem value="investigating">{t("status.investigating")}</SelectItem>
                              <SelectItem value="resolved">{t("status.resolved")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t("cases.priority")}</label>
                          <Select defaultValue={case_.priority}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">{t("priority.low")}</SelectItem>
                              <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                              <SelectItem value="high">{t("priority.high")}</SelectItem>
                              <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("cases.description")}</label>
                        <p className="mt-1 text-sm text-muted-foreground">{case_.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("cases.add_note")}</label>
                        <Textarea placeholder={t("cases.note_placeholder")} className="mt-1" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">{t("common.cancel")}</Button>
                        <Button className="bg-pink-600 hover:bg-pink-700">{t("cases.update_case")}</Button>
                      </div>
                    </div>
                  </DialogContent>
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
