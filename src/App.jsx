import React, { useMemo, useState } from "react";
import { supabase } from './supabase';

function AuthGate({ children }) {
  const [session, setSession] = React.useState(null);
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn() {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for the sign-in link');
  }

  if (!session) {
    return (
      <div style={{ padding: 24, maxWidth: 420 }}>
        <h2>Sign in to Bestway Jobs</h2>
        <input
          placeholder="you@example.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{ width:'100%', padding:10, border:'1px solid #ddd', borderRadius:8, margin:'8px 0' }}
        />
        <button onClick={signIn} style={{ padding:'8px 12px' }}>Send magic link</button>
      </div>
    );
  }
  return children;
}


/**
 * Sandbox‑friendly prototype: no external UI libraries, no icons, no fancy deps.
 * Paste this entire file into src/App.jsx in a fresh React (Vite or CRA) sandbox.
 */

const CREWS = [
  { id: "crew-a", name: "Crew A" },
  { id: "crew-b", name: "Crew B" },
];

const CUSTOMERS = [
  { id: "c1", name: "Singh Residence", address: "12 Meadow Ln, Brampton" },
  { id: "c2", name: "Patel Custom Homes", address: "88 Skyline Dr, Mississauga" },
];

const JOB_TYPES = [
  { id: "spray_foam", label: "Spray Foam" },
  { id: "blow_in", label: "Blow-In" },
  { id: "batts", label: "Batts" },
];

function useWeek() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const mondayOffset = (day + 6) % 7; // days since Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  return days;
}

function formatDay(d) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function timeBlocks() {
  const blocks = [];
  for (let h = 7; h <= 17; h++) {
    blocks.push({ label: `${h}:00` });
    blocks.push({ label: `${h}:30` });
  }
  return blocks;
}

function App() {
  const days = useWeek();
  const blocks = useMemo(() => timeBlocks(), []);
  const [jobs, setJobs] = useState([]); // {id, customerId, jobType, dayIdx, start, durationMin, crewId, area, sqft, thicknessIn, rValue, notes}
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    customerId: CUSTOMERS[0].id,
    jobType: JOB_TYPES[0].id,
    crewId: CREWS[0].id,
    dayIdx: 0,
    start: "08:00",
    durationMin: 180,
    area: "Attic",
    sqft: "1000",
    thicknessIn: "3.5",
    rValue: "50",
    notes: "Gate code 1234",
    options: { topUp: false, baffles: 10, perimeterBatts: true, vaporBarrier: "Poly 6mil" },
  });

  function addJob() {
    setJobs((prev) => [...prev, { id: crypto.randomUUID(), ...draft }]);
    setModalOpen(false);
  }

  function jobsFor(dayIdx, crewId) {
    return jobs.filter((j) => j.dayIdx === dayIdx && j.crewId === crewId);
  }

  function parseTime(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function blockTopPx(start) {
    const minutesFromStart = parseTime(start) - 7 * 60; // grid starts at 07:00
    return (minutesFromStart / 30) * 32; // 32px per 30 min
  }

  function blockHeightPx(durationMin) {
    return (durationMin / 30) * 32;
  }

  const todayIdx = days.findIndex((d) => {
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial, sans-serif", padding: 16, background: "#fafafa", minHeight: "100vh" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Bestway Scheduling — Prototype (Sandbox‑friendly)</h1>
        <button onClick={() => setModalOpen(true)} style={btnPrimary}>+ New Job</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        {/* Calendar Card */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{ fontWeight: 600 }}>Week of {days[0].toLocaleDateString()}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {days.map((d, i) => (
                <span key={i} style={{ ...badge, background: i === todayIdx ? "#111" : "#fff", color: i === todayIdx ? "#fff" : "#111", borderColor: "#ddd" }}>{formatDay(d)}</span>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 900 }}>
              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: `100px repeat(${CREWS.length}, 1fr)` }}>
                <div style={{ padding: 8, fontSize: 12, color: "#666" }}>Time</div>
                {CREWS.map((c) => (
                  <div key={c.id} style={{ padding: 8, fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                ))}
              </div>
              {/* Time grid */}
              <div style={{ position: "relative", borderTop: "1px solid #eee" }}>
                {/* Rows */}
                {blocks.map((b, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: `100px repeat(${CREWS.length}, 1fr)` }}>
                    <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, fontSize: 11, color: "#aaa" }}>{b.label}</div>
                    {CREWS.map((c) => (
                      <div key={c.id + i} style={{ height: 32, borderLeft: "1px solid #f4f4f5" }} />
                    ))}
                  </div>
                ))}
                {/* Day columns with jobs */}
                {days.map((_, dayIdx) => (
                  <div key={dayIdx}>
                    <div style={{ display: "grid", gridTemplateColumns: `100px repeat(${CREWS.length}, 1fr)` }}>
                      <div style={{ padding: 8, background: "#fff", position: "sticky", left: 0, borderTop: "1px solid #eee", borderBottom: "1px solid #eee", zIndex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{formatDay(days[dayIdx]).split(",")[0]}</div>
                      </div>
                      {CREWS.map((crew) => (
                        <div key={crew.id} style={{ position: "relative", height: 32 * blocks.length, borderTop: "1px solid #eee", borderLeft: "1px solid #eee", background: "#fff" }}>
                          {jobsFor(dayIdx, crew.id).map((job) => (
                            <div key={job.id} style={{ position: "absolute", left: 6, right: 6, top: blockTopPx(job.start), height: blockHeightPx(job.durationMin), background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 6, fontSize: 12, overflow: "hidden" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                                <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(CUSTOMERS.find(c=>c.id===job.customerId)||{}).name}</div>
                                <span style={{ ...badge, fontSize: 10 }}>{(JOB_TYPES.find(t=>t.id===job.jobType)||{}).label}</span>
                              </div>
                              <div style={{ marginTop: 4, color: "#555" }}>{job.start} · {Math.round(job.durationMin/60)}h</div>
                              <div style={{ color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.area} · {job.jobType!=="blow_in" ? `${job.sqft} sqft` : `${job.sqft} sqft · R${job.rValue}`}</div>
                            </div>
                          ))}
                          <button onClick={() => { setDraft((d) => ({ ...d, crewId: crew.id, dayIdx })); setModalOpen(true); }} style={{ position: "absolute", bottom: 8, right: 8, fontSize: 10, border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 8px", background: "#fff" }}>Quick add</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card}>
            <div style={cardHeader}><b>Crew App — Today</b></div>
            <div style={{ padding: 12 }}>
              {CREWS.map((crew) => (
                <div key={crew.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 600 }}>{crew.name}</div>
                    <span style={badge}>{jobsFor(todayIdx, crew.id).length} jobs</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {jobsFor(todayIdx, crew.id).map((job) => (
                      <div key={job.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 8, marginBottom: 6 }}>
                        <div style={{ fontWeight: 600 }}>{job.start} · {(CUSTOMERS.find(c=>c.id===job.customerId)||{}).name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{(CUSTOMERS.find(c=>c.id===job.customerId)||{}).address}</div>
                        <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                          <button style={btnSmall}>Start</button>
                          <button style={btnSmall}>Checklist</button>
                          <button style={btnSmall}>Complete</button>
                        </div>
                      </div>
                    ))}
                    {jobsFor(todayIdx, crew.id).length === 0 && (
                      <div style={{ fontSize: 12, color: "#888" }}>No jobs today.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={cardHeader}><b>Quick Materials Estimator</b></div>
            <div style={{ padding: 12 }}>
              <Tabs
                tabs={[{ id: "spray_foam", label: "Spray Foam" }, { id: "blow_in", label: "Blow-In" }, { id: "batts", label: "Batts" }]}
                render={(tab) => {
                  if (tab === "spray_foam") return <SprayFoamEstimator />;
                  if (tab === "blow_in") return <BlowInEstimator />;
                  return <BattsEstimator />;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={modalBackdrop} onClick={() => setModalOpen(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>New Job</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <LabeledSelect label="Customer" value={draft.customerId} onChange={(v) => setDraft((d) => ({ ...d, customerId: v }))} options={CUSTOMERS.map(c => ({ value: c.id, label: c.name }))} />
              <LabeledSelect label="Crew" value={draft.crewId} onChange={(v) => setDraft((d) => ({ ...d, crewId: v }))} options={CREWS.map(c => ({ value: c.id, label: c.name }))} />
              <LabeledSelect label="Day" value={String(draft.dayIdx)} onChange={(v) => setDraft((d) => ({ ...d, dayIdx: Number(v) }))} options={days.map((d, i) => ({ value: String(i), label: formatDay(d) }))} />
              <LabeledInput label="Start" value={draft.start} onChange={(v) => setDraft((d) => ({ ...d, start: v }))} placeholder="08:00" />
              <LabeledInput label="Duration (min)" type="number" value={draft.durationMin} onChange={(v) => setDraft((d) => ({ ...d, durationMin: Number(v) }))} />
              <LabeledSelect label="Job Type" value={draft.jobType} onChange={(v) => setDraft((d) => ({ ...d, jobType: v }))} options={JOB_TYPES.map(t => ({ value: t.id, label: t.label }))} />
            </div>

            {/* Conditional Fields */}
            <div style={{ marginTop: 10, border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              {draft.jobType === "spray_foam" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <LabeledInput label="Area" value={draft.area} onChange={(v) => setDraft((d) => ({ ...d, area: v }))} />
                  <LabeledInput label="Sqft" type="number" value={draft.sqft} onChange={(v) => setDraft((d) => ({ ...d, sqft: v }))} />
                  <LabeledInput label="Thickness (in)" type="number" value={draft.thicknessIn} onChange={(v) => setDraft((d) => ({ ...d, thicknessIn: v }))} />
                  <LabeledInput label="Product" value={draft.product || "Elastochem Extreme"} onChange={(v) => setDraft((d) => ({ ...d, product: v }))} />
                </div>
              )}

              {draft.jobType === "blow_in" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <LabeledInput label="Area" value={draft.area} onChange={(v) => setDraft((d) => ({ ...d, area: v }))} />
                  <LabeledInput label="Sqft" type="number" value={draft.sqft} onChange={(v) => setDraft((d) => ({ ...d, sqft: v }))} />
                  <LabeledInput label="Target R-Value" type="number" value={draft.rValue} onChange={(v) => setDraft((d) => ({ ...d, rValue: v }))} />
                  <div>
                    <div style={labelStyle}>Options</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                      <label><input type="checkbox" checked={draft.options.topUp} onChange={(e) => setDraft((d) => ({ ...d, options: { ...d.options, topUp: e.target.checked } }))} /> Top‑up</label>
                      <label><input type="checkbox" checked={draft.options.perimeterBatts} onChange={(e) => setDraft((d) => ({ ...d, options: { ...d.options, perimeterBatts: e.target.checked } }))} /> Perimeter Batts</label>
                      <label>Baffles <input type="number" value={draft.options.baffles} onChange={(e) => setDraft((d) => ({ ...d, options: { ...d.options, baffles: Number(e.target.value) } }))} style={{ width: 70, marginLeft: 6 }} /></label>
                    </div>
                  </div>
                </div>
              )}

              {draft.jobType === "batts" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <LabeledInput label="Area" value={draft.area} onChange={(v) => setDraft((d) => ({ ...d, area: v }))} />
                  <LabeledInput label="Sqft" type="number" value={draft.sqft} onChange={(v) => setDraft((d) => ({ ...d, sqft: v }))} />
                  <LabeledInput label="R-Value" type="number" value={draft.rValue} onChange={(v) => setDraft((d) => ({ ...d, rValue: v }))} />
                  <LabeledInput label="Vapor Barrier" value={draft.options.vaporBarrier} onChange={(v) => setDraft((d) => ({ ...d, options: { ...d.options, vaporBarrier: v } }))} />
                </div>
              )}
            </div>

            <LabeledInput label="Notes" value={draft.notes} onChange={(v) => setDraft((d) => ({ ...d, notes: v }))} placeholder="Parking, access code, etc" />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={() => setModalOpen(false)} style={btn}>Cancel</button>
              <button onClick={addJob} style={btnPrimary}>Schedule Job</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 12, color: "#666" }}>
        Tip: Use the <b>Quick add</b> button inside any crew column to prefill crew/day.
      </div>
    </div>
  );
}

// ---------------- Components ----------------
function LabeledInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Tabs({ tabs, render }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{ ...btn, background: active === t.id ? "#111" : "#fff", color: active === t.id ? "#fff" : "#111", borderColor: "#ddd" }}>{t.label}</button>
        ))}
      </div>
      <div>{render(active)}</div>
    </div>
  );
}

function LabeledNumber({ label, value, setValue }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} style={inputStyle} />
    </div>
  );
}

function SprayFoamEstimator(){
  const [sqft, setSqft] = useState(1000);
  const [inch, setInch] = useState(3.5);
  const [yieldPerSet, setYieldPerSet] = useState(4000); // bf @ 1"
  const boardFeet = sqft * inch;
  const sets = boardFeet / yieldPerSet;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <LabeledNumber label="Sqft" value={sqft} setValue={setSqft} />
      <LabeledNumber label="Thickness (in)" value={inch} setValue={setInch} />
      <LabeledNumber label={'Yield per set (bf@1")'} value={yieldPerSet} setValue={setYieldPerSet} />
      <div style={estBox}>
        <div>Board Feet: <b>{Math.round(boardFeet).toLocaleString()}</b></div>
        <div>Estimated Sets: <b>{sets.toFixed(2)}</b></div>
      </div>
    </div>
  );
}

function BlowInEstimator(){
  const [sqft, setSqft] = useState(1200);
  const [targetR, setTargetR] = useState(50);
  const [coverageR50, setCoverageR50] = useState(100); // sqft per bag @ R50 (example)
  const coverage = (coverageR50 * 50) / (targetR || 1);
  const bags = sqft / (coverage || 1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <LabeledNumber label="Sqft" value={sqft} setValue={setSqft} />
      <LabeledNumber label="Target R" value={targetR} setValue={setTargetR} />
      <LabeledNumber label="Sqft per bag @R50" value={coverageR50} setValue={setCoverageR50} />
      <div style={estBox}>
        <div>Estimated Bags: <b>{bags.toFixed(1)}</b></div>
      </div>
    </div>
  );
}

function BattsEstimator(){
  const [sqft, setSqft] = useState(900);
  const [rValue, setRValue] = useState(20);
  const [rollSqft, setRollSqft] = useState(40);
  const rolls = sqft / (rollSqft || 1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <LabeledNumber label="Sqft" value={sqft} setValue={setSqft} />
      <LabeledNumber label="R-Value" value={rValue} setValue={setRValue} />
      <LabeledNumber label="Sqft per roll" value={rollSqft} setValue={setRollSqft} />
      <div style={estBox}>
        <div>Estimated Rolls: <b>{rolls.toFixed(1)}</b></div>
      </div>
    </div>
  );
}

// ---------------- Styles ----------------
const card = { background: "#fff", border: "1px solid #eee", borderRadius: 14, overflow: "hidden" };
const cardHeader = { padding: 12, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 };
const badge = { border: "1px solid #e5e7eb", borderRadius: 999, padding: "2px 8px", fontSize: 12, background: "#fff" };
const btn = { border: "1px solid #ddd", background: "#fff", borderRadius: 10, padding: "6px 10px", cursor: "pointer" };
const btnSmall = { ...btn, padding: "4px 8px", fontSize: 12 };
const btnPrimary = { ...btn, background: "#111", color: "#fff", borderColor: "#111" };
const inputStyle = { width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 14 };
const labelStyle = { fontSize: 12, color: "#555", marginBottom: 4 };
const estBox = { gridColumn: "1 / -1", background: "#f9fafb", border: "1px solid #eee", borderRadius: 12, padding: 10 };
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
const modal = { background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 16, width: 640, maxWidth: "95vw" };
export default function AppWrapped() {
  return (
    <AuthGate>
      <App />
    </AuthGate>
  );
}

