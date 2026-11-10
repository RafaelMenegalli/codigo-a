"use client";

import { CTA_TEXT, CTA_TRUST } from "@/config/site";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const ICONS = {
  lock: (
    <path d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  shield: (
    <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Zm-3 9 2.2 2.2L15.5 10" />
  ),
} as const;

export default function CtaButton({ href }: { href: string }) {
  const track = () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout");
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <a
        href={href}
        onClick={track}
        aria-label={CTA_TEXT}
        className="cta-anim block w-full max-w-[460px] rounded-2xl border-2 border-gold/80 bg-gradient-to-b from-[#ee2a4d] via-crimson to-[#8f1029] px-5 py-5 text-center text-[18px] font-bold leading-snug text-white shadow-[0_8px_30px_-6px_rgba(236,42,77,0.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:text-xl"
      >
        {CTA_TEXT}
      </a>
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-bone/80">
        {CTA_TRUST.map((item, i) => (
          <li key={item.text} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden className="mr-1.5 hidden text-gold/60 sm:inline">
                ·
              </span>
            )}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0 fill-none stroke-gold"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONS[item.icon]}
            </svg>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
