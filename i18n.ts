import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "ar" | "en";

export const translations = {
  ar: {
    // Auth screens
    "auth.login": "تسجيل الدخول",
    "auth.phoneNumber": "رقم الهاتف",
    "auth.enterPhone": "أدخل رقم الهاتف الخاص بك",
    "auth.otp": "رمز التحقق",
    "auth.enterOTP": "أدخل رمز التحقق المرسل إلى رقمك",
    "auth.verify": "تحقق",
    "auth.resendOTP": "إعادة إرسال الرمز",
    "auth.profileSetup": "إعداد الملف الشخصي",
    "auth.name": "الاسم",
    "auth.bio": "النبذة التعريفية",
    "auth.profilePicture": "صورة الملف الشخصي",
    "auth.complete": "إكمال",

    // Tab names
    "tab.chats": "الرسائل",
    "tab.stories": "الحالات",
    "tab.contacts": "جهات الاتصال",
    "tab.calls": "المكالمات",
    "tab.profile": "الملف الشخصي",

    // Chat screen
    "chat.newMessage": "رسالة جديدة",
    "chat.typeMessage": "اكتب رسالة...",
    "chat.send": "إرسال",
    "chat.image": "صورة",
    "chat.video": "فيديو",
    "chat.file": "ملف",
    "chat.audio": "رسالة صوتية",
    "chat.reply": "رد",
    "chat.forward": "إعادة توجيه",
    "chat.delete": "حذف",
    "chat.edit": "تعديل",
    "chat.deleteForBoth": "حذف للطرفين",
    "chat.seen": "مقروءة",
    "chat.delivered": "مستقبلة",
    "chat.sent": "مرسلة",

    // Stories
    "story.addStory": "إضافة حالة",
    "story.viewedBy": "شاهدها",
    "story.reply": "رد",
    "story.delete": "حذف الحالة",
    "story.expiresIn": "تنتهي في",

    // Contacts
    "contact.addContact": "إضافة جهة اتصال",
    "contact.search": "البحث",
    "contact.suggestions": "اقتراحات",
    "contact.blocked": "محظورة",

    // Profile
    "profile.editProfile": "تعديل الملف الشخصي",
    "profile.settings": "الإعدادات",
    "profile.privacy": "الخصوصية",
    "profile.notifications": "الإشعارات",
    "profile.language": "اللغة",
    "profile.darkMode": "الوضع الليلي",
    "profile.logout": "تسجيل الخروج",

    // Settings
    "settings.whoCanMessage": "من يمكنه مراسلتي",
    "settings.whoCanSeeStatus": "من يشاهد حالاتي",
    "settings.hideLastSeen": "إخفاء آخر ظهور",
    "settings.everyone": "الجميع",
    "settings.friends": "الأصدقاء فقط",
    "settings.nobody": "لا أحد",

    // Calls
    "call.incoming": "مكالمة واردة",
    "call.accept": "قبول",
    "call.reject": "رفض",
    "call.endCall": "إنهاء المكالمة",
    "call.mute": "كتم الصوت",
    "call.unmute": "تشغيل الصوت",
    "call.camera": "الكاميرا",
    "call.speaker": "السماعة",
    "call.switchCamera": "تبديل الكاميرا",

    // Groups
    "group.createGroup": "إنشاء مجموعة",
    "group.groupName": "اسم المجموعة",
    "group.addMembers": "إضافة أعضاء",
    "group.members": "الأعضاء",
    "group.admin": "المسؤول",
    "group.owner": "المالك",
    "group.leave": "مغادرة المجموعة",

    // Channels
    "channel.createChannel": "إنشاء قناة",
    "channel.channelName": "اسم القناة",
    "channel.subscribe": "الاشتراك",
    "channel.unsubscribe": "إلغاء الاشتراك",
    "channel.subscribers": "المشتركون",

    // Admin
    "admin.dashboard": "لوحة التحكم",
    "admin.users": "المستخدمون",
    "admin.reports": "البلاغات",
    "admin.statistics": "الإحصائيات",
    "admin.block": "حظر",
    "admin.unblock": "إلغاء الحظر",
    "admin.delete": "حذف",
    "admin.welcomeAdmin": "أهلاً بك",
    "admin.unauthorized": "أنت لست مسؤولاً",
    "admin.totalUsers": "إجمالي المستخدمين",
    "admin.activeUsers": "المستخدمون النشطون",
    "admin.blockedUsers": "المستخدمون المحظورون",
    "admin.totalMessages": "إجمالي الرسائل",
    "admin.systemInfo": "معلومات النظام",
    "admin.appVersion": "إصدار التطبيق",
    "admin.apiVersion": "إصدار API",
    "admin.dbStatus": "حالة قاعدة البيانات",
    "admin.connected": "متصل",
    "admin.blockUser": "حظر المستخدم",
    "admin.confirmBlock": "هل تريد حظر هذا المستخدم؟",
    "admin.blocked": "محظور",
    "admin.admin": "مسؤول",
    "admin.noReports": "لا توجد بلاغات",

    // Discover
    "discover.title": "اكتشف",
    "discover.searchPlaceholder": "ابحث عن أشخاص أو مجموعات أو قنوات",
    "discover.user": "مستخدم",
    "discover.group": "مجموعة",
    "discover.channel": "قناة",
    "discover.members": "أعضاء",
    "discover.message": "رسالة",
    "discover.join": "الانضمام",
    "discover.noResults": "لا توجد نتائج",
    "discover.suggestions": "الاقتراحات",

    // Settings Extended
    "settings.account": "الحساب",
    "settings.privacy": "الخصوصية",
    "settings.display": "العرض",
    "settings.about": "حول التطبيق",
    "settings.onlineStatus": "حالة الاتصال",
    "settings.readReceipts": "إشعارات القراءة",
    "settings.typingIndicators": "مؤشرات الكتابة",
    "settings.notificationsEnabled": "الإشعارات",
    "settings.soundEnabled": "الصوت",
    "settings.vibrationsEnabled": "الاهتزاز",
    "settings.darkMode": "الوضع الداكن",
    "settings.language": "اللغة",
    "settings.termsOfService": "شروط الخدمة",
    "settings.privacyPolicy": "سياسة الخصوصية",
    "settings.confirmLogout": "هل تريد تسجيل الخروج؟",

    // Events
    "events.title": "الفعاليات",
    "events.createEvent": "إنشاء فعالية",
    "events.createDescription": "إنشاء فعالية جديدة",
    "events.all": "الكل",
    "events.upcoming": "القادمة",
    "events.attending": "الفعاليات التي أحضرها",
    "events.ongoing": "جارية",
    "events.completed": "مكتملة",
    "events.attendees": "حاضر",
    "events.organizer": "المنظم",
    "events.attend": "الحضور",
    "events.cancel": "إلغاء",
    "events.noEvents": "لا توجد فعاليات",

    // Story Extended
    "story.createNew": "إنشاء حالة جديدة",
    "story.type": "نوع الحالة",
    "story.text": "نص",
    "story.image": "صورة",
    "story.video": "فيديو",
    "story.audio": "صوت",
    "story.previewText": "معاينة النص",
    "story.enterText": "أدخل النص",
    "story.backgroundColor": "لون الخلفية",
    "story.textColor": "لون النص",
    "story.pickImage": "اختر صورة",
    "story.pickVideo": "اختر فيديو",
    "story.recordAudio": "سجل صوتاً",
    "story.views": "مشاهدات",
    "story.error": "خطأ",
    "story.emptyContent": "يرجى إدخال محتوى",
    "story.success": "تم بنجاح",
    "story.created": "تم إنشاء الحالة بنجاح",

    // Channel Extended
    "channel.like": "إعجاب",
    "channel.comment": "تعليق",
    "channel.share": "مشاركة",
    "channel.subscribed": "مشترك",

    // Group Extended
    "group.removeMember": "إزالة عضو",
    "group.confirmRemove": "هل تريد إزالة",
    "group.remove": "إزالة",

    // Common Extended
    "common.ok": "حسناً",
    "common.create": "إنشاء",
  },
  en: {
    // Auth screens
    "auth.login": "Login",
    "auth.phoneNumber": "Phone Number",
    "auth.enterPhone": "Enter your phone number",
    "auth.otp": "Verification Code",
    "auth.enterOTP": "Enter the code sent to your phone",
    "auth.verify": "Verify",
    "auth.resendOTP": "Resend Code",
    "auth.profileSetup": "Profile Setup",
    "auth.name": "Name",
    "auth.bio": "Bio",
    "auth.profilePicture": "Profile Picture",
    "auth.complete": "Complete",

    // Tab names
    "tab.chats": "Chats",
    "tab.stories": "Stories",
    "tab.contacts": "Contacts",
    "tab.calls": "Calls",
    "tab.profile": "Profile",

    // Chat screen
    "chat.newMessage": "New Message",
    "chat.typeMessage": "Type a message...",
    "chat.send": "Send",
    "chat.image": "Image",
    "chat.video": "Video",
    "chat.file": "File",
    "chat.audio": "Voice Message",
    "chat.reply": "Reply",
    "chat.forward": "Forward",
    "chat.delete": "Delete",
    "chat.edit": "Edit",
    "chat.deleteForBoth": "Delete for Both",
    "chat.seen": "Seen",
    "chat.delivered": "Delivered",
    "chat.sent": "Sent",

    // Stories
    "story.addStory": "Add Story",
    "story.viewedBy": "Viewed by",
    "story.reply": "Reply",
    "story.delete": "Delete Story",
    "story.expiresIn": "Expires in",

    // Contacts
    "contact.addContact": "Add Contact",
    "contact.search": "Search",
    "contact.suggestions": "Suggestions",
    "contact.blocked": "Blocked",

    // Profile
    "profile.editProfile": "Edit Profile",
    "profile.settings": "Settings",
    "profile.privacy": "Privacy",
    "profile.notifications": "Notifications",
    "profile.language": "Language",
    "profile.darkMode": "Dark Mode",
    "profile.logout": "Logout",

    // Settings
    "settings.whoCanMessage": "Who can message me",
    "settings.whoCanSeeStatus": "Who can see my status",
    "settings.hideLastSeen": "Hide last seen",
    "settings.everyone": "Everyone",
    "settings.friends": "Friends only",
    "settings.nobody": "Nobody",

    // Calls
    "call.incoming": "Incoming Call",
    "call.accept": "Accept",
    "call.reject": "Reject",
    "call.endCall": "End Call",
    "call.mute": "Mute",
    "call.unmute": "Unmute",
    "call.camera": "Camera",
    "call.speaker": "Speaker",
    "call.switchCamera": "Switch Camera",

    // Groups
    "group.createGroup": "Create Group",
    "group.groupName": "Group Name",
    "group.addMembers": "Add Members",
    "group.members": "Members",
    "group.admin": "Admin",
    "group.owner": "Owner",
    "group.leave": "Leave Group",

    // Channels
    "channel.createChannel": "Create Channel",
    "channel.channelName": "Channel Name",
    "channel.subscribe": "Subscribe",
    "channel.unsubscribe": "Unsubscribe",
    "channel.subscribers": "Subscribers",

    // Admin
    "admin.dashboard": "Dashboard",
    "admin.users": "Users",
    "admin.reports": "Reports",
    "admin.statistics": "Statistics",
    "admin.block": "Block",
    "admin.unblock": "Unblock",
    "admin.delete": "Delete",

    // Admin Extended
    "admin.welcomeAdmin": "Welcome",
    "admin.unauthorized": "You are not an admin",
    "admin.totalUsers": "Total Users",
    "admin.activeUsers": "Active Users",
    "admin.blockedUsers": "Blocked Users",
    "admin.totalMessages": "Total Messages",
    "admin.systemInfo": "System Info",
    "admin.apiVersion": "API Version",
    "admin.dbStatus": "Database Status",
    "admin.connected": "Connected",
    "admin.blockUser": "Block User",
    "admin.confirmBlock": "Are you sure you want to block this user?",
    "admin.blocked": "Blocked",
    "admin.admin": "Admin",
    "admin.noReports": "No reports",

    // Discover
    "discover.title": "Discover",
    "discover.searchPlaceholder": "Search for people, groups or channels",
    "discover.user": "User",
    "discover.group": "Group",
    "discover.channel": "Channel",
    "discover.members": "members",
    "discover.message": "Message",
    "discover.join": "Join",
    "discover.noResults": "No results found",
    "discover.suggestions": "Suggestions",

    // Settings Extended
    "settings.account": "Account",
    "settings.display": "Display",
    "settings.about": "About",
    "settings.onlineStatus": "Online Status",
    "settings.readReceipts": "Read Receipts",
    "settings.typingIndicators": "Typing Indicators",
    "settings.notificationsEnabled": "Notifications",
    "settings.soundEnabled": "Sound",
    "settings.vibrationsEnabled": "Vibrations",
    "settings.darkMode": "Dark Mode",
    "settings.language": "Language",
    "settings.termsOfService": "Terms of Service",
    "settings.privacyPolicy": "Privacy Policy",
    "settings.confirmLogout": "Are you sure you want to logout?",

    // Events
    "events.title": "Events",
    "events.createEvent": "Create Event",
    "events.createDescription": "Create a new event",
    "events.all": "All",
    "events.upcoming": "Upcoming",
    "events.attending": "Attending",
    "events.ongoing": "Ongoing",
    "events.completed": "Completed",
    "events.attendees": "attendees",
    "events.organizer": "Organizer",
    "events.attend": "Attend",
    "events.cancel": "Cancel",
    "events.noEvents": "No events",

    // Story Extended
    "story.createNew": "Create New Story",
    "story.type": "Story Type",
    "story.text": "Text",
    "story.image": "Image",
    "story.video": "Video",
    "story.audio": "Audio",
    "story.previewText": "Preview text",
    "story.enterText": "Enter text",
    "story.backgroundColor": "Background Color",
    "story.textColor": "Text Color",
    "story.pickImage": "Pick Image",
    "story.pickVideo": "Pick Video",
    "story.recordAudio": "Record Audio",
    "story.views": "views",
    "story.error": "Error",
    "story.emptyContent": "Please enter content",
    "story.success": "Success",
    "story.created": "Story created successfully",

    // Channel Extended
    "channel.like": "Like",
    "channel.comment": "Comment",
    "channel.share": "Share",
    "channel.subscribed": "Subscribed",

    // Group Extended
    "group.removeMember": "Remove Member",
    "group.confirmRemove": "Are you sure you want to remove",
    "group.remove": "Remove",

    // Common Extended
    "common.ok": "OK",
    "common.create": "Create",

    // Common
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.online": "Online",
    "common.offline": "Offline",
    "common.away": "Away",
    "common.lastSeen": "Last seen",
  },
};

let currentLanguage: Language = "ar"; // Arabic is the default language

export async function initI18n() {
  try {
    const saved = await AsyncStorage.getItem("@language");
    if (saved === "ar" || saved === "en") {
      currentLanguage = saved;
    }
  } catch (error) {
    console.error("Failed to load language preference:", error);
  }
}

export async function setLanguage(language: Language) {
  try {
    currentLanguage = language;
    await AsyncStorage.setItem("@language", language);
  } catch (error) {
    console.error("Failed to save language preference:", error);
  }
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, language?: Language): string {
  const lang = language || currentLanguage;
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === "string" ? value : key;
}

export function isRTL(): boolean {
  return currentLanguage === "ar";
}
