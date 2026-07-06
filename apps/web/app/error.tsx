"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070711] px-6 text-center text-white">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-white/60">
        The page failed to load. Try refreshing, or continue to Developers and
        Playground.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#070711]"
        >
          Try again
        </button>
        <a
          href="/developers"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80"
        >
          Developers
        </a>
        <a
          href="/playground"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80"
        >
          Playground
        </a>
      </div>
    </div>
  );
}
