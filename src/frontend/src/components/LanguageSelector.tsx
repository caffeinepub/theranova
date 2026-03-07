import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import React from "react";
import { LANGUAGES, useLanguage } from "../contexts/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const currentLang =
    LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-ocid="nav.language_select"
          aria-label="Select language"
          className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline text-xs font-semibold max-w-16 truncate">
            {currentLang.native}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 rounded-2xl border-border/60 p-3"
        style={{
          background: "oklch(0.14 0.025 248)",
          boxShadow:
            "0 8px 40px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.28 0.03 245 / 0.6)",
        }}
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Select Language
        </p>
        <div className="grid grid-cols-2 gap-1">
          {LANGUAGES.map((lang, idx) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                data-ocid={`nav.language.item.${idx + 1}`}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-start gap-2 p-2.5 rounded-xl text-left transition-all duration-150 group ${
                  isSelected
                    ? "text-primary"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                }`}
                style={
                  isSelected
                    ? {
                        background: "oklch(0.72 0.17 185 / 0.1)",
                        boxShadow:
                          "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25)",
                      }
                    : undefined
                }
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold leading-tight truncate ${
                      isSelected ? "text-primary" : ""
                    }`}
                  >
                    {lang.native}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight truncate">
                    {lang.english}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-primary mt-0.5 flex-shrink-0">
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                      aria-hidden="true"
                    >
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
