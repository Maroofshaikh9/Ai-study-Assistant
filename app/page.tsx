import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import {
  Sparkles,
  FileText,
  BrainCircuit,
  Layers,
  MessageSquareCode,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  FileCheck,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    badge: "Instant Synthesis",
    title: "AI Document Summary",
    text: "Transform 50-page complex PDF lecture notes and textbooks into crisp, chapter-wise executive summaries and key revision takeaways.",
  },
  {
    icon: BrainCircuit,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
    badge: "Active Testing",
    title: "AI Quiz Generator",
    text: "Test your comprehension before exams with automated multiple-choice quizzes generated directly from your uploaded materials with explanations.",
  },
  {
    icon: Layers,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 text-violet-700 border-violet-200/60",
    badge: "Spaced Repetition",
    title: "3D AI Flashcards",
    text: "Reinforce high-yield terminology, definitions, and formulas using interactive 3D flip flashcards crafted by AI from your syllabus.",
  },
  {
    icon: MessageSquareCode,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 text-amber-700 border-amber-200/60",
    badge: "RAG Study Tutor",
    title: "Document Study Chat",
    text: "Chat directly with your notes. Ask tough doubts, request code breakdowns, or ask for real-world examples with zero hallucination.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload Course PDFs",
    description: "Drag and drop any lecture slides, textbook chapters, or handwritten research notes up to 6MB.",
    icon: FileCheck,
  },
  {
    step: "02",
    title: "High-Speed AI Processing",
    description: "Groq LLaMA 3.1 parses raw content and maps core concepts, formulas, and critical exam topics.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Generate Study Modules",
    description: "Choose your study format: read concise summaries, drill 3D flashcards, or take a timed practice quiz.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Master & Retain",
    description: "Track your quiz score history, clear specific doubts in chat, and walk into exams fully confident.",
    icon: TrendingUp,
  },
];


export default function HomePage() {
  return (
    <div id="home" className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-brand-500 selection:text-white">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-mesh-academic border-b border-slate-200/70">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-400/15 via-cyan-400/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Academic Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-brand-200/80 text-brand-800 shadow-sm shadow-brand-500/10 hover:border-brand-300 transition-colors">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span>B.Sc. Computer Science Capstone Project</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Groq LLaMA 3.1</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Master Your Lecture Notes in{" "}
                <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-teal-500 bg-clip-text text-transparent">
                  Minutes, Not Hours.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                StudyMate turns complex textbook PDFs into concise study summaries, interactive quizzes, 3D active-recall flashcards, and a 24/7 document AI doubt tutor.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-brand-600 via-brand-700 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>Start Studying Free</span>
                  <ArrowRight className="w-4 h-4 text-emerald-100" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-200"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Student Sign In</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Zero Plaintext Passwords</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Encrypted OTP Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Verified PDF Extraction</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating highlight card */}
                <div className="absolute -top-6 -right-6 z-20 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-900/5 animate-pulse-subtle">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Exam Ready</p>
                    <p className="text-[11px] text-slate-500">3x Faster Topic Recall</p>
                  </div>
                </div>

                {/* macOS Mock Window Card */}
                <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
                  {/* Window Bar */}
                  <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-xs">
                      <FileText className="w-3 h-3 text-brand-600" />
                      Operating_Systems_Ch4.pdf
                    </div>
                    <div className="w-12" />
                  </div>

                  {/* Window Content: Live Study Mockup */}
                  <div className="p-5 space-y-4">
                    {/* Simulated Document Summary Card */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-800 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                          Key Takeaways
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          AI Generated
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        • Deadlocks occur when 4 Coffman conditions hold: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
                      </p>
                    </div>

                    {/* Simulated Interactive Quiz Question */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">Q2. Banker&apos;s Algorithm</span>
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/50">
                          Active Question
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Which deadlock strategy uses the Banker&apos;s Algorithm?
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-center">
                          A. Prevention
                        </div>
                        <div className="p-2 rounded-xl bg-brand-600 border border-brand-700 text-white text-center shadow-xs flex items-center justify-center gap-1">
                          <span>B. Avoidance</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Simulated Chat Dialogue */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-700 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        SM
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs text-slate-700 leading-relaxed">
                        Need clarification on semaphore implementation? Ask anytime!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / TIMELINE SECTION */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-wide">
              Seamless Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Dense PDF to Exam Mastery
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Designed specifically for university students to cut down study fatigue and maximize recall efficiency.
            </p>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative group p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 group-hover:text-brand-500 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-brand-700 flex items-center justify-center shadow-xs group-hover:bg-brand-50 group-hover:border-brand-200 transition-all">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 md:py-28 bg-[#f8fafc] border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-wide">
              Intelligent Tools
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Four Core AI Study Pillars
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Every tool works strictly against the notes you provide—no generic, unverified web answers.
            </p>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${feature.bgColor}`}>
                        {feature.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {feature.text}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-700">
                    <span>Try with notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-400/30 text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Ready to Accelerate Your Exam Preparation?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
            Create your account in seconds, upload your lecture materials, and experience your personalized AI study companion today.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-900 bg-white hover:bg-emerald-50 shadow-xl shadow-white/10 hover:-translate-y-0.5 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all"
            >
              <span>Existing Student Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ACADEMIC FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 text-sm text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-xs">
              SM
            </div>
            <span className="font-bold text-slate-800">StudyMate</span>
            <span className="text-xs text-slate-400">• B.Sc. Computer Science Capstone Project</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#home" className="hover:text-brand-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">Workflow</a>
            <Link href="/login" className="hover:text-brand-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
