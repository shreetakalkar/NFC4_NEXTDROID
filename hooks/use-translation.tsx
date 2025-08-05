"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface TranslationContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations = {
  en: {
    "system.title": "Secure Harassment Reporting System",
    "system.subtitle": "Admin Dashboard",
    "nav.overview": "Overview",
    "nav.cases": "Cases",
    "nav.evidence": "Evidence",
    "nav.users": "Users",
    "nav.reports": "Reports",
    "auth.logout": "Logout",
    "dashboard.urgent_cases": "Urgent Cases",
    "dashboard.urgent_cases_desc": "Cases requiring immediate attention",
    "dashboard.recent_activity": "Recent Activity",
    "dashboard.recent_activity_desc": "Latest system activities",
    "stats.total_cases": "Total Cases",
    "stats.total_cases_desc": "All reported cases",
    "stats.urgent_cases": "Urgent Cases",
    "stats.urgent_cases_desc": "High priority cases",
    "stats.active_users": "Active Users",
    "stats.active_users_desc": "Currently active users",
    "stats.resolution_rate": "Resolution Rate",
    "stats.resolution_rate_desc": "Cases resolved successfully",
    "cases.title": "Case Management",
    "cases.search_placeholder": "Search cases...",
    "cases.filter.all": "All Status",
    "cases.filter.pending": "Pending",
    "cases.filter.investigating": "Investigating",
    "cases.filter.resolved": "Resolved",
    "cases.anonymous": "Anonymous",
    "cases.evidence_items": "evidence items",
    "cases.view_details": "View Details",
    "cases.contact": "Contact",
    "cases.status": "Status",
    "cases.priority": "Priority",
    "cases.description": "Description",
    "cases.add_note": "Add Note",
    "cases.note_placeholder": "Add your notes here...",
    "cases.update_case": "Update Case",
    "evidence.title": "Evidence Vault",
    "evidence.view_vault": "View Vault",
    "evidence.search_placeholder": "Search evidence...",
    "evidence.encrypted": "Encrypted",
    "evidence.items": "items",
    "evidence.case_id": "Case ID",
    "evidence.view": "View",
    "evidence.download": "Download",
    "evidence.description": "Description",
    "users.title": "User Management",
    "users.add_user": "Add User",
    "users.search_placeholder": "Search users...",
    "users.filter_by_role": "Filter by Role",
    "users.all_roles": "All Roles",
    "users.add_new_user": "Add New User",
    "users.add_user_desc": "Create a new user account",
    "users.name": "Name",
    "users.name_placeholder": "Enter full name",
    "users.email": "Email",
    "users.email_placeholder": "Enter email address",
    "users.phone": "Phone",
    "users.phone_placeholder": "Enter phone number",
    "users.role": "Role",
    "users.select_role": "Select Role",
    "users.organization": "Organization",
    "users.organization_placeholder": "Enter organization",
    "users.create_user": "Create User",
    "users.cases_handled": "Cases Handled",
    "users.last_login": "Last Login",
    "users.edit": "Edit",
    "reports.title": "Reports & Analytics",
    "reports.generate": "Generate Report",
    "reports.analytics": "System Analytics",
    "reports.analytics_desc": "Overview of system performance",
    "reports.total_cases": "Total Cases",
    "reports.resolved_cases": "Resolved Cases",
    "reports.pending_cases": "Pending Cases",
    "status.pending": "Pending",
    "status.investigating": "Investigating",
    "status.resolved": "Resolved",
    "status.active": "Active",
    "status.inactive": "Inactive",
    "priority.low": "Low",
    "priority.medium": "Medium",
    "priority.high": "High",
    "priority.urgent": "Urgent",
    "access.confidential": "Confidential",
    "access.restricted": "Restricted",
    "access.internal": "Internal",
    "roles.posh_committee": "PoSH Committee",
    "roles.legal_advisor": "Legal Advisor",
    "roles.hr_admin": "HR Admin",
    "roles.ngo_counselor": "NGO Counselor",
    "roles.admin": "Administrator",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
  },
  hi: {
    "system.title": "सुरक्षित उत्पीड़न रिपोर्टिंग सिस्टम",
    "system.subtitle": "एडमिन डैशबोर्ड",
    "nav.overview": "अवलोकन",
    "nav.cases": "मामले",
    "nav.evidence": "साक्ष्य",
    "nav.users": "उपयोगकर्ता",
    "nav.reports": "रिपोर्ट",
    "auth.logout": "लॉगआउट",
    "dashboard.urgent_cases": "तत्काल मामले",
    "dashboard.urgent_cases_desc": "तत्काल ध्यान देने वाले मामले",
    "dashboard.recent_activity": "हाल की गतिविधि",
    "dashboard.recent_activity_desc": "नवीनतम सिस्टम गतिविधियां",
    "stats.total_cases": "कुल मामले",
    "stats.total_cases_desc": "सभी रिपोर्ट किए गए मामले",
    "stats.urgent_cases": "तत्काल मामले",
    "stats.urgent_cases_desc": "उच्च प्राथमिकता मामले",
    "stats.active_users": "सक्रिय उपयोगकर्ता",
    "stats.active_users_desc": "वर्तमान में सक्रिय उपयोगकर्ता",
    "stats.resolution_rate": "समाधान दर",
    "stats.resolution_rate_desc": "सफलतापूर्वक हल किए गए मामले",
    "cases.title": "मामला प्रबंधन",
    "cases.search_placeholder": "मामले खोजें...",
    "cases.filter.all": "सभी स्थिति",
    "cases.filter.pending": "लंबित",
    "cases.filter.investigating": "जांच में",
    "cases.filter.resolved": "हल हो गया",
    "cases.anonymous": "गुमनाम",
    "cases.evidence_items": "साक्ष्य आइटम",
    "cases.view_details": "विवरण देखें",
    "cases.contact": "संपर्क",
    "cases.status": "स्थिति",
    "cases.priority": "प्राथमिकता",
    "cases.description": "विवरण",
    "cases.add_note": "नोट जोड़ें",
    "cases.note_placeholder": "यहाँ अपने नोट्स जोड़ें...",
    "cases.update_case": "मामला अपडेट करें",
    "evidence.title": "साक्ष्य तिजोरी",
    "evidence.view_vault": "तिजोरी देखें",
    "evidence.search_placeholder": "साक्ष्य खोजें...",
    "evidence.encrypted": "एन्क्रिप्टेड",
    "evidence.items": "आइटम",
    "evidence.case_id": "मामला आईडी",
    "evidence.view": "देखें",
    "evidence.download": "डाउनलोड",
    "evidence.description": "विवरण",
    "users.title": "उपयोगकर्ता प्रबंधन",
    "users.add_user": "उपयोगकर्ता जोड़ें",
    "users.search_placeholder": "उपयोगकर्ता खोजें...",
    "users.filter_by_role": "भूमिका के अनुसार फ़िल्टर करें",
    "users.all_roles": "सभी भूमिकाएं",
    "users.add_new_user": "नया उपयोगकर्ता जोड़ें",
    "users.add_user_desc": "नया उपयोगकर्ता खाता बनाएं",
    "users.name": "नाम",
    "users.name_placeholder": "पूरा नाम दर्ज करें",
    "users.email": "ईमेल",
    "users.email_placeholder": "ईमेल पता दर्ज करें",
    "users.phone": "फोन",
    "users.phone_placeholder": "फोन नंबर दर्ज करें",
    "users.role": "भूमिका",
    "users.select_role": "भूमिका चुनें",
    "users.organization": "संगठन",
    "users.organization_placeholder": "संगठन दर्ज करें",
    "users.create_user": "उपयोगकर्ता बनाएं",
    "users.cases_handled": "संभाले गए मामले",
    "users.last_login": "अंतिम लॉगिन",
    "users.edit": "संपादित करें",
    "reports.title": "रिपोर्ट और विश्लेषण",
    "reports.generate": "रिपोर्ट जेनरेट करें",
    "reports.analytics": "सिस्टम विश्लेषण",
    "reports.analytics_desc": "सिस्टम प्रदर्शन का अवलोकन",
    "reports.total_cases": "कुल मामले",
    "reports.resolved_cases": "हल किए गए मामले",
    "reports.pending_cases": "लंबित मामले",
    "status.pending": "लंबित",
    "status.investigating": "जांच में",
    "status.resolved": "हल हो गया",
    "status.active": "सक्रिय",
    "status.inactive": "निष्क्रिय",
    "priority.low": "कम",
    "priority.medium": "मध्यम",
    "priority.high": "उच्च",
    "priority.urgent": "तत्काल",
    "access.confidential": "गोपनीय",
    "access.restricted": "प्रतिबंधित",
    "access.internal": "आंतरिक",
    "roles.posh_committee": "पोश समिति",
    "roles.legal_advisor": "कानूनी सलाहकार",
    "roles.hr_admin": "एचआर एडमिन",
    "roles.ngo_counselor": "एनजीओ काउंसलर",
    "roles.admin": "प्रशासक",
    "common.cancel": "रद्द करें",
    "common.save": "सेव करें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
  },
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en"
    setLanguage(savedLanguage)
  }, [])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language as keyof typeof translations]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
