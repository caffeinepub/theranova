import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Brain,
  Eye,
  Gamepad2,
  Heart,
  Loader2,
  Mic,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import React, { useEffect } from "react";
import LanguageSelector from "../components/LanguageSelector";
import { useDemo } from "../contexts/DemoContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const featureCards = [
  {
    icon: Mic,
    labelKey: "module.speech",
    desc: "AI-powered pronunciation training and voice recognition exercises",
    borderColor: "border-chart-1",
    iconBg: "bg-chart-1/15",
    iconColor: "text-chart-1",
    glowColor: "shadow-[0_0_20px_oklch(0.72_0.17_185_/_0.25)]",
  },
  {
    icon: Gamepad2,
    labelKey: "module.motor",
    desc: "Gamified hand and finger coordination rehabilitation games",
    borderColor: "border-chart-2",
    iconBg: "bg-chart-2/15",
    iconColor: "text-chart-2",
    glowColor: "shadow-[0_0_20px_oklch(0.68_0.18_155_/_0.25)]",
  },
  {
    icon: Eye,
    labelKey: "module.eye",
    desc: "Hands-free dwell-to-click interaction for full accessibility",
    borderColor: "border-chart-3",
    iconBg: "bg-chart-3/15",
    iconColor: "text-chart-3",
    glowColor: "shadow-[0_0_20px_oklch(0.68_0.22_280_/_0.25)]",
  },
  {
    icon: Video,
    labelKey: "module.telerehab",
    desc: "Remote monitoring and live sessions with your therapist",
    borderColor: "border-chart-4",
    iconBg: "bg-chart-4/15",
    iconColor: "text-chart-4",
    glowColor: "shadow-[0_0_20px_oklch(0.78_0.17_55_/_0.25)]",
  },
];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const orbVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { enterDemoMode } = useDemo();
  const { t } = useLanguage();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, navigate]);

  const isLoggingIn = loginStatus === "logging-in";

  const handleDemo = () => {
    enterDemoMode();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient gradient orbs — decorative background depth */}
      <motion.div
        variants={orbVariants}
        initial="hidden"
        animate="visible"
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        {/* Primary teal orb — top right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.17 185 / 0.12) 0%, oklch(0.62 0.2 240 / 0.06) 50%, transparent 75%)",
            filter: "blur(40px)",
          }}
        />
        {/* Electric blue orb — bottom left */}
        <div
          className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.2 240 / 0.10) 0%, oklch(0.68 0.22 280 / 0.05) 55%, transparent 75%)",
            filter: "blur(50px)",
          }}
        />
        {/* Subtle violet orb — center */}
        <div
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.68 0.22 280 / 0.06) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        {/* Grid overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.72 0.17 185) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.17 185) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* Nav bar */}
      <header className="relative z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center teal-glow">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gradient tracking-tight">
              TheraNova
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Language selector */}
            <LanguageSelector />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-success" />
              <span className="hidden sm:inline">System Online</span>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main hero */}
      <main className="flex-1 relative z-10 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 w-full">
          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-16 items-center">
            {/* Left: Hero copy + feature cards */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              {/* Tag line */}
              <motion.div variants={fadeUp} className="mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/25 px-3.5 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Rehabilitation Platform
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              >
                <span className="text-foreground">Your Path to</span>
                <br />
                <span className="text-gradient">Full Recovery</span>
                <br />
                <span className="text-foreground">Starts Here.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-lg leading-relaxed max-w-xl mb-10"
              >
                Intelligent rehabilitation combining AI therapy, gamification,
                and remote care — designed to help stroke survivors and
                rehabilitation patients recover from home.
              </motion.p>

              {/* Feature cards */}
              <motion.div
                variants={stagger}
                className="grid sm:grid-cols-2 gap-3"
              >
                {featureCards.map(
                  ({
                    icon: Icon,
                    labelKey,
                    desc,
                    borderColor,
                    iconBg,
                    iconColor,
                    glowColor,
                  }) => (
                    <motion.div
                      key={labelKey}
                      variants={fadeUp}
                      whileHover={{ scale: 1.02 }}
                      className={`group flex items-start gap-3.5 p-4 rounded-2xl bg-card border ${borderColor}/30 hover:${borderColor}/60 ${glowColor} transition-all duration-300`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm text-foreground mb-0.5">
                          {t(labelKey)}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </motion.div>
                  ),
                )}
              </motion.div>

              {/* Social proof — India languages */}
              <motion.div
                variants={fadeUp}
                className="mt-6 flex items-center gap-3 flex-wrap"
              >
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-primary/20"
                  style={{ background: "oklch(0.72 0.17 185 / 0.06)" }}
                >
                  <span className="text-xl leading-none">🇮🇳</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      Trusted across India
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      Available in 13 Indian languages
                    </p>
                  </div>
                  <span className="ml-1 text-xs font-bold text-primary bg-primary/12 border border-primary/25 px-2 py-0.5 rounded-full">
                    13 langs
                  </span>
                </div>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeUp}
                className="mt-5 flex flex-wrap gap-5"
              >
                {[
                  { tag: "AI-Powered", icon: Sparkles, color: "text-primary" },
                  { tag: "No Hardware", icon: Zap, color: "text-chart-2" },
                  { tag: "Free to Try", icon: Heart, color: "text-chart-3" },
                  {
                    tag: "Secure & Private",
                    icon: ShieldCheck,
                    color: "text-chart-4",
                  },
                ].map(({ tag, icon: TagIcon, color }) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <TagIcon className={`w-3.5 h-3.5 ${color}`} />
                    {tag}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Login card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            >
              {/* Card with subtle teal border glow */}
              <div className="relative">
                {/* Glow backdrop */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-60 pointer-events-none"
                  style={{
                    boxShadow:
                      "0 0 60px oklch(0.72 0.17 185 / 0.15), 0 0 120px oklch(0.62 0.2 240 / 0.08)",
                  }}
                />

                <div className="relative bg-card border border-border/60 rounded-3xl p-8 shadow-card-hover backdrop-blur-sm">
                  {/* Logo */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block mb-5">
                      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto animate-float teal-glow">
                        <Brain className="w-9 h-9 text-white" />
                      </div>
                      {/* Pulse ring */}
                      <div className="absolute inset-0 rounded-2xl animate-pulse-ring opacity-50" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1.5">
                      Welcome to{" "}
                      <span className="text-gradient">TheraNova</span>
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                      Sign in to continue your healing journey, or explore all
                      modules instantly in demo mode.
                    </p>
                  </div>

                  {/* Sign in button */}
                  <Button
                    data-ocid="login.primary_button"
                    onClick={login}
                    disabled={isLoggingIn || isInitializing}
                    className="w-full h-12 gradient-primary text-white border-0 font-bold text-sm rounded-xl hover:opacity-90 transition-all duration-200"
                    style={{
                      boxShadow:
                        "0 4px 24px -2px oklch(0.72 0.17 185 / 0.4), 0 0 0 1px oklch(0.72 0.17 185 / 0.2)",
                    }}
                  >
                    {isLoggingIn || isInitializing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        {t("btn.signin")} with Internet Identity
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="my-5 flex items-center gap-3">
                    <div className="flex-1 h-px bg-border/60" />
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      or
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>

                  {/* Demo button — prominent teal outline */}
                  <Button
                    data-ocid="login.demo_button"
                    onClick={handleDemo}
                    className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 border-glow"
                    style={{
                      background: "oklch(0.72 0.17 185 / 0.08)",
                      border: "1px solid oklch(0.72 0.17 185 / 0.45)",
                      color: "oklch(0.72 0.17 185)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(0.72 0.17 185 / 0.14)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(0.72 0.17 185 / 0.08)";
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    {t("btn.demo")} — No Login Required
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    All 4 modules unlocked instantly — no account needed
                  </p>

                  {/* Security note */}
                  <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Secured by Internet Identity — your health data stays
                      private and decentralized on the Internet Computer.
                    </p>
                  </div>

                  {/* Module count pill */}
                  <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    {[
                      { count: "4", label: "Modules" },
                      { count: "25+", label: "Exercises" },
                      { count: "24/7", label: "AI Support" },
                    ].map(({ count, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <span className="font-display font-bold text-base text-foreground">
                          {count}
                        </span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 bg-background/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="font-display font-semibold text-foreground text-xs">
              TheraNova
            </span>
            <span className="text-xs">· © {new Date().getFullYear()}</span>
          </div>
          <p className="flex items-center gap-1.5 text-xs">
            Built with <Heart className="w-3 h-3 text-primary fill-primary" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "theranova")}`}
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
