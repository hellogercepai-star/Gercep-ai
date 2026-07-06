import type { ReactNode } from "react";

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-[var(--border-default)] pt-8 first:border-t-0 first:pt-0"
    >
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[var(--text-secondary)]">{children}</div>
    </section>
  );
}

export function LegalNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5"
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-[var(--accent-teal)] transition hover:opacity-80"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
