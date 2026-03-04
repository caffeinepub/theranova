import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Clock,
  Eye,
  Gamepad2,
  MessageSquare,
  Mic,
  Minus,
  TrendingDown,
  TrendingUp,
  Video,
} from "lucide-react";
import React, { useEffect } from "react";
import ProfileSetupModal from "../components/ProfileSetupModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFetchCallerPlan,
  useGetCallerUserProfile,
  useIsCallerApproved,
} from "../hooks/useQueries";

const moduleCards = [
  {
    title: "Speech Therapy",
    description: "Voice recognition exercises and pronunciation scoring",
    icon: "/assets/generated/icon-speech.dim_128x128.png",
    fallbackIcon: Mic,
    path: "/speech",
    color: "from-chart-1/20 to-chart-1/5",
    badge: "AI Powered",
  },
  {
    title: "Motor Skills",
    description: "Gamified hand and finger coordination exercises",
    icon: "/assets/generated/icon-motor.dim_128x128.png",
    fallbackIcon: Gamepad2,
    path: "/motor",
    color: "from-chart-2/20 to-chart-2/5",
    badge: "3D Games",
  },
  {
    title: "Eye Control",
    description: "Hands-free interaction with dwell-to-click technology",
    icon: "/assets/generated/icon-eye.dim_128x128.png",
    fallbackIcon: Eye,
    path: "/eye-control",
    color: "from-chart-3/20 to-chart-3/5",
    badge: "Accessibility",
  },
  {
    title: "Tele-Rehabilitation",
    description: "Connect with your therapist remotely",
    icon: "/assets/generated/icon-telemed.dim_128x128.png",
    fallbackIcon: Video,
    path: "/therapist",
    color: "from-chart-4/20 to-chart-4/5",
    badge: "Remote Care",
  },
];

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: plan, isLoading: planLoading } = useFetchCallerPlan();
  const { data: isApproved } = useIsCallerApproved();

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);

  const showProfileSetup =
    !!identity && !profileLoading && isFetched && userProfile === null;

  const recentFeedback = plan?.feedback?.slice(-3).reverse() ?? [];
  const recentSessions = plan?.sessions?.slice(-5).reverse() ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <ProfileSetupModal open={showProfileSetup} />

      {/* Welcome Header */}
      <div className="mb-8">
        {profileLoading ? (
          <Skeleton className="h-8 w-64 mb-2" />
        ) : (
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {userProfile?.name?.split(" ")[0] || "there"} 👋
          </h1>
        )}
        <p className="text-muted-foreground mt-1">
          Continue your rehabilitation journey. Choose a module to get started.
        </p>
      </div>

      {/* Recovery Trend Banner */}
      {plan?.recoveryTrend && (
        <div className="mb-6 p-4 rounded-xl bg-card border border-border flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Recovery Trend</p>
            <p className="text-xs text-muted-foreground">
              Based on your recent session data
            </p>
          </div>
          <TrendBadge trend={plan.recoveryTrend} />
        </div>
      )}

      {/* Module Cards */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Therapy Modules
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleCards.map(
            ({
              title,
              description,
              icon,
              fallbackIcon: _FallbackIcon,
              path,
              color,
              badge,
            }) => (
              <Card
                key={path}
                className="cursor-pointer card-hover border-border overflow-hidden group"
                onClick={() => navigate({ to: path })}
              >
                <div className={`h-2 bg-gradient-to-r ${color}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center overflow-hidden">
                      <img
                        src={icon}
                        alt={title}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const svg = document.createElement("div");
                            svg.innerHTML = `<svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>`;
                            parent.appendChild(svg);
                          }
                        }}
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Start <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </section>

      {/* Bottom Grid: Recent Sessions + Therapist Feedback */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Sessions
            </CardTitle>
            <CardDescription>Your latest therapy activity</CardDescription>
          </CardHeader>
          <CardContent>
            {planLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  No sessions yet. Start a module to begin!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((session) => {
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
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/30"
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
            {isApproved && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-primary"
                onClick={() => navigate({ to: "/speech/progress" })}
              >
                View Full Progress <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Therapist Feedback */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Therapist Feedback
            </CardTitle>
            <CardDescription>Messages from your care team</CardDescription>
          </CardHeader>
          <CardContent>
            {planLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentFeedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No feedback yet from your therapist.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFeedback.map((fb) => {
                  const date = new Date(Number(fb.timestamp) / 1_000_000);
                  return (
                    <div
                      key={fb.timestamp.toString()}
                      className="p-3 rounded-lg bg-accent/30 border-l-2 border-primary"
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
