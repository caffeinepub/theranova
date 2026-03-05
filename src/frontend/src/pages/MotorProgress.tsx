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
import { ArrowLeft, Award, Gamepad2, Target, TrendingUp } from "lucide-react";
import React, { useEffect } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ApprovalGate from "../components/ApprovalGate";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFetchCallerPlan } from "../hooks/useQueries";

export default function MotorProgress() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { data: plan, isLoading } = useFetchCallerPlan();

  useEffect(() => {
    if (!identity && !isDemoMode) navigate({ to: "/" });
  }, [identity, isDemoMode, navigate]);

  const motorSessions =
    plan?.sessions?.filter((s) => s.task.__kind__ === "motorTask") ?? [];

  const pathSessions = motorSessions.filter(
    (s) =>
      s.task.__kind__ === "motorTask" && s.task.motorTask === "Path Tracing",
  );
  const tappingSessions = motorSessions.filter(
    (s) =>
      s.task.__kind__ === "motorTask" && s.task.motorTask === "Tapping Speed",
  );
  const reactionSessions = motorSessions.filter(
    (s) =>
      s.task.__kind__ === "motorTask" &&
      s.task.motorTask === "Reaction Targets",
  );

  const chartData = motorSessions.map((s, i) => {
    const taskName =
      s.task.__kind__ === "motorTask" ? s.task.motorTask : "Motor";
    return {
      session: `S${i + 1}`,
      score: Number(s.score),
      game: taskName,
      date: new Date(Number(s.timestamp) / 1_000_000).toLocaleDateString(),
    };
  });

  const avgScore = motorSessions.length
    ? Math.round(
        motorSessions.reduce((acc, s) => acc + Number(s.score), 0) /
          motorSessions.length,
      )
    : 0;

  const bestScore = motorSessions.length
    ? Math.max(...motorSessions.map((s) => Number(s.score)))
    : 0;

  const trend =
    motorSessions.length >= 3
      ? (() => {
          const recent = motorSessions.slice(-3).map((s) => Number(s.score));
          const avg = recent.reduce((a, b) => a + b, 0) / 3;
          const first = Number(motorSessions[0].score);
          if (avg > first + 5) return "Improving";
          if (avg < first - 5) return "Declining";
          return "Stable";
        })()
      : "Not enough data";

  return (
    <ApprovalGate>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/motor" })}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Motor Skills
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Motor Progress
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your motor skill improvement over time
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Sessions", value: motorSessions.length, icon: Target },
            { label: "Avg Score", value: `${avgScore}%`, icon: Award },
            { label: "Best Score", value: `${bestScore}%`, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-display font-bold text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display">Score History</CardTitle>
                <CardDescription>
                  All motor game scores over time
                </CardDescription>
              </div>
              <Badge
                variant={
                  trend === "Improving"
                    ? "default"
                    : trend === "Declining"
                      ? "destructive"
                      : "secondary"
                }
              >
                {trend}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Gamepad2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Play motor games to see your progress here</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.88 0.03 180)"
                  />
                  <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      `${value}%`,
                      props.payload?.game ?? "Score",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="oklch(0.52 0.14 185)"
                    strokeWidth={2.5}
                    dot={{ fill: "oklch(0.52 0.14 185)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Per-game breakdown */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Path Tracing",
              sessions: pathSessions,
              color: "text-chart-1",
            },
            {
              label: "Tapping Speed",
              sessions: tappingSessions,
              color: "text-chart-2",
            },
            {
              label: "Reaction Targets",
              sessions: reactionSessions,
              color: "text-chart-3",
            },
          ].map(({ label, sessions, color }) => {
            const avg = sessions.length
              ? Math.round(
                  sessions.reduce((a, s) => a + Number(s.score), 0) /
                    sessions.length,
                )
              : 0;
            return (
              <Card key={label}>
                <CardContent className="p-4 text-center">
                  <p className={`text-sm font-semibold ${color} mb-1`}>
                    {label}
                  </p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {avg}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sessions.length} sessions
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Session List */}
        {motorSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {motorSessions
                  .slice()
                  .reverse()
                  .map((s) => {
                    const sc = Number(s.score);
                    const date = new Date(Number(s.timestamp) / 1_000_000);
                    const taskName =
                      s.task.__kind__ === "motorTask"
                        ? s.task.motorTask
                        : "Motor";
                    return (
                      <div
                        key={s.timestamp.toString()}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/30"
                      >
                        <div>
                          <p className="text-sm font-medium">{taskName}</p>
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
            </CardContent>
          </Card>
        )}
      </div>
    </ApprovalGate>
  );
}
