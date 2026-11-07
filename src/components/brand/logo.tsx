import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="var(--color-forest)" />
      <path d="M9.5 22.5C9.5 14.5 14.5 9.5 22.5 9.5c0 8-5 13-13 13Z" fill="var(--color-paper)" />
      <path d="M10.2 21.8 18.6 13.4" stroke="var(--color-forest)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22.6" cy="22.6" r="1.6" fill="var(--color-saffron)" />
    </svg>
  );
}

export function Logo({ href = "/", tone = "ink" }: { href?: string; tone?: "ink" | "paper" }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 rounded-md ${tone === "paper" ? "text-paper" : "text-ink"}`}
      aria-label="SAVORA home"
    >
      <LogoMark className="size-8" />
      <span className="font-display text-[1.45rem] font-medium leading-none tracking-[-0.02em]">Savora</span>
    </Link>
  );
}
