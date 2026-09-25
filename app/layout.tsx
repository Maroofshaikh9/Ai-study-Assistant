import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyMate - AI Study Assistant",
  description:
    "Upload notes, generate summaries, quizzes, flashcards, and ask study doubts with StudyMate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
