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
import { Input } from "@/components/ui/input"
import { FileText, ImageIcon, Mic, Video, Download, Lock, Eye, Search, Heart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { evidenceService, type Evidence } from "@/lib/firestore-service"

export function EvidenceVault() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const fetchedEvidence = await evidenceService.getAll()
        setEvidence(fetchedEvidence)
      } catch (error) {
        console.error("Error fetching evidence:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvidence()
  }, [])

  const getFileIcon = (type: string) => {
    switch (type) {
      case "audio":
        return <Mic className="h-5 w-5 text-purple-600" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-green-600" />
      case "video":
        return <Video className="h-5 w-5 text-blue-600" />
      case "document":
        return <FileText className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "confidential":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "restricted":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
      case "internal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredEvidence = evidence.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caseId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-pink-200 rounded w-3/4"></div>
              <div className="h-3 bg-pink-100 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-pink-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("evidence.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 border-pink-200 focus:border-pink-400 dark:border-pink-800"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="flex items-center space-x-1 border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-300"
          >
            <Lock className="h-3 w-3" />
            <span>{t("evidence.encrypted")}</span>
          </Badge>
          <span className="text-sm text-muted-foreground">
            {filteredEvidence.length} {t("evidence.items")}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvidence.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-lg transition-all duration-200 border-pink-100 dark:border-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800/30"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getFileIcon(item.fileType)}
                  <div>
                    <CardTitle className="text-sm font-medium truncate">{item.filename}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatFileSize(item.fileSize)} • {item.uploadedAt.toDate().toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getAccessLevelColor(item.accessLevel)}>{t(`access.${item.accessLevel}`)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>
                    {t("evidence.case_id")}: {item.caseId}
                  </span>
                  {item.isEncrypted && (
                    <div className="flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>{t("evidence.encrypted")}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20 bg-transparent"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t("evidence.view")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-pink-600" />
                          <span>{item.filename}</span>
                        </DialogTitle>
                        <DialogDescription>
                          {t("evidence.case_id")}: {item.caseId} • {t(`access.${item.accessLevel}`)}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-pink-50/50 dark:bg-pink-950/10">
                          <div className="flex items-center justify-center h-32">
                            {getFileIcon(item.fileType)}
                            <div className="ml-4 text-center">
                              <p className="font-medium">{item.filename}</p>
                              <p className="text-sm text-muted-foreground">{formatFileSize(item.fileSize)}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t("evidence.description")}</label>
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20 bg-transparent"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t("evidence.download")}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" className="hover:bg-pink-50 dark:hover:bg-pink-950/20">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
