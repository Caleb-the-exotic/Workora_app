import { Link } from "@tanstack/react-router";

import { bell, clamp01, lerp, range } from "@/lib/film";

/* Short caption lines — bottom of frame so 3D panels stay the hero. */
function Caption({
  p,
  a,
  b,
  eyebrow,
  title,
}: {
  p: number;
  a: number;
  b: number;
  eyebrow: string;
  title: string;
}) {
  const t = bell(p, a, b, 0.32);
  return (
    <div
      className="film-overlay film-overlay--act"
      style={{
        opacity: t,
        transform: `translate3d(-50%, ${(1 - t) * 22}px, 0)`,
        visibility: t < 0.01 ? "hidden" : "visible",
      }}
    >
      <p className="film-eyebrow">{eyebrow}</p>
      <h2 className="film-title">{title}</h2>
    </div>
  );
}

/* Readable product panels floating over the 3D stage. */
function PanelCard({
  p,
  a,
  b,
  x = 0,
  y = 0,
  tilt = 0,
  children,
}: {
  p: number;
  a: number;
  b: number;
  x?: number;
  y?: number;
  tilt?: number;
  children: React.ReactNode;
}) {
  const t = bell(p, a, b, 0.3);
  return (
    <div
      className="film-panel"
      style={{
        opacity: t,
        visibility: t < 0.01 ? "hidden" : "visible",
        transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y + (1 - t) * 28}px), 0) perspective(1200px) rotateY(${lerp(tilt * 1.6, tilt, t)}deg) scale(${lerp(0.94, 1, t)})`,
      }}
    >
      {children}
    </div>
  );
}

export default function Overlays({ p }: { p: number }) {
  const introWord = bell(p, -0.04, 0.15, 0.4);
  const introTag = bell(p, 0.04, 0.18, 0.35);
  const finalIn = range(p, 0.9, 0.985);
  const leaveState = p > 0.645 ? "Approved" : p > 0.585 ? "In Review" : "Pending";

  return (
    <div className="film-overlays">
      {/* ACT 1 */}
      <div
        className="film-overlay"
        style={{
          opacity: introWord,
          transform: `translate3d(-50%, -50%, 0) scale(${1 + (1 - introWord) * 0.04})`,
          visibility: introWord < 0.01 ? "hidden" : "visible",
        }}
      >
        <h1 className="film-wordmark">WORKORA</h1>
        <p className="film-sub" style={{ opacity: introTag }}>
          Every workday, perfectly aligned.
        </p>
      </div>

      {/* ACT 2 — employee management */}
      <PanelCard p={p} a={0.15} b={0.36} x={0} y={-30} tilt={-4}>
        <div className="film-card">
          <div className="film-card__head">
            <span className="film-avatar">AR</span>
            <div>
              <p className="film-card__name">Aarav Rane</p>
              <p className="film-card__meta">EMP-2041 · Product Design</p>
            </div>
            <span className="film-chip film-chip--active">Active</span>
          </div>
          <dl className="film-grid2">
            <div>
              <dt>Role</dt>
              <dd>Senior Designer</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>Design</dd>
            </div>
            <div>
              <dt>Employee ID</dt>
              <dd>EMP-2041</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>On-site · Active</dd>
            </div>
          </dl>
        </div>
      </PanelCard>

      {/* ACT 3 — attendance */}
      <PanelCard p={p} a={0.33} b={0.54} x={0} y={-30} tilt={3}>
        <div className="film-card">
          <p className="film-card__label">Today · Attendance</p>
          <p className="film-card__hero">09:02 AM</p>
          <p className="film-card__sub--accent">Checked In</p>
          <div className="film-bar">
            <span style={{ width: `${clamp01((p - 0.36) * 6) * 100}%` }} />
          </div>
          <div className="film-row">
            <span>8h 42m — Working</span>
            <span>Check-out 18:12</span>
          </div>
          <div className="film-legend">
            <span className="is-present">Present</span>
            <span className="is-half">Half-day</span>
            <span className="is-leave">Leave</span>
            <span className="is-absent">Absent</span>
          </div>
        </div>
      </PanelCard>

      {/* ACT 4 — leave & time off */}
      <PanelCard p={p} a={0.51} b={0.71} x={0} y={-30} tilt={-3}>
        <div className="film-card">
          <div className="film-card__head">
            <div>
              <p className="film-card__label">Leave Request</p>
              <p className="film-card__name">Paid Leave · 12–14 Mar</p>
            </div>
            <span
              className={
                leaveState === "Approved"
                  ? "film-chip film-chip--ok"
                  : leaveState === "In Review"
                    ? "film-chip film-chip--review"
                    : "film-chip film-chip--pending"
              }
            >
              {leaveState}
            </span>
          </div>
          <ol className="film-steps">
            <li className={p > 0.53 ? "is-on" : ""}>Request</li>
            <li className={p > 0.585 ? "is-on" : ""}>Review</li>
            <li className={p > 0.645 ? "is-on" : ""}>Approved</li>
          </ol>
          <div className="film-legend">
            <span className="is-present">Paid</span>
            <span className="is-half">Sick</span>
            <span className="is-absent">Unpaid</span>
          </div>
        </div>
      </PanelCard>

      {/* ACT 5 — payroll */}
      <PanelCard p={p} a={0.67} b={0.87} x={0} y={-30} tilt={2}>
        <div className="film-card">
          <div className="film-card__head">
            <div>
              <p className="film-card__label">Salary Slip · March</p>
              <p className="film-card__hero film-card__hero--sm">₹ 1,42,500</p>
            </div>
            <span className="film-chip film-chip--ok">Processed</span>
          </div>
          <dl className="film-grid2">
            <div>
              <dt>Basic</dt>
              <dd>₹ 78,000</dd>
            </div>
            <div>
              <dt>Allowances</dt>
              <dd>₹ 52,400</dd>
            </div>
            <div>
              <dt>Deductions</dt>
              <dd>₹ 12,900</dd>
            </div>
            <div>
              <dt>Payout</dt>
              <dd>28 Mar</dd>
            </div>
          </dl>
          <p className="film-card__foot">
            {p > 0.78 ? "HR admin view · 1,284 employees · payroll run ready" : "Employee view · read-only"}
          </p>
        </div>
      </PanelCard>

      {/* ACT 6 — analytics */}
      <PanelCard p={p} a={0.82} b={1.06} x={0} y={-210}>
        <div className="film-card film-card--wide">
          <p className="film-card__label">Workforce Overview</p>
          <div className="film-stats">
            <div>
              <p>1,284</p>
              <span>Employees</span>
            </div>
            <div>
              <p>96.4%</p>
              <span>Attendance</span>
            </div>
            <div>
              <p>312</p>
              <span>Leave days</span>
            </div>
            <div>
              <p>₹ 4.2Cr</p>
              <span>Payroll</span>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Captions */}
      <Caption p={p} a={0.17} b={0.34} eyebrow="Employee Management" title="Everyone. Connected." />
      <Caption p={p} a={0.35} b={0.52} eyebrow="Attendance" title="Every workday, aligned." />
      <Caption p={p} a={0.53} b={0.69} eyebrow="Leave & Time Off" title="Request. Review. Approved." />
      <Caption p={p} a={0.69} b={0.84} eyebrow="Payroll" title="Clear. Accurate. Secure." />

      {/* ACT 6 finale */}
      <div
        className="film-overlay film-overlay--final"
        style={{
          opacity: finalIn,
          transform: `translate3d(-50%, ${(1 - finalIn) * 26}px, 0)`,
          visibility: finalIn < 0.01 ? "hidden" : "visible",
        }}
      >
        <p className="film-eyebrow">Analytics & Workforce</p>
        <h2 className="film-wordmark film-wordmark--sm">WORKORA</h2>
        <p className="film-sub">Every workday, perfectly aligned.</p>
        <div className="film-cta-wrap" style={{ pointerEvents: finalIn > 0.6 ? "auto" : "none" }}>
          <Link to="/signup" className="film-cta">
            Get Started <span aria-hidden>→</span>
          </Link>
          <Link to="/login" className="film-cta film-cta--ghost">
            Sign in
          </Link>
        </div>
      </div>

      {/* Persistent chrome */}
      <div className="film-chrome">
        <Link to="/" className="film-brand">
          WORKORA
        </Link>
        <div className="film-progress" aria-hidden>
          <span style={{ transform: `scaleX(${clamp01(p)})` }} />
        </div>
      </div>

      <div className="film-scroll-hint" style={{ opacity: 1 - range(p, 0.0, 0.06) }}>
        Scroll
      </div>
    </div>
  );
}
