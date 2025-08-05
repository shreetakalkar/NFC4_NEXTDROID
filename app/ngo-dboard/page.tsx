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
                Safety Analytics & Impact Reports
              </h2>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            {/* Safety Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Support Trends</span>
                  </CardTitle>
                  <CardDescription>Monthly assistance statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Crisis Calls</span>
                      <span className="font-semibold text-red-600">↑ 18%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Shelter Requests</span>
                      <span className="font-semibold text-orange-600">↑ 12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Legal Aid</span>
                      <span className="font-semibold text-green-600">↑ 25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Counseling Sessions</span>
                      <span className="font-semibold text-green-600">↑ 30%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>Response Times</span>
                  </CardTitle>
                  <CardDescription>Emergency support efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10">
                      <div className="text-2xl font-bold text-green-600">3.2 min</div>
                      <div className="text-sm text-muted-foreground">Crisis Hotline</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/10 dark:to-cyan-950/10">
                      <div className="text-2xl font-bold text-blue-600">24 hrs</div>
                      <div className="text-sm text-muted-foreground">Safe Housing</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Success Rates</span>
                  </CardTitle>
                  <CardDescription>Program effectiveness metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Safety Planning</span>
                      <span className="font-semibold text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Legal Support</span>
                      <span className="font-semibold text-green-600">88%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Housing Placement</span>
                      <span className="font-semibold text-yellow-600">76%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Economic Empowerment</span>
                      <span className="font-semibold text-green-600">82%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Analytics Card */}
            <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span>Women's Safety Impact Metrics</span>
                </CardTitle>
                <CardDescription>Key performance indicators for women's safety and empowerment programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/10 dark:to-rose-950/10">
                    <div className="text-2xl font-bold text-pink-600">1,847</div>
                    <div className="text-sm text-muted-foreground">
                      Women Helped
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-sm text-muted-foreground">
                      Lives Saved
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/10 dark:to-amber-950/10">
                    <div className="text-2xl font-bold text-orange-600">89</div>
                    <div className="text-sm text-muted-foreground">
                      Active Cases
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/10 dark:to-cyan-950/10">
                    <div className="text-2xl font-bold text-blue-600">91.2%</div>
                    <div className="text-sm text-muted-foreground">
                      Recovery Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Impact */}
            <Card className="border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Program Impact & Outreach</span>
                </CardTitle>
                <CardDescription>High-impact programs and areas needing additional support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Most Effective Programs</h4>
                    {[
                      { program: "24/7 Crisis Hotline", impact: 95, beneficiaries: 1247 },
                      { program: "Safe Housing Network", impact: 89, beneficiaries: 234 },
                      { program: "Legal Aid Services", impact: 87, beneficiaries: 567 },
                    ].map((prog, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-800/50">
                        <div>
                          <p className="font-medium">{prog.program}</p>
                          <p className="text-sm text-muted-foreground">{prog.beneficiaries} women helped</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                          {prog.impact}% success rate
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Priority Action Items</h4>
                    {[
                      { action: "Expand shelter capacity in urban areas", priority: "High" },
                      { action: "Launch digital safety awareness campaign", priority: "Medium" },
                      { action: "Strengthen partnerships with law enforcement", priority: "High" },
                    ].map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-800/50">
                        <p className="font-medium text-sm">{item.action}</p>
                        <Badge 
                          variant={item.priority === "High" ? "destructive" : "secondary"}
                          className="mt-2"
                        >
                          {item.priority} Priority
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