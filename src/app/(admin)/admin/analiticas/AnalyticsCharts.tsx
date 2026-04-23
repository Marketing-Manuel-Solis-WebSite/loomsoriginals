"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type VideoEvent = { event_type: string; created_at: string; episode_id: string };
type Cta = { cta_type: string; created_at: string; destination_url: string | null };
type Episode = { id: string; title_es: string };

export function AnalyticsCharts({
  videoEvents,
  ctas,
  episodes,
}: {
  videoEvents: VideoEvent[];
  ctas: Cta[];
  episodes: Episode[];
}) {
  const [nowMs] = useState(() => Date.now());
  const byDay = useMemo(() => {
    const map = new Map<string, { day: string; plays: number; completes: number; ctas: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { day: key.slice(5), plays: 0, completes: 0, ctas: 0 });
    }
    for (const ev of videoEvents) {
      const k = ev.created_at.slice(0, 10);
      const row = map.get(k);
      if (!row) continue;
      if (ev.event_type === "play") row.plays += 1;
      if (ev.event_type === "complete") row.completes += 1;
    }
    for (const c of ctas) {
      const k = c.created_at.slice(0, 10);
      const row = map.get(k);
      if (!row) continue;
      row.ctas += 1;
    }
    return Array.from(map.values());
  }, [nowMs, videoEvents, ctas]);

  const topEpisodes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ev of videoEvents) {
      if (ev.event_type !== "play") continue;
      counts.set(ev.episode_id, (counts.get(ev.episode_id) ?? 0) + 1);
    }
    const titleById = new Map(episodes.map((e) => [e.id, e.title_es]));
    return Array.from(counts.entries())
      .map(([id, plays]) => ({ name: titleById.get(id) ?? id.slice(0, 8), plays }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);
  }, [videoEvents, episodes]);

  const ctasByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of ctas) counts.set(c.cta_type, (counts.get(c.cta_type) ?? 0) + 1);
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [ctas]);

  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-2">
      <Panel title="Reproducciones y conversiones por día">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={byDay}>
            <CartesianGrid stroke="#243654" vertical={false} />
            <XAxis dataKey="day" stroke="#A8B2C8" fontSize={11} />
            <YAxis stroke="#A8B2C8" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0A1628", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="plays" stroke="#D4AF37" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="completes" stroke="#A8B2C8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ctas" stroke="#E6C458" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Top 10 episodios por reproducciones">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topEpisodes} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid stroke="#243654" horizontal={false} />
            <XAxis type="number" stroke="#A8B2C8" fontSize={11} />
            <YAxis dataKey="name" type="category" stroke="#A8B2C8" fontSize={11} width={180} />
            <Tooltip contentStyle={{ background: "#0A1628", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 12 }} />
            <Bar dataKey="plays" radius={[0, 8, 8, 0]}>
              {topEpisodes.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "#D4AF37" : "#C9A227"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Clics CTA por tipo">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ctasByType}>
            <CartesianGrid stroke="#243654" vertical={false} />
            <XAxis dataKey="name" stroke="#A8B2C8" fontSize={11} />
            <YAxis stroke="#A8B2C8" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0A1628", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 12 }} />
            <Bar dataKey="value" fill="#D4AF37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Funnel" hint="Play → Complete → Consulta">
        <div className="grid h-[300px] place-items-center text-ivory-100">
          <FunnelView data={videoEvents} ctas={ctas} />
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-lg italic text-ivory-50">{title}</h2>
        {hint ? <span className="text-[11px] uppercase tracking-widest text-ivory-200/60">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function FunnelView({ data, ctas }: { data: VideoEvent[]; ctas: Cta[] }) {
  const plays = data.filter((e) => e.event_type === "play").length;
  const completes = data.filter((e) => e.event_type === "complete").length;
  const consultas = ctas.filter((c) => c.cta_type === "consultation").length;
  const steps = [
    { label: "Play", value: plays },
    { label: "Complete", value: completes, pct: plays ? Math.round((completes / plays) * 100) : 0 },
    { label: "Consulta", value: consultas, pct: plays ? Math.round((consultas / plays) * 100) : 0 },
  ];
  return (
    <div className="flex w-full items-end justify-around gap-3 px-6">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-col items-center">
          <div
            className="flex h-40 w-20 items-end justify-center rounded-2xl bg-gold-500/15 ring-1 ring-gold-500/20"
            style={{
              height: `${i === 0 ? 100 : Math.max(20, (s.value / Math.max(plays, 1)) * 100)}%`,
              minHeight: 40,
            }}
          >
            <span className="pb-3 font-display text-xl italic text-gold-400">{s.value}</span>
          </div>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-widest text-ivory-100">
            {s.label}
          </p>
          {s.pct !== undefined ? (
            <p className="text-[11px] text-ivory-200/60">{s.pct}%</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
