"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-white/80">
        <code data-language={language}>{code}</code>
      </pre>
    </div>
  );
}

/** Replaces {{BASE_URL}} with window.location.origin after mount. */
export function DocsCode({
  template,
  language = "bash",
}: {
  template: string;
  language?: string;
}) {
  const [code, setCode] = useState(() =>
    template.replace(/\{\{BASE_URL\}\}/g, "https://your-domain")
  );

  useEffect(() => {
    setCode(template.replace(/\{\{BASE_URL\}\}/g, window.location.origin));
  }, [template]);

  return <CodeBlock code={code} language={language} />;
}
