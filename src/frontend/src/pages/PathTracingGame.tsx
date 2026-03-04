import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
  Route,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import ApprovalGate from "../components/ApprovalGate";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSubmitSession } from "../hooks/useQueries";

// ── Path generation ───────────────────────────────────────────────────────────
// Generates a smooth Lissajous-style path as 2D canvas coordinates

interface Point {
  x: number;
  y: number;
}

function generatePath(width: number, height: number): Point[] {
  const points: Point[] = [];
  const count = 14;
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.38;
  const ry = height * 0.38;
  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * Math.PI * 1.8;
    const x = cx + Math.cos(t) * rx + Math.sin(t * 2.1) * rx * 0.22;
    const y = cy + Math.sin(t) * ry + Math.cos(t * 1.7) * ry * 0.18;
    points.push({ x, y });
  }
  return points;
}

// ── Canvas renderer ───────────────────────────────────────────────────────────

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  path: Point[],
  cursorPos: Point | null,
  reachedIdx: number,
  active: boolean,
) {
  // Background
  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#f0fdf4");
  bg.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  if (path.length < 2) return;

  // Draw path segments — completed in teal, remaining in grey
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = i < reachedIdx ? "#0d9488" : "#cbd5e1";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Draw waypoints
  path.forEach((p, i) => {
    const reached = i <= reachedIdx;
    const isStart = i === 0;
    const isEnd = i === path.length - 1;

    // Outer glow for unreached
    if (!reached && active) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = isEnd ? "rgba(239,68,68,0.15)" : "rgba(13,148,136,0.12)";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, isStart || isEnd ? 11 : 8, 0, Math.PI * 2);
    if (isStart) {
      ctx.fillStyle = "#22c55e";
    } else if (isEnd) {
      ctx.fillStyle = reached ? "#22c55e" : "#ef4444";
    } else {
      ctx.fillStyle = reached ? "#0d9488" : "#94a3b8";
    }
    ctx.fill();

    // White border
    ctx.beginPath();
    ctx.arc(p.x, p.y, isStart || isEnd ? 11 : 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label start/end
    if (isStart || isEnd) {
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.fillText(isStart ? "START" : "END", p.x, p.y - 18);
    }
  });

  // Draw cursor
  if (cursorPos && active) {
    // Outer ring
    ctx.beginPath();
    ctx.arc(cursorPos.x, cursorPos.y, 18, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(245,158,11,0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Inner dot
    ctx.beginPath();
    ctx.arc(cursorPos.x, cursorPos.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PathTracingGame() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { mutate: submitSession, isPending: isSubmitting } = useSubmitSession();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const pathRef = useRef<Point[]>([]);
  const cursorRef = useRef<Point | null>(null);
  const reachedIdxRef = useRef<number>(0);
  const gameStateRef = useRef<"idle" | "playing" | "complete">("idle");

  const [gameState, setGameState] = useState<"idle" | "playing" | "complete">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!identity) navigate({ to: "/" });
  }, [identity, navigate]);

  // Rebuild path when canvas size is known
  const initPath = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    pathRef.current = generatePath(canvas.width, canvas.height);
  }, []);

  // Main render loop
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawScene(
      ctx,
      canvas.width,
      canvas.height,
      pathRef.current,
      cursorRef.current,
      reachedIdxRef.current,
      gameStateRef.current === "playing",
    );
    animFrameRef.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = rect.height || 380;
    initPath();

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [initPath, renderLoop]);

  // Timer
  useEffect(() => {
    if (gameState === "playing") {
      const t0 = startTime;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - t0) / 1000));
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime]);

  const handleStart = () => {
    reachedIdxRef.current = 0;
    cursorRef.current = null;
    gameStateRef.current = "playing";
    setProgress(0);
    setSubmitted(false);
    setElapsed(0);
    setStartTime(Date.now());
    setGameState("playing");
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameStateRef.current !== "playing") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      cursorRef.current = { x, y };

      // Check proximity to next waypoint
      const path = pathRef.current;
      const nextIdx = reachedIdxRef.current;
      if (nextIdx < path.length) {
        const target = path[nextIdx];
        const dist = Math.hypot(x - target.x, y - target.y);
        const threshold = canvas.width * 0.055;
        if (dist < threshold) {
          reachedIdxRef.current = Math.min(path.length - 1, nextIdx + 1);
          const pct = Math.round(
            (reachedIdxRef.current / (path.length - 1)) * 100,
          );
          setProgress(pct);
          if (reachedIdxRef.current >= path.length - 1) {
            gameStateRef.current = "complete";
            setGameState("complete");
          }
        }
      }
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (gameStateRef.current !== "playing") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      cursorRef.current = { x, y };

      const path = pathRef.current;
      const nextIdx = reachedIdxRef.current;
      if (nextIdx < path.length) {
        const target = path[nextIdx];
        const dist = Math.hypot(x - target.x, y - target.y);
        const threshold = canvas.width * 0.055;
        if (dist < threshold) {
          reachedIdxRef.current = Math.min(path.length - 1, nextIdx + 1);
          const pct = Math.round(
            (reachedIdxRef.current / (path.length - 1)) * 100,
          );
          setProgress(pct);
          if (reachedIdxRef.current >= path.length - 1) {
            gameStateRef.current = "complete";
            setGameState("complete");
          }
        }
      }
    },
    [],
  );

  const score =
    gameState === "complete"
      ? Math.max(10, Math.round(100 - elapsed * 1.5))
      : progress;

  const handleSubmit = () => {
    submitSession(
      { task: { __kind__: "motorTask", motorTask: "Path Tracing" }, score },
      { onSuccess: () => setSubmitted(true) },
    );
  };

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
            <Route className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Path Tracing
            </h1>
            <p className="text-sm text-muted-foreground">
              Move your cursor along the glowing path from START to END
            </p>
          </div>
        </div>

        {/* Game Canvas */}
        <Card className="mb-4 overflow-hidden">
          <div className="relative" style={{ height: "380px" }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              style={{
                touchAction: "none",
                cursor: gameState === "playing" ? "none" : "default",
              }}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            />

            {/* Idle overlay */}
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="text-center px-4">
                  <Route className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
                  <p className="text-muted-foreground mb-2 text-sm">
                    Trace the path from{" "}
                    <span className="text-green-600 font-semibold">START</span>{" "}
                    to <span className="text-red-500 font-semibold">END</span>{" "}
                    using your cursor or finger
                  </p>
                  <Button
                    onClick={handleStart}
                    className="gradient-primary text-white border-0 h-12 px-8 mt-2"
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {/* Complete overlay */}
            {gameState === "complete" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <div className="text-center animate-score-pop">
                  <CheckCircle className="w-14 h-14 text-success mx-auto mb-2" />
                  <p className="font-display font-bold text-2xl text-foreground">
                    Path Complete!
                  </p>
                  <p className="text-muted-foreground">
                    Finished in {elapsed}s
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Progress Bar */}
        {gameState === "playing" && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Path Progress</span>
                <span className="text-sm font-mono text-primary font-semibold">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                Time: {elapsed}s
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {gameState === "complete" && !submitted && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className="text-5xl font-display font-bold text-primary mb-2">
                {score}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Completed in {elapsed} seconds
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
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="font-semibold">Score saved: {score} points</p>
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
