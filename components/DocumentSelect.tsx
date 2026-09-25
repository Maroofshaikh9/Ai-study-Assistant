"use client";

type Note = { id: string; filename: string };

export default function DocumentSelect({
  notes,
  value,
  onChange,
}: {
  notes: Note[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Upload a PDF in My Notes first, then come back here.
      </p>
    );
  }

  return (
    <label className="block text-sm">
      <span className="text-slate-600">Selected document</span>
      <select
        className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {notes.map((note) => (
          <option key={note.id} value={note.id}>
            {note.filename}
          </option>
        ))}
      </select>
    </label>
  );
}
