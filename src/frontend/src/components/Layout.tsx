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
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { useIsCallerAdmin } from "../hooks/useQueries";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    label: "Tips",
    path: "/tips",
    icon: Lightbulb,
    ocid: "nav.tips_link",
  },
  { label: "Speech", path: "/speech", icon: Mic, ocid: "nav.speech_link" },
  {
    label: "Motor Skills",
    path: "/motor",
    icon: Gamepad2,
    ocid: "nav.motor_link",
  },
  {
    label: "Eye Control",
    path: "/eye-control",
    icon: Eye,
    ocid: "nav.eye_control_link",
  },
  {
    label: "Tele-Rehab",
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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // In demo mode show all nav items; otherwise show admin-only items only when admin
  const visibleNavItems = navItems.filter((item) => {
    if (item.path === "/therapist") {
      return isDemoMode || isAdmin;
    }
    return true;
  });

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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              type="button"
              data-ocid="nav.logo_link"
              onClick={() => navigate({ to: "/dashboard" })}
              className="flex items-center gap-2.5 group"
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
            <nav className="hidden md:flex items-center gap-0.5">
              {visibleNavItems.map(({ label, path, icon: Icon, ocid }) => {
                const active = isActive(path);
                return (
                  <button
                    data-ocid={ocid}
                    type="button"
                    key={path}
                    onClick={() => navigate({ to: path })}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-touch ${
                      active
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={
                      active
                        ? {
                            background: "oklch(0.72 0.17 185 / 0.1)",
                            boxShadow:
                              "inset 0 0 0 1px oklch(0.72 0.17 185 / 0.25), 0 0 12px oklch(0.72 0.17 185 / 0.08)",
                          }
                        : undefined
                    }
                  >
                    {/* Active left indicator */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-primary"
                        style={{
                          boxShadow: "0 0 6px oklch(0.72 0.17 185 / 0.8)",
                        }}
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 ${active ? "text-primary" : ""}`}
                    />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* Online indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
                <Zap className="w-3 h-3 text-primary" />
                <span className="hidden lg:inline">AI Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              </div>

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
                    <span className="hidden sm:block text-sm font-medium max-w-28 truncate">
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
            {visibleNavItems.map(({ label, path, icon: Icon, ocid }) => {
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
                  {label}
                </button>
              );
            })}
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
