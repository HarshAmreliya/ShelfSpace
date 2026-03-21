"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getErrorMessage } from "@/lib/api-utils";
import {
  BookOpen,
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  Palette,
  Heart,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  List,
  Bell,
  BellOff,
  Globe,
  Lock,
  Sparkles,
  Library,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = "LIGHT" | "DARK" | "SYSTEM";
type ViewMode = "CARD" | "LIST";

interface FormData {
  bio: string;
  website: string;
  isPublic: boolean;
  theme: Theme;
  notificationsEmail: boolean;
  dailyDigest: boolean;
  defaultViewMode: ViewMode;
  favoriteGenres: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "profile",     icon: User,    label: "Profile",    desc: "Tell us about yourself" },
  { id: "preferences", icon: Palette, label: "Preferences", desc: "Customise your experience" },
  { id: "interests",   icon: Heart,   label: "Interests",   desc: "Pick your favourite genres" },
];

const GENRES: { name: string; color: string }[] = [
  { name: "Fiction",     color: "from-amber-400    to-orange-400"  },
  { name: "Non-Fiction", color: "from-sky-400      to-blue-500"    },
  { name: "Mystery",     color: "from-violet-500   to-purple-600"  },
  { name: "Romance",     color: "from-pink-400     to-rose-500"    },
  { name: "Sci-Fi",      color: "from-cyan-400     to-teal-500"    },
  { name: "Fantasy",     color: "from-fuchsia-400  to-purple-500"  },
  { name: "Biography",   color: "from-lime-400     to-green-500"   },
  { name: "History",     color: "from-yellow-400   to-amber-500"   },
  { name: "Self-Help",   color: "from-emerald-400  to-green-500"   },
  { name: "Horror",      color: "from-gray-600     to-slate-700"   },
  { name: "Poetry",      color: "from-rose-400     to-pink-500"    },
  { name: "Comedy",      color: "from-yellow-300   to-orange-400"  },
  { name: "Thriller",    color: "from-red-500      to-rose-600"    },
  { name: "Adventure",   color: "from-orange-400   to-amber-500"   },
  { name: "Drama",       color: "from-indigo-400   to-blue-500"    },
  { name: "Crime",       color: "from-zinc-500     to-gray-600"    },
  { name: "Philosophy",  color: "from-teal-400     to-cyan-500"    },
  { name: "Psychology",  color: "from-purple-400   to-violet-500"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [step, setStep]         = useState(0);
  const [saving, setSaving]     = useState(false);
  const [completed, setCompleted] = useState(false);
  const [form, setForm]         = useState<FormData>({
    bio: "",
    website: "",
    isPublic: true,
    theme: "SYSTEM",
    notificationsEmail: true,
    dailyDigest: true,
    defaultViewMode: "CARD",
    favoriteGenres: [],
  });

  // Navigate to dashboard only after the session JWT is actually updated
  useEffect(() => {
    if (completed && session && !session.isNewUser && !session.needsPreferences) {
      router.push("/dashboard");
    }
  }, [session, completed, router]);

  if (status === "loading") return <LoadingSkeleton />;
  if (status === "unauthenticated") { router.push("/login"); return null; }
  if (session && !session.isNewUser && !session.needsPreferences && !completed) {
    router.push("/dashboard");
    return null;
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "Reader";
  const canProceed = step < 2 || form.favoriteGenres.length >= 3;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGenre(name: string) {
    set(
      "favoriteGenres",
      form.favoriteGenres.includes(name)
        ? form.favoriteGenres.filter((g) => g !== name)
        : [...form.favoriteGenres, name],
    );
  }

  async function handleComplete() {
    try {
      setSaving(true);

      if (form.bio || form.website || !form.isPublic) {
        const body: Record<string, unknown> = { isPublic: form.isPublic };
        if (form["bio"])     body["bio"]     = form["bio"];
        if (form["website"]) body["website"] = form["website"];
        await fetch("/api/user/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme:               form.theme,
          language:            "en",
          notificationsEmail:  form.notificationsEmail,
          dailyDigest:         form.dailyDigest,
          defaultViewMode:     form.defaultViewMode,
        }),
      });

      // Mark completed locally so the useEffect can watch for the session update
      setCompleted(true);

      // Update the JWT — the useEffect above will navigate once the session
      // reflects the change, avoiding the 1-minute redirect loop that happened
      // when we navigated before the cookie was refreshed.
      await update({ isNewUser: false, needsPreferences: false });
    } catch (error) {
      alert(`Could not save preferences: ${getErrorMessage(error)}. Please try again.`);
      setSaving(false);
      setCompleted(false);
    }
  }

  async function handleSkip() {
    try {
      setSaving(true);
      setCompleted(true);
      await update({ isNewUser: false, needsPreferences: false });
    } catch {
      setSaving(false);
      setCompleted(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">

      {/* ── Left sidebar ── */}
      <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 p-10 relative overflow-hidden flex-shrink-0">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-3 mb-12">
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white font-serif">ShelfSpace</span>
        </div>

        {/* headline */}
        <div className="relative z-10 mb-12">
          <h2 className="text-3xl font-bold text-white font-serif leading-snug mb-3">
            Welcome,<br />{firstName}!
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Just a few quick steps to personalise your reading experience.
          </p>
        </div>

        {/* step list */}
        <nav className="relative z-10 space-y-3 flex-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done    = i < step;
            const current = i === step;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  current
                    ? "bg-white/20 backdrop-blur-sm shadow-lg"
                    : done
                    ? "bg-white/10"
                    : "opacity-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    done
                      ? "bg-white text-orange-500"
                      : current
                      ? "bg-white/30 text-white ring-2 ring-white/50"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${current || done ? "text-white" : "text-white/60"}`}>
                    {s.label}
                  </p>
                  <p className={`text-xs ${current || done ? "text-white/70" : "text-white/40"}`}>
                    {s.desc}
                  </p>
                </div>
                {current && <ChevronRight className="w-4 h-4 text-white/60 ml-auto" />}
              </div>
            );
          })}
        </nav>

        {/* features */}
        <div className="relative z-10 mt-8 space-y-3">
          {[
            { icon: Sparkles,  text: "AI-powered recommendations" },
            { icon: Library,   text: "Personal reading library" },
            { icon: TrendingUp, text: "Track your reading goals" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/70 text-xs">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* top bar (mobile logo + progress) */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-amber-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white font-serif">ShelfSpace</span>
          </div>

          {/* step dots */}
          <div className="flex items-center gap-2 mx-auto lg:mx-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i < step
                      ? "w-6 bg-orange-500"
                      : i === step
                      ? "w-8 bg-gradient-to-r from-amber-500 to-orange-500"
                      : "w-2 bg-gray-300 dark:bg-slate-600"
                  }`}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-40"
          >
            Skip setup
          </button>
        </header>

        {/* step content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-xl">

            {/* step 0 — profile */}
            {step === 0 && (
              <StepCard
                icon={<User className="w-6 h-6 text-amber-500" />}
                title="Set up your profile"
                subtitle="Let readers know who you are (all fields are optional)"
              >
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => set("bio", e.target.value)}
                      placeholder="A few words about yourself…"
                      rows={3}
                      maxLength={300}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition resize-none"
                    />
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">
                      {form.bio.length}/300
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                      <input
                        type="url"
                        value={form.website}
                        onChange={(e) => set("website", e.target.value)}
                        placeholder="https://yoursite.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                      Profile visibility
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: true,  icon: Globe, label: "Public",  desc: "Anyone can see your profile" },
                        { value: false, icon: Lock,  label: "Private", desc: "Only you can see your profile" },
                      ].map((opt) => (
                        <button
                          key={String(opt.value)}
                          onClick={() => set("isPublic", opt.value)}
                          className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            form.isPublic === opt.value
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300"
                          }`}
                        >
                          <opt.icon className={`w-5 h-5 ${form.isPublic === opt.value ? "text-amber-500" : "text-gray-400 dark:text-slate-500"}`} />
                          <div>
                            <p className={`font-semibold text-sm ${form.isPublic === opt.value ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-slate-300"}`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepCard>
            )}

            {/* step 1 — preferences */}
            {step === 1 && (
              <StepCard
                icon={<Palette className="w-6 h-6 text-orange-500" />}
                title="Personalise your experience"
                subtitle="Choose how ShelfSpace looks and behaves"
              >
                <div className="space-y-6">
                  {/* theme */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "LIGHT",  icon: Sun,     label: "Light"  },
                        { value: "DARK",   icon: Moon,    label: "Dark"   },
                        { value: "SYSTEM", icon: Monitor, label: "System" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => set("theme", opt.value as Theme)}
                          className={`flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                            form.theme === opt.value
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300"
                          }`}
                        >
                          <opt.icon className={`w-5 h-5 ${form.theme === opt.value ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`} />
                          <span className={`text-xs font-semibold ${form.theme === opt.value ? "text-orange-700 dark:text-orange-400" : "text-gray-600 dark:text-slate-400"}`}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* default view */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Default library view</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "CARD", icon: LayoutGrid, label: "Card grid",  desc: "Browse with cover art" },
                        { value: "LIST", icon: List,       label: "List view",  desc: "Compact and detailed" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => set("defaultViewMode", opt.value as ViewMode)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            form.defaultViewMode === opt.value
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300"
                          }`}
                        >
                          <opt.icon className={`w-5 h-5 flex-shrink-0 ${form.defaultViewMode === opt.value ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`} />
                          <div>
                            <p className={`font-semibold text-sm ${form.defaultViewMode === opt.value ? "text-orange-700 dark:text-orange-400" : "text-gray-700 dark:text-slate-300"}`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* notifications */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Notifications</p>
                    <div className="space-y-3">
                      {[
                        { key: "notificationsEmail" as const, icon: Bell,    label: "Email notifications", desc: "Updates about your activity" },
                        { key: "dailyDigest"        as const, icon: BellOff, label: "Daily digest",        desc: "A summary email each morning" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => set(opt.key, !form[opt.key])}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            form[opt.key]
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300"
                          }`}
                        >
                          <opt.icon className={`w-5 h-5 flex-shrink-0 ${form[opt.key] ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`} />
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${form[opt.key] ? "text-orange-700 dark:text-orange-400" : "text-gray-700 dark:text-slate-300"}`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">{opt.desc}</p>
                          </div>
                          <div className={`w-10 h-6 rounded-full flex items-center transition-all duration-200 flex-shrink-0 ${form[opt.key] ? "bg-orange-500 justify-end" : "bg-gray-200 dark:bg-slate-600 justify-start"}`}>
                            <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepCard>
            )}

            {/* step 2 — interests */}
            {step === 2 && (
              <StepCard
                icon={<Heart className="w-6 h-6 text-red-500" />}
                title="What do you love reading?"
                subtitle={
                  form.favoriteGenres.length < 3
                    ? `Pick at least 3 genres — ${3 - form.favoriteGenres.length} more to go`
                    : `${form.favoriteGenres.length} selected — looking good!`
                }
                {...(form.favoriteGenres.length >= 3 ? { subtitleColor: "text-green-600 dark:text-green-400" } : {})}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {GENRES.map((g) => {
                    const selected = form.favoriteGenres.includes(g.name);
                    return (
                      <button
                        key={g.name}
                        onClick={() => toggleGenre(g.name)}
                        className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 group ${
                          selected
                            ? "border-red-400 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/20 dark:to-orange-500/10 shadow-sm scale-[1.03]"
                            : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-300 hover:scale-[1.02]"
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-white text-xs font-bold leading-none">
                            {g.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className={`text-xs font-medium leading-tight text-center ${selected ? "text-red-700 dark:text-red-300" : "text-gray-600 dark:text-slate-400"}`}>
                          {g.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepCard>
            )}

            {/* navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 disabled:opacity-0 disabled:pointer-events-none transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!canProceed || saving}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Complete setup
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({
  icon,
  title,
  subtitle,
  subtitleColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  subtitleColor?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 dark:border-slate-700/60 p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif">{title}</h2>
          <p className={`text-sm mt-0.5 ${subtitleColor ?? "text-gray-500 dark:text-slate-400"}`}>
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="hidden lg:block lg:w-80 xl:w-96 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500" />
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl p-8 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/2" />
          <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-2/3" />
          <div className="space-y-3 mt-4">
            <div className="h-12 bg-gray-100 dark:bg-slate-700 rounded-xl" />
            <div className="h-12 bg-gray-100 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
