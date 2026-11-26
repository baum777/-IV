"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { elements, freshnessMs, providers, readResponse, stages, type Projection, type Reading } from "@/lib/observatory-v1";

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const utc = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" });
const glyphs = { FIRE: "🜂", WATER: "🜄", AIR: "🜁", EARTH: "🜃" };
const unknown = "—";
const money = (value?: number | null) => value == null ? unknown : dollars.format(value / 100);
const words = (value: string) => value.replaceAll("_", " ");
const isFresh = (time: string | undefined | null, now: number) => Boolean(time && now - Date.parse(time) <= freshnessMs);
const duration = (seconds: number | undefined | null) => seconds == null ? unknown : [Math.floor(seconds / 3600),
  Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, "0")).join(":");

function Stamp({ at }: { at?: string | null }) {
  return at ? <time dateTime={at}>{utc.format(new Date(at))} UTC</time> : unknown;
}

function Data({ fields }: { fields: [string, ReactNode][] }) {
  return <dl className="obs-data">{fields.map(([name, value]) =>
    <div key={name}><dt>{name}</dt><dd>{value ?? unknown}</dd></div>
  )}</dl>;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section className={`obs-panel obs-${id}`} aria-labelledby={`obs-${id}`}>
    <h2 id={`obs-${id}`}>{title}</h2>
    {children}
  </section>;
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="obs-empty">{children}</p>;
}

function Amount({ value }: { value?: number | null }) {
  const [display, setDisplay] = useState(value);
  const shown = useRef(value);
  useEffect(() => {
    const from = shown.current;
    if (from == null || value == null || from === value || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current = value;
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / 260);
      shown.current = Math.round(from! + (value! - from!) * progress);
      setDisplay(shown.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span aria-label={money(value)}>{money(display)}</span>;
}

function useProjection() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer: number;
    let controller: AbortController;
    async function poll() {
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 6000);
      let next: Reading;
      try {
        const result = await fetch("/api/observatory", { cache: "no-store", signal: controller.signal });
        next = result.ok ? readResponse(await result.json(), Date.now()) : { mode: "UNAVAILABLE", reason: "INTERRUPTED" };
      } catch {
        next = { mode: "UNAVAILABLE", reason: "INTERRUPTED" };
      } finally {
        clearTimeout(timeout);
      }
      if (!cancelled) {
        setNow(Date.now());
        setReading(next);
        timer = window.setTimeout(poll, 15000);
      }
    }
    void poll();
    return () => {
      cancelled = true;
      controller?.abort();
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    if (reading?.mode !== "CONNECTED") return;
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, [reading?.mode]);
  const expired = reading?.mode === "CONNECTED" && (now - Date.parse(reading.data.publishedAt) > freshnessMs ||
    reading.data.session?.state === "ACTIVE" && (!isFresh(reading.data.session.heartbeatAt, now) ||
      now >= Date.parse(reading.data.session.startedAt!) + reading.data.session.durationSeconds * 1000));
  return { reading: expired ? { mode: "UNAVAILABLE", reason: "STALE" } as const : reading, now };
}

function Session({ reading, now, deploymentRevision }: { reading: Reading | null; now: number; deploymentRevision?: string }) {
  const data = reading && "data" in reading ? reading.data : undefined;
  const session = data?.session;
  const active = reading?.mode === "CONNECTED" && session?.state === "ACTIVE";
  const elapsed = active && session?.elapsedSeconds != null ? Math.min(session.durationSeconds,
    session.elapsedSeconds + Math.max(0, Math.floor((now - Date.parse(session.heartbeatAt!)) / 1000))) : session?.elapsedSeconds;
  const progress = session && elapsed != null ? elapsed / session.durationSeconds : null;

  return <Section id="session" title="Session & runtime">
    <div className="obs-session-top">
      <div className="obs-runtime">{session ? words(session.state) : "UNVERIFIED"}</div>
      <span role="status" className="obs-status" data-state={reading?.mode ?? "LOADING"}>
        {reading?.mode ?? "CHECKING PROJECTION"}
        {reading?.mode === "UNAVAILABLE" && ` · ${reading.reason}`}
      </span>
    </div>
    {progress != null && <div role="progressbar" aria-label="Session progress" aria-valuenow={Math.floor(progress * 100)}
      className="obs-progress" data-active={active}>
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>}
    <Data fields={[
      ["Session", session?.id], ["Classification", session?.classification], ["Execution policy", "PAPER ONLY"],
      ["Elapsed", duration(elapsed)], ["Remaining", duration(session && elapsed != null ? session.durationSeconds - elapsed : null)],
      ["Run started", <Stamp at={session?.startedAt} />], ["Verified heartbeat", <Stamp at={session?.heartbeatAt} />],
      [reading?.mode === "SNAPSHOT" ? "Snapshot created" : "Projection published", <Stamp at={data?.publishedAt} />],
      ["Source revision", data?.sourceRevision && <code title={data.sourceRevision}>{data.sourceRevision.slice(0, 12)}</code>],
      ["Deployment revision", deploymentRevision && <code title={deploymentRevision}>{deploymentRevision.slice(0, 12)}</code>],
    ]} />
  </Section>;
}

function Instances({ data, connected, now }: { data?: Projection; connected: boolean; now: number }) {
  return <Section id="instances" title="The four instances">
    <div className="obs-agents">{elements.map(element => {
      const row = data?.instances.find(item => item.element === element);
      const fresh = isFresh(row?.heartbeatAt, now);
      const active = connected && data?.session?.state === "ACTIVE" && fresh &&
        row && !["IDLE", "UNVERIFIED"].includes(row.state) ? row.state : undefined;
      return <article key={element} data-element={element} className="obs-agent">
        <div className="obs-agent-title"><span className="obs-glyph" data-activity={active} aria-hidden="true">{glyphs[element]}</span>
          <div><h3>{element}</h3><p>{row?.identity ?? unknown}</p></div>
        </div>
        <Data fields={[
          ["Activity", row ? `${words(row.state)}${connected && !fresh ? " · stale" : ""}` : "UNVERIFIED"],
          ["Model", row?.model], ["Last observation", row?.observation], ["Latest decision", row?.decision],
          ["Hypothesis / uncertainty", row?.hypothesis], ["Inference budget", row?.budgetRemaining],
          ["Experiential activity", row?.experience], ["Heartbeat", <Stamp at={row?.heartbeatAt} />],
        ]} />
      </article>;
    })}</div>
  </Section>;
}

function Economy({ data }: { data?: Projection["economy"] }) {
  return <Section id="economy" title="Economic state">
    <p className="obs-caption">Simulated USD · paper ledger</p>
    <div className="obs-equity"><span>Paper equity</span><strong><Amount value={data?.equity} /></strong></div>
    <Data fields={[
      ["Initial capital", <Amount value={data?.initial} />], ["Available", <Amount value={data?.available} />],
      ["Reserved", <Amount value={data?.reserved} />], ["Realized P&L", <Amount value={data?.realized} />],
      ["Unrealized P&L", <Amount value={data?.unrealized} />], ["Fees", <Amount value={data?.fees} />],
      ["Operational reserve", <Amount value={data?.reserve} />],
      ["Drawdown", data?.drawdownBps == null ? unknown : `${(data.drawdownBps / 100).toFixed(2)}%`],
    ]} />
  </Section>;
}

const newest = <T extends { at: string }>(rows: T[]) => [...rows].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

function Market({ rows, now, connected }: { rows: Projection["market"]; now: number; connected: boolean }) {
  const observations = newest(rows);
  const priced = observations.find(row => row.priceUsd != null);
  const series = observations.filter(row => row.priceUsd != null && row.token === priced?.token && row.provider === priced.provider).reverse();
  const values = series.map(row => row.priceUsd!);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const start = Date.parse(series[0]?.at ?? "");
  const span = Date.parse(series.at(-1)?.at ?? "") - start;
  const pointList = series.map(row => `${(Date.parse(row.at) - start) / span * 300},${max === min ? 32 : 60 - (row.priceUsd! - min) / (max - min) * 56}`).join(" ");
  return <Section id="market" title="Market observation">
    {span > 0 && <figure className="obs-chart">
      <figcaption>{priced?.token} · {priced?.provider} · USD spot observations</figcaption>
      <svg viewBox="0 0 300 64" role="img" aria-label={`Observed spot range: ${min} to ${max} USD`}>
        <polyline key={pointList} points={pointList} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </figure>}
    {!rows.length && <Empty>No verified market observations.</Empty>}
    <ol className="obs-stream">{observations.map(row => <li key={row.id}>
      <strong>{words(row.kind)}</strong><span className="obs-token">{row.token}</span>
      <small>{row.provider} · <Stamp at={row.at} />{connected && !isFresh(row.at, now) ? " · stale" : ""}</small>
      <Data fields={[
        ["Observed price", row.priceUsd == null ? unknown : `$${row.priceUsd}`],
        ["Liquidity", row.liquidityUsd == null ? unknown : dollars.format(row.liquidityUsd)],
        ["Trades", row.trades], ["Size-specific quote", words(row.quote)],
      ]} />
    </li>)}</ol>
  </Section>;
}

const executionPhase = {
  PROPOSAL: "Decision", HOLD: "Decision", SKIP: "Decision", REJECTED: "Authority", GRANTED: "Authority",
  RESERVED: "Authority", ENTRY: "Execution", EXIT: "Execution", FILL: "Execution", RECONCILED: "Reconciliation",
};

function Execution({ rows, positions }: { rows: Projection["execution"]; positions: Projection["positions"] }) {
  return <Section id="execution" title="Execution stream">
    {!rows.length && <Empty>No published decisions or fill receipts.</Empty>}
    <ol className="obs-stream">{newest(rows).map(row => <li key={row.id} data-phase={executionPhase[row.stage]}>
      <strong>{executionPhase[row.stage]} · {row.stage}{row.element && ` · ${row.element}`}</strong>
      <p>{row.summary}</p><small><Stamp at={row.at} /></small>
      <Data fields={[["Receipt", row.receipt], ["Fill owner", row.fillOwner], ["Estimated fee", money(row.estimatedFeeCents)]]} />
    </li>)}</ol>
    <h3 className="obs-subhead">Open simulated positions</h3>
    {positions.length ? <Data fields={positions.map(row => [`${row.token} · ${row.id}`, money(row.exposureCents)])} />
      : <Empty>No published open positions.</Empty>}
  </Section>;
}

function Genesis({ rows }: { rows: Projection["esge"] }) {
  const [filter, setFilter] = useState<(typeof elements)[number] | "ALL">("ALL");
  const visible = newest(rows.filter(row => filter === "ALL" || row.element === filter));
  return <Section id="genesis" title="Empirical Strategy Genesis">
    <p className="obs-caption">Experiential evidence · lifecycle records</p>
    <ol className="obs-lifecycle" aria-label="Evidence lifecycle">{stages.map(stage => <li key={stage}>{stage}</li>)}</ol>
    {rows.length > 0 && <div className="obs-filter"><label htmlFor="obs-instance-filter">Instance</label>
      <select id="obs-instance-filter" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
        <option value="ALL">All instances</option>{elements.map(element => <option key={element}>{element}</option>)}
      </select></div>}
    {rows.length > 0 && <Data fields={elements.map(element => [element, rows.filter(row => row.element === element).length])} />}
    {!visible.length && <Empty>No published evidence for this view.</Empty>}
    <ol className="obs-stream">{visible.map(row => <li key={row.id} data-phase={row.stage}>
      <strong>{row.stage} · {row.element}</strong><span>{row.hypothesisId}</span>
      <p>{row.summary}</p><small><Stamp at={row.at} /></small>
      <Data fields={[
        ["Prediction", row.prediction], ["Decision", row.decision], ["Observed outcome", row.outcome],
        ["Contradiction", row.contradiction], ["Strategy candidate", row.candidate],
      ]} />
    </li>)}</ol>
  </Section>;
}

function Health({ rows, connected, now }: { rows: Projection["health"]; connected: boolean; now: number }) {
  return <Section id="health" title="Infrastructure & providers">
    <ul className="obs-health">{providers.map(service => {
      const row = rows.find(record => record.service === service);
      const state = connected && row && !isFresh(row.at, now) ? "STALE" : row?.state ?? "UNVERIFIED";
      return <li key={service}>
        <div><strong>{service}</strong><small><Stamp at={row?.at} /></small></div>
        <div><span className="obs-status" key={state} data-state={state}>{words(state)}</span>
          {row?.qualified != null && <small>{row.qualified ? "Qualified" : "Qualification pending"}</small>}
          {row?.quotaRemaining != null && <small>{row.quotaRemaining} quota remaining</small>}
        </div>
      </li>;
    })}</ul>
  </Section>;
}

export function Observatory({ deploymentRevision }: { deploymentRevision?: string }) {
  const { reading, now } = useProjection();
  const data = reading && "data" in reading ? reading.data : undefined;
  const connected = reading?.mode === "CONNECTED";
  return <div className="obs">
    <header className="obs-header">
      <p>THE FOURTH <span aria-hidden="true">/</span> TATD</p>
      <h1>Observatory</h1>
    </header>
    <div className="obs-grid">
      <Session reading={reading} now={now} deploymentRevision={deploymentRevision} />
      <Instances data={data} connected={connected} now={now} />
      <Economy data={data?.economy} />
      <Market rows={data?.market ?? []} now={now} connected={connected} />
      <Execution rows={data?.execution ?? []} positions={data?.positions ?? []} />
      <Genesis rows={data?.esge ?? []} />
      <Health rows={data?.health ?? []} connected={connected} now={now} />
    </div>
  </div>;
}
