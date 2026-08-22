/**
 * Deterministic math helpers for the Workora scroll film.
 * Every visual value in the experience is a pure function of scroll progress `p`.
 */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** Normalized 0..1 progress of `p` inside the [a,b] window, eased. */
export const range = (p: number, a: number, b: number) => smoothstep((p - a) / (b - a));

/** 0 -> 1 -> 0 bell across [a,b] with `edge` fraction used for the ramps. */
export const bell = (p: number, a: number, b: number, edge = 0.25) => {
  const t = (p - a) / (b - a);
  if (t <= 0 || t >= 1) return 0;
  return smoothstep(t / edge) * smoothstep((1 - t) / edge);
};

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** ACT windows — the whole film is one continuous timeline. */
export const ACTS = {
  intro: [0.0, 0.18],
  people: [0.15, 0.36],
  attendance: [0.33, 0.54],
  leave: [0.51, 0.7],
  payroll: [0.67, 0.86],
  analytics: [0.83, 1.0],
} as const;
