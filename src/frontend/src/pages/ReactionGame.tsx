import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
  Target,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ApprovalGate from "../components/ApprovalGate";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSubmitSession } from "../hooks/useQueries";

const GAME_DURATION = 45;
const TARGET_LIFETIME = 1500;

interface TargetItem {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number;
}

export default function ReactionGame() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { mutate: submitSession, isPending: isSubmitting } = useSubmitSession();

  const [gameState, setGameState] = useState<"idle" | "playing" | "complete">(
    "idle",
  );
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const idCounter = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!identity && !isDemoMode) navigate({ to: "/" });
  }, [identity, isDemoMode, navigate]);

  const stopGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (expireRef.current) clearInterval(expireRef.current);
    setTargets([]);
    setGameState("complete");
  }, []);

  const spawnTarget = useCallback(() => {
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const size = Math.floor(Math.random() * 30) + 40;
    const x = Math.random() * (rect.width - size - 20) + 10;
    const y = Math.random() * (rect.height - size - 20) + 10;
    const newTarget: TargetItem = {
      id: idCounter.current++,
      x,
      y,
      size,
      createdAt: Date.now(),
    };
    setTargets((prev) => [...prev.slice(-4), newTarget]);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setMissed(0);
    setTimeLeft(GAME_DURATION);
    setSubmitted(false);
    setTargets([]);
    idCounter.current = 0;
    setGameState("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(spawnTarget, 800);

    expireRef.current = setInterval(() => {
      const now = Date.now();
      setTargets((prev) => {
        const expired = prev.filter((t) => now - t.createdAt > TARGET_LIFETIME);
        if (expired.length > 0) {
          setMissed((m) => m + expired.length);
        }
        return prev.filter((t) => now - t.createdAt <= TARGET_LIFETIME);
      });
    }, 200);
  }, [spawnTarget, stopGame]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (expireRef.current) clearInterval(expireRef.current);
    };
  }, []);

  const handleHit = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setScore((s) => s + 1);
  };

  const finalScore = Math.min(
    100,
    Math.round((score / Math.max(score + missed, 1)) * 100),
  );

  const handleSubmit = () => {
    if (isDemoMode) {
      setSubmitted(true);
      return;
    }
    submitSession(
      {
        task: { __kind__: "motorTask", motorTask: "Reaction Targets" },
        score: finalScore,
      },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  const progressPct = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;

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

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Reaction Targets
            </h1>
            <p className="text-sm text-muted-foreground">
              Click the targets before they disappear!
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        {gameState === "playing" && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Time</p>
                <p
                  className={`text-2xl font-display font-bold ${timeLeft <= 10 ? "text-destructive" : "text-primary"}`}
                >
                  {timeLeft}s
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Hits</p>
                <p className="text-2xl font-display font-bold text-success">
                  {score}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Missed</p>
                <p className="text-2xl font-display font-bold text-destructive">
                  {missed}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Area */}
        <Card className="mb-4 overflow-hidden">
          <div
            ref={gameAreaRef}
            className="relative bg-gradient-to-br from-accent/30 to-primary/5 select-none"
            style={{ height: "380px" }}
          >
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Target className="w-16 h-16 text-primary mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    Click the colored circles as fast as you can. They disappear
                    after {TARGET_LIFETIME / 1000}s!
                  </p>
                  <Button
                    onClick={startGame}
                    className="gradient-primary text-white border-0 h-12 px-8 text-base"
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {gameState === "complete" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <div className="text-center animate-score-pop">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
                  <p className="font-display font-bold text-xl">Time's Up!</p>
                  <p className="text-muted-foreground">
                    {score} hits · {missed} missed
                  </p>
                </div>
              </div>
            )}

            {gameState === "playing" &&
              targets.map((target) => {
                const age = Date.now() - target.createdAt;
                const opacity = Math.max(0.3, 1 - age / TARGET_LIFETIME);
                return (
                  <button
                    type="button"
                    key={target.id}
                    onClick={() => handleHit(target.id)}
                    className="absolute rounded-full gradient-primary border-2 border-white/30 shadow-lg transition-transform hover:scale-110 active:scale-95"
                    style={{
                      left: target.x,
                      top: target.y,
                      width: target.size,
                      height: target.size,
                      opacity,
                    }}
                  />
                );
              })}
          </div>
        </Card>

        {/* Progress */}
        {gameState === "playing" && (
          <Progress value={progressPct} className="h-2 mb-4" />
        )}

        {/* Result */}
        {gameState === "complete" && !submitted && (
          <Card className="animate-score-pop">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Accuracy Score
              </p>
              <p className="text-5xl font-display font-bold text-primary mb-1">
                {finalScore}%
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {score} hits out of {score + missed} targets
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={startGame}>
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
              <p className="font-semibold">
                {isDemoMode ? "Demo complete!" : `Score saved: ${finalScore}%`}
              </p>
              {isDemoMode && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  In demo mode, scores are not saved. Sign in to track your
                  progress.
                </p>
              )}
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
