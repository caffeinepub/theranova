import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LanguageCode =
  | "en"
  | "hi"
  | "ta"
  | "te"
  | "kn"
  | "ml"
  | "bn"
  | "mr"
  | "gu"
  | "pa"
  | "or"
  | "as"
  | "ur";

export interface LanguageMeta {
  code: LanguageCode;
  native: string;
  english: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
  { code: "ur", native: "اردو", english: "Urdu" },
];

// ─── Translations ─────────────────────────────────────────────────────────────

type TranslationKey =
  | "nav.dashboard"
  | "nav.tips"
  | "nav.modules"
  | "module.speech"
  | "module.motor"
  | "module.eye"
  | "module.telerehab"
  | "greeting.welcome"
  | "btn.start"
  | "btn.signin"
  | "btn.demo";

type Translations = Record<TranslationKey, string>;
type TranslationMap = Record<LanguageCode, Translations>;

const translations: TranslationMap = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.tips": "Recovery Tips",
    "nav.modules": "Modules",
    "module.speech": "Speech Therapy",
    "module.motor": "Motor Skills",
    "module.eye": "Eye Control",
    "module.telerehab": "Tele-Rehabilitation",
    "greeting.welcome": "Welcome back",
    "btn.start": "Start",
    "btn.signin": "Sign In",
    "btn.demo": "Try Demo",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.tips": "रिकवरी टिप्स",
    "nav.modules": "मॉड्यूल",
    "module.speech": "वाक् चिकित्सा",
    "module.motor": "मोटर कौशल",
    "module.eye": "नेत्र नियंत्रण",
    "module.telerehab": "टेली-पुनर्वास",
    "greeting.welcome": "वापस आपका स्वागत",
    "btn.start": "शुरू करें",
    "btn.signin": "साइन इन करें",
    "btn.demo": "डेमो आज़माएं",
  },
  ta: {
    "nav.dashboard": "டாஷ்போர்டு",
    "nav.tips": "மீட்சி குறிப்புகள்",
    "nav.modules": "தொகுதிகள்",
    "module.speech": "பேச்சு சிகிச்சை",
    "module.motor": "மோட்டார் திறன்கள்",
    "module.eye": "கண் கட்டுப்பாடு",
    "module.telerehab": "டெலி-மறுவாழ்வு",
    "greeting.welcome": "மீண்டும் வரவேற்கிறோம்",
    "btn.start": "தொடங்கு",
    "btn.signin": "உள்நுழைய",
    "btn.demo": "டெமோ முயற்சிக்க",
  },
  te: {
    "nav.dashboard": "డాష్‌బోర్డు",
    "nav.tips": "రికవరీ చిట్కాలు",
    "nav.modules": "మాడ్యూళ్ళు",
    "module.speech": "స్పీచ్ థెరపీ",
    "module.motor": "మోటర్ నైపుణ్యాలు",
    "module.eye": "కంటి నియంత్రణ",
    "module.telerehab": "టెలి-రిహాబిలిటేషన్",
    "greeting.welcome": "తిరిగి స్వాగతం",
    "btn.start": "ప్రారంభించు",
    "btn.signin": "సైన్ ఇన్ చేయండి",
    "btn.demo": "డెమో ప్రయత్నించండి",
  },
  kn: {
    "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav.tips": "ಚೇತರಿಕೆ ಸಲಹೆಗಳು",
    "nav.modules": "ಮಾಡ್ಯೂಲ್‌ಗಳು",
    "module.speech": "ಸ್ಪೀಚ್ ಥೆರಪಿ",
    "module.motor": "ಮೋಟರ್ ಕೌಶಲ್ಯಗಳು",
    "module.eye": "ಕಣ್ಣಿನ ನಿಯಂತ್ರಣ",
    "module.telerehab": "ಟೆಲಿ-ಪುನರ್ವಸತಿ",
    "greeting.welcome": "ಮತ್ತೆ ಸ್ವಾಗತ",
    "btn.start": "ಪ್ರಾರಂಭಿಸಿ",
    "btn.signin": "ಸೈನ್ ಇನ್ ಮಾಡಿ",
    "btn.demo": "ಡೆಮೋ ಪ್ರಯತ್ನಿಸಿ",
  },
  ml: {
    "nav.dashboard": "ഡാഷ്‌ബോർഡ്",
    "nav.tips": "റിക്കവറി ടിപ്‌സ്",
    "nav.modules": "മൊഡ്യൂളുകൾ",
    "module.speech": "സ്പീച്ച് തെറാപ്പി",
    "module.motor": "മോട്ടോർ കഴിവുകൾ",
    "module.eye": "കണ്ണ് നിയന്ത്രണം",
    "module.telerehab": "ടെലി-പുനരധിവാസം",
    "greeting.welcome": "തിരിച്ചു സ്വാഗതം",
    "btn.start": "ആരംഭിക്കുക",
    "btn.signin": "സൈൻ ഇൻ ചെയ്യുക",
    "btn.demo": "ഡെമോ ശ്രമിക്കുക",
  },
  bn: {
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.tips": "রিকভারি টিপস",
    "nav.modules": "মডিউল",
    "module.speech": "স্পিচ থেরাপি",
    "module.motor": "মোটর দক্ষতা",
    "module.eye": "চোখের নিয়ন্ত্রণ",
    "module.telerehab": "টেলি-পুনর্বাসন",
    "greeting.welcome": "আবার স্বাগতম",
    "btn.start": "শুরু করুন",
    "btn.signin": "সাইন ইন করুন",
    "btn.demo": "ডেমো ব্যবহার করুন",
  },
  mr: {
    "nav.dashboard": "डॅशबोर्ड",
    "nav.tips": "रिकव्हरी टिप्स",
    "nav.modules": "मॉड्युल",
    "module.speech": "स्पीच थेरपी",
    "module.motor": "मोटर कौशल",
    "module.eye": "डोळे नियंत्रण",
    "module.telerehab": "टेली-पुनर्वसन",
    "greeting.welcome": "पुन्हा स्वागत आहे",
    "btn.start": "सुरू करा",
    "btn.signin": "साइन इन करा",
    "btn.demo": "डेमो वापरा",
  },
  gu: {
    "nav.dashboard": "ડૅશબોર્ડ",
    "nav.tips": "રિકવરી ટિપ્સ",
    "nav.modules": "મૉડ્યૂલ",
    "module.speech": "સ્પીચ થેરપી",
    "module.motor": "મોટર સ્કિલ્સ",
    "module.eye": "આંખ નિયંત્રણ",
    "module.telerehab": "ટેલી-રિહૅબ",
    "greeting.welcome": "ફરી સ્વાગત છે",
    "btn.start": "શરૂ કરો",
    "btn.signin": "સાઇન ઇન કરો",
    "btn.demo": "ડેમો અજમાવો",
  },
  pa: {
    "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ",
    "nav.tips": "ਰਿਕਵਰੀ ਟਿਪਸ",
    "nav.modules": "ਮੌਡਿਊਲ",
    "module.speech": "ਸਪੀਚ ਥੈਰੇਪੀ",
    "module.motor": "ਮੋਟਰ ਹੁਨਰ",
    "module.eye": "ਅੱਖ ਕੰਟਰੋਲ",
    "module.telerehab": "ਟੈਲੀ-ਮੁੜ-ਵਸੇਬਾ",
    "greeting.welcome": "ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ",
    "btn.start": "ਸ਼ੁਰੂ ਕਰੋ",
    "btn.signin": "ਸਾਈਨ ਇਨ ਕਰੋ",
    "btn.demo": "ਡੈਮੋ ਅਜ਼ਮਾਓ",
  },
  or: {
    "nav.dashboard": "ଡ୍ୟାଶବୋର୍ଡ",
    "nav.tips": "ରିକଭରି ଟିପ୍ସ",
    "nav.modules": "ମଡ୍ୟୁଲ",
    "module.speech": "ସ୍ପୀଚ ଥେରାପି",
    "module.motor": "ମୋଟର ଦକ୍ଷତା",
    "module.eye": "ଆଖି ନିୟନ୍ତ୍ରଣ",
    "module.telerehab": "ଟେଲି-ପୁନର୍ବାସ",
    "greeting.welcome": "ପୁଣି ସ୍ୱାଗତ",
    "btn.start": "ଆରମ୍ଭ କର",
    "btn.signin": "ସାଇନ ଇନ କର",
    "btn.demo": "ଡେମୋ ଚୁଷ୍ଟ",
  },
  as: {
    "nav.dashboard": "ডেছব'ৰ্ড",
    "nav.tips": "ৰিকভাৰি টিপছ",
    "nav.modules": "মডিউল",
    "module.speech": "স্পিচ থেৰাপি",
    "module.motor": "মটৰ দক্ষতা",
    "module.eye": "চকুৰ নিয়ন্ত্ৰণ",
    "module.telerehab": "টেলি-পুনৰ্বাসন",
    "greeting.welcome": "আকৌ স্বাগতম",
    "btn.start": "আৰম্ভ কৰক",
    "btn.signin": "চাইন ইন কৰক",
    "btn.demo": "ডেম' চাওক",
  },
  ur: {
    "nav.dashboard": "ڈیش بورڈ",
    "nav.tips": "ریکوری ٹپس",
    "nav.modules": "ماڈیول",
    "module.speech": "اسپیچ تھراپی",
    "module.motor": "موٹر مہارتیں",
    "module.eye": "آنکھ کنٹرول",
    "module.telerehab": "ٹیلی-بحالی",
    "greeting.welcome": "دوبارہ خوش آمدید",
    "btn.start": "شروع کریں",
    "btn.signin": "سائن ان کریں",
    "btn.demo": "ڈیمو آزمائیں",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "theranova-lang";

function loadStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored as LanguageCode]) {
      return stored as LanguageCode;
    }
  } catch {
    // ignore
  }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] =
    useState<LanguageCode>(loadStoredLanguage);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const langTranslations = translations[language];
      if (langTranslations && key in langTranslations) {
        return langTranslations[key as TranslationKey];
      }
      // Fallback to English
      const enTranslations = translations.en;
      if (key in enTranslations) {
        return enTranslations[key as TranslationKey];
      }
      return key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
