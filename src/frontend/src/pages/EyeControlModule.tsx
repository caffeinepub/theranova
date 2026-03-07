import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Eye,
  HelpCircle,
  Info,
  Navigation2,
  Settings,
  Trash2,
  Users,
  Volume2,
  Zap,
} from "lucide-react";
import React, { useState, useCallback } from "react";
import { useEffect } from "react";
import VirtualKeyboard from "../components/VirtualKeyboard";
import { useDemo } from "../contexts/DemoContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ─── Who Can Use This — user type cards ──────────────────────────────────────

const userTypes = [
  {
    icon: AlertCircle,
    title: "Paralysis Patients",
    desc: "Cannot move hands or legs. Eye movement remains one of the few controllable body actions.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/25",
  },
  {
    icon: Zap,
    title: "Stroke Survivors",
    desc: "Some stroke patients permanently lose hand movement but retain full eye control.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    border: "border-chart-1/25",
  },
  {
    icon: Eye,
    title: "ALS Patients",
    desc: "ALS progressively removes the ability to speak or move the body. Eye control is often the last mobility retained.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/25",
  },
  {
    icon: HelpCircle,
    title: "Spinal Cord Injury",
    desc: "Patients with spinal cord injuries cannot use keyboard or mouse but can control the system through eye movements.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/25",
  },
  {
    icon: Users,
    title: "Severe Motor Disabilities",
    desc: "Any patient whose only reliable movement is their eyes can use this module to communicate and operate the system.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/25",
  },
];

// ─── Detection Components data ───────────────────────────────────────────────

const detectionComponents = [
  {
    icon: Camera,
    title: "Camera (Webcam)",
    desc: "Captures the user's face and eyes in real time, providing continuous video frames for analysis.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    border: "border-chart-1/25",
  },
  {
    icon: Eye,
    title: "Eye Detection Algorithm",
    desc: "Detects the position of the eye region within each video frame using computer vision.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/25",
  },
  {
    icon: Crosshair,
    title: "Pupil Tracking",
    desc: "Tracks the pupil (the black part of the eye) and calculates its center position precisely.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/25",
  },
  {
    icon: Navigation2,
    title: "Gaze Estimation",
    desc: "Calculates which direction the user is looking based on pupil position relative to the eye corners.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/25",
  },
];

// ─── Technologies Used data ───────────────────────────────────────────────────

const techBadges = [
  {
    label: "Computer Vision",
    color: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  },
  {
    label: "Eye Tracking Algorithms",
    color: "bg-primary/15 text-primary border-primary/30",
  },
  { label: "OpenCV", color: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  {
    label: "Dlib Facial Landmarks",
    color: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  },
  {
    label: "Machine Learning",
    color: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  },
];

// ─── Dwell Example steps ──────────────────────────────────────────────────────

const dwellExampleSteps = [
  {
    num: 1,
    text: "User looks at letter",
    highlight: "A",
    suffix: " on the screen",
  },
  { num: 2, text: "Camera detects", highlight: "eye direction", suffix: "" },
  { num: 3, text: "Cursor moves to", highlight: "A", suffix: "" },
  {
    num: 4,
    text: "User stares for",
    highlight: "2 seconds",
    suffix: " (dwell time)",
  },
  {
    num: 5,
    text: "System automatically",
    highlight: "selects A",
    suffix: "",
    success: true,
  },
];

// ─── Pupil direction mapping ──────────────────────────────────────────────────

const pupilDirections = [
  { pupil: "Center", gaze: "Look straight", icon: Crosshair },
  { pupil: "Left", gaze: "Looking left", icon: ArrowLeft },
  { pupil: "Right", gaze: "Looking right", icon: ArrowRight },
  { pupil: "Up", gaze: "Looking up", icon: ArrowUp },
  { pupil: "Down", gaze: "Looking down", icon: ArrowDown },
];

// ─── Cursor direction mapping ─────────────────────────────────────────────────

const cursorDirections = [
  { look: "Look left", cursor: "Cursor moves left", icon: ArrowLeft },
  { look: "Look right", cursor: "Cursor moves right", icon: ArrowRight },
  { look: "Look up", cursor: "Cursor moves up", icon: ArrowUp },
  { look: "Look down", cursor: "Cursor moves down", icon: ArrowDown },
];

// ─── Info Panel ───────────────────────────────────────────────────────────────

function EyeInfoPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/8 transition-all duration-200 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              About This Module — Eye-Controlled Interaction
            </p>
            <p className="text-xs text-muted-foreground">
              Why it exists, how it works, and who benefits
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary font-medium hidden sm:inline">
            {isOpen ? "Hide info" : "Learn more"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-primary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-primary" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 animate-fade-in">
          <Tabs defaultValue="why">
            <TabsList className="w-full h-11 mb-5 grid grid-cols-3 rounded-xl">
              <TabsTrigger
                value="why"
                data-ocid="eye_module.why_tab"
                className="rounded-lg text-sm font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                Why This
              </TabsTrigger>
              <TabsTrigger
                value="how"
                data-ocid="eye_module.how_tab"
                className="rounded-lg text-sm font-medium"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                How It Works
              </TabsTrigger>
              <TabsTrigger
                value="who"
                data-ocid="eye_module.who_tab"
                className="rounded-lg text-sm font-medium"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Who Can Use
              </TabsTrigger>
            </TabsList>

            {/* Why Tab */}
            <TabsContent value="why" className="space-y-4">
              <div
                className="rounded-2xl p-5 border border-border/60"
                style={{
                  background:
                    "linear-gradient(145deg, oklch(0.16 0.025 248), oklch(0.13 0.022 250))",
                }}
              >
                <h3 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-chart-3 inline-block" />
                  The Core Problem
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Some rehabilitation patients{" "}
                  <strong className="text-foreground">
                    cannot move their hands, legs, or body
                  </strong>{" "}
                  because of severe disabilities. This means they cannot use a
                  keyboard, mouse, or touch screen — leaving them unable to
                  communicate or operate a computer normally.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 mb-4">
                  {[
                    "Stroke patients with paralysis",
                    "Paralysis patients",
                    "Spinal cord injury patients",
                    "ALS patients",
                  ].map((example) => (
                    <div
                      key={example}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-chart-3/8 border border-chart-3/15"
                    >
                      <Eye className="w-3.5 h-3.5 text-chart-3 flex-shrink-0" />
                      <span className="text-xs text-foreground/80">
                        {example}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="p-4 rounded-xl border border-primary/20"
                  style={{ background: "oklch(0.72 0.17 185 / 0.06)" }}
                >
                  <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    The Solution: Eye Tracking Technology
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The system allows the patient to control the computer using{" "}
                    <strong className="text-foreground">
                      only their eye movements
                    </strong>
                    . Most patients — even those with severe motor disabilities
                    — can still move their eyes, making this the most accessible
                    input method available.
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {[
                      "Communicate with caregivers and therapists",
                      "Use the rehabilitation system independently",
                      "Perform therapy exercises hands-free",
                    ].map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* How It Works Tab */}
            <TabsContent value="how" className="space-y-4">
              <div
                className="rounded-2xl p-5 border border-border/60 space-y-7"
                style={{
                  background:
                    "linear-gradient(145deg, oklch(0.16 0.025 248), oklch(0.13 0.022 250))",
                }}
              >
                {/* ── Section 1: What Detects Eye Movement ── */}
                <div>
                  <h3 className="font-display font-bold text-base text-foreground mb-1 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-chart-1 inline-block" />
                    What Detects Eye Movement
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Four core components work together to track and interpret
                    gaze in real time.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detectionComponents.map(
                      ({ icon: Icon, title, desc, color, bg, border }, idx) => (
                        <div
                          key={title}
                          data-ocid={`eye_module.detection_component.${idx + 1}`}
                          className={`p-4 rounded-xl border ${bg} ${border} flex items-start gap-3`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className={`w-4 h-4 ${color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">
                              {title}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {desc}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* ── Section 2: Step-by-Step Working ── */}
                <div>
                  <h3 className="font-display font-bold text-base text-foreground mb-1 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                    Step-by-Step Working
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    How the system processes eye movement from camera capture to
                    cursor action.
                  </p>
                  <div className="space-y-3">
                    {/* Step 1 */}
                    <div
                      data-ocid="eye_module.how_step.1"
                      className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/40"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          1
                        </span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-foreground mb-0.5">
                          Camera Captures Face
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          A webcam records the user's face and eyes
                          continuously.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div
                      data-ocid="eye_module.how_step.2"
                      className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/40"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          2
                        </span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-foreground mb-0.5">
                          Eye Detection
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Using computer vision (like{" "}
                          <strong className="text-foreground">OpenCV</strong>),
                          the system detects the eye region in the video frame.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div
                      data-ocid="eye_module.how_step.3"
                      className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/40"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          3
                        </span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-foreground mb-0.5">
                          Pupil Detection
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          The system locates and finds the center of the pupil
                          within the eye region.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 — with pupil direction table */}
                    <div
                      data-ocid="eye_module.how_step.4"
                      className="p-3 rounded-xl bg-card/60 border border-border/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            4
                          </span>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-foreground mb-0.5">
                            Eye Direction Calculation
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                            The system checks where the pupil is located inside
                            the eye to determine gaze direction.
                          </p>
                          {/* Pupil direction mini-table */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {pupilDirections.map(
                              ({ pupil, gaze, icon: DirIcon }) => (
                                <div
                                  key={pupil}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15"
                                >
                                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <DirIcon className="w-3 h-3 text-primary" />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Pupil{" "}
                                    <strong className="text-foreground font-semibold">
                                      {pupil}
                                    </strong>
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                                  <span className="text-xs text-primary font-medium">
                                    {gaze}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 5 — with cursor direction mapping */}
                    <div
                      data-ocid="eye_module.how_step.5"
                      className="p-3 rounded-xl bg-card/60 border border-border/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            5
                          </span>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-foreground mb-0.5">
                            Cursor Movement
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                            The software converts eye direction into cursor
                            movement — no hands required.
                          </p>
                          {/* Cursor direction mapping */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {cursorDirections.map(
                              ({ look, cursor, icon: CurIcon }) => (
                                <div
                                  key={look}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-chart-2/5 border border-chart-2/15"
                                >
                                  <div className="w-6 h-6 rounded-md bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                                    <CurIcon className="w-3 h-3 text-chart-2" />
                                  </div>
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {look}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                                  <span className="text-xs text-chart-2 font-semibold">
                                    {cursor}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Technologies Used ── */}
                <div>
                  <h3 className="font-display font-bold text-base text-foreground mb-1 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-chart-4 inline-block" />
                    Technologies Used
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Core technologies that power eye-tracking and gaze
                    estimation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {techBadges.map(({ label, color }, idx) => (
                      <span
                        key={label}
                        data-ocid={`eye_module.tech_badge.${idx + 1}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Section 4: Dwell Example — Selecting Letter A ── */}
                <div
                  data-ocid="eye_module.dwell_example.panel"
                  className="rounded-xl border border-primary/20 overflow-hidden"
                  style={{ background: "oklch(0.72 0.17 185 / 0.05)" }}
                >
                  <div className="px-4 pt-4 pb-3 border-b border-primary/15">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Dwell Example — Selecting Letter A
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Watch how a single letter gets selected using only gaze
                      and dwell time.
                    </p>
                  </div>
                  <div className="p-4">
                    {/* Vertical step flow */}
                    <div className="space-y-2">
                      {dwellExampleSteps.map(
                        ({ num, text, highlight, suffix, success }, idx) => (
                          <React.Fragment key={num}>
                            <div
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                                success
                                  ? "bg-chart-2/12 border-chart-2/35 shadow-[0_0_12px_oklch(0.68_0.18_155_/_0.18)]"
                                  : "bg-card/50 border-border/40"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                                  success
                                    ? "bg-chart-2/20 border border-chart-2/40 text-chart-2"
                                    : "bg-primary/15 border border-primary/25 text-primary"
                                }`}
                              >
                                {success ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  num
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {text}{" "}
                                <strong
                                  className={`font-bold ${success ? "text-chart-2" : "text-foreground"}`}
                                >
                                  {highlight}
                                </strong>
                                {suffix}
                              </p>
                            </div>
                            {idx < dwellExampleSteps.length - 1 && (
                              <div className="flex justify-center">
                                <ArrowDown className="w-3.5 h-3.5 text-muted-foreground/40" />
                              </div>
                            )}
                          </React.Fragment>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Section 5: HELLO example box (preserved) ── */}
                <div
                  className="p-4 rounded-xl border border-chart-2/25"
                  style={{ background: "oklch(0.68 0.18 155 / 0.07)" }}
                >
                  <p className="text-xs font-semibold text-chart-2 uppercase tracking-wider mb-2">
                    Example
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {(["H", "E", "L1", "L2", "O"] as const).map((key) => (
                      <span
                        key={key}
                        className="w-8 h-8 rounded-lg bg-chart-2/15 border border-chart-2/30 flex items-center justify-center text-sm font-bold font-mono text-chart-2"
                      >
                        {key.replace(/[0-9]/g, "")}
                      </span>
                    ))}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/25 text-xs font-bold text-primary">
                      "HELLO" spoken aloud
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Patient looks at each letter → system builds the word → text
                    is converted to speech automatically.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Who Can Use Tab */}
            <TabsContent value="who" className="space-y-4">
              <div
                className="rounded-2xl p-5 border border-border/60"
                style={{
                  background:
                    "linear-gradient(145deg, oklch(0.16 0.025 248), oklch(0.13 0.022 250))",
                }}
              >
                <h3 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-chart-4 inline-block" />
                  Eligible Users
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userTypes.map(
                    ({ icon: Icon, title, desc, color, bg, border }) => (
                      <div
                        key={title}
                        className={`p-4 rounded-xl border ${bg} ${border}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}
                        >
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1.5">
                          {title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    ),
                  )}
                </div>
                <div
                  className="mt-4 p-4 rounded-xl border border-primary/20"
                  style={{ background: "oklch(0.72 0.17 185 / 0.06)" }}
                >
                  <p className="text-sm text-foreground font-medium mb-1">
                    Key insight
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Without this module, severely disabled patients cannot use
                    the rehabilitation system independently. Eye-controlled
                    interaction is the bridge that gives them autonomy,
                    communication, and access to therapy — even when every other
                    input method is unavailable.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EyeControlModule() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();
  const { t } = useLanguage();

  const [dwellEnabled, setDwellEnabled] = useState(false);
  const [dwellTime, setDwellTime] = useState(1500); // ms
  const [composedText, setComposedText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!identity && !isDemoMode) navigate({ to: "/" });
  }, [identity, isDemoMode, navigate]);

  const handleKey = useCallback((key: string) => {
    if (key === "BACK") {
      setComposedText((text) => text.slice(0, -1));
    } else if (key === "SPACE" || key === " ") {
      setComposedText((text) => `${text} `);
    } else {
      setComposedText((text) => text + key);
    }
  }, []);

  const handleSpeak = () => {
    if (!composedText.trim()) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(composedText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synth.speak(utterance);
  };

  const handleClear = () => {
    setComposedText("");
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const dwellSeconds = (dwellTime / 1000).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t("module.eye")}
            </h1>
            <p className="text-muted-foreground text-sm">
              Hands-free interaction system for accessibility
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings((s) => !s)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
          {showSettings ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Rich Info Panel — collapsible, always shown at top */}
      <EyeInfoPanel />

      {/* Hardware Disclaimer */}
      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Eye-Tracking Hardware Note
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This module uses your mouse cursor as a proxy for gaze input. If you
            have eye-tracking hardware (e.g., Tobii, EyeTech), map it to your
            system cursor to enable full hands-free control. Enable{" "}
            <strong>Dwell-to-Click</strong> below to activate gaze-based
            selection.
          </p>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">
              Interaction Settings
            </CardTitle>
            <CardDescription>Configure dwell-to-click behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Dwell Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dwell-toggle" className="font-medium">
                  Dwell-to-Click
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hover over a key for {dwellSeconds}s to select it
                </p>
              </div>
              <div className="flex items-center gap-2">
                {dwellEnabled && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
                <Switch
                  id="dwell-toggle"
                  checked={dwellEnabled}
                  onCheckedChange={setDwellEnabled}
                />
              </div>
            </div>

            {/* Dwell Time Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Dwell Time</Label>
                <span className="text-sm font-mono text-primary font-semibold">
                  {dwellSeconds}s
                </span>
              </div>
              <Slider
                min={500}
                max={3000}
                step={100}
                value={[dwellTime]}
                onValueChange={([val]) => setDwellTime(val)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5s (fast)</span>
                <span>3.0s (slow)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dwell Status Banner */}
      {dwellEnabled && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2">
          <Eye className="w-4 h-4 text-success" />
          <p className="text-sm text-success font-medium">
            Dwell-to-Click active — hover over keys for {dwellSeconds}s to
            select
          </p>
        </div>
      )}

      {/* Text Composition Area */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Composed Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-16 p-4 rounded-lg bg-accent/30 border border-border font-mono text-lg text-foreground mb-4 break-all">
            {composedText || (
              <span className="text-muted-foreground text-base font-sans">
                Start typing using the keyboard below...
              </span>
            )}
            {composedText && <span className="animate-pulse">|</span>}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSpeak}
              disabled={!composedText.trim() || isSpeaking}
              className="flex-1 h-11 gradient-primary text-white border-0 flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              {isSpeaking ? "Speaking..." : "Speak Text"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!composedText}
              className="h-11 px-4"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Virtual Keyboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg">
              Virtual Keyboard
            </CardTitle>
            {dwellEnabled && (
              <Badge variant="secondary" className="text-xs">
                Dwell: {dwellSeconds}s
              </Badge>
            )}
          </div>
          <CardDescription>
            {dwellEnabled
              ? `Hover over a key for ${dwellSeconds}s to select it`
              : "Click keys to type, or enable Dwell-to-Click for hands-free use"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VirtualKeyboard
            onKey={handleKey}
            dwellEnabled={dwellEnabled}
            dwellTime={dwellTime}
          />
        </CardContent>
      </Card>
    </div>
  );
}
