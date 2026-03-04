import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Gamepad2, Loader2, Mic } from "lucide-react";
import React, { useState } from "react";
import { TherapyType } from "../backend";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  open: boolean;
}

const therapyOptions = [
  {
    value: TherapyType.speech,
    label: "Speech Therapy",
    description: "Improve speaking ability and pronunciation",
    icon: Mic,
    color: "text-chart-1",
  },
  {
    value: TherapyType.motorSkills,
    label: "Motor Skills",
    description: "Hand, finger, and body coordination",
    icon: Gamepad2,
    color: "text-chart-2",
  },
  {
    value: TherapyType.cognitivePhysical,
    label: "Cognitive & Physical",
    description: "Combined cognitive and physical exercises",
    icon: Brain,
    color: "text-chart-3",
  },
];

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [selectedTherapy, setSelectedTherapy] = useState<TherapyType | null>(
    null,
  );
  const [step, setStep] = useState<"name" | "therapy">("name");
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleNameNext = () => {
    if (name.trim().length < 2) return;
    setStep("therapy");
  };

  const handleSave = () => {
    if (!selectedTherapy) return;
    saveProfile({
      name: name.trim(),
      role: "patient",
      therapyType: selectedTherapy,
      enrolledModules: [],
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === "name"
              ? "Welcome to TheraNova 👋"
              : "Choose Your Therapy"}
          </DialogTitle>
          <DialogDescription>
            {step === "name"
              ? "Let's set up your profile to personalize your rehabilitation journey."
              : "Select your primary therapy focus. You can always change this later."}
          </DialogDescription>
        </DialogHeader>

        {step === "name" ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                className="h-11"
                autoFocus
              />
            </div>
            <Button
              onClick={handleNameNext}
              disabled={name.trim().length < 2}
              className="w-full h-11 gradient-primary text-white border-0"
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {therapyOptions.map(
              ({ value, label, description, icon: Icon, color }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setSelectedTherapy(value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left min-touch ${
                    selectedTherapy === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-accent/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 ${color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </button>
              ),
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("name")}
                className="flex-1 h-11"
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={!selectedTherapy || isPending}
                className="flex-1 h-11 gradient-primary text-white border-0"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
