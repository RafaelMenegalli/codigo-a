import { HEADLINE } from "@/config/site";

export default function Headline() {
  return (
    <header className="mb-4 w-full max-w-4xl px-2 text-center sm:mb-5">
      <h1 className="font-display text-[19px] font-bold leading-[1.18] tracking-tight text-bone [text-wrap:balance] min-[400px]:text-[22px] sm:text-[28px] md:text-[34px]">
        {HEADLINE.map((p, i) =>
          p.hl ? (
            <em key={i} className="font-bold italic text-rose">
              {p.text}
            </em>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </h1>
    </header>
  );
}
