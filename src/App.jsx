import { useState, useEffect, useRef } from "react";

const BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah",
  "Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians",
  "2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians",
  "2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James",
  "1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
];

const LOCATION_TYPES = [
  "Home","Vehicle","Church","Field","Hotel","Coffee Shop","Restaurant",
  "Office","Gym","Range","Outdoors","Airport","Other"
];

const SYSTEM_PROMPT = `You are a Scripture analyst for a serious reader who does not want devotional fluff, motivational coach language, or therapy voice. This reader takes the Word as final authority.

When given a Bible passage range, return a JSON object with exactly these four keys:

{
  "questions": ["3 to 5 questions derived directly from the material. Not generic. Not surface-level. Questions that require the reader to go back to the text and wrestle with it. Observation, interpretation, one application."],
  "notes": ["3 to 5 plain-language notes explaining what is actually happening in the passage. Historical context, original meaning, structural observations. No padding. Truth in plain language."],
  "returnVerses": [
    { "ref": "Book Chapter:Verse", "reason": "One sentence on why this verse deserves a second look." }
  ],
  "summary": "One sentence. What this passage is actually about at its core."
}

Rules:
- Return ONLY valid JSON. No preamble, no markdown fences, no extra text.
- Questions must be specific to this exact passage, not generic Bible questions.
- Notes must be factual and grounded. No speculation presented as fact.
- Return verses must come from within the passage read, not outside it.
- Language: strong nouns, active verbs, direct sentences. No em dashes. No therapy tone.`;

function CrossIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function formatTime(d) { return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function formatDate(d) { return new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }
function elapsed(start, end) {
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const d = await r.json();
    const a = d.address || {};
    const city = a.city || a.town || a.village || a.county || "";
    const state = a.state || "";
    if (city && state) return `${city}, ${state}`;
    return city || null;
  } catch { return null; }
}

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null), { timeout: 8000 }
    );
  });
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        else if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function generateShareCard(session) {
  return new Promise((resolve) => {
    const S = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext("2d");

    const drawCard = () => {
      // Dark overlay
      const ov = ctx.createLinearGradient(0, 0, 0, S);
      ov.addColorStop(0, "rgba(10,8,4,0.62)");
      ov.addColorStop(0.4, "rgba(10,8,4,0.35)");
      ov.addColorStop(0.65, "rgba(10,8,4,0.72)");
      ov.addColorStop(1, "rgba(10,8,4,0.97)");
      ctx.fillStyle = ov;
      ctx.fillRect(0, 0, S, S);

      // Cross
      const cx = S / 2;
      ctx.strokeStyle = "#c9a84c";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, 68); ctx.lineTo(cx, 148); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 38, 102); ctx.lineTo(cx + 38, 102); ctx.stroke();

      // SELAH
      ctx.fillStyle = "#e4dcc8";
      ctx.font = "bold 100px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("SELAH", S / 2, 248);

      // Gold divider
      ctx.strokeStyle = "rgba(201,168,76,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(S * 0.25, 275); ctx.lineTo(S * 0.75, 275); ctx.stroke();

      // Passage
      ctx.fillStyle = "#c9a84c";
      ctx.font = "italic 50px Georgia, serif";
      const pLines = wrapText(ctx, session.passage || "", S - 120);
      let py = 345;
      pLines.forEach(l => { ctx.fillText(l, S / 2, py); py += 65; });

      // Summary
      if (session.aiResult?.summary) {
        ctx.fillStyle = "rgba(228,220,200,0.72)";
        ctx.font = "italic 34px Georgia, serif";
        const sLines = wrapText(ctx, `"${session.aiResult.summary}"`, S - 200);
        let sy = py + 28;
        sLines.forEach(l => { ctx.fillText(l, S / 2, sy); sy += 48; });
        py = sy;
      }

      // Top return verse ref
      const rv = session.aiResult?.returnVerses?.[0];
      if (rv) {
        ctx.fillStyle = "rgba(201,168,76,0.55)";
        ctx.font = "600 28px Georgia, serif";
        ctx.fillText(rv.ref, S / 2, py + 34);
      }

      // Location + date
      const locLine = [
        session.locationType !== "Other" ? session.locationType : session.otherLocation,
        session.geoLabel,
        formatDate(session.startTime)
      ].filter(Boolean).join("  ·  ");
      ctx.fillStyle = "rgba(228,220,200,0.42)";
      ctx.font = "400 27px Georgia, serif";
      ctx.fillText(locLine, S / 2, S - 108);

      ctx.strokeStyle = "rgba(201,168,76,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(S * 0.3, S - 88); ctx.lineTo(S * 0.7, S - 88); ctx.stroke();

      ctx.fillStyle = "rgba(201,168,76,0.52)";
      ctx.font = "400 25px Georgia, serif";
      ctx.fillText("Selah  ·  Midnight Ministries", S / 2, S - 54);

      canvas.toBlob(blob => resolve(blob), "image/png");
    };

    if (session.photoData) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#0e0c06";
        ctx.fillRect(0, 0, S, S);
        const ratio = Math.max(S / img.width, S / img.height);
        const dw = img.width * ratio, dh = img.height * ratio;
        ctx.drawImage(img, (S - dw) / 2, (S - dh) / 2, dw, dh);
        drawCard();
      };
      img.src = session.photoData;
    } else {
      ctx.fillStyle = "#0e0c06";
      ctx.fillRect(0, 0, S, S);
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, "#1a1408"); grad.addColorStop(1, "#0a0804");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, S, S);
      const radial = ctx.createRadialGradient(S * 0.3, S * 0.4, 0, S * 0.3, S * 0.4, S * 0.7);
      radial.addColorStop(0, "rgba(201,168,76,0.08)"); radial.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radial; ctx.fillRect(0, 0, S, S);
      drawCard();
    }
  });
}

const STORAGE_KEY = "selah_sessions_v2";
function loadSessions() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveSessions(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

export default function App() {
  const [view, setView] = useState("home");
  const [sessions, setSessions] = useState(loadSessions);
  const [activeSession, setActiveSession] = useState(null);
  const [form, setForm] = useState({
    locationType: "Home", otherLocation: "",
    startBook: "Genesis", startChapter: "", startVerse: "",
    endBook: "Genesis", endChapter: "", endVerse: "", notes: ""
  });
  const [useGps, setUseGps] = useState(true);
  const [sessionPhoto, setSessionPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [expandedSession, setExpandedSession] = useState(null);
  const [openSection, setOpenSection] = useState({ q: true, n: true, v: true });
  const [ticker, setTicker] = useState(0);
  const timerRef = useRef(null);
  const photoInputRef = useRef(null);
  const histPhotoRefs = useRef({});

  useEffect(() => {
    if (view === "session") { timerRef.current = setInterval(() => setTicker(t => t + 1), 15000); }
    return () => clearInterval(timerRef.current);
  }, [view]);

  useEffect(() => { saveSessions(sessions); }, [sessions]);

  function resetForm() {
    setForm({ locationType: "Home", otherLocation: "", startBook: "Genesis", startChapter: "", startVerse: "", endBook: "Genesis", endChapter: "", endVerse: "", notes: "" });
    setResult(null); setActiveSession(null); setError(""); setSessionPhoto(null);
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSessionPhoto(await compressImage(file));
  }

  async function startSession() {
    if (!form.startChapter) { setError("Set a starting chapter."); return; }
    setError(""); setLocLoading(true);
    const coords = await getLocation();
    let geoLabel = null;
    if (useGps && coords) geoLabel = await reverseGeocode(coords.lat, coords.lng);
    setActiveSession({ ...form, coords, geoLabel, startTime: new Date().toISOString(), id: Date.now() });
    setLocLoading(false);
    setView("session");
  }

  async function endSession() {
    if (!form.endChapter) { setError("Set where you finished."); return; }
    setError(""); setLoading(true);
    const endTime = new Date().toISOString();
    const passage = `${activeSession.startBook} ${activeSession.startChapter}${activeSession.startVerse ? ":" + activeSession.startVerse : ""} through ${form.endBook} ${form.endChapter}${form.endVerse ? ":" + form.endVerse : ""}`;
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Passage read: ${passage}` }]
        })
      });
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const completed = { ...activeSession, endBook: form.endBook, endChapter: form.endChapter, endVerse: form.endVerse, personalNotes: form.notes, endTime, passage, aiResult: parsed, photoData: sessionPhoto };
      setSessions(prev => [completed, ...prev]);
      setResult(parsed); setActiveSession(completed); setView("result");
    } catch { setError("Could not generate notes. Check your connection."); }
    setLoading(false);
  }

  async function shareSession(session) {
    setSharing(true);
    try {
      const blob = await generateShareCard(session);
      const file = new File([blob], "selah-session.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "SELAH", text: `${session.passage} — Selah by Midnight Ministries` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "selah-session.png"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        try {
          const blob = await generateShareCard(session);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "selah-session.png"; a.click();
          URL.revokeObjectURL(url);
        } catch {}
      }
    }
    setSharing(false);
  }

  function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (expandedSession === id) setExpandedSession(null);
  }

  const activeMins = activeSession ? Math.round((Date.now() - new Date(activeSession.startTime)) / 60000) : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#0e0c06", color:"#e4dcc8", fontFamily:"'Crimson Text',Georgia,serif", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#3a2e10;border-radius:2px;}
        input,select,textarea{background:#161208;border:1px solid #2e2408;color:#e4dcc8;border-radius:5px;padding:10px 13px;font-family:'Crimson Text',Georgia,serif;font-size:16px;outline:none;width:100%;transition:border-color 0.2s,box-shadow 0.2s;}
        input:focus,select:focus,textarea:focus{border-color:#c9a84c;box-shadow:0 0 0 2px rgba(201,168,76,0.08);}
        select option{background:#161208;}
        .btn-primary{background:linear-gradient(135deg,#c9a84c 0%,#a8832a 100%);color:#0e0c06;border:none;border-radius:5px;padding:14px 24px;font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:0.12em;cursor:pointer;transition:opacity 0.2s,transform 0.1s;text-transform:uppercase;width:100%;}
        .btn-primary:hover{opacity:0.88;transform:translateY(-1px);}
        .btn-primary:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
        .btn-ghost{background:transparent;color:#6a5a30;border:1px solid #2e2408;border-radius:5px;padding:11px 20px;font-family:'Cinzel',serif;font-size:11px;font-weight:600;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;width:100%;}
        .btn-ghost:hover{border-color:#c9a84c;color:#c9a84c;}
        .btn-share{display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;color:#c9a84c;border:1px solid rgba(201,168,76,0.4);border-radius:5px;padding:12px 20px;font-family:'Cinzel',serif;font-size:11px;font-weight:600;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;width:100%;}
        .btn-share:hover{background:rgba(201,168,76,0.07);border-color:#c9a84c;}
        .btn-share:disabled{opacity:0.4;cursor:not-allowed;}
        .btn-danger{background:transparent;color:#8a3020;border:1px solid #3a1810;border-radius:4px;padding:6px 12px;font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;}
        .btn-danger:hover{border-color:#c04030;color:#c04030;}
        .card{background:#141008;border:1px solid #252010;border-radius:8px;padding:18px;margin-bottom:14px;}
        .label{font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.14em;color:#6a5a30;text-transform:uppercase;display:block;margin-bottom:8px;}
        .divider{border:none;border-top:1px solid #252010;margin:14px 0;}
        .fade-in{animation:fadeIn 0.35s ease forwards;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .pulse{animation:pulse 1.8s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .nav-tab{background:transparent;border:none;color:#3a3010;font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;padding:10px 14px;border-bottom:2px solid transparent;transition:all 0.2s;flex:1;}
        .nav-tab.active{color:#c9a84c;border-bottom-color:#c9a84c;}
        .nav-tab:hover:not(.active){color:#8a7a4a;}
        .section-head{display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:14px 0;user-select:none;}
        .hist-card{background:#141008;border:1px solid #252010;border-radius:7px;margin-bottom:10px;overflow:hidden;transition:border-color 0.2s;}
        .hist-card:hover{border-color:#2e2408;}
        .hist-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;}
        .rv-item{border-left:2px solid #2e2408;padding-left:14px;margin-bottom:13px;}
        .q-item{display:flex;gap:12px;margin-bottom:14px;align-items:flex-start;}
        .n-item{display:flex;gap:10px;margin-bottom:13px;align-items:flex-start;}
        .geo-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:20px;padding:4px 10px;font-family:'Cinzel',serif;font-size:9px;color:#8a7a4a;letter-spacing:0.08em;text-transform:uppercase;}
        .photo-drop{border:1px dashed #3a3010;border-radius:6px;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:center;}
        .photo-drop:hover{border-color:#c9a84c;background:rgba(201,168,76,0.03);}
        .photo-preview{width:100%;border-radius:6px;overflow:hidden;position:relative;}
        .photo-preview img{width:100%;display:block;max-height:260px;object-fit:cover;}
        .photo-remove{position:absolute;top:8px;right:8px;background:rgba(10,8,4,0.8);border:1px solid #3a1810;color:#a04030;border-radius:4px;padding:4px 10px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;cursor:pointer;text-transform:uppercase;}
      `}</style>

      <div style={{ position:"fixed",inset:0,pointerEvents:"none",opacity:0.5,zIndex:0,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`
      }}/>

      <div style={{ position:"relative",zIndex:1,maxWidth:480,margin:"0 auto",padding:"0 16px 60px" }}>

        {/* HEADER */}
        <div style={{ textAlign:"center",padding:"28px 0 18px",position:"relative" }}>
          {view !== "session" && (
            <button onClick={()=>setView("settings")} style={{ position:"absolute",right:0,top:28,background:"transparent",border:"none",color:"#3a3010",cursor:"pointer",padding:8,transition:"color 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.color="#c9a84c"}
              onMouseOut={e=>e.currentTarget.style.color="#3a3010"}>
              <SettingsIcon/>
            </button>
          )}
          <div style={{ color:"#c9a84c",marginBottom:10,opacity:0.85 }}><CrossIcon size={22}/></div>
          <h1 style={{ fontFamily:"'Cinzel',serif",fontSize:26,fontWeight:700,letterSpacing:"0.1em",color:"#e4dcc8" }}>SELAH</h1>
          <p style={{ fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:13,color:"#4a3e1a",marginTop:3 }}>Read. Mark. Return.</p>
        </div>

        {/* NAV */}
        {view !== "session" && view !== "settings" && (
          <div style={{ display:"flex",borderBottom:"1px solid #252010",marginBottom:20 }}>
            <button className={`nav-tab ${(view==="home"||view==="result")?"active":""}`} onClick={()=>{ resetForm(); setView("home"); }}>New Session</button>
            <button className={`nav-tab ${view==="history"?"active":""}`} onClick={()=>setView("history")}>
              Log {sessions.length > 0 && `(${sessions.length})`}
            </button>
          </div>
        )}

        {/* HOME */}
        {view === "home" && (
          <div className="fade-in">
            <div className="card">
              <label className="label">Where you are</label>
              <select value={form.locationType} onChange={e=>setForm(f=>({...f,locationType:e.target.value}))}>
                {LOCATION_TYPES.map(l=><option key={l}>{l}</option>)}
              </select>
              {form.locationType === "Other" && (
                <input style={{marginTop:8}} placeholder="Describe the place..." value={form.otherLocation}
                  onChange={e=>setForm(f=>({...f,otherLocation:e.target.value}))}/>
              )}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid #252010" }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ color:useGps?"#c9a84c":"#3a3010" }}><ShieldIcon/></div>
                  <div>
                    <p style={{ fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:useGps?"#6a5a30":"#3a3010" }}>Tag GPS Location</p>
                    <p style={{ fontSize:13,color:"#3a3010",marginTop:2 }}>{useGps ? "Stored on device only — never shared" : "Location will not be recorded"}</p>
                  </div>
                </div>
                <div onClick={()=>setUseGps(v=>!v)} style={{ width:40,height:22,borderRadius:11,cursor:"pointer",flexShrink:0,background:useGps?"#c9a84c":"#252010",border:`1px solid ${useGps?"#c9a84c":"#3a3010"}`,position:"relative",transition:"background 0.2s,border-color 0.2s" }}>
                  <div style={{ position:"absolute",top:2,left:useGps?18:2,width:16,height:16,borderRadius:8,background:useGps?"#0e0c06":"#4a3e1a",transition:"left 0.2s" }}/>
                </div>
              </div>
            </div>

            <div className="card">
              <label className="label">Opening at</label>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8 }}>
                <select value={form.startBook} onChange={e=>setForm(f=>({...f,startBook:e.target.value,endBook:e.target.value}))}>
                  {BOOKS.map(b=><option key={b}>{b}</option>)}
                </select>
                <input placeholder="Ch." type="number" min="1" value={form.startChapter} onChange={e=>setForm(f=>({...f,startChapter:e.target.value,endChapter:e.target.value}))}/>
                <input placeholder="Vs." type="number" min="1" value={form.startVerse} onChange={e=>setForm(f=>({...f,startVerse:e.target.value}))}/>
              </div>
            </div>

            {error && <p style={{ color:"#a04030",fontSize:15,marginBottom:12,fontStyle:"italic" }}>{error}</p>}
            <button className="btn-primary" onClick={startSession} disabled={locLoading}>
              {locLoading ? "Getting Location..." : "Open the Word"}
            </button>
          </div>
        )}

        {/* SESSION */}
        {view === "session" && activeSession && (
          <div className="fade-in">
            <div style={{ background:"#141008",border:"1px solid #2e2408",borderRadius:8,padding:"14px 16px",marginBottom:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:activeSession.geoLabel?10:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,color:"#6a5a30",fontSize:13 }}>
                  <ClockIcon/><span>{formatTime(activeSession.startTime)}</span>
                  <span className="pulse" style={{ color:"#c9a84c",fontSize:10 }}>●</span>
                  <span style={{ color:"#8a7a4a" }}>{activeMins}m</span>
                </div>
                <span style={{ fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase" }}>{activeSession.locationType}</span>
              </div>
              {activeSession.geoLabel && <div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div>}
            </div>

            <div style={{ textAlign:"center",padding:"16px 0 20px" }}>
              <p style={{ fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7 }}>In the Word</p>
              <p style={{ fontFamily:"'Crimson Text',serif",fontSize:24,color:"#c9a84c" }}>
                {activeSession.startBook} {activeSession.startChapter}{activeSession.startVerse?`:${activeSession.startVerse}`:""}
              </p>
            </div>

            {/* Photo upload */}
            <div className="card">
              <label className="label" style={{ display:"flex",alignItems:"center",gap:6 }}><CameraIcon/> Capture the Moment (optional)</label>
              {sessionPhoto ? (
                <div className="photo-preview">
                  <img src={sessionPhoto} alt="Session"/>
                  <button className="photo-remove" onClick={()=>setSessionPhoto(null)}>Remove</button>
                </div>
              ) : (
                <div className="photo-drop" onClick={()=>photoInputRef.current?.click()}>
                  <div style={{ color:"#4a3e1a" }}><CameraIcon/></div>
                  <p style={{ fontFamily:"'Cinzel',serif",fontSize:10,color:"#3a3010",letterSpacing:"0.1em",textTransform:"uppercase" }}>Add a photo</p>
                  <p style={{ fontSize:14,color:"#2e2408" }}>Where you are. Who you're with. What surrounds this time.</p>
                  <p style={{ fontSize:12,color:"#252010",marginTop:4 }}>Saved to your log — share as a card when you close</p>
                </div>
              )}
              <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoUpload}/>
            </div>

            <div className="card">
              <label className="label">Closing at</label>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8 }}>
                <select value={form.endBook} onChange={e=>setForm(f=>({...f,endBook:e.target.value}))}>
                  {BOOKS.map(b=><option key={b}>{b}</option>)}
                </select>
                <input placeholder="Ch." type="number" min="1" value={form.endChapter} onChange={e=>setForm(f=>({...f,endChapter:e.target.value}))}/>
                <input placeholder="Vs." type="number" min="1" value={form.endVerse} onChange={e=>setForm(f=>({...f,endVerse:e.target.value}))}/>
              </div>
            </div>

            <div className="card">
              <label className="label">Your notes (optional)</label>
              <textarea rows={3} placeholder="What hit you. What you noticed. What you're carrying out." style={{ resize:"vertical" }}
                value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
            </div>

            {error && <p style={{ color:"#a04030",fontSize:15,marginBottom:12,fontStyle:"italic" }}>{error}</p>}

            {loading ? (
              <div style={{ textAlign:"center",padding:"28px 0" }}>
                <p className="pulse" style={{ fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:"0.18em" }}>PROCESSING PASSAGE...</p>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <button className="btn-primary" onClick={endSession}>Close Session</button>
                <button className="btn-ghost" onClick={()=>{ resetForm(); setView("home"); }}>Abandon</button>
              </div>
            )}
          </div>
        )}

        {/* RESULT */}
        {view === "result" && result && activeSession && (
          <div className="fade-in">
            {/* Photo header */}
            {activeSession.photoData ? (
              <div style={{ borderRadius:8,overflow:"hidden",marginBottom:14,position:"relative" }}>
                <img src={activeSession.photoData} alt="" style={{ width:"100%",maxHeight:280,objectFit:"cover",display:"block" }}/>
                <div style={{ position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 45%,rgba(14,12,6,0.9) 100%)" }}/>
                <div style={{ position:"absolute",bottom:14,left:16,right:16 }}>
                  <p style={{ fontFamily:"'Crimson Text',serif",fontSize:19,color:"#c9a84c",marginBottom:6 }}>{activeSession.passage}</p>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:"6px 12px",alignItems:"center" }}>
                    {activeSession.geoLabel && <div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div>}
                    <span style={{ fontFamily:"'Cinzel',serif",fontSize:9,color:"#5a4a2a",letterSpacing:"0.08em" }}>
                      {elapsed(activeSession.startTime,activeSession.endTime)} · {activeSession.locationType}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background:"linear-gradient(160deg,#181208,#0e0c06)",border:"1px solid #2e2408",borderRadius:8,padding:"18px",marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",gap:12 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6 }}>Session Complete</p>
                    <p style={{ fontFamily:"'Crimson Text',serif",fontSize:20,color:"#c9a84c",lineHeight:1.3 }}>{activeSession.passage}</p>
                  </div>
                  <div style={{ textAlign:"right",fontSize:12,color:"#4a3e1a",flexShrink:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end",marginBottom:5 }}><ClockIcon/>{elapsed(activeSession.startTime,activeSession.endTime)}</div>
                    <div style={{ fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase" }}>{activeSession.locationType}</div>
                  </div>
                </div>
                {activeSession.geoLabel && <div style={{marginTop:10}}><div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div></div>}
              </div>
            )}

            {result.summary && (
              <div style={{ borderLeft:"2px solid rgba(201,168,76,0.4)",paddingLeft:16,marginBottom:16 }}>
                <p style={{ fontStyle:"italic",color:"#8a7a5a",fontSize:18,lineHeight:1.55 }}>"{result.summary}"</p>
              </div>
            )}

            {/* Share button */}
            <div style={{ marginBottom:16 }}>
              <button className="btn-share" onClick={()=>shareSession(activeSession)} disabled={sharing}>
                {sharing ? <><span className="pulse" style={{fontSize:10}}>●</span>&nbsp;Building card...</> : <><ShareIcon/> Share This Session</>}
              </button>
              <p style={{ fontFamily:"'Cinzel',serif",fontSize:9,color:"#2e2408",letterSpacing:"0.08em",textAlign:"center",marginTop:7 }}>
                {activeSession.photoData ? "Generates a card with your photo, passage + Midnight Ministries mark" : "Generates a share card with passage, notes + Midnight Ministries mark"}
              </p>
            </div>

            {/* Questions */}
            <div className="card">
              <div className="section-head" onClick={()=>setOpenSection(s=>({...s,q:!s.q}))}>
                <span style={{ fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"#c9a84c",textTransform:"uppercase" }}>Questions from the Text</span>
                <ChevronIcon open={openSection.q}/>
              </div>
              {openSection.q && <div style={{paddingTop:10}}>{result.questions?.map((q,i)=>(
                <div key={i} className="q-item">
                  <span style={{ fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",minWidth:22,paddingTop:4 }}>{String(i+1).padStart(2,"0")}</span>
                  <p style={{ fontSize:17,lineHeight:1.65,color:"#d4ccb8" }}>{q}</p>
                </div>
              ))}</div>}
            </div>

            {/* Field Notes */}
            <div className="card">
              <div className="section-head" onClick={()=>setOpenSection(s=>({...s,n:!s.n}))}>
                <span style={{ fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"#c9a84c",textTransform:"uppercase" }}>Field Notes</span>
                <ChevronIcon open={openSection.n}/>
              </div>
              {openSection.n && <div style={{paddingTop:10}}>{result.notes?.map((n,i)=>(
                <div key={i} className="n-item">
                  <span style={{ color:"#c9a84c",fontSize:16,minWidth:14,paddingTop:2 }}>—</span>
                  <p style={{ fontSize:17,lineHeight:1.65,color:"#d4ccb8" }}>{n}</p>
                </div>
              ))}</div>}
            </div>

            {/* Return Verses */}
            <div className="card">
              <div className="section-head" onClick={()=>setOpenSection(s=>({...s,v:!s.v}))}>
                <span style={{ fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"#c9a84c",textTransform:"uppercase" }}>Come Back To</span>
                <ChevronIcon open={openSection.v}/>
              </div>
              {openSection.v && <div style={{paddingTop:10}}>{result.returnVerses?.map((v,i)=>(
                <div key={i} className="rv-item">
                  <p style={{ fontFamily:"'Cinzel',serif",fontSize:12,color:"#c9a84c",marginBottom:5 }}>{v.ref}</p>
                  <p style={{ fontSize:16,color:"#6a5a30",lineHeight:1.55,fontStyle:"italic" }}>{v.reason}</p>
                </div>
              ))}</div>}
            </div>

            {activeSession.personalNotes && (
              <div className="card" style={{borderColor:"#2e2408",marginBottom:14}}>
                <p className="label">Your Notes</p>
                <p style={{ fontSize:17,lineHeight:1.65,color:"#6a5a30",fontStyle:"italic" }}>{activeSession.personalNotes}</p>
              </div>
            )}

            <button className="btn-primary" onClick={()=>{ resetForm(); setView("home"); }}>New Session</button>
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div className="fade-in">
            {sessions.length === 0 ? (
              <div style={{ textAlign:"center",padding:"60px 0" }}>
                <div style={{ color:"#2e2408",marginBottom:16,display:"flex",justifyContent:"center" }}><BookIcon/></div>
                <p style={{ fontFamily:"'Cinzel',serif",fontSize:10,color:"#2e2408",letterSpacing:"0.14em" }}>NO SESSIONS LOGGED</p>
              </div>
            ) : (
              <>
                <div style={{ display:"flex",background:"#141008",border:"1px solid #252010",borderRadius:7,overflow:"hidden",marginBottom:18 }}>
                  {[["Sessions",sessions.length],["Books",new Set(sessions.map(s=>s.startBook)).size],["Time",(() => { const m = sessions.reduce((a,s)=>a+Math.round((new Date(s.endTime)-new Date(s.startTime))/60000),0); return m<60?`${m}m`:`${Math.floor(m/60)}h`; })()]].map(([l,v],i,arr)=>(
                    <div key={l} style={{ flex:1,padding:"12px 8px",textAlign:"center",borderRight:i<arr.length-1?"1px solid #252010":"none" }}>
                      <p style={{ fontFamily:"'Cinzel',serif",fontSize:16,color:"#c9a84c",fontWeight:600 }}>{v}</p>
                      <p style={{ fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:3 }}>{l}</p>
                    </div>
                  ))}
                </div>

                {sessions.map(s=>(
                  <div key={s.id} className="hist-card">
                    {s.photoData && (
                      <div style={{ height:90,overflow:"hidden",position:"relative" }}>
                        <img src={s.photoData} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:0.65 }}/>
                        <div style={{ position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(14,12,6,0.85))" }}/>
                      </div>
                    )}
                    <div className="hist-head" onClick={()=>setExpandedSession(expandedSession===s.id?null:s.id)}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ fontFamily:"'Crimson Text',serif",fontSize:18,color:"#c9a84c",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.passage}</p>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:"6px 14px",color:"#4a3e1a",fontSize:12,alignItems:"center" }}>
                          <span style={{display:"flex",alignItems:"center",gap:3}}><ClockIcon/>{formatDate(s.startTime)}</span>
                          <span>{elapsed(s.startTime,s.endTime)}</span>
                          {s.geoLabel && <span style={{display:"flex",alignItems:"center",gap:3}}><PinIcon/>{s.geoLabel}</span>}
                        </div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginLeft:8,flexShrink:0 }}>
                        <button className="btn-danger" onClick={e=>{e.stopPropagation();deleteSession(s.id);}}>×</button>
                        <ChevronIcon open={expandedSession===s.id}/>
                      </div>
                    </div>

                    {expandedSession===s.id && s.aiResult && (
                      <div style={{ padding:"0 16px 16px",borderTop:"1px solid #252010" }}>
                        {s.aiResult.summary && <p style={{ fontStyle:"italic",color:"#5a4a20",fontSize:15,padding:"12px 0",lineHeight:1.55 }}>"{s.aiResult.summary}"</p>}
                        <button className="btn-share" style={{fontSize:10,padding:"9px 16px",marginBottom:14}} onClick={()=>shareSession(s)} disabled={sharing}>
                          <ShareIcon/> Share Session
                        </button>
                        <hr className="divider"/>
                        <p className="label">Questions</p>
                        {s.aiResult.questions?.map((q,i)=>(
                          <p key={i} style={{ fontSize:15,color:"#6a5a30",marginBottom:8,paddingLeft:12,borderLeft:"1px solid #252010",lineHeight:1.5 }}>{q}</p>
                        ))}
                        <hr className="divider"/>
                        <p className="label">Return Verses</p>
                        {s.aiResult.returnVerses?.map((v,i)=>(
                          <div key={i} style={{marginBottom:9}}>
                            <span style={{ fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c" }}>{v.ref}</span>
                            <span style={{ color:"#5a4a20",fontSize:14,fontStyle:"italic" }}> — {v.reason}</span>
                          </div>
                        ))}
                        {s.personalNotes && (<><hr className="divider"/><p style={{ fontStyle:"italic",color:"#5a4a20",fontSize:15,lineHeight:1.55 }}>{s.personalNotes}</p></>)}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {view === "settings" && (
          <div className="fade-in">
            <button onClick={()=>setView("home")} style={{ background:"transparent",border:"none",color:"#6a5a30",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:6,padding:0 }}>
              ← Back
            </button>
            <div className="card" style={{ textAlign:"center",paddingTop:28,paddingBottom:28 }}>
              <div style={{ color:"#c9a84c",marginBottom:14,opacity:0.7,display:"flex",justifyContent:"center" }}><CrossIcon size={28}/></div>
              <h2 style={{ fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,letterSpacing:"0.1em",color:"#e4dcc8",marginBottom:6 }}>SELAH</h2>
              <p style={{ fontFamily:"'Crimson Text',serif",fontStyle:"italic",color:"#4a3e1a",fontSize:14,marginBottom:18 }}>Read. Mark. Return.</p>
              <p style={{ fontFamily:"'Cinzel',serif",fontSize:10,color:"#3a3010",letterSpacing:"0.12em",textTransform:"uppercase" }}>Selah by Midnight Ministries</p>
            </div>
            <div className="card">
              <p className="label">Privacy</p>
              <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                <div style={{ color:"#c9a84c",marginTop:2,flexShrink:0 }}><ShieldIcon/></div>
                <p style={{ fontSize:16,lineHeight:1.65,color:"#6a5a30" }}>
                  GPS location and photos are stored only on this device. Nothing is transmitted or synced externally. Share cards are generated locally and only leave the device when you choose to send them.
                </p>
              </div>
            </div>
            <div className="card">
              <p className="label">Storage</p>
              <p style={{ fontSize:16,lineHeight:1.65,color:"#6a5a30",marginBottom:14 }}>All sessions including photos are saved in your browser. Clearing browser data removes your log.</p>
              <p style={{ fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",letterSpacing:"0.08em" }}>
                {sessions.length} session{sessions.length!==1?"s":""} — {sessions.filter(s=>s.photoData).length} with photos
              </p>
            </div>
            <div className="card">
              <p className="label">Clear All Data</p>
              <p style={{ fontSize:15,color:"#5a4a20",marginBottom:14,lineHeight:1.5 }}>Removes every session from this device. Cannot be undone.</p>
              <button className="btn-danger" style={{ width:"100%",padding:"12px" }}
                onClick={()=>{ if(window.confirm("Delete all sessions? This cannot be undone.")) { setSessions([]); saveSessions([]); }}}>
                Clear All Sessions
              </button>
            </div>
            <div style={{ textAlign:"center",paddingTop:8 }}>
              <p style={{ fontFamily:"'Cinzel',serif",fontSize:9,color:"#2e2408",letterSpacing:"0.1em",textTransform:"uppercase" }}>Psalm 46:10</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
