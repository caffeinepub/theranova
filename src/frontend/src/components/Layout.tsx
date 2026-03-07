import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  Eye,
  Gamepad2,
  Heart,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Mic,
  Video,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useDemo } from "../contexts/DemoContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { useIsCallerAdmin } from "../hooks/useQueries";
import LanguageSelector from "./LanguageSelector";

interface LayoutProps {
  children: React.ReactNode;
}

const moduleNavItems = [
  {
    labelKey: "module.speech",
    path: "/speech",
    icon: Mic,
    ocid: "nav.speech_link",
  },
  {
    labelKey: "module.motor",
    path: "/motor",
    icon: Gamepad2,
    ocid: "nav.motor_link",
  },
  {
    labelKey: "module.eye",
    path: "/eye-control",
    icon: Eye,
    ocid: "nav.eye_control_link",
  },
  {
    labelKey: "module.telerehab",
    path: "/therapist",
    icon: Video,
    ocid: "nav.telerehab_link",
  },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { isDemoMode, demoUser, exitDemoMode } = useDemo();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const handleExitDemo = () => {
    exitDemoMode();
    navigate({ to: "/" });
  };

  const displayName = isDemoMode ? demoUser.name : userProfile?.name || "User";
  const displayRole = isDemoMode
    ? demoUser.role
    : userProfile?.role || "patient";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const visibleModules = moduleNavItems.filter((item) => {
    if (item.path === "/therapist") {
      return isDemoMode || isAdmin;
    }
    return true;
  });

  const isModuleActive = visibleModules.some((m) => isActive(m.path));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div
          className="border-b border-warning/30 px-4 py-2"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.78 0.18 65 / 0.08), oklch(0.78 0.18 65 / 0.05))",
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
              <span className="text-foreground/75 text-xs">
                <span className="font-semibold text-warning">Demo Mode</span> —
                Explore freely. Sign in with Internet Identity for your personal
                account.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExitDemo}
              data-ocid="nav.exit_demo_button"
              className="text-xs border-warning/35 text-warning hover:bg-warning/10 flex-shrink-0 h-7 px-3"
            >
              Exit Demo
            </Button>
          </div>
        </div>
      )}

      {/* Header — dark glass panel */}
      <header
        className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl"
        style={{
          background: "oklch(0.09 0.02 250 / 0.95)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <button
              type="button"
              data-ocid="nav.logo_link"
              onClick={() => navigate({ to: "/dashboard" })}
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div
                className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center transition-all group-hover:teal-glow"
                style={{
                  boxShadow: "0 0 16px oklch(0.72 0.17 185 / 0.3)",
                }}
              >
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-gradient hidden sm:block tracking-tight">
                TheraNova
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {/* Dashboard */}
              <button
                data-ocid="nav.dashboard_link"
                type="button"
                onClick={() => navigate({ to: "/dashboard" })}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-touch ${
                  isActive("/dashboard")
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={
                  isActive("/dashboard")
                    ? {
                        background: "oklch(0.72 0.17 185 / 0.1)",
                        boxShadow:
                          "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25), 0 0 12px oklch(0.72 0.17 185 / 0.08)",
                      }
                    : undefined
                }
              >
                {isActive("/dashboard") && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-primary"
                    style={{ boxShadow: "0 0 6px oklch(0.72 0.17 185 / 0.8)" }}
                  />
                )}
                <LayoutDashboard
                  className={`w-4 h-4 ${isActive("/dashboard") ? "text-primary" : ""}`}
                />
                {t("nav.dashboard")}
              </button>

              {/* Recovery Tips */}
              <button
                data-ocid="nav.tips_link"
                type="button"
                onClick={() => navigate({ to: "/tips" })}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-touch ${
                  isActive("/tips")
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={
                  isActive("/tips")
                    ? {
                        background: "oklch(0.72 0.17 185 / 0.1)",
                        boxShadow:
                          "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25), 0 0 12px oklch(0.72 0.17 185 / 0.08)",
                      }
                    : undefined
                }
              >
                {isActive("/tips") && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-primary"
                    style={{ boxShadow: "0 0 6px oklch(0.72 0.17 185 / 0.8)" }}
                  />
                )}
                <Lightbulb
                  className={`w-4 h-4 ${isActive("/tips") ? "text-primary" : ""}`}
                />
                {t("nav.tips")}
              </button>

              {/* Modules Dropdown */}
              <DropdownMenu open={modulesOpen} onOpenChange={setModulesOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-ocid="nav.modules_dropdown"
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-touch ${
                      isModuleActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={
                      isModuleActive
                        ? {
                            background: "oklch(0.72 0.17 185 / 0.1)",
                            boxShadow:
                              "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25), 0 0 12px oklch(0.72 0.17 185 / 0.08)",
                          }
                        : undefined
                    }
                  >
                    {isModuleActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-primary"
                        style={{
                          boxShadow: "0 0 6px oklch(0.72 0.17 185 / 0.8)",
                        }}
                      />
                    )}
                    {t("nav.modules")}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${modulesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  sideOffset={8}
                  className="w-56 rounded-2xl border-border/60 p-2"
                  style={{
                    background: "oklch(0.13 0.025 248)",
                    boxShadow:
                      "0 8px 40px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.28 0.03 245 / 0.6)",
                  }}
                >
                  {visibleModules.map(
                    ({ labelKey, path, icon: Icon, ocid }) => {
                      const active = isActive(path);
                      return (
                        <DropdownMenuItem
                          key={path}
                          data-ocid={ocid}
                          onClick={() => {
                            navigate({ to: path });
                            setModulesOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            active
                              ? "text-primary font-semibold"
                              : "text-foreground/80 hover:text-foreground"
                          }`}
                          style={
                            active
                              ? {
                                  background: "oklch(0.72 0.17 185 / 0.1)",
                                  boxShadow:
                                    "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.2)",
                                }
                              : undefined
                          }
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              active ? "bg-primary/15" : "bg-muted/60"
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 ${active ? "text-primary" : "text-muted-foreground"}`}
                            />
                          </div>
                          <span className="text-sm">{t(labelKey)}</span>
                        </DropdownMenuItem>
                      );
                    },
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right: Language Selector + User Menu */}
            <div className="flex items-center gap-1.5">
              {/* Online indicator */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
                <Zap className="w-3 h-3 text-primary" />
                <span>AI Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              </div>

              {/* Language Selector */}
              <LanguageSelector />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    data-ocid="nav.user_menu"
                    className="flex items-center gap-2 h-9 px-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{
                          background: "oklch(0.72 0.17 185 / 0.15)",
                          color: "oklch(0.72 0.17 185)",
                        }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl border-border/60"
                  style={{
                    background: "oklch(0.14 0.025 248)",
                    boxShadow:
                      "0 8px 32px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.28 0.03 245 / 0.6)",
                  }}
                >
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold font-display">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {displayRole}
                    </p>
                    {isDemoMode && (
                      <span className="inline-block mt-1 text-xs bg-warning/15 text-warning px-2 py-0.5 rounded-full font-medium">
                        Demo
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {isDemoMode ? (
                    <DropdownMenuItem
                      onClick={handleExitDemo}
                      className="text-warning cursor-pointer focus:bg-warning/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Exit Demo
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive cursor-pointer focus:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                data-ocid="nav.mobile_menu_button"
                className="md:hidden rounded-xl hover:bg-muted/50"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div
            className="md:hidden border-t border-border/40 px-4 py-3 space-y-1"
            style={{ background: "oklch(0.11 0.022 248)" }}
          >
            {/* Dashboard */}
            <button
              data-ocid="nav.dashboard_link"
              type="button"
              onClick={() => {
                navigate({ to: "/dashboard" });
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-touch ${
                isActive("/dashboard")
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              style={
                isActive("/dashboard")
                  ? {
                      background: "oklch(0.72 0.17 185 / 0.1)",
                      boxShadow: "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25)",
                    }
                  : undefined
              }
            >
              <LayoutDashboard
                className={`w-4 h-4 ${isActive("/dashboard") ? "text-primary" : ""}`}
              />
              {t("nav.dashboard")}
            </button>

            {/* Tips */}
            <button
              data-ocid="nav.tips_link"
              type="button"
              onClick={() => {
                navigate({ to: "/tips" });
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-touch ${
                isActive("/tips")
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              style={
                isActive("/tips")
                  ? {
                      background: "oklch(0.72 0.17 185 / 0.1)",
                      boxShadow: "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25)",
                    }
                  : undefined
              }
            >
              <Lightbulb
                className={`w-4 h-4 ${isActive("/tips") ? "text-primary" : ""}`}
              />
              {t("nav.tips")}
            </button>

            {/* Module section header */}
            <div className="px-3.5 pt-3 pb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("nav.modules")}
              </p>
            </div>

            {visibleModules.map(({ labelKey, path, icon: Icon, ocid }) => {
              const active = isActive(path);
              return (
                <button
                  data-ocid={ocid}
                  type="button"
                  key={path}
                  onClick={() => {
                    navigate({ to: path });
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-touch ${
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                  style={
                    active
                      ? {
                          background: "oklch(0.72 0.17 185 / 0.1)",
                          boxShadow:
                            "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25)",
                        }
                      : undefined
                  }
                >
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                  {t(labelKey)}
                </button>
              );
            })}

            {/* Language Selector in mobile */}
            <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Language
              </p>
              <LanguageSelector />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-mesh">{children}</main>

      {/* Footer */}
      <footer
        className="border-t border-border/40 py-6 mt-auto"
        style={{ background: "oklch(0.09 0.02 250 / 0.8)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs">
              © {new Date().getFullYear()}{" "}
              <span className="font-display font-semibold text-foreground/80">
                TheraNova
              </span>
              . All rights reserved.
            </p>
          </div>
          <p className="flex items-center gap-1 text-xs">
            Built with{" "}
            <Heart className="w-3 h-3 text-primary fill-primary mx-0.5" /> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "theranova")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
