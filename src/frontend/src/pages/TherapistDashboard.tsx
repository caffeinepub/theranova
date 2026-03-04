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
  CheckCircle,
  ChevronRight,
  Clock,
  ShieldAlert,
  UserCheck,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import React, { useEffect } from "react";
import { ApprovalStatus } from "../backend";
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
    <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
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
        className="flex items-center gap-1 flex-shrink-0"
      >
        View <ChevronRight className="w-3 h-3" />
      </Button>
    </div>
  );
}

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: patients, isLoading: patientsLoading } = useListPatients();
  const { data: approvals } = useListApprovals();
  const { mutate: setApproval, isPending: approvalPending } = useSetApproval();

  useEffect(() => {
    if (!identity) navigate({ to: "/" });
  }, [identity, navigate]);

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
        <Card className="max-w-md w-full text-center">
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
              className="gradient-primary text-white border-0"
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
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
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
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">
              {patients?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-display font-bold">
              {pendingApprovals.length}
            </p>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card>
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
        <Card className="mb-6">
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
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
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
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
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
                      className="gradient-primary text-white border-0"
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
      <Card>
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
            <div className="text-center py-10 text-muted-foreground">
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
