import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Mic, MicOff, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFetchSpeechExercises } from "../hooks/useQueries";

// ─── SpeechExercise Page ──────────────────────────────────────────────────────

export default function SpeechExercise() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { exerciseIndex } = useParams({ strict: false }) as {
    exerciseIndex: string;
  };
  const idx = Number.parseInt(exerciseIndex ?? "0", 10);

  const { data: exercises } = useFetchSpeechExercises();
  const exercise = exercises?.[idx] ?? "Say: Hello, my name is...";

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!identity && !isDemoMode) navigate({ to: "/" });
  }, [identity, isDemoMode, navigate]);

  const handleSpeak = () => {
    if (!exercise) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(exercise);
    utt.lang = "en-US";
    utt.rate = 0.85;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    synth.speak(utt);
  };

  const calcScore = (spoken: string, target: string): number => {
    const spokenWords = spoken.toLowerCase().trim().split(/\s+/);
    const targetWords = target.toLowerCase().trim().split(/\s+/);
    if (!targetWords.length) return 0;
    let matches = 0;
    for (const w of spokenWords) {
      if (targetWords.includes(w)) matches++;
    }
    return Math.min(100, Math.round((matches / targetWords.length) * 100));
  };

  const buildFeedback = (s: number): string => {
    if (s >= 90)
      return "Excellent! Your pronunciation is very clear. Keep it up!";
    if (s >= 70)
      return "Good job! Try to pronounce each word a bit more clearly.";
    if (s >= 50)
      return "Getting there! Speak slower and focus on each syllable.";
    return "Keep practicing! Try listening to the example first, then repeat.";
  };

  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setTranscript("Speech recognition not supported in this browser.");
      return;
    }
    const rec = new SpeechRecognitionAPI();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setTranscript(spoken);
      const s = calcScore(spoken, exercise);
      setScore(s);
      setFeedback(buildFeedback(s));
    };
    rec.onerror = () => {
      setIsRecording(false);
      setTranscript("Could not capture audio. Please try again.");
    };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
    setTranscript("");
    setScore(null);
    setFeedback("");
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const level = idx < 2 ? "Beginner" : idx < 4 ? "Intermediate" : "Advanced";

  const scoreColor =
    score === null
      ? "text-muted-foreground"
      : score >= 70
        ? "text-chart-2"
        : score >= 50
          ? "text-chart-4"
          : "text-destructive";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/speech" })}
          className="flex items-center gap-1.5"
          data-ocid="speech_exercise.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Exercise {idx + 1}
          </h1>
          <p className="text-xs text-muted-foreground">
            Speech Therapy Practice
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          {level}
        </Badge>
      </div>

      {/* Exercise Prompt */}
      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            Read This Aloud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-xl font-semibold text-foreground leading-relaxed mb-4 font-display"
            data-ocid="speech_exercise.panel"
          >
            {exercise}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="flex items-center gap-2"
            data-ocid="speech_exercise.secondary_button"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isSpeaking ? "Playing..." : "Hear Example"}
          </Button>
        </CardContent>
      </Card>

      {/* Recording Control */}
      <Card className="mb-5">
        <CardContent className="pt-5">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              data-ocid={
                isRecording
                  ? "speech_exercise.secondary_button"
                  : "speech_exercise.primary_button"
              }
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording
                  ? "bg-destructive/15 border-2 border-destructive animate-pulse"
                  : "bg-primary/10 border-2 border-primary hover:bg-primary/20"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-destructive" />
              ) : (
                <Mic className="w-8 h-8 text-primary" />
              )}
            </button>
            <p className="text-sm text-muted-foreground">
              {isRecording
                ? "Recording… click to stop"
                : "Click the mic to start speaking"}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div
              className="mt-4 p-3 rounded-lg bg-accent/30 border border-border"
              data-ocid="speech_exercise.success_state"
            >
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                You said
              </p>
              <p className="text-sm text-foreground font-medium italic">
                "{transcript}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score */}
      {score !== null && (
        <Card className="mb-5 animate-fade-in" data-ocid="speech_exercise.card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-chart-2" />
              Pronunciation Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold font-display ${scoreColor}`}>
                {score}%
              </span>
              <span className="text-sm text-muted-foreground mb-1">
                {score >= 90
                  ? "Excellent"
                  : score >= 70
                    ? "Good"
                    : score >= 50
                      ? "Fair"
                      : "Keep Practicing"}
              </span>
            </div>
            <Progress value={score} className="h-2" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback}
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => {
                  setScore(null);
                  setTranscript("");
                  setFeedback("");
                }}
                variant="outline"
                className="flex-1"
                data-ocid="speech_exercise.secondary_button"
              >
                Try Again
              </Button>
              {idx + 1 < (exercises?.length ?? 0) && (
                <Button
                  size="sm"
                  onClick={() =>
                    navigate({ to: `/speech/exercise/${idx + 1}` })
                  }
                  className="flex-1 gradient-primary text-white border-0"
                  data-ocid="speech_exercise.primary_button"
                >
                  Next Exercise
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
