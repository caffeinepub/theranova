import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
  Heart,
  Info,
  MessageSquare,
  Monitor,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import React, { useEffect } from "react";
import { ApprovalStatus } from "../backend";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFetchSessionScores,
  useGetUserProfile,
  useIsCallerAdmin,
  useListApprovals,
  useListPatients,
  useSetApproval,
} from "../hooks/useQueries";

function PatientRow({
  patientId,
  onView,
}: {
  patientId: Principal;
  onView: (id: string) => void;
}) {
  const { data: profile } = useGetUserProfile(patientId);
  const { data: scores } = useFetchSessionScores(patientId);

  const latestScore =
    scores && scores.length > 0 ? Number(scores[scores.length - 1]) : null;
  const avgScore =
    scores && scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + Number(b), 0) / scores.length)
      : null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary flex-shrink-0">
        {profile?.name ? profile.name[0].toUpperCase() : "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {profile?.name ?? `${patientId.toString().slice(0, 12)}...`}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">
            {scores?.length ?? 0} sessions
          </p>
          {avgScore !== null && (
            <Badge
              variant={
                avgScore >= 70
                  ? "default"
                  : avgScore >= 40
                    ? "secondary"
                    : "destructive"
              }
              className="text-xs font-mono"
            >
              Avg: {avgScore}%
            </Badge>
          )}
          {latestScore !== null && (
            <Badge variant="outline" className="text-xs font-mono">
              Last: {latestScore}%
            </Badge>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onView(patientId.toString())}
        className="flex items-center gap-1 flex-shrink-0 rounded-xl"
      >
        View <ChevronRight className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Demo tele-rehab view shown when in demo mode
function DemoTeleRehabView() {
  const demoFeedback = [
    {
      author: "Dr. Sarah Chen",
      text: "Your speech clarity has improved significantly this week. Keep up the excellent work with the pronunciation exercises!",
      date: "Today, 10:30 AM",
      avatar: "SC",
    },
    {
      author: "Dr. Sarah Chen",
      text: "I reviewed your motor skills session. Great tapping speed improvement — you're trending upward on all metrics.",
      date: "Yesterday, 2:15 PM",
      avatar: "SC",
    },
    {
      author: "Dr. Marcus Wright",
      text: "Consider increasing your daily practice to 20 minutes. Your progress rate suggests you can handle more intensity now.",
      date: "3 days ago",
      avatar: "MW",
    },
  ];

  const howItWorks = [
    {
      icon: Monitor,
      title: "Remote Monitoring",
      desc: "Your therapist reviews all exercise data and session recordings in real-time.",
    },
    {
      icon: Activity,
      title: "AI Progress Reports",
      desc: "Our AI generates detailed recovery trend reports automatically after each session.",
    },
    {
      icon: MessageSquare,
      title: "Direct Feedback",
      desc: "Receive personalized feedback and exercise recommendations directly from your therapist.",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      desc: "Book live video sessions at times that work for you, from anywhere in the world.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-card">
          <Video className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Tele-Rehabilitation
          </h1>
          <p className="text-muted-foreground text-sm">
            Remote monitoring and live therapy with your care team
          </p>
        </div>
      </div>

      {/* Demo note */}
      <div className="mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            You're exploring in Demo Mode
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This is a preview of the Tele-Rehabilitation module. Sign in with
            Internet Identity to connect with real therapists and access live
            video sessions.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Video Call Card */}
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Video Session
            </CardTitle>
            <CardDescription>
              Live therapy with your assigned therapist
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mock video area */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 aspect-video flex items-center justify-center mb-4 border border-border">
              <Camera className="w-12 h-12 text-primary/40" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">Dr. Sarah Chen</span>
                  <span className="text-muted-foreground text-xs">
                    — Available
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() =>
                alert(
                  "Video calls require login with Internet Identity. Sign in to join live sessions with your therapist.",
                )
              }
              className="w-full h-11 gradient-primary text-white border-0 rounded-xl font-semibold"
              data-ocid="telerehab.join.button"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Session
            </Button>
          </CardContent>
        </Card>

        {/* Session Stats */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Session Statistics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-2xl font-display font-bold text-primary">
                    3
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sessions this week
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-2xl font-display font-bold text-success">
                    78%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Average score
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <p className="text-sm font-display font-bold text-success">
                      Up
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Trend</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">
                  Recovery Progress
                </h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Speech Clarity", value: 82 },
                  { label: "Motor Coordination", value: 75 },
                  { label: "Response Time", value: 68 },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">
                        {value}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Therapist Feedback */}
      <Card className="shadow-card mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Therapist Feedback
          </CardTitle>
          <CardDescription>Recent messages from your care team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoFeedback.map((fb) => (
              <div
                key={fb.date}
                className="flex gap-3 p-4 rounded-xl bg-primary/5 border-l-2 border-primary/30"
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {fb.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {fb.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {fb.date}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {fb.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">
            How Tele-Rehab Works
          </CardTitle>
          <CardDescription>
            Remote rehabilitation made simple and effective
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {howItWorks.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-3 p-4 rounded-xl bg-muted/40"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-0.5">
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: patients, isLoading: patientsLoading } = useListPatients();
  const { data: approvals } = useListApprovals();
  const { mutate: setApproval, isPending: approvalPending } = useSetApproval();

  useEffect(() => {
    if (!identity && !isDemoMode) navigate({ to: "/" });
  }, [identity, isDemoMode, navigate]);

  // Demo mode: show showcase
  if (isDemoMode) {
    return <DemoTeleRehabView />;
  }

  if (adminLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-64">
        <Card className="max-w-md w-full text-center shadow-card">
          <CardContent className="p-8">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              This dashboard is only accessible to therapists and
              administrators.
            </p>
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              className="gradient-primary text-white border-0 rounded-xl"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingApprovals =
    approvals?.filter((a) => a.status === ApprovalStatus.pending) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-card">
          <Video className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Therapist Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor patients and manage approvals
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">
              {patients?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Patients</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">
              {pendingApprovals.length}
            </p>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <UserCheck className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">
              {approvals?.filter((a) => a.status === ApprovalStatus.approved)
                .length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Review and approve patient access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.principal.toString()}
                  className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/20"
                >
                  <div>
                    <p className="text-sm font-medium font-mono">
                      {approval.principal.toString().slice(0, 20)}...
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approvalPending}
                      onClick={() =>
                        setApproval({
                          user: approval.principal,
                          status: ApprovalStatus.rejected,
                        })
                      }
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={approvalPending}
                      onClick={() =>
                        setApproval({
                          user: approval.principal,
                          status: ApprovalStatus.approved,
                        })
                      }
                      className="gradient-primary text-white border-0 rounded-xl"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Patient List
          </CardTitle>
          <CardDescription>
            All patients with active treatment plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : !patients || patients.length === 0 ? (
            <div
              data-ocid="therapist.patients.empty_state"
              className="text-center py-10 text-muted-foreground"
            >
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No patients have submitted sessions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patientId) => (
                <PatientRow
                  key={patientId.toString()}
                  patientId={patientId}
                  onView={(id) => navigate({ to: `/therapist/patient/${id}` })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
