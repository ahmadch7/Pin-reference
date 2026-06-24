import React, { useEffect, useRef, useState } from "react";
import { CircuitBoard, ArrowRight } from "lucide-react";

/* Animated pixel/dot field background, drawn on a canvas.
   The whole field drifts slowly on a diagonal while each dot softly pulses —
   gives a calm, living "digital matrix" feel behind the sign-in. */
function DotField() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 16;
    const SIZE = 2.5;
    const VX = 16; // px/sec drift
    const VY = 9;
    let w = 0, h = 0, raf = 0, last = 0;
    let offx = 0, offy = 0;

    // stable per-cell brightness from logical coords (so bright dots drift with the field)
    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return s - Math.floor(s);
    };

    const resize = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      offx += VX * dt;
      offy += VY * dt;
      const baseLx = Math.floor(offx / GAP);
      const baseLy = Math.floor(offy / GAP);
      const ox = offx - baseLx * GAP;
      const oy = offy - baseLy * GAP;
      const cols = Math.ceil(w / GAP) + 2;
      const rows = Math.ceil(h / GAP) + 2;
      const waveT = t * 0.0016; // moving brightness wave

      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * GAP - ox;
          const py = r * GAP - oy;
          const b = hash(baseLx + c, baseLy + r); // sparkle distribution, drifts with field
          // diagonal brightness band that sweeps across over time -> clearly moving
          const wave = 0.5 + 0.5 * Math.sin(px * 0.02 + py * 0.02 + waveT);
          const a = 0.05 + Math.pow(b, 3) * 0.5 * (0.3 + 0.7 * wave) + wave * 0.06;
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fillRect(px, py, SIZE, SIZE);
        }
      }
      raf = requestAnimationFrame(render);
    };

    resize();
    raf = requestAnimationFrame(render);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{
        WebkitMaskImage: "radial-gradient(ellipse 95% 75% at 50% 38%, #000 58%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 95% 75% at 50% 38%, #000 58%, transparent 100%)",
      }}
    />
  );
}

// Monochrome Google "G" to match the reference button.
function GoogleG({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <path d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8 20-20 0-1.3-.1-2.3-.4-3.5z" />
      <path d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
      <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
      <path d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.9 35.7 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const [email, setEmail] = useState("");
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0a0a0b] text-[#e5e5e0] font-sans antialiased flex flex-col">
      <DotField />
      <div className="lp-topglow" aria-hidden="true" />

      {/* Top glass nav pill */}
      <header className="relative z-10 flex justify-center px-4 pt-6">
        <nav className="lp-anim lp-glass flex items-center gap-1 rounded-full py-1.5 pl-3 pr-1.5" style={d(60)}>
          <div className="flex items-center gap-2 pr-3 pl-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 text-white">
              <CircuitBoard size={16} />
            </span>
            <span className="hidden sm:block text-sm font-semibold tracking-tight text-[#f5f5f0]">Pin-Reference</span>
          </div>
          <div className="hidden items-center md:flex">
            {["Features", "Docs", "GitHub"].map((l) => (
              <a key={l} href="#" onClick={(e) => e.preventDefault()} className="rounded-full px-3.5 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white">
                {l}
              </a>
            ))}
          </div>
          <button onClick={onEnter} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-white/10 hover:text-white">
            Log in
          </button>
          <button
            onClick={onEnter}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black shadow-[0_0_22px_rgba(255,255,255,0.28)] transition-transform hover:scale-[1.03]"
          >
            Sign up
          </button>
        </nav>
      </header>

      {/* Hero / sign-in */}
      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 pb-24 text-center">
        <h1 className="lp-anim whitespace-nowrap text-5xl font-bold tracking-tight text-white sm:text-6xl" style={d(140)}>
          Welcome, Maker
        </h1>
        <p className="lp-anim mt-3 text-lg font-light text-zinc-400" style={d(220)}>
          Your microcontroller companion
        </p>

        <div className="mt-10 w-full max-w-sm space-y-4">
          <button
            onClick={onEnter}
            className="lp-anim lp-glass lp-glass-hover flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-sm font-medium text-[#f0f0ee] transition-colors"
            style={d(300)}
          >
            <span className="text-zinc-200"><GoogleG size={17} /></span>
            Sign in with Google
          </button>

          <div className="lp-anim flex items-center gap-3" style={d(360)} aria-hidden="true">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-zinc-500">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onEnter();
            }}
            className="lp-anim lp-glass lp-glass-hover flex items-center rounded-2xl py-1.5 pl-5 pr-1.5 transition-colors focus-within:border-orange-500/60"
            style={d(420)}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@gmail.com"
              aria-label="Email address"
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Continue"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300 transition-colors hover:bg-orange-600 hover:text-white"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="lp-anim mt-10 max-w-xs text-xs leading-relaxed text-zinc-500" style={d(520)}>
          By continuing, you agree to the{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-400 underline underline-offset-2 hover:text-white">Terms</a>,{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-400 underline underline-offset-2 hover:text-white">Acceptable Use</a>, and{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-400 underline underline-offset-2 hover:text-white">Privacy Notice</a>.
        </p>
      </main>
    </div>
  );
}
