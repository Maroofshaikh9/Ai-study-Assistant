import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Page not found</h1>
        <p className="mt-2 text-slate-500">This page does not exist in StudyMate.</p>
        <Link href="/" className="inline-block mt-4 text-brand-700">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
