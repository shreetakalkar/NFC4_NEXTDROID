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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [caseStats, users] = await Promise.all([caseService.getStats(), userService.getAll()])

        const activeUsers = users.filter((user) => user.status === "active").length
        const resolutionRate = caseStats.total > 0 ? Math.round((caseStats.resolved / caseStats.total) * 100) : 0

        setStats({
          totalCases: caseStats.total,
          urgentCases: caseStats.urgent,
          activeUsers,
          resolutionRate,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsData = [
    {
      title: t("stats.total_cases"),
      value: loading ? "..." : stats.totalCases.toString(),
      description: t("stats.total_cases_desc"),
      icon: FileText,
      trend: "+12%",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
    {
      title: t("stats.urgent_cases"),
      value: loading ? "..." : stats.urgentCases.toString(),
      description: t("stats.urgent_cases_desc"),
      icon: AlertTriangle,
      trend: "-25%",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: t("stats.active_users"),
      value: loading ? "..." : stats.activeUsers.toString(),
      description: t("stats.active_users_desc"),
      icon: Users,
      trend: "+8%",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
    },
    {
      title: t("stats.resolution_rate"),
      value: loading ? "..." : `${stats.resolutionRate}%`,
      description: t("stats.resolution_rate_desc"),
      icon: Heart,
      trend: "+5%",
      color: "text-pink-700",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="border-pink-100 dark:border-pink-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
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
