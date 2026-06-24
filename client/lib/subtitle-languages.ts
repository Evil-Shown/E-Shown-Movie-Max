export interface SubtitleLanguageOption {
  code: string;
  label: string;
  nativeLabel?: string;
}

/** Common subtitle languages — includes Sinhala (si). */
export const SUBTITLE_LANGUAGES: SubtitleLanguageOption[] = [
  { code: "off", label: "Off" },
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "si", label: "Sinhala", nativeLabel: "සිංහල" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "ko", label: "Korean", nativeLabel: "한국어" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands" },
  { code: "pl", label: "Polish", nativeLabel: "Polski" },
  { code: "th", label: "Thai", nativeLabel: "ไทย" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt" },
];

export function getSubtitleLanguageLabel(code: string): string {
  const match = SUBTITLE_LANGUAGES.find((lang) => lang.code === code);
  if (!match) return code.toUpperCase();
  return match.nativeLabel ? `${match.label} · ${match.nativeLabel}` : match.label;
}
