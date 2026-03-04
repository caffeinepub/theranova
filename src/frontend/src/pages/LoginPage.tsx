import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  Gamepad2,
  Heart,
  Loader2,
  Mic,
  ShieldCheck,
  Video,
} from "lucide-react";
import React, { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: Mic,
    label: "Speech Therapy",
    desc: "AI-powered pronunciation training",
  },
  {
    icon: Gamepad2,
    label: "Motor Skills",
    desc: "Gamified rehabilitation exercises",
  },
  { icon: Eye, label: "Eye Control", desc: "Hands-free interaction system" },
  { icon: Video, label: "Tele-Rehab", desc: "Remote therapist monitoring" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, navigate]);

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1440x480.png"
          alt="TheraNova Platform"
          className="w-full h-48 sm:h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-white/90 font-display font-semibold text-lg">
                TheraNova
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight">
              Your Path to
              <br />
              Recovery Starts Here
            </h1>
            <p className="text-white/80 mt-2 text-sm sm:text-base max-w-md">
              AI-powered rehabilitation platform for speech, motor, and physical
              recovery — from home.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Integrated Rehabilitation Modules
            </h2>
            <p className="text-muted-foreground mb-8">
              One platform combining four powerful therapy modules to support
              your complete recovery journey.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border card-hover"
                >
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-card">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Sign in to continue your rehabilitation journey
                </p>
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="w-full h-12 gradient-primary text-white border-0 font-semibold text-base rounded-xl"
              >
                {isLoggingIn || isInitializing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
                    Connecting...
                  </>
                ) : (
                  "Sign In with Internet Identity"
                )}
              </Button>

              <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-accent/50">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Secured by Internet Identity — your data stays private and
                  decentralized on the Internet Computer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TheraNova. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-primary fill-primary mx-0.5" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "theranove")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
