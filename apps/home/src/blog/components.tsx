import { useEffect, useRef, useState } from "react";

/* ─── Code Block ─── */
export function CodeBlock({
  language,
  filename,
  children,
}: {
  language: string;
  filename?: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-200 bg-[#0f172a]">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/60 border-b border-slate-700/50">
          <span className="text-xs text-slate-400 font-mono">{filename}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            {language}
          </span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={copy}
          className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-medium rounded-md bg-slate-700/60 text-slate-300 hover:bg-slate-600/80 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
          <code className="text-slate-200 font-mono text-[13px]">{children}</code>
        </pre>
      </div>
    </div>
  );
}

/* ─── Mermaid Diagram ─── */
let mermaidInitialized = false;

export function Mermaid({ chart, caption }: { chart: string; caption?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let cancelled = false;

    const renderChart = async () => {
      try {
        const mermaid = (await import("mermaid")).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            fontFamily: "Inter, system-ui, sans-serif",
            securityLevel: "loose",
            flowchart: { useMaxWidth: true, htmlLabels: true },
          });
          mermaidInitialized = true;
        }

        // mermaid.render needs a unique id and the chart definition
        // In mermaid v10+, render returns { svg } and we can optionally
        // pass a container element for the temporary render target
        const { svg: rendered } = await mermaid.render(
          idRef.current,
          chart.trim(),
          containerRef.current ?? undefined
        );

        if (!cancelled) {
          setSvg(rendered);
          setError(false);
        }
      } catch (e) {
        console.error("Mermaid render error:", e);
        if (!cancelled) setError(true);
      }
    };

    renderChart();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <figure className="my-8">
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto">
          <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap">{chart.trim()}</pre>
        </div>
        {caption && (
          <figcaption className="mt-3 text-sm text-slate-400 text-center italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="my-8">
      {/* Hidden container used by mermaid as a render target */}
      <div ref={containerRef} style={{ display: "none" }} />
      <div
        className="flex justify-center items-center p-6 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && (
        <figcaption className="mt-3 text-sm text-slate-400 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ─── Section Header ─── */
export function SectionHeader({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  const id = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  return (
    <h2
      id={id}
      className="text-2xl sm:text-3xl font-bold text-slate-900 mt-16 mb-6 scroll-mt-24"
    >
      <span className="text-[#2563eb] font-mono mr-2 text-lg">
        {String(number).padStart(2, "0")}.
      </span>
      {title}
    </h2>
  );
}

/* ─── Callout ─── */
export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    danger: "🚨",
  };

  return (
    <div className={`my-6 p-4 rounded-xl border ${styles[type]} text-sm leading-relaxed`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}

/* ─── Inline Code ─── */
export function IC({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[13px] font-mono">
      {children}
    </code>
  );
}
