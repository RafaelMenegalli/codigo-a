import Headline from "@/components/Headline";
import VslPlayer from "@/components/VslPlayer";

export default function Home() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <main className="relative flex flex-1 flex-col items-center overflow-x-clip px-2 pb-10 pt-5 sm:px-4 sm:pt-6">
        {/* brillo radial carmesí detrás del vídeo */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[30%] -z-10 h-[900px] w-[900px] max-w-[160vw] -translate-x-1/2 -translate-y-1/3 bg-[radial-gradient(closest-side,rgba(196,24,58,0.2),transparent)]"
        />
        <Headline />
        <VslPlayer />
      </main>
    </div>
  );
}
