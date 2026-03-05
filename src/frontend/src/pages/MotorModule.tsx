import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Gamepad2,
  Route,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useEffect } from "react";
import ApprovalGate from "../components/ApprovalGate";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const games = [
  {
    title: "Path Tracing",
    description:
      "Trace the glowing 3D path with your cursor to improve hand-eye coordination and fine motor control.",
    icon: Route,
    path: "/motor/path",
    badge: "3D Game",
    difficulty: "Medium",
    duration: "~2 min",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    title: "Tapping Speed",
    description:
      "Tap the target as fast as you can in 30 seconds. Builds finger speed and dexterity.",
    icon: Zap,
    path: "/motor/tapping",
    badge: "Speed",
    difficulty: "Easy",
    duration: "30 sec",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    title: "Reaction Targets",
    description:
      "Click moving targets as they appear. Trains reaction time and spatial coordination.",
    icon: Target,
    path: "/motor/reaction",
    badge: "Reaction",
    difficulty: "Hard",
    duration: "~1 min",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
];

export default function MotorModule() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    if (!identity && !isDemoMode) navigate({ to: "/" });
  }, [identity, isDemoMode, navigate]);

  return (
    <ApprovalGate>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Motor Skills
              </h1>
              <p className="text-muted-foreground text-sm">
                Gamified rehabilitation exercises
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/motor/progress" })}
            className="hidden sm:flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            View Progress
          </Button>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground font-medium mb-1">
            About Motor Rehabilitation
          </p>
          <p className="text-xs text-muted-foreground">
            These games are designed to improve hand-eye coordination, finger
            dexterity, and reaction time. Play regularly and track your
            improvement over time.
          </p>
        </div>

        {/* Game Cards */}
        <div className="space-y-4">
          {games.map(
            ({
              title,
              description,
              icon: Icon,
              path,
              badge,
              difficulty,
              duration,
              color,
              bg,
            }) => (
              <Card
                key={path}
                className="cursor-pointer card-hover border-border group"
                onClick={() => navigate({ to: path })}
              >
                <CardContent className="p-5 flex items-center gap-5">
                  <div
                    className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-7 h-7 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-foreground">
                        {title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Difficulty:{" "}
                        <span className="font-medium text-foreground">
                          {difficulty}
                        </span>
                      </span>
                      <span>
                        Duration:{" "}
                        <span className="font-medium text-foreground">
                          {duration}
                        </span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </CardContent>
              </Card>
            ),
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => navigate({ to: "/motor/progress" })}
          className="sm:hidden w-full mt-4 flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          View My Progress
        </Button>
      </div>
    </ApprovalGate>
  );
}
