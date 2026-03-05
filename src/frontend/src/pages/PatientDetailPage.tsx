import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@dfinity/principal";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Loader2,
  MessageSquare,
  Minus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Video,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddTherapistFeedback,
  useFetchTreatmentPlan,
  useGetUserProfile,
  useIsCallerAdmin,
  useUpdateRecoveryTrend,
} from "../hooks/useQueries";

function TrendBadge({ trend }: { trend: string }) {
  if (!trend) return <Badge variant="secondary">No trend yet</Badge>;
  const lower = trend.toLowerCase();
  if (lower.includes("improv"))
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> {trend}
      </Badge>
    );
  if (lower.includes("declin"))
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <TrendingDown className="w-3 h-3" /> {trend}
      </Badge>
    );
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Minus className="w-3 h-3" /> {trend}
    </Badge>
  );
}

export default function PatientDetailPage() {
  const navigate = useNavigate();
  const { patientId: patientIdStr } = useParams({
    from: "/auth/therapist/patient/$patientId",
  });
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { data: isAdmin } = useIsCallerAdmin();

  const patientPrincipal = React.useMemo(() => {
    try {
      return Principal.fromText(patientIdStr ?? "");
    } catch {
      return null;
    }
  }, [patientIdStr]);

  const { data: plan, isLoading: planLoading } =
    useFetchTreatmentPlan(patientPrincipal);
  const { data: profile } = useGetUserProfile(patientPrincipal);
  const { mutate: addFeedback, isPending: feedbackPending } =
    useAddTherapistFeedback();
  const { mutate: updateTrend, isPending: trendPending } =
    useUpdateRecoveryTrend();

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [trendValue, setTrendValue] = useState("");
  const [trendSent, setTrendSent] = useState(false);
  const [videoUrl, setVideoUrl] = useState("https://meet.google.com/");

  useEffect(() => {
    if (!identity && !isDemoMode) navigate({ to: "/" });
  }, [identity, isDemoMode, navigate]);

  useEffect(() => {
    if (plan?.recoveryTrend) setTrendValue(plan.recoveryTrend);
  }, [plan?.recoveryTrend]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-64">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Only therapists can view patient details.
            </p>
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              className="gradient-primary text-white border-0"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessions = plan?.sessions ?? [];
  const feedback = plan?.feedback ?? [];

  const chartData = sessions.map((s, i) => ({
    session: `S${i + 1}`,
    score: Number(s.score),
    date: new Date(Number(s.timestamp) / 1_000_000).toLocaleDateString(),
  }));

  const handleSendFeedback = () => {
    if (!feedbackText.trim() || !patientPrincipal) return;
    addFeedback(
      { patientId: patientPrincipal, feedbackText: feedbackText.trim() },
      {
        onSuccess: () => {
          setFeedbackSent(true);
          setFeedbackText("");
          setTimeout(() => setFeedbackSent(false), 3000);
        },
      },
    );
  };

  const handleUpdateTrend = () => {
    if (!trendValue.trim() || !patientPrincipal) return;
    updateTrend(
      { patientId: patientPrincipal, trend: trendValue.trim() },
      {
        onSuccess: () => {
          setTrendSent(true);
          setTimeout(() => setTrendSent(false), 3000);
        },
      },
    );
  };

  const handleStartVideo = () => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/therapist" })}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Therapist Dashboard
      </Button>

      {/* Patient Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-display font-bold text-2xl text-primary">
            {profile?.name ? profile.name[0].toUpperCase() : "?"}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {profile?.name ?? "Patient"}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              {patientIdStr?.slice(0, 24)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrendBadge trend={plan?.recoveryTrend ?? ""} />
          <Badge variant="outline">{sessions.length} sessions</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Charts + Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Session Scores
              </CardTitle>
              <CardDescription>Patient performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              {planLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No sessions recorded yet</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={192}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.88 0.03 180)"
                    />
                    <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="oklch(0.52 0.14 185)"
                      strokeWidth={2}
                      dot={{ fill: "oklch(0.52 0.14 185)", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Session List */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sessions yet
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessions
                    .slice()
                    .reverse()
                    .map((s) => {
                      const sc = Number(s.score);
                      const date = new Date(Number(s.timestamp) / 1_000_000);
                      const taskLabel =
                        s.task.__kind__ === "speechTask"
                          ? "Speech"
                          : s.task.__kind__ === "motorTask"
                            ? "Motor"
                            : "Cognitive";
                      return (
                        <div
                          key={s.timestamp.toString()}
                          className="flex items-center justify-between p-3 rounded-lg bg-accent/30"
                        >
                          <div>
                            <p className="text-sm font-medium">{taskLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {date.toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              sc >= 70
                                ? "default"
                                : sc >= 40
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="font-mono"
                          >
                            {sc}%
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback History */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Feedback History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No feedback sent yet
                </p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {feedback
                    .slice()
                    .reverse()
                    .map((fb) => {
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
                            {date.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          {/* Video Session */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <img
                  src="/assets/generated/icon-telemed.dim_128x128.png"
                  alt="Tele-rehab"
                  className="w-6 h-6 object-contain"
                />
                Video Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Meeting URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="text-sm h-9"
                />
              </div>
              <Button
                onClick={handleStartVideo}
                className="w-full h-11 gradient-primary text-white border-0 flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Start Video Session
                <ExternalLink className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Recovery Trend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recovery Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {["Improving", "Stable", "Declining"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTrendValue(t)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors min-touch ${
                      trendValue === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleUpdateTrend}
                disabled={trendPending || !trendValue}
                variant="outline"
                className="w-full h-10"
              >
                {trendPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : trendSent ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                ) : null}
                {trendSent ? "Trend Updated!" : "Update Trend"}
              </Button>
            </CardContent>
          </Card>

          {/* Send Feedback */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Send Feedback
              </CardTitle>
              <CardDescription className="text-xs">
                Patient will see this in their dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write your feedback for this patient..."
                className="min-h-24 text-sm resize-none"
              />
              <Button
                onClick={handleSendFeedback}
                disabled={feedbackPending || !feedbackText.trim()}
                className="w-full h-10 gradient-primary text-white border-0"
              >
                {feedbackPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : feedbackSent ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                {feedbackSent ? "Feedback Sent!" : "Send Feedback"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
