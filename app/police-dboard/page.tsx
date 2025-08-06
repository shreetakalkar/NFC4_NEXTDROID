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
  TrendingUp,
  Activity,
  BarChart3,
  Building2,
  AlertCircle,
  Target,
  BriefcaseIcon,
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInitialized, setIsInitialized] = useState(false);
  const [urgentCases, setUrgentCases] = useState<any[]>([]);
  const { t, language } = useTranslation();

  // Hardcoded department insights data
  const departmentInsights = [
    { department: "Human Resources", incidents: 45, trend: "up", percentage: 12, type: "Harassment" },
    { department: "IT Department", incidents: 38, trend: "down", percentage: 8, type: "Data Security" },
    { department: "Finance", incidents: 29, trend: "up", percentage: 15, type: "Fraud" },
    { department: "Sales", incidents: 34, trend: "stable", percentage: 2, type: "Misconduct" },
    { department: "Operations", incidents: 41, trend: "up", percentage: 18, type: "Safety Violations" },
    { department: "Marketing", incidents: 22, trend: "down", percentage: 10, type: "Discrimination" },
    { department: "Legal", incidents: 18, trend: "stable", percentage: 1, type: "Ethics" },
    { department: "Customer Service", incidents: 27, trend: "up", percentage: 9, type: "Harassment" },
  ];

  // Hardcoded office area trends data
  const officeAreaTrends = [
    { area: "Open Workspace Floor 3", incidents: 28, riskLevel: "High", primaryIssue: "Harassment" },
    { area: "Private Offices Floor 2", incidents: 19, riskLevel: "Medium", primaryIssue: "Misconduct" },
    { area: "Conference Rooms", incidents: 15, riskLevel: "Medium", primaryIssue: "Discrimination" },
    { area: "Cafeteria & Break Areas", incidents: 12, riskLevel: "Low", primaryIssue: "Verbal Abuse" },
    { area: "Parking Garage", incidents: 23, riskLevel: "High", primaryIssue: "Safety Issues" },
    { area: "Reception Area", incidents: 8, riskLevel: "Low", primaryIssue: "Visitor Issues" },
    { area: "Server Room", incidents: 6, riskLevel: "Medium", primaryIssue: "Unauthorized Access" },
    { area: "Executive Floor", incidents: 11, riskLevel: "Medium", primaryIssue: "Power Abuse" },
  ];

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
                    {t("system.title")}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{t("system.subtitle")}</span>
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
                {t("auth.logout")}
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
          <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-900/50 border border-pink-100 dark:border-pink-900/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.overview")}
            </TabsTrigger>
            <TabsTrigger
              value="cases"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.cases")}
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.reports")}
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              {t("nav.maps")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats />

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>{t("dashboard.urgent_cases")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.urgent_cases_desc")}
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
                    <span>{t("dashboard.recent_activity")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.recent_activity_desc")}
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

          <TabsContent value="cases" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {t("cases.title")}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("cases.search_placeholder")}
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
                    <SelectItem value="all">{t("cases.filter.all")}</SelectItem>
                    <SelectItem value="pending">
                      {t("cases.filter.pending")}
                    </SelectItem>
                    <SelectItem value="investigating">
                      {t("cases.filter.investigating")}
                    </SelectItem>
                    <SelectItem value="resolved">
                      {t("cases.filter.resolved")}
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
                Crime Analytics & Reports
              </h2>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            {/* Crime Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Crime Trends</span>
                  </CardTitle>
                  <CardDescription>Monthly crime statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Theft</span>
                      <span className="font-semibold text-red-600">↑ 12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Assault</span>
                      <span className="font-semibold text-green-600">↓ 8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Burglary</span>
                      <span className="font-semibold text-green-600">↓ 5%</span>
                    </div>
                    {/* <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Drug Offenses</span>
                      <span className="font-semibold text-red-600">↑ 15%</span>
                    </div> */}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>Response Times</span>
                  </CardTitle>
                  <CardDescription>Average emergency response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10">
                      <div className="text-2xl font-bold text-green-600">10 min</div>
                      <div className="text-sm text-muted-foreground">Emergency Response</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/10 dark:to-cyan-950/10">
                      <div className="text-2xl font-bold text-blue-600">15 min</div>
                      <div className="text-sm text-muted-foreground">Non-Emergency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Case Clearance</span>
                  </CardTitle>
                  <CardDescription>Investigation success rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Homicide</span>
                      <span className="font-semibold text-green-600">87%</span>
                    </div> */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Robbery</span>
                      <span className="font-semibold text-yellow-600">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Burglary</span>
                      <span className="font-semibold text-orange-600">42%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Auto Theft</span>
                      <span className="font-semibold text-red-600">38%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department-Wise Insights */}
            <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Department-Wise Insights</span>
                </CardTitle>
                <CardDescription>
                  Incident reporting patterns across different departments to identify focus areas for awareness and prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {departmentInsights.map((dept, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-800/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{dept.department}</h4>
                        <Badge
                          variant={dept.trend === "up" ? "destructive" : dept.trend === "down" ? "default" : "secondary"}
                          className={
                            dept.trend === "up"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                              : dept.trend === "down"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                          }
                        >
                          {dept.trend === "up" ? `↑ ${dept.percentage}%` : dept.trend === "down" ? `↓ ${dept.percentage}%` : "stable"}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-pink-600">{dept.incidents}</div>
                      <div className="text-sm text-muted-foreground">
                        Total Incidents
                      </div>
                      <div className="text-xs text-muted-foreground bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/10 dark:to-rose-950/10 p-2 rounded">
                        Primary: {dept.type}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Top Departments Requiring Attention */}
                <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/10 dark:to-amber-950/10 border border-orange-200 dark:border-orange-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">Departments Requiring Immediate Attention</h4>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                      <div className="font-semibold text-red-600">Operations</div>
                      <div className="text-sm text-muted-foreground">↑ 18% Safety Violations</div>
                    </div>
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                      <div className="font-semibold text-red-600">Finance</div>
                      <div className="text-sm text-muted-foreground">↑ 15% Fraud Cases</div>
                    </div>
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                      <div className="font-semibold text-red-600">Human Resources</div>
                      <div className="text-sm text-muted-foreground">↑ 12% Harassment</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Area Trends */}
            <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>Office Area Trends</span>
                </CardTitle>
                <CardDescription>
                  Identify potential hotspots within office spaces where incidents are more frequent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center space-x-2">
                      <BriefcaseIcon className="h-4 w-4" />
                      <span>High-Risk Areas</span>
                    </h4>
                    {officeAreaTrends
                      .filter(area => area.riskLevel === "High")
                      .map((area, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg border-red-200 dark:border-red-900/20 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/10 dark:to-pink-950/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-red-800 dark:text-red-200">{area.area}</h5>
                            <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              {area.riskLevel} Risk
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-red-600 mb-1">{area.incidents}</div>
                          <div className="text-sm text-muted-foreground mb-2">Incidents This Month</div>
                          <div className="text-xs bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                            Primary Issue: {area.primaryIssue}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Medium & Low Risk Areas</h4>
                    {officeAreaTrends
                      .filter(area => area.riskLevel !== "High")
                      .map((area, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg ${
                            area.riskLevel === "Medium"
                              ? "border-yellow-200 dark:border-yellow-900/20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/10 dark:to-orange-950/10"
                              : "border-green-200 dark:border-green-900/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`font-medium ${
                              area.riskLevel === "Medium" ? "text-yellow-800 dark:text-yellow-200" : "text-green-800 dark:text-green-200"
                            }`}>
                              {area.area}
                            </h5>
                            <Badge 
                              variant={area.riskLevel === "Medium" ? "secondary" : "default"}
                              className={
                                area.riskLevel === "Medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              }
                            >
                              {area.riskLevel} Risk
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`text-lg font-bold ${
                                area.riskLevel === "Medium" ? "text-yellow-600" : "text-green-600"
                              }`}>
                                {area.incidents}
                              </div>
                              <div className="text-xs text-muted-foreground">incidents</div>
                            </div>
                            <div className="text-xs text-right">
                              <div className="font-medium">Primary:</div>
                              <div className="text-muted-foreground">{area.primaryIssue}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Prevention Recommendations */}
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/10 dark:to-indigo-950/10 border border-blue-200 dark:border-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Prevention & Action Recommendations</h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Immediate Actions</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Install additional security cameras in Open Workspace Floor 3</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Increase security patrols in Parking Garage during peak hours</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Conduct emergency safety training for Operations department</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Long-term Strategies</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Implement mandatory harassment prevention workshops</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Establish anonymous reporting hotline for each department</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Create safe space initiatives in high-traffic areas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Analytics Card */}
            <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-pink-600" />
                  <span>Department Performance Metrics</span>
                </CardTitle>
                <CardDescription>Key performance indicators for law enforcement operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/10 dark:to-rose-950/10">
                    <div className="text-2xl font-bold text-pink-600">247</div>
                    <div className="text-sm text-muted-foreground">
                      Total Incidents
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10">
                    <div className="text-2xl font-bold text-green-600">189</div>
                    <div className="text-sm text-muted-foreground">
                      Cases Closed
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/10 dark:to-amber-950/10">
                    <div className="text-2xl font-bold text-orange-600">58</div>
                    <div className="text-sm text-muted-foreground">
                      Active Cases
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/10 dark:to-cyan-950/10">
                    <div className="text-2xl font-bold text-blue-600">76.5%</div>
                    <div className="text-sm text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crime Hotspots */}
            <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span>Crime Hotspots</span>
                </CardTitle>
                <CardDescription>High-activity areas requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">This Week</h4>
                    {[
                      { area: "Downtown District", incidents: 23, type: "Mixed" },
                      { area: "Industrial Zone", incidents: 18, type: "Theft" },
                      { area: "Residential Area B", incidents: 15, type: "Burglary" },
                    ].map((hotspot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-800/50">
                        <div>
                          <p className="font-medium">{hotspot.area}</p>
                          <p className="text-sm text-muted-foreground">{hotspot.type}</p>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                          {hotspot.incidents} incidents
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Patrol Recommendations</h4>
                    {[
                      { recommendation: "Increase patrol frequency in Downtown District", priority: "High" },
                      { recommendation: "Deploy K-9 units in Industrial Zone", priority: "Medium" },
                      { recommendation: "Community outreach in Residential Area B", priority: "Medium" },
                    ].map((rec, index) => (
                      <div key={index} className="p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-800/50">
                        <p className="font-medium text-sm">{rec.recommendation}</p>
                        <Badge 
                          variant={rec.priority === "High" ? "destructive" : "secondary"}
                          className="mt-2"
                        >
                          {rec.priority} Priority
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {t("Map")}
              </h2>
            </div>
            {/* <MapPinIcon /> */}
            <Map />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}