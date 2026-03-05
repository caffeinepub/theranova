import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Mic,
  TrendingUp,
  Volume2,
} from "lucide-react";
import React from "react";
import { useEffect } from "react";
import ApprovalGate from "../components/ApprovalGate";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFetchSpeechExercises } from "../hooks/useQueries";

export default function SpeechModule() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { data: exercises, isLoading } = useFetchSpeechExercises();

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
              <Mic className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Speech Therapy
              </h1>
              <p className="text-muted-foreground text-sm">
                AI-powered pronunciation training
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/speech/progress" })}
            className="hidden sm:flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            View Progress
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
          <Volume2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">How it works</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Read the exercise prompt aloud. Your speech will be captured and
              scored based on accuracy. Practice regularly to improve your
              pronunciation and fluency.
            </p>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Exercise Library
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            exercises?.map((exercise, index) => (
              <Card
                key={exercise}
                className="cursor-pointer card-hover border-border group"
                onClick={() => navigate({ to: `/speech/exercise/${index}` })}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-display font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {exercise}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {index < 2
                          ? "Beginner"
                          : index < 4
                            ? "Intermediate"
                            : "Advanced"}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => navigate({ to: "/speech/progress" })}
          className="sm:hidden w-full mt-4 flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          View My Progress
        </Button>
      </div>
    </ApprovalGate>
  );
}
