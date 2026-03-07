import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Info,
  Mic,
  TrendingUp,
  Volume2,
  Workflow,
} from "lucide-react";
import React from "react";
import { useEffect } from "react";
import ApprovalGate from "../components/ApprovalGate";
import { useDemo } from "../contexts/DemoContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFetchSpeechExercises } from "../hooks/useQueries";

// ─── Info accordion data ──────────────────────────────────────────────────────

const whyPoints = [
  "Difficulty pronouncing words clearly",
  "Unclear or slurred speech",
  "Slow speaking ability",
  "Loss of fluency after neurological events",
];

const whyBarriers = [
  { icon: "💰", label: "High treatment cost" },
  { icon: "🏥", label: "Long travel distance to clinic" },
  { icon: "🚶", label: "Physical difficulty traveling" },
];

const howItWorksSteps = [
  {
    n: 1,
    title: "System shows a word or sentence",
    detail: 'Example: "HELLO" appears on screen',
  },
  {
    n: 2,
    title: "Patient speaks the word using microphone",
    detail: "The device microphone captures the spoken audio.",
  },
  {
    n: 3,
    title: "System records the voice",
    detail: "Audio is captured and processed for analysis.",
  },
  {
    n: 4,
    title: "AI analyzes the voice",
    detail: "Checks pronunciation accuracy, clarity, and speaking speed.",
  },
  {
    n: 5,
    title: "System compares with correct pronunciation",
    detail: "The spoken audio is matched against the reference model.",
  },
  {
    n: 6,
    title: "System gives a score and feedback",
    detail:
      'Example: "Pronunciation score: 80% — Speak slower and more clearly."',
  },
  {
    n: 7,
    title: "Progress data is stored for tracking",
    detail: "Each session is saved so you can see improvement over time.",
  },
];

const userSteps = [
  "Log into the rehabilitation system",
  "Select Speech Therapy Module",
  'Words or sentences appear on screen (e.g. "Hello", "Good morning", "Thank you")',
  "Repeat the word using the microphone",
  "System analyzes your speech",
  "System gives a score and improvement suggestion",
  "Practice daily and improve over time",
];

// ─── Speech Info Accordion ────────────────────────────────────────────────────

function SpeechInfoPanel() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          About Speech Therapy Module
        </h2>
        <span className="text-xs text-muted-foreground">— click to expand</span>
      </div>

      <Accordion type="single" collapsible defaultValue="">
        {/* Section 1 — Why */}
        <AccordionItem
          value="why"
          data-ocid="speech_module.why_panel"
          className="border border-border/50 rounded-2xl mb-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.155 0.025 248), oklch(0.13 0.022 250))",
          }}
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-chart-1/15 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-3.5 h-3.5 text-chart-1" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground">
                Why This Module?
              </span>
              <Badge
                variant="outline"
                className="text-xs border-chart-1/30 text-chart-1 bg-chart-1/10 font-medium"
              >
                Need & Purpose
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Many rehabilitation patients — especially{" "}
              <strong className="text-foreground">stroke survivors</strong> —
              face significant speech problems after a neurological event:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 mb-5">
              {whyPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-chart-1/6 border border-chart-1/15"
                >
                  <Mic className="w-3.5 h-3.5 text-chart-1 flex-shrink-0" />
                  <span className="text-xs text-foreground/80">{point}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Normally, patients must visit a speech therapist regularly. But
              many cannot attend because of:
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {whyBarriers.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/8 border border-destructive/15"
                >
                  <span>{icon}</span>
                  <span className="text-xs text-foreground/80">{label}</span>
                </div>
              ))}
            </div>

            <div
              className="p-4 rounded-xl border border-primary/20"
              style={{ background: "oklch(0.72 0.17 185 / 0.06)" }}
            >
              <p className="text-sm font-semibold text-primary mb-1 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                The Solution
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This module allows patients to{" "}
                <strong className="text-foreground">
                  practice speech therapy from home using AI
                </strong>
                . It acts like a virtual speech trainer — available 24/7, at
                zero cost, and without any travel required.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2 — How It Works */}
        <AccordionItem
          value="how"
          data-ocid="speech_module.how_panel"
          className="border border-border/50 rounded-2xl mb-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.155 0.025 248), oklch(0.13 0.022 250))",
          }}
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Workflow className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground">
                How the System Works
              </span>
              <Badge
                variant="outline"
                className="text-xs border-primary/30 text-primary bg-primary/10 font-medium"
              >
                AI Analysis
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              This module uses{" "}
              <strong className="text-foreground">
                voice recognition and speech analysis AI
              </strong>{" "}
              to evaluate pronunciation in real time:
            </p>
            <div className="space-y-3">
              {howItWorksSteps.map(({ n, title, detail }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{n}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3 — How to Use */}
        <AccordionItem
          value="steps"
          data-ocid="speech_module.steps_panel"
          className="border border-border/50 rounded-2xl mb-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.155 0.025 248), oklch(0.13 0.022 250))",
          }}
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-chart-2/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground">
                How to Use This Module
              </span>
              <Badge
                variant="outline"
                className="text-xs border-chart-2/30 text-chart-2 bg-chart-2/10 font-medium"
              >
                User Guide
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Follow these simple steps each session to get the most out of your
              speech therapy practice:
            </p>
            <div className="space-y-2.5">
              {userSteps.map((step, stepIdx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: ordered steps list
                  key={stepIdx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-chart-2/6 border border-chart-2/15"
                >
                  <div className="w-5 h-5 rounded-full bg-chart-2/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-chart-2">
                      {stepIdx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4 — Example Scenario */}
        <AccordionItem
          value="example"
          data-ocid="speech_module.example_panel"
          className="border border-border/50 rounded-2xl mb-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.155 0.025 248), oklch(0.13 0.022 250))",
          }}
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-chart-4/15 flex items-center justify-center flex-shrink-0">
                <Info className="w-3.5 h-3.5 text-chart-4" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground">
                Real Example Scenario
              </span>
              <Badge
                variant="outline"
                className="text-xs border-chart-4/30 text-chart-4 bg-chart-4/10 font-medium"
              >
                Case Study
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              A <strong className="text-foreground">stroke patient</strong>{" "}
              cannot pronounce words clearly after their recovery.
            </p>

            <div className="space-y-3">
              {/* System prompt */}
              <div
                className="p-4 rounded-xl border border-primary/20"
                style={{ background: "oklch(0.72 0.17 185 / 0.07)" }}
              >
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
                  System asks the patient to say:
                </p>
                <p className="text-2xl font-display font-bold text-foreground tracking-widest">
                  "Good Morning"
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mic className="w-3.5 h-3.5 text-primary" />
                  Patient speaks into microphone
                  <ArrowRight className="w-3.5 h-3.5" />
                  AI analyzes speech
                </div>
              </div>

              {/* Feedback */}
              <div
                className="p-4 rounded-xl border border-chart-4/25"
                style={{ background: "oklch(0.78 0.17 55 / 0.08)" }}
              >
                <p className="text-xs text-chart-4 font-semibold uppercase tracking-wider mb-3">
                  System feedback:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium w-28 flex-shrink-0">
                      Pronunciation Score:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full w-[70%] rounded-full bg-chart-4" />
                      </div>
                      <span className="text-sm font-bold font-mono text-chart-4">
                        70%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground font-medium w-28 flex-shrink-0 pt-0.5">
                      Suggestion:
                    </span>
                    <p className="text-sm text-foreground italic">
                      "Try to pronounce 'morning' more clearly — slow down and
                      emphasize each syllable."
                    </p>
                  </div>
                </div>
              </div>

              {/* Outcome */}
              <div className="p-3.5 rounded-xl border border-chart-2/25 bg-chart-2/8">
                <p className="text-sm text-chart-2 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  With daily practice, the score improves from 70% toward 100%.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SpeechModule() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { t } = useLanguage();
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
                {t("module.speech")}
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

        {/* Rich Info Accordion */}
        <SpeechInfoPanel />

        {/* Quick How-it-works banner */}
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
          <Volume2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Quick Start</p>
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
