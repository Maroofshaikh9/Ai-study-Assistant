"use client";

import React from "react";
import { Sparkles, BookOpen } from "lucide-react";

function renderFormattedInline(text: string): React.ReactNode {
  // Regex splitting by bold (**...**), inline code (`...`), and italic (*...*)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-brand-700 border border-slate-200/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function FormattedSummary({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentQuote: string[] = [];

  const flushList = (key: string) => {
    if (currentList) {
      if (currentList.type === "ul") {
        elements.push(
          <ul key={key} className="my-3 space-y-2 pl-1">
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2.5 shrink-0" />
                <span className="flex-1">{renderFormattedInline(item)}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={key} className="my-3 space-y-2 pl-1">
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  {idx + 1}
                </span>
                <span className="flex-1">{renderFormattedInline(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const flushQuote = (key: string) => {
    if (currentQuote.length > 0) {
      elements.push(
        <div
          key={key}
          className="my-5 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm sm:text-base leading-relaxed space-y-1">
              {currentQuote.map((qLine, qIdx) => (
                <p key={qIdx}>{renderFormattedInline(qLine)}</p>
              ))}
            </div>
          </div>
        </div>
      );
      currentQuote = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`list-${index}`);
      flushQuote(`quote-${index}`);
      return;
    }

    // Check blockquote
    if (trimmed.startsWith(">")) {
      flushList(`list-${index}`);
      currentQuote.push(trimmed.replace(/^>\s?/, ""));
      return;
    } else {
      flushQuote(`quote-${index}`);
    }

    // Check bullet list item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.replace(/^[-*]\s+/, "");
      if (currentList && currentList.type === "ul") {
        currentList.items.push(itemText);
      } else {
        flushList(`list-${index}`);
        currentList = { type: "ul", items: [itemText] };
      }
      return;
    }

    // Check numbered list item
    const matchNumbered = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (matchNumbered) {
      const itemText = matchNumbered[2];
      if (currentList && currentList.type === "ol") {
        currentList.items.push(itemText);
      } else {
        flushList(`list-${index}`);
        currentList = { type: "ol", items: [itemText] };
      }
      return;
    }

    // Non-list line
    flushList(`list-${index}`);

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={`h3-${index}`}
          className="text-base sm:text-lg font-bold text-slate-800 mt-5 mb-2"
        >
          {renderFormattedInline(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <div
          key={`h2-${index}`}
          className="mt-8 mb-3 pb-2 border-b border-slate-200/80 flex items-center gap-2.5"
        >
          <div className="w-1.5 h-5 rounded-full bg-brand-500 shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {renderFormattedInline(trimmed.replace(/^##\s+/, ""))}
          </h3>
        </div>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <div key={`h1-${index}`} className="flex items-center gap-2 mt-7 mb-3">
          <BookOpen className="w-5 h-5 text-brand-600 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {renderFormattedInline(trimmed.replace(/^#\s+/, ""))}
          </h2>
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p
        key={`p-${index}`}
        className="text-sm sm:text-base text-slate-700 leading-relaxed my-2.5"
      >
        {renderFormattedInline(trimmed)}
      </p>
    );
  });

  flushList("list-end");
  flushQuote("quote-end");

  return <div className="space-y-1">{elements}</div>;
}
