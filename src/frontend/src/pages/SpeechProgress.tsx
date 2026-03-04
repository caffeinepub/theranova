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
import { ArrowLeft, Award, Target, TrendingUp } from "lucide-react";
import React, { useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ApprovalGate from "../components/ApprovalGate";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFetchCallerPlan } from "../hooks/useQueries";

export default function SpeechProgress() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: plan, isLoading } = useFetchCallerPlan();

  useEffect(() => {
    if (!identity) navigate({ to: "/" });
  }, [identity, navigate]);

  const speechSessions =
    plan?.sessions?.filter((s) => s.task.__kind__ === "speechTask") ?? [];

  const chartData = speechSessions.map((s, i) => ({
    session: `S${i + 1}`,
    score: Number(s.score),
    date: new Date(Number(s.timestamp) / 1_000_000).toLocaleDateString(),
  }));

  const avgScore = speechSessions.length
    ? Math.round(
        speechSessions.reduce((acc, s) => acc + Number(s.score), 0) /
          speechSessions.length,
      )
    : 0;

  const bestScore = speechSessions.length
    ? Math.max(...speechSessions.map((s) => Number(s.score)))
    : 0;

  const trend =
    speechSessions.length >= 3
      ? (() => {
          const recent = speechSessions.slice(-3).map((s) => Number(s.score));
          const avg = recent.reduce((a, b) => a + b, 0) / 3;
          const first = Number(speechSessions[0].score);
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
          onClick={() => navigate({ to: "/speech" })}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Speech Module
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Speech Progress
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your pronunciation improvement over time
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Sessions", value: speechSessions.length, icon: Target },
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
                  Your pronunciation scores over sessions
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
                  <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Complete speech exercises to see your progress here</p>
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
                    formatter={(value) => [`${value}%`, "Score"]}
                    labelFormatter={(label) => `Session ${label}`}
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

        {/* Session List */}
        {speechSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {speechSessions
                  .slice()
                  .reverse()
                  .map((s) => {
                    const score = Number(s.score);
                    const date = new Date(Number(s.timestamp) / 1_000_000);
                    const taskText =
                      s.task.__kind__ === "speechTask" ? s.task.speechTask : "";
                    return (
                      <div
                        key={s.timestamp.toString()}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/30"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {taskText}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleString()}
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
                          className="ml-3 font-mono"
                        >
                          {score}%
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
