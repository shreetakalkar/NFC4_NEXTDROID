"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Shield, Edit, Trash2, Search, Heart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { userService, type User as UserType } from "@/lib/firestore-service"

export function UserManagement() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getAll()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "posh_committee":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
      case "legal_advisor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "hr_admin":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "ngo_counselor":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
      case "admin":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
  }

  // const filteredUsers = users.filter((user) => {
    // const matchesSearch =
      // user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // user.organization.toLowerCase().includes(searchQuery.toLowerCase())
    // const matchesRole = roleFilter === "all" || user.role === roleFilter
    // return matchesSearch && matchesRole
  // })

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
              <div className="space-y-2">
                <div className="h-3 bg-pink-100 rounded"></div>
                <div className="h-3 bg-pink-100 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("users.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 border-pink-200 focus:border-pink-400 dark:border-pink-800"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48 border-pink-200 dark:border-pink-800">
              <SelectValue placeholder={t("users.filter_by_role")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.all_roles")}</SelectItem>
              <SelectItem value="posh_committee">{t("roles.posh_committee")}</SelectItem>
              <SelectItem value="legal_advisor">{t("roles.legal_advisor")}</SelectItem>
              <SelectItem value="hr_admin">{t("roles.hr_admin")}</SelectItem>
              <SelectItem value="ngo_counselor">{t("roles.ngo_counselor")}</SelectItem>
              <SelectItem value="admin">{t("roles.admin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <User className="h-4 w-4 mr-2" />
              {t("users.add_user")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-pink-600" />
                <span>{t("users.add_new_user")}</span>
              </DialogTitle>
              <DialogDescription>{t("users.add_user_desc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t("users.name")}</Label>
                  <Input id="name" placeholder={t("users.name_placeholder")} />
                </div>
                <div>
                  <Label htmlFor="email">{t("users.email")}</Label>
                  <Input id="email" type="email" placeholder={t("users.email_placeholder")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">{t("users.phone")}</Label>
                  <Input id="phone" placeholder={t("users.phone_placeholder")} />
                </div>
                <div>
                  <Label htmlFor="role">{t("users.role")}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t("users.select_role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="posh_committee">{t("roles.posh_committee")}</SelectItem>
                      <SelectItem value="legal_advisor">{t("roles.legal_advisor")}</SelectItem>
                      <SelectItem value="hr_admin">{t("roles.hr_admin")}</SelectItem>
                      <SelectItem value="ngo_counselor">{t("roles.ngo_counselor")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="organization">{t("users.organization")}</Label>
                <Input id="organization" placeholder={t("users.organization_placeholder")} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">{t("common.cancel")}</Button>
                <Button className="bg-pink-600 hover:bg-pink-700">{t("users.create_user")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className="hover:shadow-lg transition-all duration-200 border-pink-100 dark:border-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800/30"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <CardDescription className="text-sm">{user.organization}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(user.status)}>{t(`status.${user.status}`)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge className={getRoleColor(user.role)} variant="outline">
                    {t(`roles.${user.role}`)}
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-pink-100 dark:border-pink-900/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("users.cases_handled")}</span>
                  <span className="font-medium">{user.casesHandled || 0}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("users.last_login")}</span>
                    <span className="text-xs">{user.lastLogin.toDate().toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20 bg-transparent"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("users.edit")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
