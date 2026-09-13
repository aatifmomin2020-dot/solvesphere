export type Language = "en" | "hi" | "mr";

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    tagline: "From societal problems to measurable solutions.",
    report_problem: "Report a Problem",
    explore_challenges: "Explore Challenges",
    citizen_portal: "Citizen Portal",
    government_portal: "Government Validation",
    university_portal: "University Matching",
    industry_portal: "Industry & CSR Hub",
    ai_observability: "AI Observability",
    status_verified: "VERIFIED",
    status_analyzed: "AI ANALYZED",
    priority_high: "HIGH PRIORITY",
  },
  hi: {
    tagline: "सामाजिक समस्याओं से मापने योग्य समाधानों तक।",
    report_problem: "समस्या दर्ज करें",
    explore_challenges: "चुनौतियों का अन्वेषण करें",
    citizen_portal: "नागरिक पोर्टल",
    government_portal: "सरकारी सत्यापन",
    university_portal: "विश्वविद्यालय मिलान",
    industry_portal: "उद्योग एवं सीएसआर हब",
    ai_observability: "एआई वेधशाला",
    status_verified: "सत्यापित",
    status_analyzed: "एआई विश्लेषित",
    priority_high: "उच्च प्राथमिकता",
  },
  mr: {
    tagline: "सामाजिक समस्यांपासून मोजता येणाऱ्या उपायांपर्यंत.",
    report_problem: "समस्या नोंदवा",
    explore_challenges: "आव्हाने शोधा",
    citizen_portal: "नागरिक पोर्टल",
    government_portal: "शासकीय पडताळणी",
    university_portal: "विद्यापीठ जुळणी",
    industry_portal: "उद्योग आणि सीएसआर केंद्र",
    ai_observability: "एआय निरीक्षण",
    status_verified: "पडताळलेले",
    status_analyzed: "एआय विश्लेषण केले",
    priority_high: "उच्च प्राधान्य",
  }
};

export function getTranslation(lang: Language, key: string): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"]?.[key] || key;
}
