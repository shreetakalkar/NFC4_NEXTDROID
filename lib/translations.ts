type SupportedLanguage =
  | "en"
  | "hi"
  | "bn"
  | "te"
  | "mr"
  | "ta"
  | "gu"
  | "kn"
  | "ml"
  | "pa";
type TranslationKey = string;



// Define the translation structure with proper typing
interface Translations {
  system: {
    title: string;
    subtitle: string;
  };
  nav: {
    overview: string;
    cases: string;
    evidence: string;
    users: string;
    reports: string;
  };
  auth: {
    logout: string;
  };
  dashboard: {
    urgent_cases: string;
    urgent_cases_desc: string;
    recent_activity: string;
    recent_activity_desc: string;
  };
  stats: {
    total_cases: string;
    total_cases_desc: string;
    urgent_cases: string;
    urgent_cases_desc: string;
    active_users: string;
    active_users_desc: string;
    resolution_rate: string;
    resolution_rate_desc: string;
  };
  cases: {
    title: string;
    search_placeholder: string;
    filter: {
      all: string;
      pending: string;
      investigating: string;
      resolved: string;
    };
    anonymous: string;
    evidence_items: string;
    view_details: string;
    contact: string;
    status: string;
    priority: string;
    description: string;
    add_note: string;
    note_placeholder: string;
    update_case: string;
  };
  evidence: {
    title: string;
    view_vault: string;
    search_placeholder: string;
    encrypted: string;
    items: string;
    case_id: string;
    view: string;
    download: string;
    description: string;
  };
  users: {
    title: string;
    add_user: string;
    search_placeholder: string;
    filter_by_role: string;
    all_roles: string;
    add_new_user: string;
    add_user_desc: string;
    name: string;
    name_placeholder: string;
    email: string;
    email_placeholder: string;
    phone: string;
    phone_placeholder: string;
    role: string;
    select_role: string;
    organization: string;
    organization_placeholder: string;
    create_user: string;
    cases_handled: string;
    last_login: string;
    edit: string;
  };
  reports: {
    title: string;
    generate: string;
    analytics: string;
    analytics_desc: string;
    total_cases: string;
    resolved_cases: string;
    pending_cases: string;
  };
  status: {
    pending: string;
    investigating: string;
    resolved: string;
    active: string;
    inactive: string;
  };
  priority: {
    low: string;
    medium: string;
    high: string;
    urgent: string;
  };
  access: {
    confidential: string;
    restricted: string;
    internal: string;
  };
  roles: {
    posh_committee: string;
    legal_advisor: string;
    hr_admin: string;
    ngo_counselor: string;
    admin: string;
  };
  common: {
    cancel: string;
    save: string;
    delete: string;
    edit: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    system: {
      title: "Secure Harassment Reporting System",
      subtitle: "Admin Dashboard"
    },
    nav: {
      overview: "Overview",
      cases: "Cases",
      evidence: "Evidence",
      users: "Users",
      reports: "Reports"
    },
    auth: {
      logout: "Logout"
    },
    dashboard: {
      urgent_cases: "Urgent Cases",
      urgent_cases_desc: "Cases requiring immediate attention",
      recent_activity: "Recent Activity",
      recent_activity_desc: "Latest system activities"
    },
    stats: {
      total_cases: "Total Cases",
      total_cases_desc: "All reported cases",
      urgent_cases: "Urgent Cases",
      urgent_cases_desc: "High priority cases",
      active_users: "Active Users",
      active_users_desc: "Currently active users",
      resolution_rate: "Resolution Rate",
      resolution_rate_desc: "Cases resolved successfully"
    },
    cases: {
      title: "Case Management",
      search_placeholder: "Search cases...",
      filter: {
        all: "All Status",
        pending: "Pending",
        investigating: "Investigating",
        resolved: "Resolved"
      },
      anonymous: "Anonymous",
      evidence_items: "evidence items",
      view_details: "View Details",
      contact: "Contact",
      status: "Status",
      priority: "Priority",
      description: "Description",
      add_note: "Add Note",
      note_placeholder: "Add your notes here...",
      update_case: "Update Case"
    },
    evidence: {
      title: "Evidence Vault",
      view_vault: "View Vault",
      search_placeholder: "Search evidence...",
      encrypted: "Encrypted",
      items: "items",
      case_id: "Case ID",
      view: "View",
      download: "Download",
      description: "Description"
    },
    users: {
      title: "User Management",
      add_user: "Add User",
      search_placeholder: "Search users...",
      filter_by_role: "Filter by Role",
      all_roles: "All Roles",
      add_new_user: "Add New User",
      add_user_desc: "Create a new user account",
      name: "Name",
      name_placeholder: "Enter full name",
      email: "Email",
      email_placeholder: "Enter email address",
      phone: "Phone",
      phone_placeholder: "Enter phone number",
      role: "Role",
      select_role: "Select Role",
      organization: "Organization",
      organization_placeholder: "Enter organization",
      create_user: "Create User",
      cases_handled: "Cases Handled",
      last_login: "Last Login",
      edit: "Edit"
    },
    reports: {
      title: "Reports & Analytics",
      generate: "Generate Report",
      analytics: "System Analytics",
      analytics_desc: "Overview of system performance",
      total_cases: "Total Cases",
      resolved_cases: "Resolved Cases",
      pending_cases: "Pending Cases"
    },
    status: {
      pending: "Pending",
      investigating: "Investigating",
      resolved: "Resolved",
      active: "Active",
      inactive: "Inactive"
    },
    priority: {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent"
    },
    access: {
      confidential: "Confidential",
      restricted: "Restricted",
      internal: "Internal"
    },
    roles: {
      posh_committee: "PoSH Committee",
      legal_advisor: "Legal Advisor",
      hr_admin: "HR Admin",
      ngo_counselor: "NGO Counselor",
      admin: "Administrator"
    },
    common: {
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit"
    }
  },
  hi: {
    system: {
      title: "सुरक्षित उत्पीड़न रिपोर्टिंग सिस्टम",
      subtitle: "एडमिन डैशबोर्ड"
    },
    nav: {
      overview: "अवलोकन",
      cases: "मामले",
      evidence: "साक्ष्य",
      users: "उपयोगकर्ता",
      reports: "रिपोर्ट"
    },
    auth: {
      logout: "लॉगआउट"
    },
    dashboard: {
      urgent_cases: "तत्काल मामले",
      urgent_cases_desc: "तत्काल ध्यान देने वाले मामले",
      recent_activity: "हाल की गतिविधि",
      recent_activity_desc: "नवीनतम सिस्टम गतिविधियां"
    },
    stats: {
      total_cases: "कुल मामले",
      total_cases_desc: "सभी रिपोर्ट किए गए मामले",
      urgent_cases: "तत्काल मामले",
      urgent_cases_desc: "उच्च प्राथमिकता मामले",
      active_users: "सक्रिय उपयोगकर्ता",
      active_users_desc: "वर्तमान में सक्रिय उपयोगकर्ता",
      resolution_rate: "समाधान दर",
      resolution_rate_desc: "सफलतापूर्वक हल किए गए मामले"
    },
    cases: {
      title: "मामला प्रबंधन",
      search_placeholder: "मामले खोजें...",
      filter: {
        all: "सभी स्थिति",
        pending: "लंबित",
        investigating: "जांच में",
        resolved: "हल हो गया"
      },
      anonymous: "गुमनाम",
      evidence_items: "साक्ष्य आइटम",
      view_details: "विवरण देखें",
      contact: "संपर्क",
      status: "स्थिति",
      priority: "प्राथमिकता",
      description: "विवरण",
      add_note: "नोट जोड़ें",
      note_placeholder: "यहाँ अपने नोट्स जोड़ें...",
      update_case: "मामला अपडेट करें"
    },
    evidence: {
      title: "साक्ष्य तिजोरी",
      view_vault: "तिजोरी देखें",
      search_placeholder: "साक्ष्य खोजें...",
      encrypted: "एन्क्रिप्टेड",
      items: "आइटम",
      case_id: "मामला आईडी",
      view: "देखें",
      download: "डाउनलोड",
      description: "विवरण"
    },
    users: {
      title: "उपयोगकर्ता प्रबंधन",
      add_user: "उपयोगकर्ता जोड़ें",
      search_placeholder: "उपयोगकर्ता खोजें...",
      filter_by_role: "भूमिका के अनुसार फ़िल्टर करें",
      all_roles: "सभी भूमिकाएं",
      add_new_user: "नया उपयोगकर्ता जोड़ें",
      add_user_desc: "नया उपयोगकर्ता खाता बनाएं",
      name: "नाम",
      name_placeholder: "पूरा नाम दर्ज करें",
      email: "ईमेल",
      email_placeholder: "ईमेल पता दर्ज करें",
      phone: "फोन",
      phone_placeholder: "फोन नंबर दर्ज करें",
      role: "भूमिका",
      select_role: "भूमिका चुनें",
      organization: "संगठन",
      organization_placeholder: "संगठन दर्ज करें",
      create_user: "उपयोगकर्ता बनाएं",
      cases_handled: "संभाले गए मामले",
      last_login: "अंतिम लॉगिन",
      edit: "संपादित करें"
    },
    reports: {
      title: "रिपोर्ट और विश्लेषण",
      generate: "रिपोर्ट जेनरेट करें",
      analytics: "सिस्टम विश्लेषण",
      analytics_desc: "सिस्टम प्रदर्शन का अवलोकन",
      total_cases: "कुल मामले",
      resolved_cases: "हल किए गए मामले",
      pending_cases: "लंबित मामले"
    },
    status: {
      pending: "लंबित",
      investigating: "जांच में",
      resolved: "हल हो गया",
      active: "सक्रिय",
      inactive: "निष्क्रिय"
    },
    priority: {
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
      urgent: "तत्काल"
    },
    access: {
      confidential: "गोपनीय",
      restricted: "प्रतिबंधित",
      internal: "आंतरिक"
    },
    roles: {
      posh_committee: "पोश समिति",
      legal_advisor: "कानूनी सलाहकार",
      hr_admin: "एचआर एडमिन",
      ngo_counselor: "एनजीओ काउंसलर",
      admin: "प्रशासक"
    },
    common: {
      cancel: "रद्द करें",
      save: "सेव करें",
      delete: "हटाएं",
      edit: "संपादित करें"
    }
  },
  bn: {
    system: {
      title: "নিরাপদ হয়রানি রিপোর্টিং সিস্টেম",
      subtitle: "অ্যাডমিন ড্যাশবোর্ড"
    },
    nav: {
      overview: "সংক্ষিপ্ত বিবরণ",
      cases: "মামলা",
      evidence: "প্রমাণ",
      users: "ব্যবহারকারী",
      reports: "রিপোর্ট"
    },
    auth: {
      logout: "লগআউট"
    },
    dashboard: {
      urgent_cases: "জরুরি মামলা",
      urgent_cases_desc: "তাৎক্ষণিক মনোযোগ প্রয়োজন এমন মামলা",
      recent_activity: "সাম্প্রতিক কার্যক্রম",
      recent_activity_desc: "সর্বশেষ সিস্টেম কার্যক্রম"
    },
    stats: {
      total_cases: "মোট মামলা",
      total_cases_desc: "সমস্ত রিপোর্ট করা মামলা",
      urgent_cases: "জরুরি মামলা",
      urgent_cases_desc: "উচ্চ অগ্রাধিকার মামলা",
      active_users: "সক্রিয় ব্যবহারকারী",
      active_users_desc: "বর্তমানে সক্রিয় ব্যবহারকারী",
      resolution_rate: "সমাধানের হার",
      resolution_rate_desc: "সফলভাবে সমাধান হওয়া মামলা"
    },
    cases: {
      title: "মামলা ব্যবস্থাপনা",
      search_placeholder: "মামলা খুঁজুন...",
      filter: {
        all: "সব অবস্থা",
        pending: "মুলতুবি",
        investigating: "তদন্তাধীন",
        resolved: "সমাধান হয়েছে"
      },
      anonymous: "বেনামী",
      evidence_items: "প্রমাণ আইটেম",
      view_details: "বিস্তারিত দেখুন",
      contact: "যোগাযোগ",
      status: "অবস্থা",
      priority: "অগ্রাধিকার",
      description: "বিবরণ",
      add_note: "নোট যোগ করুন",
      note_placeholder: "এখানে আপনার নোট যোগ করুন...",
      update_case: "মামলা আপডেট করুন"
    },
    evidence: {
      title: "প্রমাণ ভল্ট",
      view_vault: "ভল্ট দেখুন",
      search_placeholder: "প্রমাণ খুঁজুন...",
      encrypted: "এনক্রিপ্টেড",
      items: "আইটেম",
      case_id: "মামলা আইডি",
      view: "দেখুন",
      download: "ডাউনলোড",
      description: "বিবরণ"
    },
    users: {
      title: "ব্যবহারকারী ব্যবস্থাপনা",
      add_user: "ব্যবহারকারী যোগ করুন",
      search_placeholder: "ব্যবহারকারী খুঁজুন...",
      filter_by_role: "ভূমিকা অনুসারে ফিল্টার করুন",
      all_roles: "সব ভূমিকা",
      add_new_user: "নতুন ব্যবহারকারী যোগ করুন",
      add_user_desc: "নতুন ব্যবহারকারী অ্যাকাউন্ট তৈরি করুন",
      name: "নাম",
      name_placeholder: "পূর্ণ নাম লিখুন",
      email: "ইমেইল",
      email_placeholder: "ইমেইল ঠিকানা লিখুন",
      phone: "ফোন",
      phone_placeholder: "ফোন নম্বর লিখুন",
      role: "ভূমিকা",
      select_role: "ভূমিকা নির্বাচন করুন",
      organization: "সংস্থা",
      organization_placeholder: "সংস্থা লিখুন",
      create_user: "ব্যবহারকারী তৈরি করুন",
      cases_handled: "পরিচালিত মামলা",
      last_login: "শেষ লগইন",
      edit: "সম্পাদনা করুন"
    },
    reports: {
      title: "রিপোর্ট ও বিশ্লেষণ",
      generate: "রিপোর্ট তৈরি করুন",
      analytics: "সিস্টেম বিশ্লেষণ",
      analytics_desc: "সিস্টেমের কর্মক্ষমতার সংক্ষিপ্ত বিবরণ",
      total_cases: "মোট মামলা",
      resolved_cases: "সমাধান হওয়া মামলা",
      pending_cases: "মুলতুবি মামলা"
    },
    status: {
      pending: "মুলতুবি",
      investigating: "তদন্তাধীন",
      resolved: "সমাধান হয়েছে",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়"
    },
    priority: {
      low: "কম",
      medium: "মাঝারি",
      high: "উচ্চ",
      urgent: "জরুরি"
    },
    access: {
      confidential: "গোপনীয়",
      restricted: "সীমাবদ্ধ",
      internal: "অভ্যন্তরীণ"
    },
    roles: {
      posh_committee: "পোশ কমিটি",
      legal_advisor: "আইনি পরামর্শদাতা",
      hr_admin: "এইচআর অ্যাডমিন",
      ngo_counselor: "এনজিও পরামর্শদাতা",
      admin: "প্রশাসক"
    },
    common: {
      cancel: "বাতিল",
      save: "সংরক্ষণ",
      delete: "মুছুন",
      edit: "সম্পাদনা"
    }
  },
  te: {
    system: {
      title: "సురక్షిత వేధింపుల నివేదన వ్యవస్థ",
      subtitle: "అడ్మిన్ డ్యాష్‌బోర్డ్"
    },
    nav: {
      overview: "అవలోకనం",
      cases: "కేసులు",
      evidence: "సాక్ష్యం",
      users: "వినియోగదారులు",
      reports: "నివేదికలు"
    },
    auth: {
      logout: "లాగ్అవుట్"
    },
    dashboard: {
      urgent_cases: "అత్యవసర కేసులు",
      urgent_cases_desc: "తక్షణ దృష్టి అవసరమైన కేసులు",
      recent_activity: "ఇటీవలి కార్యకలాపాలు",
      recent_activity_desc: "తాజా వ్యవస్థ కార్యకలాపాలు"
    },
    stats: {
      total_cases: "మొత్తం కేసులు",
      total_cases_desc: "అన్ని నివేదించబడిన కేసులు",
      urgent_cases: "అత్యవసర కేసులు",
      urgent_cases_desc: "అధిక ప్రాధాన్యత కేసులు",
      active_users: "సక్రియ వినియోగదారులు",
      active_users_desc: "ప్రస్తుతం సక్రియంగా ఉన్న వినియోగదారులు",
      resolution_rate: "పరిష్కార రేటు",
      resolution_rate_desc: "విజయవంతంగా పరిష్కరించబడిన కేసులు"
    },
    cases: {
      title: "కేసుల నిర్వహణ",
      search_placeholder: "కేసుల కోసం వెతకండి...",
      filter: {
        all: "అన్ని స్థితులు",
        pending: "పెండింగ్‌లో",
        investigating: "దర్యాప్తులో",
        resolved: "పరిష్కరించబడింది"
      },
      anonymous: "అనామక",
      evidence_items: "సాక్ష్య అంశాలు",
      view_details: "వివరాలు చుడండి",
      contact: "సంప్రదించండి",
      status: "స్థితి",
      priority: "ప్రాధాన్యత",
      description: "వివరణ",
      add_note: "గమనిక జోడించండి",
      note_placeholder: "మీ గమనికలను ఇక్కడ జోడించండి...",
      update_case: "కేసు అప్‌డేట్ చేయండి"
    },
    evidence: {
      title: "సాక్ష్య ఖజానా",
      view_vault: "ఖజానా చుడండి",
      search_placeholder: "సాక్ష్యాల కోసం వెతకండి...",
      encrypted: "గుప్తీకరించబడింది",
      items: "అంశాలు",
      case_id: "కేసు ID",
      view: "చుడండి",
      download: "డౌన్‌లోడ్",
      description: "వివరణ"
    },
    users: {
      title: "వినియోగదారుల నిర్వహణ",
      add_user: "వినియోగదారుని జోడించండి",
      search_placeholder: "వినియోగదారుల కోసం వెతకండి...",
      filter_by_role: "పాత్ర ఆధారంగా ఫిల్టర్ చేయండి",
      all_roles: "అన్ని పాత్రలు",
      add_new_user: "కొత్త వినియోగదారుని జోడించండి",
      add_user_desc: "కొత్త వినియోగదారు ఖాతాను సృష్టించండి",
      name: "పేరు",
      name_placeholder: "పూర్తి పేరు నమోదు చేయండి",
      email: "ఇమెయిల్",
      email_placeholder: "ఇమెయిల్ చిరునామా నమోదు చేయండి",
      phone: "ఫోన్",
      phone_placeholder: "ఫోన్ నంబర్ నమోదు చేయండి",
      role: "పాత్র",
      select_role: "పాత్రను ఎంచుకోండి",
      organization: "సంస్థ",
      organization_placeholder: "సంస్థను నమోదు చేయండి",
      create_user: "వినియోగదారుని సృష్టించండి",
      cases_handled: "నిర్వహించిన కేసులు",
      last_login: "చివరి లాగిన్",
      edit: "సవరించండి"
    },
    reports: {
      title: "నివేదికలు మరియు విశ్లేషణలు",
      generate: "నివేదిక రూపొందించండి",
      analytics: "వ్యవస్థ విశ్లేషణలు",
      analytics_desc: "వ్యవస్థ పనితీరు అవలోకనం",
      total_cases: "మొత్తం కేసులు",
      resolved_cases: "పరిష్కరించబడిన కేసులు",
      pending_cases: "పెండింగ్‌లో ఉన్న కేసులు"
    },
    status: {
      pending: "పెండింగ్‌లో",
      investigating: "దర్యాప్తులో",
      resolved: "పరిష్కరించబడింది",
      active: "సక్రియం",
      inactive: "నిష్క్రియం"
    },
    priority: {
      low: "తక్కువ",
      medium: "మధ్యమ",
      high: "అధిక",
      urgent: "అత్యవసరం"
    },
    access: {
      confidential: "రహస్యం",
      restricted: "పరిమితం",
      internal: "అంతర్గత"
    },
    roles: {
      posh_committee: "పోష్ కమిటీ",
      legal_advisor: "న్యాయ సలహాదారు",
      hr_admin: "HR అడ్మిన్",
      ngo_counselor: "NGO కౌన్సెలర్",
      admin: "నిర్వాహకుడు"
    },
    common: {
      cancel: "రద్దు చేయండి",
      save: "సేవ్ చేయండి",
      delete: "తొలగించండి",
      edit: "సవరించండి"
    }
  },
  mr: {
    system: {
      title: "सुरक्षित छळवणूक अहवाल प्रणाली",
      subtitle: "अॅडमिन डॅशबोर्ड"
    },
    nav: {
      overview: "विहंगावलोकन",
      cases: "प्रकरणे",
      evidence: "पुरावे",
      users: "वापरकर्ते",
      reports: "अहवाल"
    },
    auth: {
      logout: "लॉगआउट"
    },
    dashboard: {
      urgent_cases: "तातडीची प्रकरणे",
      urgent_cases_desc: "तात्काळ लक्ष देण्याची गरज असलेली प्रकरणे",
      recent_activity: "अलीकडील क्रियाकलाप",
      recent_activity_desc: "नवीनतम सिस्टम क्रियाकलाप"
    },
    stats: {
      total_cases: "एकूण प्रकरणे",
      total_cases_desc: "सर्व नोंदवलेली प्रकरणे",
      urgent_cases: "तातडीची प्रकरणे",
      urgent_cases_desc: "उच्च प्राधान्य प्रकरणे",
      active_users: "सक्रिय वापरकर्ते",
      active_users_desc: "सध्या सक्रिय वापरकर्ते",
      resolution_rate: "निराकरण दर",
      resolution_rate_desc: "यशस्वीरित्या सोडवलेली प्रकरणे"
    },
    cases: {
      title: "प्रकरण व्यवस्थापन",
      search_placeholder: "प्रकरणे शोधा...",
      filter: {
        all: "सर्व स्थिती",
        pending: "प्रलंबित",
        investigating: "तपासणी करत आहे",
        resolved: "निराकरण झाले"
      },
      anonymous: "गुमनाम",
      evidence_items: "पुरावे आयटम",
      view_details: "तपशील पहा",
      contact: "संपर्क",
      status: "स्थिती",
      priority: "प्राधान्य",
      description: "वर्णन",
      add_note: "टीप जोडा",
      note_placeholder: "येथे आपल्या टिप्पण्या जोडा...",
      update_case: "प्रकरण अपडेट करा"
    },
    evidence: {
      title: "पुरावे तिजोरी",
      view_vault: "तिजोरी पहा",
      search_placeholder: "पुरावे शोधा...",
      encrypted: "एन्क्रिप्टेड",
      items: "आयटम",
      case_id: "प्रकरण ID",
      view: "पहा",
      download: "डाउनलोड",
      description: "वर्णन"
    },
    users: {
      title: "वापरकर्ता व्यवस्थापन",
      add_user: "वापरकर्ता जोडा",
      search_placeholder: "वापरकर्ते शोधा...",
      filter_by_role: "भूमिकेनुसार फिल्टर करा",
      all_roles: "सर्व भूमिका",
      add_new_user: "नवीन वापरकर्ता जोडा",
      add_user_desc: "नवीन वापरकर्ता खाते तयार करा",
      name: "नाव",
      name_placeholder: "पूर्ण नाव प्रविष्ट करा",
      email: "ईमेल",
      email_placeholder: "ईमेल पत्ता प्रविष्ट करा",
      phone: "फोन",
      phone_placeholder: "फोन नंबर प्रविष्ट करा",
      role: "भूमिका",
      select_role: "भूमिका निवडा",
      organization: "संस्था",
      organization_placeholder: "संस्था प्रविष्ट करा",
      create_user: "वापरकर्ता तयार करा",
      cases_handled: "हाताळलेली प्रकरणे",
      last_login: "शेवटची लॉगिन",
      edit: "संपादित करा"
    },
    reports: {
      title: "अहवाल आणि विश्लेषण",
      generate: "अहवाल तयार करा",
      analytics: "सिस्टम विश्लेषण",
      analytics_desc: "सिस्टम कार्यक्षमतेचे विहंगावलोकन",
      total_cases: "एकूण प्रकरणे",
      resolved_cases: "निराकरण झालेली प्रकरणे",
      pending_cases: "प्रलंबित प्रकरणे"
    },
    status: {
      pending: "प्रलंबित",
      investigating: "तपासणी करत आहे",
      resolved: "निराकरण झाले",
      active: "सक्रिय",
      inactive: "निष्क्रिय"
    },
    priority: {
      low: "कमी",
      medium: "मध्यम",
      high: "उच्च",
      urgent: "तातडीचे"
    },
    access: {
      confidential: "गोपनीय",
      restricted: "प्रतिबंधित",
      internal: "अंतर्गत"
    },
    roles: {
      posh_committee: "पोश समिती",
      legal_advisor: "कायदेशीर सल्लागार",
      hr_admin: "HR अॅडमिन",
      ngo_counselor: "NGO समुपदेशक",
      admin: "प्रशासक"
    },
    common: {
      cancel: "रद्द करा",
      save: "जतन करा",
      delete: "हटवा",
      edit: "संपादित करा"
    }
  },
  ta: {
    system: {
      title: "பாதுகாப்பான துன்புறுத்தல் புகார் அமைப்பு",
      subtitle: "நிர்வாக டாஷ்போர்டு"
    },
    nav: {
      overview: "கண்ணோட்டம்",
      cases: "வழக்குகள்",
      evidence: "சான்றுகள்",
      users: "பயனர்கள்",
      reports: "அறிக்கைகள்"
    },
    auth: {
      logout: "வெளியேறு"
    },
    dashboard: {
      urgent_cases: "அவசர வழக்குகள்",
      urgent_cases_desc: "உடனடி கவனம் தேவைப்படும் வழக்குகள்",
      recent_activity: "சமீபத்திய செயல்பாடு",
      recent_activity_desc: "சமீபத்திய அமைப்பு செயல்பாடுகள்"
    },
    stats: {
      total_cases: "மொத்த வழக்குகள்",
      total_cases_desc: "அனைத்து புகாரளிக்கப்பட்ட வழக்குகள்",
      urgent_cases: "அவசர வழக்குகள்",
      urgent_cases_desc: "உயர் முன்னுரிமை வழக்குகள்",
      active_users: "செயலில் உள்ள பயனர்கள்",
      active_users_desc: "தற்போது செயலில் உள்ள பயனர்கள்",
      resolution_rate: "தீர்வு விகிதம்",
      resolution_rate_desc: "வெற்றிகரமாக தீர்க்கப்பட்ட வழக்குகள்"
    },
    cases: {
      title: "வழக்கு நிர்வாகம்",
      search_placeholder: "வழக்குகளை தேடுங்கள்...",
      filter: {
        all: "அனைத்து நிலைகள்",
        pending: "நிலுவையில்",
        investigating: "விசாரணையில்",
        resolved: "தீர்க்கப்பட்டது"
      },
      anonymous: "அநாமதேய",
      evidence_items: "சான்று உருப்படிகள்",
      view_details: "விவரங்களைப் பார்க்கவும்",
      contact: "தொடர்பு",
      status: "நிலை",
      priority: "முன்னுரிமை",
      description: "விளக்கம்",
      add_note: "குறிப்பு சேர்க்கவும்",
      note_placeholder: "உங்கள் குறிப்புகளை இங்கே சேர்க்கவும்...",
      update_case: "வழக்கை புதுப்பிக்கவும்"
    },
    evidence: {
      title: "சான்று பெட்டகம்",
      view_vault: "பெட்டகத்தைப் பார்க்கவும்",
      search_placeholder: "சான்றுகளை தேடுங்கள்...",
      encrypted: "குறியாக்கம் செய்யப்பட்டது",
      items: "உருப்படிகள்",
      case_id: "வழக்கு ID",
      view: "பார்க்கவும்",
      download: "பதிவிறக்கம்",
      description: "விளக்கம்"
    },
    users: {
      title: "பயனர் நிர்வாகம்",
      add_user: "பயனரைச் சேர்க்கவும்",
      search_placeholder: "பயனர்களை தேடுங்கள்...",
      filter_by_role: "பாத்திரத்தின் அடிப்படையில் வடிகட்டவும்",
      all_roles: "அனைத்து பாத்திரங்கள்",
      add_new_user: "புதிய பயனரைச் சேர்க்கவும்",
      add_user_desc: "புதிய பயனர் கணக்கை உருவாக்கவும்",
      name: "பெயர்",
      name_placeholder: "முழு பெயரை உள்ளிடவும்",
      email: "மின்னஞ்சல்",
      email_placeholder: "மின்னஞ்சல் முகவரியை உள்ளிடவும்",
      phone: "தொலைபேசி",
      phone_placeholder: "தொலைபேசி எண்ணை உள்ளிடவும்",
      role: "பாத்திரம்",
      select_role: "பாத்திரத்தைத் தேர்ந்தெடுக்கவும்",
      organization: "அமைப்பு",
      organization_placeholder: "அமைப்பை உள்ளிடவும்",
      create_user: "பயனரை உருவாக்கவும்",
      cases_handled: "கையாளப்பட்ட வழக்குகள்",
      last_login: "கடைசி உள்நுழைவு",
      edit: "திருத்தவும்"
    },
    reports: {
      title: "அறிக்கைகள் மற்றும் பகுப்பாய்வு",
      generate: "அறிக்கையை உருவாக்கவும்",
      analytics: "அமைப்பு பகுப்பாய்வு",
      analytics_desc: "அமைப்பு செயல்திறனின் கண்ணோட்டம்",
      total_cases: "மொத்த வழக்குகள்",
      resolved_cases: "தீர்க்கப்பட்ட வழக்குகள்",
      pending_cases: "நிலுவையில் உள்ள வழக்குகள்"
    },
    status: {
      pending: "நிலுவையில்",
      investigating: "விசாரணையில்",
      resolved: "தீர்க்கப்பட்டது",
      active: "செயலில்",
      inactive: "செயலில் இல்லை"
    },
    priority: {
      low: "குறைவு",
      medium: "நடுத்தர",
      high: "உயர்",
      urgent: "அவசரம்"
    },
    access: {
      confidential: "ரகசியம்",
      restricted: "தடைசெய்யப்பட்ட",
      internal: "உள்ளக"
    },
    roles: {
      posh_committee: "பாஷ் குழு",
      legal_advisor: "சட்ட ஆலோசகர்",
      hr_admin: "HR நிர்வாகி",
      ngo_counselor: "NGO ஆலோசகர்",
      admin: "நிர்வாகி"
    },
    common: {
      cancel: "ரத்து செய்",
      save: "சேமி",
      delete: "நீக்கவும்",
      edit: "திருத்தவும்"
    }
  },
  gu: {
    system: {
      title: "સુરક્ષિત સતામણી રિપોર્ટિંગ સિસ્ટમ",
      subtitle: "એડમિન ડેશબોર્ડ"
    },
    nav: {
      overview: "ઝાંખી",
      cases: "કેસો",
      evidence: "પુરાવા",
      users: "વપરાશકર્તાઓ",
      reports: "રિપોર્ટ્સ"
    },
    auth: {
      logout: "લૉગઆઉટ"
    },
    dashboard: {
      urgent_cases: "તાત્કાલિક કેસો",
      urgent_cases_desc: "તાત્કાલિક ધ્યાનની જરૂર હોય તેવા કેસો",
      recent_activity: "તાજેતરની પ્રવૃત્તિ",
      recent_activity_desc: "તાજેતરની સિસ્ટમ પ્રવૃત્તિઓ"
    },
    stats: {
      total_cases: "કુલ કેસો",
      total_cases_desc: "બધા રિપોર્ટ થયેલા કેસો",
      urgent_cases: "તાત્કાલિક કેસો",
      urgent_cases_desc: "ઉચ્ચ પ્રાથમિકતા કેસો",
      active_users: "સક્રિય વપરાશકર્તાઓ",
      active_users_desc: "હાલમાં સક્રિય વપરાશકર્તાઓ",
      resolution_rate: "ઉકેલનો દર",
      resolution_rate_desc: "સફળતાપૂર્વક ઉકેલાયેલા કેસો"
    },
    cases: {
      title: "કેસ મેનેજમેન્ટ",
      search_placeholder: "કેસો શોધો...",
      filter: {
        all: "બધી સ્થિતિ",
        pending: "બાકી",
        investigating: "તપાસમાં",
        resolved: "ઉકેલાયેલ"
      },
      anonymous: "અનામી",
      evidence_items: "પુરાવા આઇટમ્સ",
      view_details: "વિગતો જુઓ",
      contact: "સંપર્ક",
      status: "સ્થિતિ",
      priority: "પ્રાથમિકતા",
      description: "વર્ણન",
      add_note: "નોંધ ઉમેરો",
      note_placeholder: "અહીં તમારી નોંધો ઉમેરો...",
      update_case: "કેસ અપડેટ કરો"
    },
    evidence: {
      title: "પુરાવા તિજોરી",
      view_vault: "તિજોરી જુઓ",
      search_placeholder: "પુરાવા શોધો...",
      encrypted: "એન્ક્રિપ્ટેડ",
      items: "આઇટમ્સ",
      case_id: "કેસ ID",
      view: "જુઓ",
      download: "ડાઉનલોડ",
      description: "વર્ણન"
    },
    users: {
      title: "વપરાશકર્તા મેનેજમેન્ટ",
      add_user: "વપરાશકર્તા ઉમેરો",
      search_placeholder: "વપરાશકર્તાઓ શોધો...",
      filter_by_role: "ભૂમિકા દ્વારા ફિલ્ટર કરો",
      all_roles: "બધી ભૂમિકાઓ",
      add_new_user: "નવા વપરાશકર્તા ઉમેરો",
      add_user_desc: "નવું વપરાશકર્તા ખાતું બનાવો",
      name: "નામ",
      name_placeholder: "પૂરું નામ દાખલ કરો",
      email: "ઇમેઇલ",
      email_placeholder: "ઇમેઇલ સરનામું દાખલ કરો",
      phone: "ફોન",
      phone_placeholder: "ફોન નંબર દાખલ કરો",
      role: "ભૂમિકા",
      select_role: "ભૂમિકા પસંદ કરો",
      organization: "સંસ્થા",
      organization_placeholder: "સંસ્થા દાખલ કરો",
      create_user: "વપરાશકર્તા બનાવો",
      cases_handled: "સંભાળેલા કેસો",
      last_login: "છેલ્લી લૉગિન",
      edit: "સંપાદિત કરો"
    },
    reports: {
      title: "રિપોર્ટ્સ અને વિશ્લેષણ",
      generate: "રિપોર્ટ જનરેટ કરો",
      analytics: "સિસ્ટમ વિશ્લેષણ",
      analytics_desc: "સિસ્ટમ કામગીરીની ઝાંખી",
      total_cases: "કુલ કેસો",
      resolved_cases: "ઉકેલાયેલા કેસો",
      pending_cases: "બાકી કેસો"
    },
    status: {
      pending: "બાકી",
      investigating: "તપાસમાં",
      resolved: "ઉકેલાયેલ",
      active: "સક્રિય",
      inactive: "નિષ્ક્રિય"
    },
    priority: {
      low: "ઓછી",
      medium: "મધ્યમ",
      high: "ઉચ્ચ",
      urgent: "તાત્કાલિક"
    },
    access: {
      confidential: "ગોપનીય",
      restricted: "પ્રતિબંધિત",
      internal: "આંતરિક"
    },
    roles: {
      posh_committee: "પોશ કમિટી",
      legal_advisor: "કાનૂની સલાહકાર",
      hr_admin: "HR એડમિન",
      ngo_counselor: "NGO કાઉન્સેલર",
      admin: "એડમિનિસ્ટ્રેટર"
    },
    common: {
      cancel: "રદ કરો",
      save: "સેવ કરો",
      delete: "કાઢી નાખો",
      edit: "સંપાદિત કરો"
    }
  },
  kn: {
    system: {
      title: "ಸುರಕ್ಷಿತ ಕಿರುಕುಳ ವರದಿ ವ್ಯವಸ್ಥೆ",
      subtitle: "ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"
    },
    nav: {
      overview: "ಅವಲೋಕನ",
      cases: "ಪ್ರಕರಣಗಳು",
      evidence: "ಸಾಕ್ಷ್ಯ",
      users: "ಬಳಕೆದಾರರು",
      reports: "ವರದಿಗಳು"
    },
    auth: {
      logout: "ಲಾಗ್‌ಔಟ್"
    },
    dashboard: {
      urgent_cases: "ತುರ್ತು ಪ್ರಕರಣಗಳು",
      urgent_cases_desc: "ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯವಿರುವ ಪ್ರಕರಣಗಳು",
      recent_activity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
      recent_activity_desc: "ಇತ್ತೀಚಿನ ವ್ಯವಸ್ಥೆ ಚಟುವಟಿಕೆಗಳು"
    },
    stats: {
      total_cases: "ಒಟ್ಟು ಪ್ರಕರಣಗಳು",
      total_cases_desc: "ಎಲ್ಲಾ ವರದಿ ಮಾಡಿದ ಪ್ರಕರಣಗಳು",
      urgent_cases: "ತುರ್ತು ಪ್ರಕರಣಗಳು",
      urgent_cases_desc: "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ ಪ್ರಕರಣಗಳು",
      active_users: "ಸಕ್ರಿಯ ಬಳಕೆದಾರರು",
      active_users_desc: "ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಬಳಕೆದಾರರು",
      resolution_rate: "ಪರಿಹಾರ ದರ",
      resolution_rate_desc: "ಯಶಸ್ವಿಯಾಗಿ ಪರಿಹರಿಸಿದ ಪ್ರಕರಣಗಳು"
    },
    cases: {
      title: "ಪ್ರಕರಣ ನಿರ್ವಹಣೆ",
      search_placeholder: "ಪ್ರಕರಣಗಳನ್ನು ಹುಡುಕಿ...",
      filter: {
        all: "ಎಲ್ಲಾ ಸ್ಥಿತಿ",
        pending: "ಬಾಕಿ ಇರುವ",
        investigating: "ತನಿಖೆಯಲ್ಲಿ",
        resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ"
      },
      anonymous: "ಅನಾಮಧೇಯ",
      evidence_items: "ಸಾಕ್ಷ್ಯ ವಸ್ತುಗಳು",
      view_details: "ವಿವರಗಳನ್ನು ನೋಡಿ",
      contact: "ಸಂಪರ್ಕ",
      status: "ಸ್ಥಿತಿ",
      priority: "ಆದ್ಯತೆ",
      description: "ವಿವರಣೆ",
      add_note: "ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ",
      note_placeholder: "ನಿಮ್ಮ ಟಿಪ್ಪಣಿಗಳನ್ನು ಇಲ್ಲಿ ಸೇರಿಸಿ...",
      update_case: "ಪ್ರಕರಣವನ್ನು ನವೀಕರಿಸಿ"
    },
    evidence: {
      title: "ಸಾಕ್ಷ್ಯ ಕೋಶ",
      view_vault: "ಕೋಶವನ್ನು ನೋಡಿ",
      search_placeholder: "ಸಾಕ್ಷ್ಯವನ್ನು ಹುಡುಕಿ...",
      encrypted: "ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ",
      items: "ವಸ್ತುಗಳು",
      case_id: "ಪ್ರಕರಣ ID",
      view: "ನೋಡಿ",
      download: "ಡೌನ್‌ಲೋಡ್",
      description: "ವಿವರಣೆ"
    },
    users: {
      title: "ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ",
      add_user: "ಬಳಕೆದಾರನನ್ನು ಸೇರಿಸಿ",
      search_placeholder: "ಬಳಕೆದಾರರನ್ನು ಹುಡುಕಿ...",
      filter_by_role: "ಪಾತ್ರದ ಮೂಲಕ ಫಿಲ್ಟರ್ ಮಾಡಿ",
      all_roles: "ಎಲ್ಲಾ ಪಾತ್ರಗಳು",
      add_new_user: "ಹೊಸ ಬಳಕೆದಾರನನ್ನು ಸೇರಿಸಿ",
      add_user_desc: "ಹೊಸ ಬಳಕೆದಾರ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
      name: "ಹೆಸರು",
      name_placeholder: "ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      email: "ಇಮೇಲ್",
      email_placeholder: "ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",
      phone: "ಫೋನ್",
      phone_placeholder: "ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
      role: "ಪಾತ್ರ",
      select_role: "ಪಾತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
      organization: "ಸಂಸ್ಥೆ",
      organization_placeholder: "ಸಂಸ್ಥೆಯನ್ನು ನಮೂದಿಸಿ",
      create_user: "ಬಳಕೆದಾರನನ್ನು ರಚಿಸಿ",
      cases_handled: "ನಿರ್ವಹಿಸಿದ ಪ್ರಕರಣಗಳು",
      last_login: "ಕೊನೆಯ ಲಾಗಿನ್",
      edit: "ಸಂಪಾದಿಸಿ"
    },
    reports: {
      title: "ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ",
      generate: "ವರದಿಯನ್ನು ರಚಿಸಿ",
      analytics: "ವ್ಯವಸ್ಥೆ ವಿಶ್ಲೇಷಣೆ",
      analytics_desc: "ವ್ಯವಸ್ಥೆ ಕಾರ್ಯಕ್ಷಮತೆಯ ಅವಲೋಕನ",
      total_cases: "ಒಟ್ಟು ಪ್ರಕರಣಗಳು",
      resolved_cases: "ಪರಿಹರಿಸಿದ ಪ್ರಕರಣಗಳು",
      pending_cases: "ಬಾಕಿ ಇರುವ ಪ್ರಕರಣಗಳು"
    },
    status: {
      pending: "ಬಾಕಿ ಇರುವ",
      investigating: "ತನಿಖೆಯಲ್ಲಿ",
      resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
      active: "ಸಕ್ರಿಯ",
      inactive: "ನಿಷ್ಕ್ರಿಯ"
    },
    priority: {
      low: "ಕಡಿಮೆ",
      medium: "ಮಧ್ಯಮ",
      high: "ಹೆಚ್ಚಿನ",
      urgent: "ತುರ್ತು"
    },
    access: {
      confidential: "ಗೌಪ್ಯ",
      restricted: "ನಿರ್ಬಂಧಿತ",
      internal: "ಆಂತರಿಕ"
    },
    roles: {
      posh_committee: "ಪೋಶ್ ಸಮಿತಿ",
      legal_advisor: "ಕಾನೂನು ಸಲಹೆಗಾರ",
      hr_admin: "HR ಅಡ್ಮಿನ್",
      ngo_counselor: "NGO ಕೌನ್ಸೆಲರ್",
      admin: "ನಿರ್ವಾಹಕ"
    },
    common: {
      cancel: "ರದ್ದುಗೊಳಿಸಿ",
      save: "ಉಳಿಸಿ",
      delete: "ಅಳಿಸಿ",
      edit: "ಸಂಪಾದಿಸಿ"
    }
  },
  ml: {
    system: {
      title: "സുരക്ഷിത പീഡന റിപ്പോർട്ടിംഗ് സിസ്റ്റം",
      subtitle: "അഡ്മിൻ ഡാഷ്ബോർഡ്"
    },
    nav: {
      overview: "അവലോകനം",
      cases: "കേസുകൾ",
      evidence: "തെളിവുകൾ",
      users: "ഉപയോക്താക്കൾ",
      reports: "റിപ്പോർട്ടുകൾ"
    },
    auth: {
      logout: "ലോഗൗട്ട്"
    },
    dashboard: {
      urgent_cases: "അടിയന്തര കേസുകൾ",
      urgent_cases_desc: "അടിയന്തര ശ്രദ്ധ ആവശ്യമുള്ള കേസുകൾ",
      recent_activity: "സമീപകാല പ്രവർത്തനം",
      recent_activity_desc: "ഏറ്റവും പുതിയ സിസ്റ്റം പ്രവർത്തനങ്ങൾ"
    },
    stats: {
      total_cases: "മൊത്തം കേസുകൾ",
      total_cases_desc: "എല്ലാ റിപ്പോർട്ട് ചെയ്ത കേസുകൾ",
      urgent_cases: "അടിയന്തര കേസുകൾ",
      urgent_cases_desc: "ഉയർന്ന മുൻഗണനാ കേസുകൾ",
      active_users: "സജീവ ഉപയോക്താക്കൾ",
      active_users_desc: "നിലവിൽ സജീവമായ ഉപയോക്താക്കൾ",
      resolution_rate: "പരിഹാര നിരക്ക്",
      resolution_rate_desc: "വിജയകരമായി പരിഹരിച്ച കേസുകൾ"
    },
    cases: {
      title: "കേസ് മാനേജ്മെന്റ്",
      search_placeholder: "കേസുകൾ തിരയുക...",
      filter: {
        all: "എല്ലാ സ്ഥിതി",
        pending: "കാത്തിരിപ്പിൽ",
        investigating: "അന്വേഷണത്തിൽ",
        resolved: "പരിഹരിച്ചു"
      },
      anonymous: "അജ്ഞാത",
      evidence_items: "തെളിവ് ഇനങ്ങൾ",
      view_details: "വിശദാംശങ്ങൾ കാണുക",
      contact: "ബന്ധപ്പെടുക",
      status: "സ്ഥിതി",
      priority: "മുൻഗണന",
      description: "വിവരണം",
      add_note: "കുറിപ്പ് ചേർക്കുക",
      note_placeholder: "നിങ്ങളുടെ കുറിപ്പുകൾ ഇവിടെ ചേർക്കുക...",
      update_case: "കേസ് അപ്ഡേറ്റ് ചെയ്യുക"
    },
    evidence: {
      title: "തെളിവ് നിലവറ",
      view_vault: "നിലവറ കാണുക",
      search_placeholder: "തെളിവുകൾ തിരയുക...",
      encrypted: "എൻക്രിപ്റ്റ് ചെയ്തത്",
      items: "ഇനങ്ങൾ",
      case_id: "കേസ് ID",
      view: "കാണുക",
      download: "ഡൗൺലോഡ്",
      description: "വിവരണം"
    },
    users: {
      title: "ഉപയോക്തൃ മാനേജ്മെന്റ്",
      add_user: "ഉപയോക്താവിനെ ചേർക്കുക",
      search_placeholder: "ഉപയോക്താക്കളെ തിരയുക...",
      filter_by_role: "റോൾ അനുസരിച്ച് ഫിൽട്ടർ ചെയ്യുക",
      all_roles: "എല്ലാ റോളുകളും",
      add_new_user: "പുതിയ ഉപയോക്താവിനെ ചേർക്കുക",
      add_user_desc: "പുതിയ ഉപയോക്തൃ അക്കൗണ്ട് സൃഷ്ടിക്കുക",
      name: "പേര്",
      name_placeholder: "പൂർണ്ണ പേര് നൽകുക",
      email: "ഇമെയിൽ",
      email_placeholder: "ഇമെയിൽ വിലാസം നൽകുക",
      phone: "ഫോൺ",
      phone_placeholder: "ഫോൺ നമ്പർ നൽകുക",
      role: "റോൾ",
      select_role: "റോൾ തിരഞ്ഞെടുക്കുക",
      organization: "സ്ഥാപനം",
      organization_placeholder: "സ്ഥാപനം നൽകുക",
      create_user: "ഉപയോക്താവിനെ സൃഷ്ടിക്കുക",
      cases_handled: "കൈകാര്യം ചെയ്ത കേസുകൾ",
      last_login: "അവസാന ലോഗിൻ",
      edit: "എഡിറ്റ് ചെയ്യുക"
    },
    reports: {
      title: "റിപ്പോർട്ടുകളും വിശകലനവും",
      generate: "റിപ്പോർട്ട് സൃഷ്ടിക്കുക",
      analytics: "സിസ്റ്റം വിശകലനം",
      analytics_desc: "സിസ്റ്റം പ്രകടനത്തിന്റെ അവലോകനം",
      total_cases: "മൊത്തം കേസുകൾ",
      resolved_cases: "പരിഹരിച്ച കേസുകൾ",
      pending_cases: "കാത്തിരിപ്പിലുള്ള കേസുകൾ"
    },
    status: {
      pending: "കാത്തിരിപ്പിൽ",
      investigating: "അന്വേഷണത്തിൽ",
      resolved: "പരിഹരിച്ചു",
      active: "സജീവം",
      inactive: "നിഷ്ക്രിയം"
    },
    priority: {
      low: "കുറഞ്ഞത്",
      medium: "ഇടത്തരം",
      high: "ഉയർന്നത്",
      urgent: "അടിയന്തരം"
    },
    access: {
      confidential: "രഹസ്യം",
      restricted: "നിയന്ത്രിത",
      internal: "ആന്തരിക"
    },
    roles: {
      posh_committee: "പോഷ് കമ്മിറ്റി",
      legal_advisor: "നിയമ ഉപദേഷ്ടാവ്",
      hr_admin: "HR അഡ്മിൻ",
      ngo_counselor: "NGO കൗൺസിലർ",
      admin: "അഡ്മിനിസ്ട്രേറ്റർ"
    },
    common: {
      cancel: "റദ്ദാക്കുക",
      save: "സേവ് ചെയ്യുക",
      delete: "ഇല്ലാതാക്കുക",
      edit: "എഡിറ്റ് ചെയ്യുക"
    }
  },
  pa: {
    system: {
      title: "ਸੁਰੱਖਿਅਤ ਤੰਗ ਕਰਨ ਦੀ ਰਿਪੋਰਟਿੰਗ ਸਿਸਟਮ",
      subtitle: "ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ"
    },
    nav: {
      overview: "ਸੰਖੇਪ",
      cases: "ਕੇਸ",
      evidence: "ਸਬੂਤ",
      users: "ਯੂਜ਼ਰ",
      reports: "ਰਿਪੋਰਟਾਂ"
    },
    auth: {
      logout: "ਲਾਗਆਉਟ"
    },
    dashboard: {
      urgent_cases: "ਤੁਰੰਤ ਕੇਸ",
      urgent_cases_desc: "ਤੁਰੰਤ ਧਿਆਨ ਦੀ ਲੋੜ ਵਾਲੇ ਕੇਸ",
      recent_activity: "ਹਾਲੀਆ ਗਤੀਵਿਧੀ",
      recent_activity_desc: "ਨਵੀਨਤਮ ਸਿਸਟਮ ਗਤੀਵਿਧੀਆਂ"
    },
    stats: {
      total_cases: "ਕੁੱਲ ਕੇਸ",
      total_cases_desc: "ਸਾਰੇ ਰਿਪੋਰਟ ਕੀਤੇ ਕੇਸ",
      urgent_cases: "ਤੁਰੰਤ ਕੇਸ",
      urgent_cases_desc: "ਉੱਚ ਤਰਜੀਹ ਵਾਲੇ ਕੇਸ",
      active_users: "ਸਰਗਰਮ ਯੂਜ਼ਰ",
      active_users_desc: "ਮੌਜੂਦਾ ਤੌਰ 'ਤੇ ਸਰਗਰਮ ਯੂਜ਼ਰ",
      resolution_rate: "ਹੱਲ ਦੀ ਦਰ",
      resolution_rate_desc: "ਸਫਲਤਾਪੂਰਵਕ ਹੱਲ ਕੀਤੇ ਕੇਸ"
    },
    cases: {
      title: "ਕੇਸ ਪ੍ਰਬੰਧਨ",
      search_placeholder: "ਕੇਸ ਖੋਜੋ...",
      filter: {
        all: "ਸਾਰੀ ਸਥਿਤੀ",
        pending: "ਲੰਬਿਤ",
        investigating: "ਜਾਂਚ ਵਿੱਚ",
        resolved: "ਹੱਲ ਹੋ ਗਿਆ"
      },
      anonymous: "ਗੁਮਨਾਮ",
      evidence_items: "ਸਬੂਤ ਆਈਟਮਾਂ",
      view_details: "ਵੇਰਵੇ ਵੇਖੋ",
      contact: "ਸੰਪਰਕ",
      status: "ਸਥਿਤੀ",
      priority: "ਤਰਜੀਹ",
      description: "ਵੇਰਵਾ",
      add_note: "ਨੋਟ ਸ਼ਾਮਲ ਕਰੋ",
      note_placeholder: "ਆਪਣੇ ਨੋਟਸ ਇੱਥੇ ਸ਼ਾਮਲ ਕਰੋ...",
      update_case: "ਕੇਸ ਅਪਡੇਟ ਕਰੋ"
    },
    evidence: {
      title: "ਸਬੂਤ ਖਜ਼ਾਨਾ",
      view_vault: "ਖਜ਼ਾਨਾ ਵੇਖੋ",
      search_placeholder: "ਸਬੂਤ ਖੋਜੋ...",
      encrypted: "ਇਨਕ੍ਰਿਪਟਿਡ",
      items: "ਆਈਟਮਾਂ",
      case_id: "ਕੇਸ ID",
      view: "ਵੇਖੋ",
      download: "ਡਾਊਨਲੋਡ",
      description: "ਵੇਰਵਾ"
    },
    users: {
      title: "ਯੂਜ਼ਰ ਪ੍ਰਬੰਧਨ",
      add_user: "ਯੂਜ਼ਰ ਸ਼ਾਮਲ ਕਰੋ",
      search_placeholder: "ਯੂਜ਼ਰ ਖੋਜੋ...",
      filter_by_role: "ਭੂਮਿਕਾ ਦੇ ਅਧਾਰ 'ਤੇ ਫਿਲਟਰ ਕਰੋ",
      all_roles: "ਸਾਰੀਆਂ ਭੂਮਿਕਾਵਾਂ",
      add_new_user: "ਨਵਾਂ ਯੂਜ਼ਰ ਸ਼ਾਮਲ ਕਰੋ",
      add_user_desc: "ਨਵਾਂ ਯੂਜ਼ਰ ਖਾਤਾ ਬਣਾਓ",
      name: "ਨਾਮ",
      name_placeholder: "ਪੂਰਾ ਨਾਮ ਦਾਖਲ ਕਰੋ",
      email: "ਈਮੇਲ",
      email_placeholder: "ਈਮੇਲ ਪਤਾ ਦਾਖਲ ਕਰੋ",
      phone: "ਫੋਨ",
      phone_placeholder: "ਫੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ",
      role: "ਭੂਮਿਕਾ",
      select_role: "ਭੂਮਿਕਾ ਚੁਣੋ",
      organization: "ਸੰਸਥਾ",
      organization_placeholder: "ਸੰਸਥਾ ਦਾਖਲ ਕਰੋ",
      create_user: "ਯੂਜ਼ਰ ਬਣਾਓ",
      cases_handled: "ਸੰਭਾਲੇ ਗਏ ਕੇਸ",
      last_login: "ਆਖਰੀ ਲਾਗਇਨ",
      edit: "ਸੰਪਾਦਿਤ ਕਰੋ"
    },
    reports: {
      title: "ਰਿਪੋਰਟਾਂ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ",
      generate: "ਰਿਪੋਰਟ ਤਿਆਰ ਕਰੋ",
      analytics: "ਸਿਸਟਮ ਵਿਸ਼ਲੇਸ਼ਣ",
      analytics_desc: "ਸਿਸਟਮ ਪ੍ਰਦਰਸ਼ਨ ਦਾ ਸੰਖੇਪ",
      total_cases: "ਕੁੱਲ ਕੇਸ",
      resolved_cases: "ਹੱਲ ਹੋਏ ਕੇਸ",
      pending_cases: "ਲੰਬਿਤ ਕੇਸ"
    },
    status: {
      pending: "ਲੰਬਿਤ",
      investigating: "ਜਾਂਚ ਵਿੱਚ",
      resolved: "ਹੱਲ ਹੋ ਗਿਆ",
      active: "ਸਰਗਰਮ",
      inactive: "ਨਿਸ਼ਕਿਰਿਆ"
    },
    priority: {
      low: "ਘੱਟ",
      medium: "ਮੱਧਮ",
      high: "ਉੱਚ",
      urgent: "ਤੁਰੰਤ"
    },
    access: {
      confidential: "ਗੁਪਤ",
      restricted: "ਪ੍ਰਤਿਬੰਧਿਤ",
      internal: "ਅੰਦਰੂਨੀ"
    },
    roles: {
      posh_committee: "ਪੋਸ਼ ਕਮੇਟੀ",
      legal_advisor: "ਕਾਨੂੰਨੀ ਸਲਾਹਕਾਰ",
      hr_admin: "HR ਐਡਮਿਨ",
      ngo_counselor: "NGO ਸਲਾਹਕਾਰ",
      admin: "ਪ੍ਰਸ਼ਾਸਕ"
    },
    common: {
      cancel: "ਰੱਦ ਕਰੋ",
      save: "ਸੇਵ ਕਰੋ",
      delete: "ਮਿਟਾਓ",
      edit: "ਸੰਪਾਦਿਤ ਕਰੋ"
    }
  }
}