"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Shield,
  Users,
  FileText,
  Clock,
  Eye,
  Search,
  Filter,
  Heart,
  Sparkles,
  MapPin,
  MapPinIcon,
  Zap,
  Phone,
  MessageSquare,
  Navigation,
  AlertCircle,
} from "lucide-react";
import { DashboardStats } from "@/components/dashboard-stats";
import { CasesList } from "@/components/cases-list";
import { EvidenceVault } from "@/components/evidence-vault";
import { UserManagement } from "@/components/user-management";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "@/hooks/use-translation";
import { initializeSampleData, caseService } from "@/lib/firestore-service";
import Map from "@/components/Map";
import PanicList from "@/components/PanicList";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInitialized, setIsInitialized] = useState(false);
  const [urgentCases, setUrgentCases] = useState<any[]>([]);
  // Remove the sample panic alerts data and related functions since we're using PanicAlertsList
  const { t, language } = useTranslation();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await initializeSampleData();
        const urgent = await caseService.getUrgentCases();
        setUrgentCases(urgent);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing data:", error);
        setIsInitialized(true);
      }
    };

    initializeData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "responding":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
            <Navigation className="h-3 w-3 mr-1" />
            Responding
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Initializing System
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up your secure workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-pink-100 dark:border-pink-900/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    {t("system.title") || "Safety Platform"}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{t("system.subtitle") || "Protecting Communities"}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20 bg-transparent"
              >
                {t("auth.logout") || "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-gray-900/50 border border-pink-100 dark:border-pink-900/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.overview") || "Overview"}
            </TabsTrigger>
            <TabsTrigger
              value="panic-alerts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white relative"
            >
              <Zap className="h-4 w-4 mr-1" />
              Panic Alerts
            </TabsTrigger>
            <TabsTrigger
              value="cases"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.cases") || "Cases"}
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.reports") || "Reports"}
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.maps") || "Map"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats />

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>{t("dashboard.urgent_cases") || "Urgent Cases"}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.urgent_cases_desc") || "Cases requiring immediate attention"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {urgentCases.slice(0, 3).map((case_, index) => (
                      <div
                        key={case_.id || index}
                        className="flex items-center justify-between p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-800/50"
                      >
                        <div>
                          <p className="font-medium">
                            {case_.caseNumber || `Case #${index + 1}001`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted{" "}
                            {case_.submittedAt
                              ? case_.submittedAt.toDate().toLocaleDateString()
                              : "2 hours ago"}
                          </p>
                        </div>
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        >
                          High Priority
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>{t("dashboard.recent_activity") || "Recent Activity"}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.recent_activity_desc") || "Latest system updates"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: "New case submitted",
                        time: "5 min ago",
                        type: "case",
                      },
                      {
                        action: "Evidence uploaded",
                        time: "15 min ago",
                        type: "evidence",
                      },
                      {
                        action: "Case status updated",
                        time: "1 hour ago",
                        type: "update",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="panic-alerts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Panic Alerts
                </h2>
              </div>
            </div>
            <PanicList/>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {t("cases.title") || "Cases"}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("cases.search_placeholder") || "Search cases..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 border-pink-200 focus:border-pink-400 dark:border-pink-800"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-pink-200 dark:border-pink-800">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("cases.filter.all") || "All"}</SelectItem>
                    <SelectItem value="pending">
                      {t("cases.filter.pending") || "Pending"}
                    </SelectItem>
                    <SelectItem value="investigating">
                      {t("cases.filter.investigating") || "Investigating"}
                    </SelectItem>
                    <SelectItem value="resolved">
                      {t("cases.filter.resolved") || "Resolved"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CasesList searchQuery={searchQuery} statusFilter={statusFilter} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {t("reports.title") || "Reports"}
              </h2>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <FileText className="h-4 w-4 mr-2" />
                {t("reports.generate") || "Generate Report"}
              </Button>
            </div>
            <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span>{t("reports.analytics") || "Analytics"}</span>
                </CardTitle>
                <CardDescription>{t("reports.analytics_desc") || "System analytics overview"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/10 dark:to-rose-950/10">
                    <div className="text-2xl font-bold text-pink-600">24</div>
                    <div className="text-sm text-muted-foreground">
                      {t("reports.total_cases") || "Total Cases"}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10">
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <div className="text-sm text-muted-foreground">
                      {t("reports.resolved_cases") || "Resolved Cases"}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/10 dark:to-amber-950/10">
                    <div className="text-2xl font-bold text-orange-600">6</div>
                    <div className="text-sm text-muted-foreground">
                      {t("reports.pending_cases") || "Pending Cases"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {t("Map") || "Location Map"}
              </h2>
            </div>
            <MapPinIcon />
            <Map />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}