"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, FileText, TrendingUp, Heart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { caseService, userService } from "@/lib/firestore-service"

export function DashboardStats() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalCases: 0,
    urgentCases: 0,
    activeUsers: 0,
    resolutionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [caseStats, users] = await Promise.all([
          caseService.getStats(), 
          userService.getAll()
        ])

        // Ensure we have valid data with fallbacks
        const totalCases = caseStats?.total ?? 0
        const resolvedCases = caseStats?.resolved ?? 0
        const urgentCases = caseStats?.urgent ?? 0
        const activeUsers = Array.isArray(users) ? users.filter(user => user?.status === "active").length : 0
        const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0

        setStats({
          totalCases,
          urgentCases,
          activeUsers,
          resolutionRate,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError("Failed to load statistics")
        // Set fallback stats on error
        setStats({
          totalCases: 0,
          urgentCases: 0,
          activeUsers: 0,
          resolutionRate: 0,
        })
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

  const statsData = [
    {
      title: t("stats.total_cases") || "Total Cases",
      value: loading ? "..." : safeToString(stats.totalCases),
      description: t("stats.total_cases_desc") || "All reported cases",
      icon: FileText,
      trend: "+12%",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
    {
      title: t("stats.urgent_cases") || "Urgent Cases",
      value: loading ? "..." : safeToString(stats.urgentCases),
      description: t("stats.urgent_cases_desc") || "Cases requiring immediate attention",
      icon: AlertTriangle,
      trend: "-25%",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: t("stats.active_users") || "Active Users",
      value: loading ? "..." : safeToString(stats.activeUsers),
      description: t("stats.active_users_desc") || "Currently active users",
      icon: Users,
      trend: "+8%",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
    },
    {
      title: t("stats.resolution_rate") || "Resolution Rate",
      value: loading ? "..." : `${safeToString(stats.resolutionRate)}%`,
      description: t("stats.resolution_rate_desc") || "Percentage of resolved cases",
      icon: Heart,
      trend: "+5%",
      color: "text-pink-700",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
  ]

  if (error) {
    return (
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
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="border-pink-100 dark:border-pink-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <span>{stat.description}</span>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-green-600">{stat.trend}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}