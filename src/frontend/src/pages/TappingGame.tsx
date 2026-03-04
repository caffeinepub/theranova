import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Loader2, RefreshCw, Zap } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ApprovalGate from "../components/ApprovalGate";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSubmitSession } from "../hooks/useQueries";

const GAME_DURATION = 30;

export default function TappingGame() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { mutate: submitSession, isPending: isSubmitting } = useSubmitSession();

  const [gameState, setGameState] = useState<"idle" | "playing" | "complete">(
    "idle",
  );
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!identity) navigate({ to: "/" });
  }, [identity, navigate]);

  useEffect(() => {
    if (gameState === "playing") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setGameState("complete");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState]);

  const handleStart = () => {
    setTapCount(0);
    setTimeLeft(GAME_DURATION);
    setSubmitted(false);
    setGameState("playing");
  };

  const handleTap = () => {
    if (gameState !== "playing") return;
    setTapCount((c) => c + 1);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
  };

  // Score: normalize taps to 0-100 (60 taps = 100%)
  const score = Math.min(100, Math.round((tapCount / 60) * 100));

  const handleSubmit = () => {
    submitSession(
      { task: { __kind__: "motorTask", motorTask: "Tapping Speed" }, score },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  const progressPct = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;

  return (
    <ApprovalGate>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/motor" })}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Motor Skills
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Tapping Speed
            </h1>
            <p className="text-sm text-muted-foreground">
              Tap as fast as you can in 30 seconds!
            </p>
          </div>
        </div>

        {/* Timer & Progress */}
        {gameState !== "idle" && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Time Remaining</span>
                <span
                  className={`text-2xl font-display font-bold ${timeLeft <= 5 ? "text-destructive" : "text-primary"}`}
                >
                  {timeLeft}s
                </span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Tap Counter */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-card border border-border shadow-card">
            <p className="text-sm text-muted-foreground mb-1">Taps</p>
            <p className="text-7xl font-display font-bold text-primary">
              {tapCount}
            </p>
          </div>
        </div>

        {/* Tap Button */}
        {gameState !== "complete" && (
          <div className="flex justify-center">
            {gameState === "idle" ? (
              <Button
                onClick={handleStart}
                className="w-48 h-48 rounded-full gradient-primary text-white border-0 text-xl font-display font-bold shadow-card"
              >
                TAP TO START
              </Button>
            ) : (
              <button
                type="button"
                onPointerDown={handleTap}
                className={`w-48 h-48 rounded-full gradient-primary text-white text-xl font-display font-bold shadow-card transition-transform select-none ${
                  isPressed ? "scale-95" : "scale-100 hover:scale-105"
                }`}
                style={{ touchAction: "none" }}
              >
                TAP!
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {gameState === "complete" && !submitted && (
          <Card className="animate-score-pop">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="font-display text-xl font-bold mb-1">Time's Up!</p>
              <p className="text-muted-foreground mb-4">
                {tapCount} taps in {GAME_DURATION} seconds
              </p>
              <p className="text-5xl font-display font-bold text-primary mb-6">
                {score}%
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleStart}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Play Again
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gradient-primary text-white border-0"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Save Score
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {submitted && (
          <Card className="animate-score-pop">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="font-semibold">Score saved: {score}%</p>
              <Button
                onClick={() => navigate({ to: "/motor" })}
                className="mt-4 gradient-primary text-white border-0"
              >
                Back to Games
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ApprovalGate>
  );
}
