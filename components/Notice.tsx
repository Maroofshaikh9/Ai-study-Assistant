export default function Notice({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
  if (!text) {
    return null;
  }

  const classes =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-800 border-green-200";

  return (
    <p className={`border rounded-md px-3 py-2 text-sm ${classes}`}>{text}</p>
  );
}
