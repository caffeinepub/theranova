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
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Info,
  Settings,
  Trash2,
  Volume2,
} from "lucide-react";
import React, { useState, useCallback } from "react";
import { useEffect } from "react";
import VirtualKeyboard from "../components/VirtualKeyboard";
import { useDemo } from "../contexts/DemoContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function EyeControlModule() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isDemoMode } = useDemo();

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
      setComposedText((t) => t.slice(0, -1));
    } else if (key === "SPACE" || key === " ") {
      setComposedText((t) => `${t} `);
    } else {
      setComposedText((t) => t + key);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Eye Control
            </h1>
            <p className="text-muted-foreground text-sm">
              Hands-free interaction system
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

      {/* Disclaimer */}
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
