"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHECKOUT_URL,
  CTA_SECONDS,
  POSTER_SRC,
  VIDEO_ASPECT_FALLBACK,
  VIDEO_SRC,
} from "@/config/site";
import CtaButton from "./CtaButton";

type Mode = "init" | "unmute" | "resume" | "playing";

const TIME_KEY = `vsl:time:${VIDEO_SRC}`;
const DONE_KEY = `vsl:done:${VIDEO_SRC}`;
const SAVE_EVERY = 5; // segundos de vídeo entre cada guardado
const MIN_RESUME = 5; // por debajo de esto no se ofrece retomar

// Muy rápida al inicio, frena gradualmente y va muy lenta en el último tercio; f(0)=0 y f(1)=1 exactos.
const curve = (x: number) => 1 - Math.pow(1 - x, 6.4);

function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage bloqueado: ignorar */
  }
}
function storageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage bloqueado: ignorar */
  }
}

type WebkitVideo = HTMLVideoElement & { webkitExitFullscreen?: () => void };

export default function VslPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>("init");
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [ratio, setRatio] = useState(VIDEO_ASPECT_FALLBACK);
  const [href, setHref] = useState(CHECKOUT_URL);

  const lastValidRef = useRef(0); // último tiempo legítimo (anti-seek)
  const allowSeekRef = useRef(false); // true durante saltos hechos por nosotros
  const lastSavedRef = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const savedTimeRef = useRef(0);
  const scrolledRef = useRef(false);

  /* ---------- helpers ---------- */

  const seekTo = useCallback((t: number) => {
    const v = videoRef.current;
    if (!v) return;
    lastValidRef.current = t;
    lastSavedRef.current = t;
    if (v.readyState >= 1) {
      allowSeekRef.current = true;
      v.currentTime = t;
    } else {
      pendingSeekRef.current = t; // se aplica en loadedmetadata
    }
  }, []);

  const syncRatio = useCallback(() => {
    const v = videoRef.current;
    if (v && v.videoWidth > 0 && v.videoHeight > 0) {
      setRatio(v.videoWidth / v.videoHeight);
    }
  }, []);

  const saveNow = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.ended) return;
    if (v.currentTime >= MIN_RESUME) {
      storageSet(TIME_KEY, String(v.currentTime));
    }
  }, []);

  /* ---------- montaje: estado inicial, URL del checkout, autoplay mudo ---------- */

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;

    // Repasar utm_*, fbclid, etc. al checkout
    let finalHref = CHECKOUT_URL;
    try {
      const url = new URL(CHECKOUT_URL);
      new URLSearchParams(window.location.search).forEach((value, key) => {
        url.searchParams.set(key, value);
      });
      finalHref = url.toString();
    } catch {
      /* URL inválida (placeholder): se queda como está */
    }

    const saved = parseFloat(storageGet(TIME_KEY) ?? "");
    const done = storageGet(DONE_KEY) === "1";
    const hasSaved = Number.isFinite(saved) && saved >= MIN_RESUME;

    // Los setState de este bloque ocurren una sola vez, tras leer storage (solo existe en cliente).
    const t = window.setTimeout(() => {
      setHref(finalHref);
      if (done || (hasSaved && saved >= CTA_SECONDS)) setCtaVisible(true);
      if (v.readyState >= 1) syncRatio();
      if (hasSaved && !done) {
        savedTimeRef.current = saved;
        setMode("resume");
      } else {
        setMode("unmute");
        v.play().catch(() => {
          /* autoplay bloqueado: el overlay sigue y el toque inicia el vídeo */
        });
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [syncRatio]);

  /* ---------- barra falsa: requestAnimationFrame sin re-render ---------- */

  useEffect(() => {
    let id = 0;
    let last = -1;
    const tick = () => {
      const v = videoRef.current;
      const bar = barRef.current;
      if (v && bar) {
        const d = v.duration;
        let p = 0;
        if (v.ended) {
          p = 1;
        } else if (Number.isFinite(d) && d > 0) {
          p = curve(Math.min(1, Math.max(0, v.currentTime / d)));
        }
        if (p !== last) {
          bar.style.transform = `scaleX(${p})`;
          last = p;
        }
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---------- pantalla completa bloqueada ---------- */

  useEffect(() => {
    const v = videoRef.current as WebkitVideo | null;
    const onDocFs = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
    const onIosFs = () => v?.webkitExitFullscreen?.();
    document.addEventListener("fullscreenchange", onDocFs);
    v?.addEventListener("webkitbeginfullscreen", onIosFs);
    return () => {
      document.removeEventListener("fullscreenchange", onDocFs);
      v?.removeEventListener("webkitbeginfullscreen", onIosFs);
    };
  }, []);

  /* ---------- guardar al salir de la página ---------- */

  useEffect(() => {
    const onHide = () => saveNow();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [saveNow]);

  /* ---------- scroll suave al botón, una sola vez ---------- */

  useEffect(() => {
    if (!ctaVisible || mode === "init" || mode === "resume") return;
    if (scrolledRef.current) return;
    scrolledRef.current = true;
    const t = window.setTimeout(() => {
      ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 500);
    return () => window.clearTimeout(t);
  }, [ctaVisible, mode]);

  /* ---------- eventos del vídeo ---------- */

  const onLoadedMetadata = () => {
    syncRatio();
    if (pendingSeekRef.current !== null) {
      const t = pendingSeekRef.current;
      pendingSeekRef.current = null;
      const v = videoRef.current;
      if (v) {
        allowSeekRef.current = true;
        v.currentTime = t;
      }
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;
    if (!v.seeking && !allowSeekRef.current) lastValidRef.current = t;
    if (t >= CTA_SECONDS) setCtaVisible(true);
    if (t - lastSavedRef.current >= SAVE_EVERY) {
      lastSavedRef.current = t;
      saveNow();
    }
  };

  // Cualquier salto que no sea nuestro vuelve al último tiempo válido.
  const onSeeking = () => {
    const v = videoRef.current;
    if (!v || allowSeekRef.current) return;
    if (Math.abs(v.currentTime - lastValidRef.current) > 0.5) {
      allowSeekRef.current = true;
      v.currentTime = lastValidRef.current;
    }
  };
  const onSeeked = () => {
    allowSeekRef.current = false;
  };

  const onEnded = () => {
    setEnded(true);
    setCtaVisible(true);
    storageSet(DONE_KEY, "1");
    storageRemove(TIME_KEY);
    if (barRef.current) barRef.current.style.transform = "scaleX(1)";
  };

  /* ---------- acciones del usuario ---------- */

  const activateSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    seekTo(0);
    v.play().catch(() => {});
    setPaused(false);
    setMode("playing");
  };

  const resumeFromSaved = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    seekTo(savedTimeRef.current);
    v.play().catch(() => {});
    setPaused(false);
    setMode("playing");
  };

  const restart = () => {
    storageRemove(TIME_KEY);
    activateSound();
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || ended) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <section className="flex w-full flex-col items-center">
      <div
        className="vsl-frame relative overflow-hidden rounded-xl border border-crimson/30 bg-black shadow-[0_0_60px_-12px_rgba(196,24,58,0.55)]"
        style={
          { aspectRatio: String(ratio), "--r": ratio } as React.CSSProperties
        }
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (
            ["ArrowLeft", "ArrowRight", "Home", "End", "f", "F", "j", "l"].includes(
              e.key,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          preload="auto"
          playsInline
          muted
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nofullscreen nodownload noremoteplayback"
          tabIndex={-1}
          aria-label="Video de presentación"
          className="h-full w-full object-cover"
          onLoadedMetadata={onLoadedMetadata}
          onLoadedData={syncRatio}
          onTimeUpdate={onTimeUpdate}
          onSeeking={onSeeking}
          onSeeked={onSeeked}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onEnded={onEnded}
        />

        {/* Pausa / play una vez activado el sonido */}
        {mode === "playing" && !ended && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={paused ? "Reanudar video" : "Pausar video"}
            className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          />
        )}
        {mode === "playing" && paused && !ended && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-black/45">
              <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9 fill-bone/90">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
              </svg>
            </span>
          </div>
        )}

        {/* Overlay: activar sonido */}
        {mode === "unmute" && (
          <button
            type="button"
            onClick={activateSound}
            aria-label="Activar el sonido y ver el video desde el inicio"
            className="absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-center gap-4 bg-ink/65 px-6 text-center backdrop-blur-[2px]"
          >
            <span className="soft-pulse relative flex h-24 w-24 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-crimson/40"
              />
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gold bg-gradient-to-b from-crimson to-wine shadow-[0_0_40px_rgba(196,24,58,0.7)]">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-11 w-11 fill-none stroke-white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="white" />
                  <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11" />
                </svg>
              </span>
            </span>
            <span className="font-display text-2xl font-bold leading-tight text-bone">
              Tu video ya comenzó
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Toca para activar el sonido
            </span>
          </button>
        )}

        {/* Overlay: retomar */}
        {mode === "resume" && (
          <div
            role="dialog"
            aria-label="Retomar video"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-ink/80 px-6 text-center backdrop-blur-sm"
          >
            <p className="font-display text-xl font-bold leading-tight text-bone sm:text-2xl">
              Ya empezaste a ver este video
            </p>
            <div className="flex w-full max-w-[280px] flex-col gap-3">
              <button
                type="button"
                onClick={resumeFromSaved}
                className="rounded-full border border-gold bg-gradient-to-b from-crimson to-wine px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Continuar viendo
              </button>
              <button
                type="button"
                onClick={restart}
                className="rounded-full border border-bone/30 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-bone"
              >
                Ver desde el inicio
              </button>
            </div>
          </div>
        )}

        {/* Barra de progreso falsa (sin números, no clicable) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[5px] bg-black/50"
        >
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-gradient-to-r from-wine via-crimson to-rose shadow-[0_0_10px_rgba(236,90,117,0.8)]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      <div ref={ctaRef} className="mt-8 flex w-full justify-center">
        {ctaVisible && <CtaButton href={href} />}
      </div>
    </section>
  );
}
