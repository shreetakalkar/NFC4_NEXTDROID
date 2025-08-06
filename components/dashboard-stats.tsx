"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, FileText, TrendingUp, Heart, Clock } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { caseService, userService } from "@/lib/firestore-service"
import { formatDescription } from "@/lib/descriptionFormatter"

interface Case {
  id: string
  description: string
  status: boolean  // true = resolved, false = pending
  priority: string // "Low", "Medium", "High", "critical"
  isAnonymous: boolean
  name: string
  panicScore: number
  createdAt: any
  incidentDate: any
  uid: string
}

export function DashboardStats() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalCases: 0,
    criticalCases: 0,
    activeUsers: 0,
    resolutionRate: 0,
  })
  const [criticalCasesList, setcriticalCasesList] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [allCases, users] = await Promise.all([
          caseService.getAll(), 
          userService.getAll()
        ])

        // Calculate stats based on your DB structure
        const totalCases = Array.isArray(allCases) ? allCases.length : 0
        const resolvedCases = Array.isArray(allCases) ? allCases.filter(c => c?.status === true).length : 0
        const criticalCases = Array.isArray(allCases) ? 
          allCases.filter(c => c?.priority?.toLowerCase() === "critical" || c?.priority?.toLowerCase() === "high").length : 0
        const activeUsers = Array.isArray(users) ? users.filter(user => user?.status === "active").length : 0
        const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0

        // Get critical cases for display
        const criticalList = Array.isArray(allCases) ? 
          allCases
            .filter(c => c?.priority?.toLowerCase() === "critical" || c?.priority?.toLowerCase() === "high")
            .sort((a, b) => {
              // Sort by panic score (higher first), then by creation date (newer first)
              if (a.panicScore !== b.panicScore) {
                return (b.panicScore || 0) - (a.panicScore || 0)
              }
              return new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() - 
                     new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
            })
            .slice(0, 5) : [] // Top 5 critical cases

        setStats({
          totalCases,
          criticalCases,
          activeUsers,
          resolutionRate,
        })
        setcriticalCasesList(criticalList)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError("Failed to load statistics")
        setStats({
          totalCases: 0,
          criticalCases: 0,
          activeUsers: 0,
          resolutionRate: 0,
        })
        setcriticalCasesList([])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Helper function to safely convert numbers to strings
  const safeToString = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) return "0"
    return value.toString()
  }

  // Helper function to truncate description
  const truncateDescription = (description: string, maxLength: number = 100): string => {
    if (!description) return "No description available"
    
    // Extract the user's initial description (before AI summary)
    const userDesc = description.split("--- AI-GENERATED SUMMARY ---")[0]
      .replace("--- USER'S INITIAL DESCRIPTION ---", "")
      .trim()
    
    // Adjust max length based on screen size (if available)
    const effectiveMaxLength = typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : maxLength
    
    if (userDesc.length <= effectiveMaxLength) return userDesc
    return userDesc.substring(0, effectiveMaxLength) + "..."
  }

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case "critical": return "text-red-600 bg-red-100"
      case "high": return "text-orange-600 bg-orange-100"
      case "medium": return "text-yellow-600 bg-yellow-100"
      default: return "text-green-600 bg-green-100"
    }
  }

  const statsData = [
    {
      title: "Total Cases",
      value: loading ? "..." : safeToString(stats.totalCases),
      description: "All reported cases",
      icon: FileText,
      trend: "+12%",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
    {
      title: "critical Cases",
      value: loading ? "..." : safeToString(stats.criticalCases),
      description: "High & critical priority cases",
      icon: AlertTriangle,
      trend: stats.criticalCases > 0 ? `${stats.criticalCases} active` : "None active",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Active Users",
      value: loading ? "..." : safeToString(stats.activeUsers),
      description: "Currently active users",
      icon: Users,
      trend: "+8%",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
    },
    {
      title: "Resolution Rate",
      value: loading ? "..." : `${safeToString(stats.resolutionRate)}%`,
      description: "Percentage of resolved cases",
      icon: Heart,
      trend: `${stats.resolutionRate >= 70 ? "Good" : "Needs improvement"}`,
      color: "text-pink-700",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="md:col-span-2 lg:col-span-4 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-pink-100 dark:border-pink-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {stat.value}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs text-muted-foreground">
                <span className="mb-1 sm:mb-0">{stat.description}</span>
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="text-green-600 text-xs">{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* critical Cases List */}
      {stats.criticalCases > 0 && (
        <Card className="border-red-200 dark:border-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Top critical Cases ({criticalCasesList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading critical cases...</div>
            ) : criticalCasesList.length > 0 ? (
              <div className="space-y-3">
                {criticalCasesList.map((case_, index) => (
                  <div key={case_.id || index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                          {case_.priority || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500">
                          Panic Score: {case_.panicScore || 0}
                        </span>
                        {case_.isAnonymous && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {case_.createdAt?.toDate?.() ? 
                          new Date(case_.createdAt.toDate()).toLocaleDateString() : 
                          "Recent"}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {formatDescription(truncateDescription(case_.description))}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Reporter: {case_.isAnonymous ? "Anonymous" : (case_.name !== "N/A" ? case_.name : "Not specified")}</span>
                      <span className={`px-2 py-1 rounded ${case_.status ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {case_.status ? "Resolved" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No critical cases found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}