import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckSquare,
  Clock,
  Eye,
  Gamepad2,
  Lightbulb,
  MessageSquare,
  Mic,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import ProfileSetupModal from "../components/ProfileSetupModal";
import { useDemo } from "../contexts/DemoContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFetchCallerPlan,
  useGetCallerUserProfile,
  useIsCallerApproved,
} from "../hooks/useQueries";
import { TIPS } from "./RecoveryTipsPage";
import type { Category } from "./RecoveryTipsPage";

// ─── Constants ────────────────────────────────────────────────────────────────

const moduleCardsConfig = [
  {
    titleKey: "module.speech",
    description: "Voice recognition exercises and AI pronunciation scoring",
    icon: "/assets/generated/icon-speech-transparent.dim_128x128.png",
    fallbackIcon: Mic,
    path: "/speech",
    stripColor: "bg-chart-1",
    hoverBorder: "hover:border-l-chart-1",
    iconBg: "bg-chart-1/15",
    iconColor: "text-chart-1",
    badge: "AI Powered",
    badgeColor: "bg-chart-1/20 text-chart-1 border-chart-1/30",
    ocid: "dashboard.speech.card",
  },
  {
    titleKey: "module.motor",
    description: "Gamified hand and finger coordination exercises",
    icon: "/assets/generated/icon-motor-transparent.dim_128x128.png",
    fallbackIcon: Gamepad2,
    path: "/motor",
    stripColor: "bg-chart-2",
    hoverBorder: "hover:border-l-chart-2",
    iconBg: "bg-chart-2/15",
    iconColor: "text-chart-2",
    badge: "Games",
    badgeColor: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    ocid: "dashboard.motor.card",
  },
  {
    titleKey: "module.eye",
    description: "Hands-free dwell-to-click interaction system",
    icon: "/assets/generated/icon-eye-transparent.dim_128x128.png",
    fallbackIcon: Eye,
    path: "/eye-control",
    stripColor: "bg-chart-3",
    hoverBorder: "hover:border-l-chart-3",
    iconBg: "bg-chart-3/15",
    iconColor: "text-chart-3",
    badge: "Accessibility",
    badgeColor: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    ocid: "dashboard.eye_control.card",
  },
  {
    titleKey: "module.telerehab",
    description: "Connect with your therapist remotely",
    icon: "/assets/generated/icon-telemed-transparent.dim_128x128.png",
    fallbackIcon: Video,
    path: "/therapist",
    stripColor: "bg-chart-4",
    hoverBorder: "hover:border-l-chart-4",
    iconBg: "bg-chart-4/15",
    iconColor: "text-chart-4",
    badge: "Remote Care",
    badgeColor: "bg-chart-4/20 text-chart-4 border-chart-4/30",
    ocid: "dashboard.telerehab.card",
  },
];

const therapistMessages = [
  "Welcome! Remember, every small step forward is progress. You're doing great!",
  "Today's goal: consistency over perfection. Even 10 minutes of practice makes a difference.",
  "Your brain is remarkably adaptable. Regular exercises help build new neural pathways.",
  "Take a deep breath. You're in a safe space to recover at your own pace.",
  "I'm here to guide you every step of the way. Let's make today count!",
];

const DAILY_TASKS: {
  id: string;
  label: string;
  category: Category | "general";
  duration: number;
}[] = [
  {
    id: "dt1",
    label: "Complete 1 speech exercise",
    category: "speech",
    duration: 10,
  },
  {
    id: "dt2",
    label: "Play 1 motor coordination game",
    category: "motor",
    duration: 10,
  },
  {
    id: "dt3",
    label: "10 min relaxation breathing",
    category: "general",
    duration: 10,
  },
  {
    id: "dt4",
    label: "Record your voice and replay",
    category: "speech",
    duration: 5,
  },
  {
    id: "dt5",
    label: "Finger stretches (both hands)",
    category: "motor",
    duration: 5,
  },
  {
    id: "dt6",
    label: "Eye control navigation practice",
    category: "eyeControl",
    duration: 10,
  },
  {
    id: "dt7",
    label: "Review therapist feedback",
    category: "teleRehab",
    duration: 5,
  },
  {
    id: "dt8",
    label: "Drink 8 glasses of water today",
    category: "general",
    duration: 1,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  speech: "text-chart-1",
  motor: "text-chart-2",
  eyeControl: "text-chart-3",
  teleRehab: "text-chart-4",
  general: "text-accent",
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  speech: "bg-chart-1",
  motor: "bg-chart-2",
  eyeControl: "bg-chart-3",
  teleRehab: "bg-chart-4",
  general: "bg-accent",
};

const demoSessions = [
  { label: "Speech Exercise", score: 82, date: "Today" },
  { label: "Motor — Tapping", score: 75, date: "Yesterday" },
  { label: "Speech Exercise", score: 68, date: "2 days ago" },
];

const demoFeedback = [
  {
    text: "Great improvement in pronunciation clarity! Keep practicing the 'th' sound.",
    date: "Yesterday",
  },
  {
    text: "Your tapping speed is improving steadily. Try the reaction targets game next.",
    date: "3 days ago",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function loadTodayTasks(): Set<string> {
  try {
    const stored = localStorage.getItem(`theranova-tasks-${getTodayKey()}`);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored) as string[]);
  } catch {
    return new Set();
  }
}

function saveTodayTasks(completed: Set<string>): void {
  try {
    localStorage.setItem(
      `theranova-tasks-${getTodayKey()}`,
      JSON.stringify([...completed]),
    );
  } catch {
    // ignore
  }
}

function getMilestone(sessionCount: number): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (sessionCount >= 30)
    return {
      label: "Champion",
      colorClass: "text-accent-foreground",
      bgClass: "bg-accent",
    };
  if (sessionCount >= 15)
    return {
      label: "Dedicated",
      colorClass: "text-primary-foreground",
      bgClass: "bg-primary",
    };
  if (sessionCount >= 5)
    return {
      label: "Consistent",
      colorClass: "text-success-foreground",
      bgClass: "bg-success",
    };
  return {
    label: "Beginner",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AITherapistPanel() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % therapistMessages.length);
        setVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5 shadow-card border"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.03 248), oklch(0.14 0.025 250))",
          borderColor: "oklch(0.72 0.17 185 / 0.2)",
          boxShadow:
            "0 0 0 1px oklch(0.72 0.17 185 / 0.08), 0 4px 24px oklch(0.72 0.17 185 / 0.1)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"
          style={{ boxShadow: "2px 0 12px oklch(0.72 0.17 185 / 0.5)" }}
        />
        <div className="flex items-start gap-4 pl-3">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
              <img
                src="/assets/generated/ai-therapist-avatar-transparent.dim_128x128.png"
                alt="Dr. Nova"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = "none";
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-semibold text-foreground text-sm">
                Dr. Nova
              </span>
              <span className="text-xs text-muted-foreground">
                — AI Therapist
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/20 border border-success/30 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                Online
              </span>
            </div>
            <AnimatePresence mode="wait">
              {visible && (
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {therapistMessages[msgIndex]}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-1 mt-3">
              {therapistMessages.map((msg, i) => (
                <div
                  key={msg.slice(0, 10)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === msgIndex ? "w-4 bg-primary" : "w-1 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-primary/8 flex-shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TipOfDayWidget() {
  const navigate = useNavigate();
  const dayOfYear = getDayOfYear();
  const tip = TIPS[dayOfYear % TIPS.length];

  const CATEGORY_LABELS: Record<string, string> = {
    speech: "Speech Therapy",
    motor: "Motor Skills",
    eyeControl: "Eye Control",
    teleRehab: "Tele-Rehab",
    general: "General",
  };

  const CATEGORY_STYLE: Record<
    string,
    { colorClass: string; bgClass: string; borderClass: string }
  > = {
    speech: {
      colorClass: "text-chart-1",
      bgClass: "bg-chart-1/10",
      borderClass: "border-chart-1/20",
    },
    motor: {
      colorClass: "text-chart-2",
      bgClass: "bg-chart-2/10",
      borderClass: "border-chart-2/20",
    },
    eyeControl: {
      colorClass: "text-chart-3",
      bgClass: "bg-chart-3/10",
      borderClass: "border-chart-3/20",
    },
    teleRehab: {
      colorClass: "text-chart-4",
      bgClass: "bg-chart-4/10",
      borderClass: "border-chart-4/20",
    },
    general: {
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
      borderClass: "border-accent/20",
    },
  };

  const cat = CATEGORY_STYLE[tip.category] ?? CATEGORY_STYLE.general;
  const catLabel = CATEGORY_LABELS[tip.category] ?? "General";
  const preview = tip.body.slice(0, 120);

  return (
    <motion.div
      data-ocid="dashboard.tip_of_day.card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="mb-6"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5 shadow-card"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.17 185 / 0.08), oklch(0.62 0.2 240 / 0.06))",
          border: "1px solid oklch(0.72 0.17 185 / 0.2)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"
          style={{ boxShadow: "2px 0 10px oklch(0.72 0.17 185 / 0.5)" }}
        />
        <div className="pl-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-warning fill-warning/30" />
              <span className="text-sm font-semibold text-foreground">
                Tip of the Day
              </span>
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cat.bgClass} ${cat.colorClass} ${cat.borderClass}`}
            >
              {catLabel}
            </span>
          </div>
          <h3 className="font-display font-bold text-base text-foreground mb-1.5">
            {tip.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {preview}
            {tip.body.length > 120 && "…"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 px-0 text-primary hover:bg-transparent hover:text-primary/80 h-auto text-sm font-medium"
            onClick={() => navigate({ to: "/tips" })}
          >
            Read more <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function DailyTasksCard() {
  const [completed, setCompleted] = useState<Set<string>>(loadTodayTasks);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveTodayTasks(next);
      return next;
    });
  };

  const completedCount = completed.size;
  const totalCount = DAILY_TASKS.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="mb-8"
    >
      <Card
        data-ocid="dashboard.daily_tasks.card"
        className="shadow-card border-border/60"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.155 0.025 248), oklch(0.13 0.022 250))",
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Today's Tasks
            </CardTitle>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {completedCount}/{totalCount}
            </span>
          </div>
          <CardDescription>
            Complete your daily therapy tasks to stay on track
          </CardDescription>
          <div className="mt-2">
            <Progress value={progressPct} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">
              {progressPct}% complete
              {completedCount === totalCount && (
                <span className="ml-2 text-success font-medium">
                  🎉 All done!
                </span>
              )}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DAILY_TASKS.map((task, index) => {
              const isChecked = completed.has(task.id);
              const colorClass =
                CATEGORY_COLORS[task.category] ?? "text-muted-foreground";
              const dotColorClass =
                CATEGORY_DOT_COLORS[task.category] ?? "bg-muted-foreground";
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isChecked
                      ? "bg-success/12 border border-success/25"
                      : "bg-muted/40 border border-transparent hover:bg-muted/60"
                  }`}
                >
                  <Checkbox
                    data-ocid={`dashboard.task.checkbox.${index + 1}`}
                    id={`task-${task.id}`}
                    checked={isChecked}
                    onCheckedChange={() => toggle(task.id)}
                    className="flex-shrink-0"
                    aria-label={task.label}
                  />
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColorClass}`}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 text-sm cursor-pointer select-none transition-colors ${
                      isChecked
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.label}
                  </label>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock className={`w-3 h-3 ${colorClass}`} />
                    <span className={`text-xs font-medium ${colorClass}`}>
                      {task.duration}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend.toLowerCase().includes("improv"))
    return <TrendingUp className="w-4 h-4 text-success" />;
  if (trend.toLowerCase().includes("declin"))
    return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function TrendBadge({ trend }: { trend: string }) {
  if (!trend) return null;
  const lower = trend.toLowerCase();
  const variant = lower.includes("improv")
    ? "default"
    : lower.includes("declin")
      ? "destructive"
      : "secondary";
  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <TrendIcon trend={trend} />
      {trend || "Stable"}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode, demoUser } = useDemo();
  const { t } = useLanguage();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: plan, isLoading: planLoading } = useFetchCallerPlan();
  const { data: isApproved } = useIsCallerApproved();

  useEffect(() => {
    if (!identity && !isDemoMode) {
      navigate({ to: "/" });
    }
  }, [identity, isDemoMode, navigate]);

  const showProfileSetup =
    !!identity &&
    !isDemoMode &&
    !profileLoading &&
    isFetched &&
    userProfile === null;

  const displayName = isDemoMode
    ? demoUser.name.split(" ")[0]
    : userProfile?.name?.split(" ")[0] || "there";

  const recentFeedback = isDemoMode
    ? demoFeedback
    : (plan?.feedback?.slice(-3).reverse() ?? []);

  const recentSessions = isDemoMode
    ? demoSessions
    : (plan?.sessions?.slice(-5).reverse() ?? []);

  // Milestone
  const sessionCount = isDemoMode
    ? demoSessions.length
    : (plan?.sessions?.length ?? 0);
  const milestone = getMilestone(sessionCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <ProfileSetupModal open={showProfileSetup} />

      {/* Welcome Header */}
      <div className="mb-8">
        {profileLoading && !isDemoMode ? (
          <Skeleton className="h-8 w-64 mb-2" />
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {t("greeting.welcome")},{" "}
              <span className="text-gradient">{displayName}</span> 👋
            </h1>
            {/* Milestone badge */}
            <span
              data-ocid="dashboard.milestone.badge"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${milestone.bgClass} ${milestone.colorClass}`}
            >
              <Trophy className="w-3.5 h-3.5" />
              {milestone.label}
            </span>
            {isDemoMode && (
              <Badge className="bg-warning/15 text-warning border-warning/30 font-medium">
                Demo Mode
              </Badge>
            )}
          </div>
        )}
        <p className="text-muted-foreground mt-1.5">
          {isDemoMode
            ? "You're exploring TheraNova in demo mode. All modules are fully accessible."
            : "Continue your rehabilitation journey. Choose a module to get started."}
        </p>
      </div>

      {/* AI Therapist Panel */}
      <AITherapistPanel />

      {/* Tip of the Day */}
      <TipOfDayWidget />

      {/* Daily Tasks Checklist */}
      <DailyTasksCard />

      {/* Recovery Trend Banner (non-demo) */}
      {!isDemoMode && plan?.recoveryTrend && (
        <div className="mb-6 p-4 rounded-2xl bg-card border border-border flex items-center gap-3 shadow-card">
          <Activity className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Recovery Trend</p>
            <p className="text-xs text-muted-foreground">
              Based on your recent session data
            </p>
          </div>
          <TrendBadge trend={plan.recoveryTrend} />
        </div>
      )}

      {/* Module Cards */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
          <span
            className="w-1 h-5 rounded-full bg-primary inline-block"
            style={{ boxShadow: "0 0 8px oklch(0.72 0.17 185 / 0.7)" }}
          />
          Therapy Modules
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleCardsConfig.map(
            (
              {
                titleKey,
                description,
                icon,
                fallbackIcon: _FallbackIcon,
                path,
                stripColor,
                iconBg,
                iconColor,
                badge,
                badgeColor,
                ocid,
              },
              index,
            ) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  data-ocid={ocid}
                  className="cursor-pointer overflow-hidden group transition-all duration-300 h-full"
                  style={{
                    background:
                      "linear-gradient(145deg, oklch(0.16 0.025 248), oklch(0.13 0.022 250))",
                    border: "1px solid oklch(0.28 0.03 245 / 0.6)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 12px 40px -4px oklch(0.72 0.17 185 / 0.25), 0 0 0 1px oklch(0.72 0.17 185 / 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  onClick={() => navigate({ to: path })}
                >
                  <div className={`h-0.5 ${stripColor}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center overflow-hidden`}
                      >
                        <img
                          src={icon}
                          alt={t(titleKey)}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${badgeColor}`}
                      >
                        {badge}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-1.5 text-base">
                      {t(titleKey)}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {description}
                    </p>
                    <div
                      className={`flex items-center ${iconColor} text-sm font-bold group-hover:gap-2 transition-all`}
                    >
                      {t("btn.start")} <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ),
          )}
        </div>
      </section>

      {/* Bottom Grid: Recent Sessions + Therapist Feedback */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card
          className="shadow-card border-border/60"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.155 0.025 248), oklch(0.13 0.022 250))",
          }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Sessions
            </CardTitle>
            <CardDescription>Your latest therapy activity</CardDescription>
          </CardHeader>
          <CardContent>
            {planLoading && !isDemoMode ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : isDemoMode ? (
              <>
                <div className="space-y-2">
                  {demoSessions.map((session) => (
                    <div
                      key={session.label}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{session.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.date}
                        </p>
                      </div>
                      <Badge
                        variant={session.score >= 70 ? "default" : "secondary"}
                        className="font-mono"
                      >
                        {session.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3 italic">
                  Demo data — sign in to track your real progress
                </p>
              </>
            ) : recentSessions.length === 0 ? (
              <div
                data-ocid="dashboard.sessions.empty_state"
                className="text-center py-8 text-muted-foreground"
              >
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  No sessions yet. Start a module to begin!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {(
                  recentSessions as Array<{
                    task: { __kind__: string };
                    score: bigint | number;
                    timestamp: bigint;
                  }>
                ).map((session) => {
                  const taskType = session.task.__kind__;
                  const taskLabel =
                    taskType === "speechTask"
                      ? "Speech"
                      : taskType === "motorTask"
                        ? "Motor"
                        : "Cognitive";
                  const score = Number(session.score);
                  const date = new Date(Number(session.timestamp) / 1_000_000);
                  return (
                    <div
                      key={session.timestamp.toString()}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {taskLabel} Exercise
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          score >= 70
                            ? "default"
                            : score >= 40
                              ? "secondary"
                              : "destructive"
                        }
                        className="font-mono"
                      >
                        {score}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            {isApproved && !isDemoMode && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-primary hover:bg-primary/5"
                onClick={() => navigate({ to: "/speech/progress" })}
              >
                View Full Progress <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Therapist Feedback */}
        <Card
          className="shadow-card border-border/60"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.155 0.025 248), oklch(0.13 0.022 250))",
          }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Therapist Feedback
            </CardTitle>
            <CardDescription>Messages from your care team</CardDescription>
          </CardHeader>
          <CardContent>
            {planLoading && !isDemoMode ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : isDemoMode ? (
              <>
                <div className="space-y-3">
                  {demoFeedback.map((fb) => (
                    <div
                      key={fb.date}
                      className="p-4 rounded-xl bg-primary/5 border-l-2 border-primary/40"
                    >
                      <p className="text-sm text-foreground leading-relaxed">
                        {fb.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {fb.date}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3 italic">
                  Demo feedback — sign in to receive real therapist messages
                </p>
              </>
            ) : recentFeedback.length === 0 ? (
              <div
                data-ocid="dashboard.feedback.empty_state"
                className="text-center py-8 text-muted-foreground"
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No feedback yet from your therapist.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(
                  recentFeedback as Array<{
                    feedbackText: string;
                    timestamp: bigint;
                  }>
                ).map((fb) => {
                  const date = new Date(Number(fb.timestamp) / 1_000_000);
                  return (
                    <div
                      key={fb.timestamp.toString()}
                      className="p-4 rounded-xl bg-primary/5 border-l-2 border-primary/40"
                    >
                      <p className="text-sm text-foreground">
                        {fb.feedbackText}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {date.toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
