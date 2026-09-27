"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-brand-400" />
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineSpans(text: string): React.ReactNode {
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

function renderFormattedInline(text: string): React.ReactNode {
  if (!text) return null;

  // Handle literal <br>, <br/>, <br /> safely without dangerouslySetInnerHTML (no XSS vulnerability)
  const brParts = text.split(/<br\s*\/?>/gi);
  if (brParts.length === 1) {
    return renderInlineSpans(text);
  }

  return brParts.map((part, idx) => (
    <React.Fragment key={idx}>
      {idx > 0 && <br className="my-0.5" />}
      {renderInlineSpans(part)}
    </React.Fragment>
  ));
}

function isDelimiterRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("-") || !trimmed.includes("|")) return false;
  const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  const cells = inner.split("|");
  if (cells.length < 2) return false;
  return cells.every((c) => /^[\s:]*-+[\s:]*$/.test(c));
}

function parseRowCells(line: string): string[] {
  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

function parseAlignments(line: string): ("left" | "center" | "right")[] {
  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => {
    const s = c.trim();
    if (s.startsWith(":") && s.endsWith(":")) return "center";
    if (s.endsWith(":")) return "right";
    return "left";
  });
}

function TableBlock({
  headers,
  alignments,
  rows,
}: {
  headers: string[];
  alignments: ("left" | "center" | "right")[];
  rows: string[][];
}) {
  const getAlignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className="my-3.5 w-full max-w-full overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-xs">
      <table className="w-full min-w-full divide-y divide-slate-200 border-collapse text-left text-xs sm:text-sm">
        <thead className="bg-slate-50/90 text-slate-800 font-semibold border-b border-slate-200">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-3.5 py-2.5 text-xs font-bold text-slate-900 tracking-wide uppercase whitespace-nowrap sm:whitespace-normal border-r border-slate-200/60 last:border-r-0 align-bottom ${getAlignClass(
                  alignments[idx]
                )}`}
              >
                {renderFormattedInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-slate-50/70 transition-colors even:bg-slate-50/30"
            >
              {headers.map((_, colIdx) => {
                const cell = row[colIdx] || "";
                return (
                  <td
                    key={colIdx}
                    className={`px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 align-top break-words [word-break:break-word] border-r border-slate-100 last:border-r-0 leading-relaxed ${getAlignClass(
                      alignments[colIdx]
                    )}`}
                  >
                    {renderFormattedInline(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FormattedChatMessage({ content }: { content: string }) {
  if (!content) return null;

  // First pass: extract fenced code blocks ```lang ... ```
  const codeBlockRegex = /```(\w+)?\r?\n([\s\S]*?)```/g;
  const segments: { type: "code" | "text"; content: string; language?: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: "code",
      language: match[1] || "code",
      content: match[2].trimEnd(),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  const elements: React.ReactNode[] = [];
  let elementKey = 0;

  segments.forEach((segment) => {
    if (segment.type === "code") {
      elements.push(
        <CodeBlock
          key={`code-${elementKey++}`}
          code={segment.content}
          language={segment.language || "code"}
        />
      );
      return;
    }

    const lines = segment.content.split("\n");
    let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
    let currentQuote: string[] = [];

    const flushList = () => {
      if (currentList) {
        if (currentList.type === "ul") {
          elements.push(
            <ul key={`ul-${elementKey++}`} className="my-2.5 space-y-1.5 pl-1">
              {currentList.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                  <span className="flex-1">{renderFormattedInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`ol-${elementKey++}`} className="my-2.5 space-y-1.5 pl-1">
              {currentList.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"
                >
                  <span className="w-4 h-4 rounded-md bg-slate-200/80 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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

    const flushQuote = () => {
      if (currentQuote.length > 0) {
        elements.push(
          <div
            key={`quote-${elementKey++}`}
            className="my-3 p-3.5 rounded-xl bg-slate-100/90 border-l-4 border-brand-500 text-slate-700 text-sm leading-relaxed space-y-1"
          >
            {currentQuote.map((q, idx) => (
              <p key={idx}>{renderFormattedInline(q)}</p>
            ))}
          </div>
        );
        currentQuote = [];
      }
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        flushQuote();
        i++;
        continue;
      }

      // Check if line starts a markdown table (requires header line with | and next line as delimiter)
      if (i + 1 < lines.length && line.includes("|") && isDelimiterRow(lines[i + 1])) {
        flushList();
        flushQuote();

        const headers = parseRowCells(line);
        const alignments = parseAlignments(lines[i + 1]);
        const rows: string[][] = [];
        i += 2; // advance past header and delimiter

        while (i < lines.length) {
          const rowLine = lines[i];
          const rowTrimmed = rowLine.trim();
          if (!rowTrimmed || !rowLine.includes("|")) break;
          // Stop if another markdown block type starts
          if (
            rowTrimmed.startsWith("#") ||
            rowTrimmed.startsWith("```") ||
            rowTrimmed.startsWith("- ") ||
            rowTrimmed.startsWith("* ") ||
            /^\d+\.\s+/.test(rowTrimmed)
          ) {
            break;
          }
          rows.push(parseRowCells(rowLine));
          i++;
        }

        elements.push(
          <TableBlock
            key={`table-${elementKey++}`}
            headers={headers}
            alignments={alignments}
            rows={rows}
          />
        );
        continue;
      }

      // Check blockquote
      if (trimmed.startsWith(">")) {
        flushList();
        currentQuote.push(trimmed.replace(/^>\s?/, ""));
        i++;
        continue;
      } else {
        flushQuote();
      }

      // Check bullet list item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.replace(/^[-*]\s+/, "");
        if (currentList && currentList.type === "ul") {
          currentList.items.push(itemText);
        } else {
          flushList();
          currentList = { type: "ul", items: [itemText] };
        }
        i++;
        continue;
      }

      // Check numbered list item
      const matchNumbered = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (matchNumbered) {
        const itemText = matchNumbered[2];
        if (currentList && currentList.type === "ol") {
          currentList.items.push(itemText);
        } else {
          flushList();
          currentList = { type: "ol", items: [itemText] };
        }
        i++;
        continue;
      }

      // Plain line / heading
      flushList();

      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4
            key={`h3-${elementKey++}`}
            className="text-sm sm:text-base font-bold text-slate-800 mt-4 mb-1"
          >
            {renderFormattedInline(trimmed.replace(/^###\s+/, ""))}
          </h4>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith("## ")) {
        elements.push(
          <h3
            key={`h2-${elementKey++}`}
            className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-1.5 border-b border-slate-200/60 pb-1"
          >
            {renderFormattedInline(trimmed.replace(/^##\s+/, ""))}
          </h3>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith("# ")) {
        elements.push(
          <h2
            key={`h1-${elementKey++}`}
            className="text-lg sm:text-xl font-extrabold text-slate-900 mt-5 mb-2"
          >
            {renderFormattedInline(trimmed.replace(/^#\s+/, ""))}
          </h2>
        );
        i++;
        continue;
      }

      elements.push(
        <p key={`p-${elementKey++}`} className="text-sm text-slate-800 leading-relaxed my-2">
          {renderFormattedInline(trimmed)}
        </p>
      );
      i++;
    }

    flushList();
    flushQuote();
  });

  return <div className="space-y-0.5">{elements}</div>;
}
