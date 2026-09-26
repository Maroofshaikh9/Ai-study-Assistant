import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyMate - AI-Powered Academic Study Assistant",
  description:
    "Accelerate your learning. Upload lecture notes, generate crystal-clear AI summaries, practice interactive quizzes, master flashcards, and chat with your personal AI study tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${plusJakarta.className} min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-brand-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
