import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

import Overlays from "@/components/film/Overlays";
import { clamp01 } from "@/lib/film";

const FilmScene = lazy(() => import("@/components/film/FilmScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workora — Every workday, perfectly aligned" },
      {
        name: "description",
        content:
          "Workora unites employees, attendance, leave, payroll and analytics in one connected HR platform. Scroll through the product story.",
      },
      { property: "og:title", content: "Workora — Human Resource Management System" },
      {
        property: "og:description",
        content: "Employees, attendance, leave, payroll and analytics in one connected platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FilmPage,
});

function FilmPage() {
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mq = window.matchMedia("(max-width: 820px)");
    const sync = () => {
      setReduced(rm.matches);
      setMobile(mq.matches);
    };
    sync();
    rm.addEventListener("change", sync);
    mq.addEventListener("change", sync);
    return () => {
      rm.removeEventListener("change", sync);
      mq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = clamp01(max > 0 ? window.scrollY / max : 0);
      progress.current = next;
      setP(Math.round(next * 1000) / 1000);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="workora-film">
      <div className="film-stage">
        {mounted && (
          <Suspense fallback={null}>
            <FilmScene progress={progress} reduced={reduced} mobile={mobile} />
          </Suspense>
        )}
      </div>
      <Overlays p={p} />
      {/* Scroll track: the entire film is driven by this single scroll value. */}
      <div className="film-track" aria-hidden />
      <section className="sr-only">
        <h1>Workora — Human Resource Management System</h1>
        <p>
          Workora connects employee management, attendance, leave and time off, payroll and
          workforce analytics in one platform. Every workday, perfectly aligned.
        </p>
      </section>
    </div>
  );
}
