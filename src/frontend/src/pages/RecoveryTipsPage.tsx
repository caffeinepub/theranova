import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Lightbulb, Search, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Tip data ────────────────────────────────────────────────────────────────

type Difficulty = "beginner" | "intermediate" | "advanced";
type Category = "speech" | "motor" | "eyeControl" | "teleRehab" | "general";

interface Tip {
  id: string;
  category: Category;
  title: string;
  body: string;
  difficulty: Difficulty;
}

const TIPS: Tip[] = [
  // Speech – beginner
  {
    id: "sp1",
    category: "speech",
    title: "Slow & Clear Practice",
    body: "Read aloud slowly, focusing on each syllable. Speed is not the goal — clarity is. Even 5 minutes of slow reading each day can rebuild neural pathways.",
    difficulty: "beginner",
  },
  {
    id: "sp2",
    category: "speech",
    title: "Mirror Mouth Exercises",
    body: "Stand in front of a mirror and exaggerate mouth movements as you speak. This strengthens oral muscles and gives you visual feedback on articulation.",
    difficulty: "beginner",
  },
  {
    id: "sp3",
    category: "speech",
    title: "Humming to Warm Up",
    body: "Hum a simple tune for 2 minutes before your speech exercises. Humming activates vocal cords gently, reducing strain during longer practice sessions.",
    difficulty: "beginner",
  },
  // Speech – intermediate
  {
    id: "sp4",
    category: "speech",
    title: "Tongue Twisters Daily",
    body: "Practice one tongue twister per day, gradually increasing speed over a week. Tongue twisters train rapid coordination between tongue, lips, and breath.",
    difficulty: "intermediate",
  },
  {
    id: "sp5",
    category: "speech",
    title: "Record & Replay",
    body: "Record yourself reading a short paragraph and listen back. Noticing your own patterns — hesitations, mispronunciations — is a powerful self-correction tool.",
    difficulty: "intermediate",
  },
  {
    id: "sp6",
    category: "speech",
    title: "Breath Support Exercises",
    body: "Inhale deeply, then count out loud on the exhale (1, 2, 3...). Try to reach 15 without running out of breath. Good breath control stabilises your voice.",
    difficulty: "intermediate",
  },
  // Speech – advanced
  {
    id: "sp7",
    category: "speech",
    title: "Read News Aloud Daily",
    body: "Read a short news article aloud every morning. This combines vocabulary, prosody, and articulation in one realistic exercise.",
    difficulty: "advanced",
  },
  {
    id: "sp8",
    category: "speech",
    title: "Conversational Practice",
    body: "Hold a 5-minute conversation on any topic daily. Real conversations build spontaneous language use, which is the ultimate goal of speech therapy.",
    difficulty: "advanced",
  },
  // Motor – beginner
  {
    id: "mo1",
    category: "motor",
    title: "Gentle Finger Stretches",
    body: "Slowly extend each finger as far as comfortable, hold for 3 seconds, then close your fist. Repeat 10 times per hand. This maintains joint flexibility.",
    difficulty: "beginner",
  },
  {
    id: "mo2",
    category: "motor",
    title: "Stress Ball Squeezes",
    body: "Squeeze a soft stress ball 20 times per hand, morning and evening. This simple exercise builds grip strength progressively without overloading muscles.",
    difficulty: "beginner",
  },
  {
    id: "mo3",
    category: "motor",
    title: "Wrist Rotation Warm-Up",
    body: "Rotate your wrists in slow circles — 10 clockwise, 10 counter-clockwise each. Always warm up before any motor activity to prevent injury.",
    difficulty: "beginner",
  },
  // Motor – intermediate
  {
    id: "mo4",
    category: "motor",
    title: "Coin Pickup Challenge",
    body: "Place several coins on a table and pick them up one at a time with your affected hand. This fine motor task challenges pincer grip and concentration.",
    difficulty: "intermediate",
  },
  {
    id: "mo5",
    category: "motor",
    title: "Threading Exercise",
    body: "Thread large beads or buttons onto a string. Gradually use smaller items as dexterity improves. This directly trains the hand-eye coordination needed for daily tasks.",
    difficulty: "intermediate",
  },
  {
    id: "mo6",
    category: "motor",
    title: "Typing Practice",
    body: "Spend 10 minutes per day typing short sentences. Keyboard use engages all fingers and trains independent finger movement, a key milestone in motor recovery.",
    difficulty: "intermediate",
  },
  // Motor – advanced
  {
    id: "mo7",
    category: "motor",
    title: "Handwriting Drills",
    body: "Write the alphabet slowly with your affected hand, focusing on smooth letter formation. Handwriting is a demanding fine-motor activity that integrates many skills.",
    difficulty: "advanced",
  },
  {
    id: "mo8",
    category: "motor",
    title: "Origami for Dexterity",
    body: "Follow simple origami tutorials to fold paper shapes. Paper folding requires precise, sustained finger control and is an engaging way to advance motor skill.",
    difficulty: "advanced",
  },
  // General – beginner
  {
    id: "ge1",
    category: "general",
    title: "Celebrate Small Wins",
    body: "Recovery is non-linear. Acknowledge every small improvement — a steadier hand, a clearer word — as real progress. Positive reinforcement sustains motivation.",
    difficulty: "beginner",
  },
  {
    id: "ge2",
    category: "general",
    title: "Consistent Sleep Schedule",
    body: "Sleep at the same time each night. The brain consolidates motor and speech memories during deep sleep; irregular sleep slows rehabilitation progress.",
    difficulty: "beginner",
  },
  {
    id: "ge3",
    category: "general",
    title: "Stay Hydrated",
    body: "Drink at least 8 glasses of water daily. Dehydration impairs concentration and muscle performance, both critical to effective therapy sessions.",
    difficulty: "beginner",
  },
  // General – intermediate
  {
    id: "ge4",
    category: "general",
    title: "Mindfulness for Recovery",
    body: "Practice 5 minutes of mindful breathing before each therapy session. Reduced stress lowers muscle tension and opens the brain to learning new movement patterns.",
    difficulty: "intermediate",
  },
  {
    id: "ge5",
    category: "general",
    title: "Set Weekly Goals",
    body: "At the start of each week, set one measurable therapy goal (e.g. complete 5 speech exercises). Specific goals improve adherence and give you a sense of achievement.",
    difficulty: "intermediate",
  },
  // Eye Control – beginner
  {
    id: "ec1",
    category: "eyeControl",
    title: "Reduce Screen Glare",
    body: "Position your screen to avoid reflections and lower brightness to a comfortable level. Eye strain reduces fixation accuracy, which matters most for eye-control interaction.",
    difficulty: "beginner",
  },
  {
    id: "ec2",
    category: "eyeControl",
    title: "Blink Regularly",
    body: "Set a reminder to blink consciously every 20 seconds. Extended focus on a screen reduces blink rate, causing dry eyes that distort gaze tracking.",
    difficulty: "beginner",
  },
  // Tele-Rehab – beginner
  {
    id: "tr1",
    category: "teleRehab",
    title: "Prepare Your Space",
    body: "Before each remote session, ensure good lighting (face the window), a stable internet connection, and a quiet environment. Technical issues reduce session quality.",
    difficulty: "beginner",
  },
  {
    id: "tr2",
    category: "teleRehab",
    title: "Keep a Therapy Journal",
    body: "Write 2-3 notes after each session: what you practised, how it felt, and any questions for your therapist. This makes follow-up sessions more productive.",
    difficulty: "beginner",
  },
  {
    id: "tr3",
    category: "teleRehab",
    title: "Share Your Progress Videos",
    body: "Record short clips of your home exercises and share them with your therapist. Video feedback helps therapists identify subtle technique issues remotely.",
    difficulty: "intermediate",
  },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; colorClass: string; bgClass: string; borderClass: string }
> = {
  speech: {
    label: "Speech Therapy",
    colorClass: "text-chart-1",
    bgClass: "bg-chart-1/10",
    borderClass: "border-chart-1/20",
  },
  motor: {
    label: "Motor Skills",
    colorClass: "text-chart-2",
    bgClass: "bg-chart-2/10",
    borderClass: "border-chart-2/20",
  },
  eyeControl: {
    label: "Eye Control",
    colorClass: "text-chart-3",
    bgClass: "bg-chart-3/10",
    borderClass: "border-chart-3/20",
  },
  teleRehab: {
    label: "Tele-Rehab",
    colorClass: "text-chart-4",
    bgClass: "bg-chart-4/10",
    borderClass: "border-chart-4/20",
  },
  general: {
    label: "General",
    colorClass: "text-accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
  },
};

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; colorClass: string; bgClass: string }
> = {
  beginner: {
    label: "Beginner",
    colorClass: "text-success-foreground",
    bgClass: "bg-success",
  },
  intermediate: {
    label: "Intermediate",
    colorClass: "text-warning-foreground",
    bgClass: "bg-warning",
  },
  advanced: {
    label: "Advanced",
    colorClass: "text-white",
    bgClass: "bg-chart-5",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ─── TipCard ─────────────────────────────────────────────────────────────────

function TipCard({
  tip,
  index,
  expanded,
  onToggle,
}: {
  tip: Tip;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cat = CATEGORY_CONFIG[tip.category];
  const diff = DIFFICULTY_CONFIG[tip.difficulty];

  return (
    <motion.div
      data-ocid={`tips.item.${index + 1}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="rounded-xl overflow-hidden shadow-card card-hover"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.16 0.025 248), oklch(0.13 0.022 250))",
        border: "1px solid oklch(0.28 0.03 245 / 0.6)",
      }}
    >
      <button
        type="button"
        className="w-full text-left p-5"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cat.bgClass} ${cat.colorClass} ${cat.borderClass}`}
          >
            {cat.label}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diff.bgClass} ${diff.colorClass}`}
          >
            {diff.label}
          </span>
        </div>

        {/* Title + toggle */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-semibold text-foreground text-base leading-snug">
            {tip.title}
          </h3>
          <div className="flex-shrink-0 mt-0.5">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border">
                {tip.body}
              </p>
            </motion.div>
          )}
          {!expanded && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
              {tip.body.slice(0, 80)}…
            </p>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterCategory = "all" | Category;

const FILTER_TABS: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "speech", label: "Speech" },
  { value: "motor", label: "Motor Skills" },
  { value: "eyeControl", label: "Eye Control" },
  { value: "teleRehab", label: "Tele-Rehab" },
  { value: "general", label: "General" },
];

export default function RecoveryTipsPage() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const dayOfYear = getDayOfYear();
  const tipOfTheDay = TIPS[dayOfYear % TIPS.length];

  const toggleTip = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredTips = TIPS.filter((tip) => {
    const matchesCategory =
      activeCategory === "all" || tip.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      tip.title.toLowerCase().includes(q) ||
      tip.body.toLowerCase().includes(q) ||
      CATEGORY_CONFIG[tip.category].label.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const todayCat = CATEGORY_CONFIG[tipOfTheDay.category];
  const todayDiff = DIFFICULTY_CONFIG[tipOfTheDay.difficulty];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-8 sm:p-12 shadow-card"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.03 252), oklch(0.16 0.03 245))",
            border: "1px solid oklch(0.72 0.17 185 / 0.15)",
          }}
        >
          {/* Decorative orbs */}
          <div
            className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.17 185 / 0.1) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.62 0.2 240 / 0.1) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                Evidence-Based Guidance
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Recovery Tips & <span className="text-gradient">Guidance</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
              Evidence-based tips to accelerate your rehabilitation journey.
              Browse {TIPS.length} expert-curated tips across all therapy
              modules.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tip of the Day */}
      <motion.div
        data-ocid="tips.tip_of_the_day.card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-6 shadow-card"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.17 185 / 0.09), oklch(0.62 0.2 240 / 0.07))",
            border: "1px solid oklch(0.72 0.17 185 / 0.22)",
          }}
        >
          {/* Left accent stripe */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 gradient-primary rounded-l-2xl"
            style={{ boxShadow: "2px 0 12px oklch(0.72 0.17 185 / 0.5)" }}
          />

          <div className="pl-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="text-sm font-semibold text-foreground">
                Tip of the Day
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ml-1 ${todayCat.bgClass} ${todayCat.colorClass} ${todayCat.borderClass}`}
              >
                {todayCat.label}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${todayDiff.bgClass} ${todayDiff.colorClass}`}
              >
                {todayDiff.label}
              </span>
            </div>

            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              {tipOfTheDay.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tipOfTheDay.body}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6 space-y-4"
      >
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="tips.search_input"
            placeholder="Search tips by keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
            style={{
              background: "oklch(0.16 0.025 248)",
              border: "1px solid oklch(0.28 0.03 245 / 0.7)",
              color: "oklch(0.93 0.012 230)",
            }}
            aria-label="Search recovery tips"
          />
        </div>

        {/* Category tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as FilterCategory)}
        >
          <TabsList
            className="flex flex-wrap gap-1 h-auto p-1 rounded-xl"
            style={{ background: "oklch(0.16 0.025 248)" }}
          >
            {FILTER_TABS.map(({ value, label }) => (
              <TabsTrigger
                data-ocid="tips.category_filter.tab"
                key={value}
                value={value}
                className="rounded-lg text-sm px-3 py-1.5 data-[state=active]:text-primary transition-all"
                style={
                  {
                    // Active styles applied via data attribute in inline style for better dark control
                  }
                }
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {filteredTips.length}
        </span>{" "}
        tip{filteredTips.length !== 1 ? "s" : ""}
        {activeCategory !== "all" &&
          ` in ${CATEGORY_CONFIG[activeCategory as Category]?.label}`}
        {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
      </div>

      {/* Tips Grid */}
      {filteredTips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
          data-ocid="tips.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No tips found
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Try adjusting your search or selecting a different category.
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTips.map((tip, index) => (
              <TipCard
                key={tip.id}
                tip={tip}
                index={index}
                expanded={expandedIds.has(tip.id)}
                onToggle={() => toggleTip(tip.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Footer note */}
      <div className="mt-12 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          These tips complement your personalised therapy sessions.{" "}
          <span className="text-foreground font-medium">
            Always follow your therapist's specific guidance.
          </span>
        </p>
      </div>
    </div>
  );
}

export { TIPS };
export type { Tip, Category, Difficulty };
