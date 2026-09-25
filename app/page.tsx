import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const features = [
  {
    title: "AI Summary",
    text: "Turn long PDF notes into a short, readable summary for revision.",
  },
  {
    title: "AI Quiz",
    text: "Practice with multiple-choice questions generated from your notes.",
  },
  {
    title: "AI Flashcards",
    text: "Review key terms and definitions one card at a time.",
  },
  {
    title: "Study Chat",
    text: "Ask doubts about an uploaded document and get answers from the notes.",
  },
];

export default function HomePage() {
  return (
    <div id="home" className="min-h-screen bg-[#f4f7f6]">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold text-brand-700 mb-3">
              B.Sc. Computer Science Mini Project
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
              Study Smarter, Not Harder.
            </h1>
            <p className="mt-4 text-slate-600 max-w-xl">
              StudyMate helps students upload PDF notes, generate AI summaries,
              quizzes and flashcards, and ask doubts using Groq. Simple, secure
              and built for academic use.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="bg-brand-700 text-white px-5 py-2.5 rounded-md"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="border border-brand-700 text-brand-700 px-5 py-2.5 rounded-md"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm font-semibold text-brand-800">What you can do</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>1. Register and log in securely</li>
              <li>2. Upload your class PDF notes</li>
              <li>3. Generate a summary, quiz or flashcards</li>
              <li>4. Chat with StudyMate about that document</li>
            </ul>
          </div>
        </section>

        <section id="features" className="mt-16">
          <h2 className="text-2xl font-bold text-slate-800">Features</h2>
          <p className="mt-2 text-slate-600">
            All AI tools work from the notes you upload. No extra study material
            is required.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="card p-5">
                <h3 className="font-semibold text-brand-800">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mt-16 card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-800">About</h2>
          <p className="mt-3 text-slate-600 max-w-3xl">
            StudyMate is an AI-powered study assistant for students. It uses
            Next.js, MongoDB, NextAuth, bcrypt, pdf-parse and the Groq API. An
            admin panel is included so teachers or project evaluators can view
            users and uploaded notes.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        StudyMate - Academic Mini Project
      </footer>
    </div>
  );
}
