import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Volume2,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ApprovalGate from "../components/ApprovalGate";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFetchSpeechExercises, useSubmitSession } from "../hooks/useQueries";

// ── Speech Recognition type shim ─────────────────────────────────────────────
// The Web Speech API is not in the default TypeScript lib, so we define a
// minimal interface here to avoid "Cannot find name 'SpeechRecognition'" errors.

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: ISpeechRecognitionConstructor | undefined;
  }
}

// ── Pronunciation scoring ─────────────────────────────────────────────────────

function computeSimilarity(target: string, spoken: string): number {
  const t = target
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();
  const s = spoken
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();
  if (!s) return 0;

  const tWords = t.split(/\s+/);
  const sWords = s.split(/\s+/);

  let matches = 0;
  const usedIndices = new Set<number>();

  for (const tw of tWords) {
    for (let i = 0; i < sWords.length; i++) {
      if (
        !usedIndices.has(i) &&
        levenshtein(tw, sWords[i]) <= Math.floor(tw.length * 0.3)
      ) {
        matches++;
        usedIndices.add(i);
        break;
      }
    }
  }

  return Math.round((matches / Math.max(tWords.length, 1)) * 100);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SpeechExercise() {
  const navigate = useNavigate();
  const { exerciseIndex } = useParams({
    from: "/auth/speech/exercise/$exerciseIndex",
  });
  const { identity } = useInternetIdentity();
  const { data: exercises } = useFetchSpeechExercises();
  const { mutate: submitSession, isPending: isSubmitting } = useSubmitSession();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const idx = Number.parseInt(exerciseIndex ?? "0", 10);
  const exercise = exercises?.[idx] ?? "";

  useEffect(() => {
    if (!identity) navigate({ to: "/" });
  }, [identity, navigate]);

  const startRecording = () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      );
      return;
    }

    setError("");
    setTranscript("");
    setScore(null);
    setSubmitted(false);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      const computed = computeSimilarity(exercise, result);
      setScore(computed);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Recognition error: ${event.error}. Please try again.`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (score === null) return;
    submitSession(
      {
        task: { __kind__: "speechTask", speechTask: exercise },
        score,
      },
      {
        onSuccess: () => setSubmitted(true),
      },
    );
  };

  const handleRetry = () => {
    setTranscript("");
    setScore(null);
    setSubmitted(false);
    setError("");
  };

  const scoreColor =
    score === null
      ? ""
      : score >= 70
        ? "text-success"
        : score >= 40
          ? "text-warning"
          : "text-destructive";

  return (
    <ApprovalGate>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/speech" })}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Exercises
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
            {idx + 1}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Speech Exercise
            </h1>
            <p className="text-sm text-muted-foreground">
              Read the prompt aloud clearly
            </p>
          </div>
        </div>

        {/* Exercise Prompt */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {exercise}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recording Controls */}
        {!submitted && (
          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${
                isRecording
                  ? "bg-destructive text-white animate-pulse-ring"
                  : "gradient-primary text-white hover:opacity-90"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
            <p className="text-sm text-muted-foreground">
              {isRecording
                ? "Recording... Click to stop"
                : "Click to start recording"}
            </p>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                What we heard:
              </p>
              <p className="text-foreground italic">"{transcript}"</p>
            </CardContent>
          </Card>
        )}

        {/* Score Display */}
        {score !== null && !submitted && (
          <div className="mt-6 text-center animate-score-pop">
            <div className="inline-flex flex-col items-center p-6 rounded-2xl bg-card border border-border shadow-card">
              <p className="text-sm text-muted-foreground mb-2">
                Pronunciation Score
              </p>
              <p className={`text-6xl font-display font-bold ${scoreColor}`}>
                {score}%
              </p>
              <Progress value={score} className="w-48 mt-3 h-2" />
              <Badge
                variant={
                  score >= 70
                    ? "default"
                    : score >= 40
                      ? "secondary"
                      : "destructive"
                }
                className="mt-3"
              >
                {score >= 70
                  ? "Excellent!"
                  : score >= 40
                    ? "Good effort"
                    : "Keep practicing"}
              </Badge>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gradient-primary text-white border-0 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Save Result
              </Button>
            </div>
          </div>
        )}

        {/* Submitted State */}
        {submitted && (
          <div className="mt-6 text-center animate-score-pop">
            <div className="p-6 rounded-2xl bg-success/10 border border-success/20">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="font-display font-bold text-lg text-foreground">
                Result Saved!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Score: {score}%
              </p>
            </div>
            <div className="flex gap-3 justify-center mt-4">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" /> Practice Again
              </Button>
              <Button
                onClick={() => navigate({ to: "/speech" })}
                className="gradient-primary text-white border-0"
              >
                Next Exercise <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ApprovalGate>
  );
}
