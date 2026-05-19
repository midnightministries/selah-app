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

const SYSTEM_PROMPT = `You are a Scripture analyst built for serious readers who take His word as final authority. No devotional fluff. No motivational coach language. No therapy voice. No flattery. His word stands on its own.

When given a Bible passage range, return a JSON object with exactly these five keys:

{
  "context": "3 to 5 sentences. Cover: who wrote this, who they wrote it to, when, and under what circumstances. Then — critically — what was happening immediately before this passage in the narrative or argument. What tension, question, or event does this passage land into? What does the reader need to know to understand why this was written and what it was answering. Factual. No speculation. This is ground.",
  "summary": "One sentence. What this passage is actually about at its core.",
  "questions": ["3 to 5 questions derived directly from the material. Not generic. Not surface-level. Questions that require the reader to return to the text and wrestle with it. Observation, interpretation, one application. These questions should not be answerable without going back to the passage."],
  "notes": ["3 to 5 plain-language notes on what is actually happening in the passage. Historical grounding, original meaning, structural observations. No padding. No commentary that belongs to a tradition rather than the text. Truth in plain language."],
  "returnVerses": [
    { "ref": "Book Chapter:Verse", "reason": "One sentence on why this verse demands a second look. Not because it is comforting. Because it requires something." }
  ]
}

Rules:
- Return ONLY valid JSON. No preamble, no markdown fences, no extra text.
- Questions must be specific to this exact passage. Never generic.
- Notes must be factual and grounded. No speculation presented as fact.
- Return verses must come from within the passage read, not outside it.
- Language: strong nouns, active verbs, direct sentences. No em dashes. No therapy tone. No flattery.`;

// ── Chalky Cross Icon (matches the reference image, recolored for the app) ──
function CrossIcon({ size = 24, glow = false }) {
  const imgH = Math.round(size * 1.5);
  return (
    <img
      src="data:image/png;base64,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"
      width={size}
      height={imgH}
      alt=""
      style={{
        display:"block",
        objectFit:"contain"
      }}
    />
  );
}

// Midnight Ministries footer cross
// Midnight Ministries footer cross (smaller, footer version)
function FooterCross({ size = 14 }) {
  return (
    <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 40 60" fill="none">
      <defs>
        <filter id="chalk-foot" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="5" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1" result="displaced"/>
          <feGaussianBlur in="displaced" stdDeviation="0.4"/>
        </filter>
        <radialGradient id="halo-foot" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="27" rx="16" ry="20" fill="url(#halo-foot)"/>
      <rect x="17" y="3" width="6" height="54" rx="1.5" fill="#c9a84c" filter="url(#chalk-foot)"/>
      <rect x="4" y="20" width="32" height="6" rx="1.5" fill="#c9a84c" filter="url(#chalk-foot)"/>
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
function NotesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────
function getTimeOpts() {
  const fmt = localStorage.getItem("selah_clock_fmt") || "12";
  const tz = localStorage.getItem("selah_timezone") || "device";
  const opts = { hour:"2-digit", minute:"2-digit", hour12: fmt === "12" };
  if (tz !== "device") opts.timeZone = tz;
  return opts;
}
function formatTime(d) { return new Date(d).toLocaleTimeString([], getTimeOpts()); }
function formatDate(d) {
  const tz = localStorage.getItem("selah_timezone") || "device";
  const opts = { weekday:"short", month:"short", day:"numeric", year:"numeric" };
  if (tz !== "device") opts.timeZone = tz;
  return new Date(d).toLocaleDateString([], opts);
}
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
  const lines = []; let cur = "";
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
      const ov = ctx.createLinearGradient(0, 0, 0, S);
      ov.addColorStop(0, "rgba(10,8,4,0.65)");
      ov.addColorStop(0.38, "rgba(10,8,4,0.38)");
      ov.addColorStop(0.65, "rgba(10,8,4,0.72)");
      ov.addColorStop(1, "rgba(10,8,4,0.97)");
      ctx.fillStyle = ov; ctx.fillRect(0, 0, S, S);

      // Cross — chalky look via shadow layers
      const cx = S / 2;
      const drawCrossBeam = (x1,y1,x2,y2) => {
        ctx.shadowColor = "rgba(201,168,76,0.4)";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "rgba(226,216,168,0.9)";
        ctx.lineWidth = 18;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(240,232,192,0.6)";
        ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      };
      // Glow halo
      const halo = ctx.createRadialGradient(cx,110,0,cx,110,90);
      halo.addColorStop(0,"rgba(201,168,76,0.3)"); halo.addColorStop(1,"rgba(201,168,76,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.ellipse(cx,110,90,80,0,0,Math.PI*2); ctx.fill();
      // Vertical: top portion taller than in a traditional cross
      drawCrossBeam(cx, 48, cx, 168);
      // Horizontal crossbar at ~38% from top of beam
      drawCrossBeam(cx-62, 95, cx+62, 95);

      // SELAH wordmark
      ctx.shadowColor = "rgba(201,168,76,0.2)"; ctx.shadowBlur = 12;
      ctx.fillStyle = "#e4dcc8"; ctx.font = "bold 100px Georgia, serif"; ctx.textAlign = "center";
      ctx.fillText("SELAH", S/2, 254); ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(201,168,76,0.38)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(S*0.25,280); ctx.lineTo(S*0.75,280); ctx.stroke();

      ctx.fillStyle = "#c9a84c"; ctx.font = "italic 50px Georgia, serif";
      const pLines = wrapText(ctx, session.passage||"", S-120);
      let py = 348; pLines.forEach(l=>{ ctx.fillText(l,S/2,py); py+=64; });

      if (session.aiResult?.summary) {
        ctx.fillStyle = "rgba(228,220,200,0.72)"; ctx.font = "italic 34px Georgia, serif";
        const sLines = wrapText(ctx,`"${session.aiResult.summary}"`,S-200);
        let sy = py+26; sLines.forEach(l=>{ ctx.fillText(l,S/2,sy); sy+=48; }); py=sy;
      }

      const rv = session.aiResult?.returnVerses?.[0];
      if (rv) {
        ctx.fillStyle="rgba(201,168,76,0.55)"; ctx.font="600 28px Georgia,serif";
        ctx.fillText(rv.ref, S/2, py+32);
      }

      const locLine = [
        session.locationType !== "Other" ? session.locationType : session.otherLocation,
        session.geoLabel, formatDate(session.startTime)
      ].filter(Boolean).join("  ·  ");
      ctx.fillStyle="rgba(228,220,200,0.42)"; ctx.font="400 27px Georgia,serif";
      ctx.fillText(locLine, S/2, S-108);

      ctx.strokeStyle="rgba(201,168,76,0.22)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(S*0.3,S-88); ctx.lineTo(S*0.7,S-88); ctx.stroke();

      ctx.fillStyle="rgba(201,168,76,0.55)"; ctx.font="400 25px Georgia,serif";
      ctx.fillText("MIDNIGHT MINISTRIES", S/2, S-54);

      canvas.toBlob(blob=>resolve(blob),"image/png");
    };

    if (session.photoData) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle="#0e0c06"; ctx.fillRect(0,0,S,S);
        const ratio = Math.max(S/img.width,S/img.height);
        const dw=img.width*ratio,dh=img.height*ratio;
        ctx.drawImage(img,(S-dw)/2,(S-dh)/2,dw,dh);
        drawCard();
      };
      img.src = session.photoData;
    } else {
      ctx.fillStyle="#0e0c06"; ctx.fillRect(0,0,S,S);
      const grad=ctx.createLinearGradient(0,0,S,S);
      grad.addColorStop(0,"#1a1408"); grad.addColorStop(1,"#0a0804");
      ctx.fillStyle=grad; ctx.fillRect(0,0,S,S);
      const radial=ctx.createRadialGradient(S*0.3,S*0.4,0,S*0.3,S*0.4,S*0.7);
      radial.addColorStop(0,"rgba(201,168,76,0.08)"); radial.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=radial; ctx.fillRect(0,0,S,S);
      drawCard();
    }
  });
}

// Generate formatted note text for export to Notes/Files
function generateNoteText(session) {
  const line = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  const thin = "────────────────────────────────────────";
  let txt = "";
  txt += `SELAH SESSION LOG\n${line}\n\n`;
  txt += `PASSAGE\n${session.passage}\n\n`;
  txt += `DATE\n${formatDate(session.startTime)}\n\n`;
  txt += `LOCATION\n${session.locationType !== "Other" ? session.locationType : session.otherLocation}`;
  if (session.geoLabel) txt += ` — ${session.geoLabel}`;
  txt += `\n\n`;
  txt += `TIME IN THE WORD\n${elapsed(session.startTime, session.endTime)}\n\n`;
  txt += `${line}\n\n`;

  if (session.aiResult?.summary) {
    txt += `SUMMARY\n${session.aiResult.summary}\n\n${thin}\n\n`;
  }

  if (session.aiResult?.questions?.length) {
    txt += `QUESTIONS FROM THE TEXT\n`;
    session.aiResult.questions.forEach((q,i) => { txt += `${String(i+1).padStart(2,"0")}. ${q}\n`; });
    txt += `\n${thin}\n\n`;
  }

  if (session.aiResult?.notes?.length) {
    txt += `FIELD NOTES\n`;
    session.aiResult.notes.forEach(n => { txt += `— ${n}\n`; });
    txt += `\n${thin}\n\n`;
  }

  if (session.aiResult?.returnVerses?.length) {
    txt += `COME BACK TO\n`;
    session.aiResult.returnVerses.forEach(v => { txt += `${v.ref}\n${v.reason}\n\n`; });
    txt += `${thin}\n\n`;
  }

  if (session.personalNotes) {
    txt += `YOUR NOTES\n${session.personalNotes}\n\n${thin}\n\n`;
  }

  txt += `${line}\nSelah by Midnight Ministries\n`;
  txt += `Save in: Selah — Midnight Ministries (folder)\n`;
  return txt;
}

async function shareAsNote(session) {
  const text = generateNoteText(session);
  const dateStr = new Date(session.startTime).toISOString().slice(0,10);
  const passageShort = (session.passage||"Session").slice(0,40).replace(/[^a-zA-Z0-9 ]/g," ").trim();
  const filename = `Selah — ${passageShort} — ${dateStr}.txt`;
  const blob = new Blob([text], { type: "text/plain" });
  const file = new File([blob], filename, { type: "text/plain" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Selah — "+passageShort, text: "Session: "+session.passage });
      return "shared";
    } catch(e) {
      if (e.name === "AbortError") return "cancelled";
    }
  }
  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}

const STORAGE_KEY = "selah_sessions_v2";
function loadSessions() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]; } catch { return []; } }
function saveSessions(s) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(s)); } catch {} }

// ── Midnight Ministries footer (always visible) ──
function MMFooter() {
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      background:"linear-gradient(to top, rgba(10,8,4,0.98) 70%, rgba(10,8,4,0))",
      paddingTop:18, paddingBottom:10,
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      pointerEvents:"none"
    }}>
      <svg width="0" height="0" style={{position:"absolute"}}>
        <defs>
          <filter id="chalk-mm" x="-5%" y="-30%" width="110%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="7" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
            <feGaussianBlur in="displaced" stdDeviation="0.35" result="soft"/>
            <feComposite in="soft" in2="SourceGraphic" operator="in" result="clipped"/>
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#c9a84c" floodOpacity="0.45"/>
          </filter>
        </defs>
      </svg>
      <span style={{
        fontFamily:"'Cinzel',serif",
        fontSize:12,
        letterSpacing:"0.22em",
        textTransform:"uppercase",
        color:"#c8bfa0",
        textShadow:"0 0 22px rgba(201,168,76,0.32), 0 0 55px rgba(201,168,76,0.14)",
        filter:"url(#chalk-mm)",
        paddingBottom:1
      }}>
        MIDNIGHT MINISTRIES
      </span>
    </div>
  );
}

// ── Export bottom sheet ──
function ExportSheet({ session, onClose }) {
  const [state, setState] = useState("idle"); // idle | working | done

  async function handleShareImage() {
    setState("working");
    try {
      const blob = await generateShareCard(session);
      const file = new File([blob],"selah-session.png",{type:"image/png"});
      if (navigator.share && navigator.canShare?.({files:[file]})) {
        await navigator.share({files:[file],title:"SELAH",text:`${session.passage} — Selah by Midnight Ministries`});
      } else {
        const url=URL.createObjectURL(blob); const a=document.createElement("a");
        a.href=url; a.download="selah-session.png"; a.click(); URL.revokeObjectURL(url);
      }
    } catch {}
    setState("idle");
  }

  async function handleSaveNote() {
    setState("working");
    await shareAsNote(session);
    setState("idle");
  }

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:200,
      background:"rgba(10,8,4,0.85)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"
    }} onClick={onClose}>
      <div style={{
        background:"#141008",border:"1px solid #2e2408",
        borderRadius:"12px 12px 0 0",padding:"24px 20px 36px",
        width:"100%",maxWidth:480
      }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:36,height:3,background:"#3a3010",borderRadius:2,margin:"0 auto 20px" }}/>
        <p style={{ fontFamily:"'Cinzel',serif",fontSize:12,color:"#6a5a30",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:16,textAlign:"center" }}>
          Save or Share Session
        </p>

        {/* Share as image */}
        <button onClick={handleShareImage} disabled={state==="working"} style={{
          display:"flex",alignItems:"center",gap:14,width:"100%",
          background:"transparent",border:"1px solid #2e2408",borderRadius:7,
          padding:"14px 16px",cursor:"pointer",marginBottom:10,transition:"border-color 0.2s"
        }}
          onMouseOver={e=>e.currentTarget.style.borderColor="#c9a84c"}
          onMouseOut={e=>e.currentTarget.style.borderColor="#2e2408"}>
          <div style={{ color:"#c9a84c",flexShrink:0 }}><ShareIcon/></div>
          <div style={{ textAlign:"left" }}>
            <p style={{ fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3 }}>Share as Image</p>
            <p style={{ fontFamily:"'Crimson Text',serif",fontSize:14,color:"#5a4a20",fontStyle:"italic" }}>
              1080×1080 card — Instagram, Facebook, Messages, WhatsApp
            </p>
          </div>
        </button>

        {/* Save as note */}
        <button onClick={handleSaveNote} disabled={state==="working"} style={{
          display:"flex",alignItems:"center",gap:14,width:"100%",
          background:"transparent",border:"1px solid #2e2408",borderRadius:7,
          padding:"14px 16px",cursor:"pointer",marginBottom:10,transition:"border-color 0.2s"
        }}
          onMouseOver={e=>e.currentTarget.style.borderColor="#c9a84c"}
          onMouseOut={e=>e.currentTarget.style.borderColor="#2e2408"}>
          <div style={{ color:"#c9a84c",flexShrink:0 }}><NotesIcon/></div>
          <div style={{ textAlign:"left" }}>
            <p style={{ fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3 }}>Save to Notes or Files</p>
            <p style={{ fontFamily:"'Crimson Text',serif",fontSize:14,color:"#5a4a20",fontStyle:"italic" }}>
              Formatted text — opens share sheet to Apple Notes, Files, or any app
            </p>
          </div>
        </button>

        <p style={{ fontFamily:"'Cinzel',serif",fontSize:9,color:"#2e2408",textAlign:"center",letterSpacing:"0.08em",marginTop:14,lineHeight:1.6 }}>
          SAVE IN APPLE NOTES: tap Notes on the share sheet<br/>
          FILE TITLE INCLUDES DATE + PASSAGE FOR EASY SORTING<br/>
          AUTO-FOLDER CREATION AVAILABLE IN THE NATIVE APP
        </p>

        {state === "working" && (
          <p style={{ fontFamily:"'Cinzel',serif",fontSize:12,color:"#c9a84c",textAlign:"center",marginTop:12,letterSpacing:"0.1em" }}
            className="pulse">BUILDING...</p>
        )}

        <button onClick={onClose} style={{
          width:"100%",marginTop:16,padding:"12px",
          background:"transparent",border:"1px solid #2e2408",borderRadius:6,
          fontFamily:"'Cinzel',serif",fontSize:12,color:"#4a3e1a",
          letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Depth level system ───────────────────────────────────────────────────
function getDepthLevel(sessions) {
  const n = sessions.length;
  if (n >= 151) return { level:5, name:"Harvest", note:"Presuppose strong biblical foundation. Push into theological density, structural exegesis, original language observations where relevant. Hardest application questions. No hand-holding." };
  if (n >= 61)  return { level:4, name:"Fruit",   note:"Reader has significant time in the Word. Assume familiarity with biblical narrative, basic theology, and cross-passage connections. Questions can demand synthesis." };
  if (n >= 21)  return { level:3, name:"Branch",  note:"Reader is growing. Introduce more historical context, interpretive depth, and theological terminology with brief explanation. Stretch." };
  if (n >= 6)   return { level:2, name:"Root",    note:"Reader is establishing foundations. Keep notes accessible but do not oversimplify. Introduce one layer beyond the obvious." };
  return         { level:1, name:"Seed",    note:"New or early reader. Questions should be observation-focused. Notes plain and concrete. Application immediate and specific. No assumed vocabulary." };
}

const FEEDBACK_PROMPT = `You are reviewing a reader's written answers to Scripture questions. For each answer respond with 1 to 3 sentences only.

If the answer is theologically sound: briefly affirm it and add one observation that goes one layer deeper.
If the answer is partially right or incomplete: acknowledge what is correct, then redirect plainly to what the passage is actually saying.
If the answer is off or confused: do not condemn. Give them one angle from which to look at the question again. What is the passage asking?

Rules:
- Return ONLY a valid JSON array of strings, one per answer, in the same order provided.
- No preamble. No markdown. No extra text. Just the JSON array.
- 1 to 3 sentences per answer. Brief. No lectures. No flattery.
- Strong nouns, active verbs. No therapy voice.
- If an answer is blank or very short ("idk", "not sure", etc.) return an empty string for that index.`;

// ── Collapsible answer input ─────────────────────────────────────────────
function AnswerInput({ value, onChange, feedback }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || "");

  function done() { onChange(draft); setOpen(false); }
  function cancel() { setDraft(value||""); setOpen(false); }

  return (
    <div>
      {!open && (
        <div onClick={()=>{ setDraft(value||""); setOpen(true); }} style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"#141008",border:"1px solid #2e2408",borderRadius:6,
          padding:"10px 14px",cursor:"pointer",transition:"border-color 0.2s",marginTop:10
        }}
          onMouseOver={e=>e.currentTarget.style.borderColor="#c9a84c"}
          onMouseOut={e=>e.currentTarget.style.borderColor="#2e2408"}>
          <p style={{
            fontFamily:value?"'Crimson Text',serif":"'Cinzel',serif",
            fontSize:value?15:10,color:value?"#8a7a5a":"#3a3010",
            letterSpacing:value?"0":"0.1em",textTransform:value?"none":"uppercase",
            fontStyle:value?"italic":"normal",
            flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"
          }}>
            {value||"Write your answer"}
          </p>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a3e1a" strokeWidth="2" style={{marginLeft:10,flexShrink:0}}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
      )}

      {open && (
        <div style={{marginTop:10,background:"#141008",border:"1px solid #c9a84c",borderRadius:6,overflow:"hidden"}}>
          <textarea
            autoFocus
            rows={5}
            value={draft}
            onChange={e=>setDraft(e.target.value)}
            placeholder="Write your answer here..."
            style={{
              width:"100%",background:"#141008",border:"none",
              color:"#d4ccb8",fontFamily:"'Crimson Text',Georgia,serif",
              fontSize:16,lineHeight:1.65,padding:"12px 14px",
              resize:"none",outline:"none",display:"block"
            }}
          />
          <div style={{display:"flex",borderTop:"1px solid #252010",padding:"8px 12px",justifyContent:"flex-end",gap:8}}>
            <button onClick={cancel} style={{background:"transparent",border:"1px solid #2e2408",borderRadius:4,padding:"6px 14px",fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Cancel</button>
            <button onClick={done} style={{background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.4)",borderRadius:4,padding:"6px 16px",fontFamily:"'Cinzel',serif",fontSize:9,color:"#c9a84c",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Done</button>
          </div>
        </div>
      )}

      {feedback && !open && (
        <div style={{marginTop:8,background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.12)",borderRadius:5,padding:"10px 14px"}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#4a3e1a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>Response</p>
          <p style={{fontSize:15,lineHeight:1.65,color:"#8a7a5a"}}>{feedback}</p>
        </div>
      )}
    </div>
  );
}

// ── Stats strip for history view ────────────────────────────────────────
function StatsStrip({ sessions }) {
  const totalMins = sessions.reduce((a,s) => a + Math.round((new Date(s.endTime)-new Date(s.startTime))/60000), 0);
  const totalTime = totalMins < 60 ? totalMins+"m" : Math.floor(totalMins/60)+"h";
  const uniqueBooks = new Set(sessions.map(s=>s.startBook)).size;
  const stats = [["Sessions",sessions.length],["Books",uniqueBooks],["Time",totalTime]];
  return (
    <div style={{display:"flex",background:"#141008",border:"1px solid #252010",borderRadius:7,overflow:"hidden",marginBottom:18}}>
      {stats.map(([l,v],i)=>(
        <div key={l} style={{flex:1,padding:"12px 8px",textAlign:"center",borderRight:i<stats.length-1?"1px solid #252010":"none"}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:16,color:"#c9a84c",fontWeight:600}}>{v}</p>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:3}}>{l}</p>
        </div>
      ))}
    </div>
  );
}

// ── Calendar for log view ─────────────────────────────────────────────────
function getISOWeek(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// ── Rotating verse pools for day modal ──────────────────────────────────
const VERSES_PAST = [
  { text:"Return to the Lord your God, for He is gracious and compassionate, slow to anger and abounding in love.", ref:"Joel 2:13" },
  { text:"The steadfast love of the Lord never ceases; His mercies never come to an end. They are new every morning.", ref:"Lamentations 3:22-23" },
  { text:"I will repay you for the years the locusts have eaten.", ref:"Joel 2:25" },
  { text:"Come to me, all you who are weary and burdened, and I will give you rest.", ref:"Matthew 11:28" },
  { text:"Though he may stumble, he will not fall, for the Lord upholds him with His hand.", ref:"Psalm 37:24" },
  { text:"If we confess our sins, He is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.", ref:"1 John 1:9" },
  { text:"Cast all your anxiety on Him because He cares for you.", ref:"1 Peter 5:7" },
  { text:"He restores my soul. He leads me in paths of righteousness for His name's sake.", ref:"Psalm 23:3" },
  { text:"The Spirit helps us in our weakness.", ref:"Romans 8:26" },
  { text:"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", ref:"Jeremiah 29:11" },
];

const VERSES_TODAY = [
  { text:"This is the day the Lord has made; let us rejoice and be glad in it.", ref:"Psalm 118:24" },
  { text:"Seek the Lord while He may be found; call on Him while He is near.", ref:"Isaiah 55:6" },
  { text:"Now is the acceptable time; behold, now is the day of salvation.", ref:"2 Corinthians 6:2" },
  { text:"Teach us to number our days, that we may gain a heart of wisdom.", ref:"Psalm 90:12" },
  { text:"Look carefully then how you walk, not as unwise but as wise, making the best use of the time.", ref:"Ephesians 5:15-16" },
  { text:"In the morning, Lord, You hear my voice; in the morning I lay my requests before You and wait expectantly.", ref:"Psalm 5:3" },
  { text:"His delight is in the law of the Lord, and on His law he meditates day and night.", ref:"Psalm 1:2" },
  { text:"Open my eyes that I may see wonderful things in Your law.", ref:"Psalm 119:18" },
  { text:"Man shall not live by bread alone, but by every word that comes from the mouth of God.", ref:"Matthew 4:4" },
  { text:"Your word is a lamp to my feet and a light to my path.", ref:"Psalm 119:105" },
];

const VERSES_FUTURE = [
  { text:"Commit to the Lord whatever you do, and He will establish your plans.", ref:"Proverbs 16:3" },
  { text:"The plans of the diligent lead to abundance, but everyone who is hasty comes only to poverty.", ref:"Proverbs 21:5" },
  { text:"In the morning, Lord, You hear my voice; in the morning I lay my requests before You and wait expectantly.", ref:"Psalm 5:3" },
  { text:"Making the best use of the time, because the days are evil.", ref:"Ephesians 5:16" },
  { text:"Look carefully then how you walk, not as unwise but as wise.", ref:"Ephesians 5:15" },
  { text:"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", ref:"Colossians 3:23" },
  { text:"The wise store up choice food and olive oil, but fools gulp theirs down.", ref:"Proverbs 21:20" },
  { text:"Blessed is the one who reads aloud the words of this prophecy, and blessed are those who hear it and take to heart what is written.", ref:"Revelation 1:3" },
  { text:"Prepare your work outside; get everything ready for yourself in the field, and after that build your house.", ref:"Proverbs 24:27" },
  { text:"The Lord himself goes before you and will be with you; He will never leave you nor forsake you. Do not be afraid.", ref:"Deuteronomy 31:8" },
];

function pickVerse(pool, key) {
  const seed = key.split("").reduce((a,c)=>a+c.charCodeAt(0),0) + Date.now() % 1000;
  return pool[seed % pool.length];
}

function DayModal({ date, session, onClose, onSessionClick, alarms, onSaveAlarm }) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  const isToday = d.getTime() === now.getTime();
  const isPast = d.getTime() < now.getTime();
  const isFuture = d.getTime() > now.getTime();

  const [showAlarm, setShowAlarm] = useState(false);
  const [alarmTime, setAlarmTime] = useState("06:00");
  const dayKey = date.toISOString().slice(0,10);
  const existingAlarm = alarms?.[dayKey];

  const REPEAT_OPTS = [
    ["daily","Every Day"],["weekdays","Weekdays"],["weekends","Weekends"],
    ["sun","Sun"],["mon","Mon"],["tue","Tue"],["wed","Wed"],["thu","Thu"],["fri","Fri"],["sat","Sat"]
  ];
  const [repeatMode, setRepeatMode] = useState("daily");

  function saveAlarm() {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(p => { if(p==="granted") doSave(); });
    } else { doSave(); }
  }
  function doSave() {
    onSaveAlarm(dayKey, { time: alarmTime, repeat: repeatMode });
    setShowAlarm(false);
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(10,8,4,0.88)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={onClose}>
      <div style={{background:"#141008",border:"1px solid #2e2408",borderRadius:"12px 12px 0 0",padding:"22px 20px 36px",width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:3,background:"#3a3010",borderRadius:2,margin:"0 auto 18px"}}/>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#6a5a30",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>
          {dayNames[date.getDay()]}
        </p>
        <p style={{fontFamily:"'Crimson Text',serif",fontSize:22,color:"#c9a84c",marginBottom:16}}>
          {months[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
        </p>

        {(() => {
          const vKey = date.toISOString().slice(0,10) + Math.floor(Date.now()/500).toString();
          const verse = isPast ? pickVerse(VERSES_PAST, vKey) : isToday ? pickVerse(VERSES_TODAY, vKey) : pickVerse(VERSES_FUTURE, vKey);
          return session ? (
            <div style={{background:"#1a1208",border:"1px solid #2e2408",borderRadius:7,padding:"14px 16px",cursor:"pointer",marginBottom:14}}
              onClick={()=>{ onSessionClick(session.id); onClose(); }}>
              <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"#c9a84c",marginBottom:6}}>{session.passage}</p>
              <div style={{display:"flex",gap:12,alignItems:"center",color:"#4a3e1a",fontSize:12}}>
                <span style={{display:"flex",alignItems:"center",gap:3}}><ClockIcon/>{formatTime(session.startTime)}</span>
                <span>{elapsed(session.startTime,session.endTime)}</span>
                {session.locationType && <span>{session.locationType}</span>}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#3a3010",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:8}}>Tap to open session</p>
            </div>
          ) : (
            <div style={{padding:"4px 0 20px",borderBottom:"1px solid #252010",marginBottom:16}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#2e2408",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>No Session Logged</p>
              {isToday && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"#5a4a20",lineHeight:1.6,marginBottom:14}}>His Word is still here. Today can still be the day.</p>}
              {isPast && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"#4a3a18",lineHeight:1.6,marginBottom:14}}>His Word was here. He was not absent.</p>}
              {isFuture && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"#5a4a20",lineHeight:1.6,marginBottom:14}}>His Word will be here. So will He.</p>}
              <div style={{borderLeft:"2px solid #2e2408",paddingLeft:14}}>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:16,color:"#6a5a30",lineHeight:1.65,fontStyle:"italic",marginBottom:6}}>"{verse.text}"</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",letterSpacing:"0.1em"}}>{verse.ref}</p>
              </div>
            </div>
          );
        })()}

        {/* Alarm section — available on future and today */}
        {(isFuture || isToday) && (
          <div>
            {existingAlarm && !showAlarm ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:6,padding:"10px 14px",marginBottom:10}}>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#c9a84c",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Alarm Set</p>
                  <p style={{fontFamily:"'Crimson Text',serif",fontSize:15,color:"#8a7a4a"}}>{existingAlarm.time} — {existingAlarm.repeat}</p>
                </div>
                <button onClick={()=>setShowAlarm(true)} style={{background:"transparent",border:"1px solid #2e2408",borderRadius:4,padding:"5px 10px",fontFamily:"'Cinzel',serif",fontSize:9,color:"#6a5a30",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>Edit</button>
              </div>
            ) : !showAlarm ? (
              <button onClick={()=>setShowAlarm(true)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"transparent",border:"1px solid #2e2408",borderRadius:6,padding:"12px",marginBottom:10,fontFamily:"'Cinzel',serif",fontSize:10,color:"#6a5a30",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s"}}
                onMouseOver={e=>{e.currentTarget.style.borderColor="#c9a84c";e.currentTarget.style.color="#c9a84c";}}
                onMouseOut={e=>{e.currentTarget.style.borderColor="#2e2408";e.currentTarget.style.color="#6a5a30";}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Set a Reminder
              </button>
            ) : null}

            {showAlarm && (
              <div style={{background:"#1a1208",border:"1px solid #2e2408",borderRadius:7,padding:"16px",marginBottom:10}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Set Reminder</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"#4a3e1a",marginBottom:14,lineHeight:1.5}}>
                  Life does not stop for reading time. A reminder holds the slot when a game, a meeting, or a mission tries to take it.
                </p>
                <label style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Time</label>
                <input type="time" value={alarmTime} onChange={e=>setAlarmTime(e.target.value)}
                  style={{marginBottom:14,fontFamily:"'Crimson Text',serif",fontSize:16}}/>
                <label style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:8}}>Repeat</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                  {REPEAT_OPTS.map(([val,label])=>(
                    <button key={val} onClick={()=>setRepeatMode(val)}
                      style={{background:repeatMode===val?"rgba(201,168,76,0.12)":"transparent",border:`1px solid ${repeatMode===val?"#c9a84c":"#2e2408"}`,borderRadius:4,padding:"5px 10px",fontFamily:"'Cinzel',serif",fontSize:9,color:repeatMode===val?"#c9a84c":"#4a3e1a",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s"}}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveAlarm} style={{flex:1,background:"linear-gradient(135deg,#c9a84c,#a8832a)",color:"#0e0c06",border:"none",borderRadius:5,padding:"11px",fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Save</button>
                  <button onClick={()=>setShowAlarm(false)} style={{flex:1,background:"transparent",border:"1px solid #2e2408",borderRadius:5,padding:"11px",fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Cancel</button>
                </div>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#2e2408",letterSpacing:"0.08em",textAlign:"center",marginTop:10,lineHeight:1.6,textTransform:"uppercase"}}>
                  Native app delivers true background alarms. Web version fires when the app is open.
                </p>
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} style={{width:"100%",marginTop:6,padding:"11px",background:"transparent",border:"1px solid #2e2408",borderRadius:6,fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Close</button>
      </div>
    </div>
  );
}

function SessionCalendar({ sessions, onDaySelect, alarms, onSaveAlarm, onFilterChange }) {
  const now = new Date();
  const [calView, setCalView] = useState("month");
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const sessionMap = {};
  sessions.forEach(s => {
    const d = new Date(s.startTime);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    sessionMap[key] = s;
  });

  function handleDayClick(date) {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const isSameDay = selectedDate && selectedDate.getFullYear()===date.getFullYear() && selectedDate.getMonth()===date.getMonth() && selectedDate.getDate()===date.getDate();
    if (isSameDay) {
      setSelectedDate(null);
      setSelectedSession(null);
      if (onFilterChange) onFilterChange(null);
    } else {
      setSelectedDate(date);
      setSelectedSession(sessionMap[key] || null);
      if (onFilterChange) onFilterChange(date);
    }
  }

  function DayCell({ date, label }) {
    if (!date) return <div/>;
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const hasSession = !!sessionMap[key];
    const isToday = date.getDate()===now.getDate() && date.getMonth()===now.getMonth() && date.getFullYear()===now.getFullYear();
    const isSelected = selectedDate && date.getFullYear()===selectedDate.getFullYear() && date.getMonth()===selectedDate.getMonth() && date.getDate()===selectedDate.getDate();
    const todayDimmed = selectedDate && !isSelected && isToday;
    const bg = isSelected ? "rgba(201,168,76,0.05)" : isToday && !todayDimmed ? "rgba(201,168,76,0.08)" : "transparent";
    const border = isSelected ? "1px solid rgba(201,168,76,0.85)" : isToday && todayDimmed ? "1px solid rgba(201,168,76,0.12)" : isToday ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent";
    const numColor = isSelected ? "#c9a84c" : hasSession ? "#c9a84c" : isToday ? "#6a5a30" : "#3a3010";
    return (
      <div onClick={()=>handleDayClick(date)}
        style={{textAlign:"center",padding:"6px 2px",borderRadius:4,position:"relative",cursor:"pointer",
          background:bg, border:border, transition:"all 0.2s"}}
        onMouseOver={e=>{ if(!isSelected&&!isToday) e.currentTarget.style.background="rgba(201,168,76,0.05)"; }}
        onMouseOut={e=>{ if(!isSelected&&!isToday) e.currentTarget.style.background="transparent"; }}>
        {label && <div style={{fontFamily:"'Cinzel',serif",fontSize:7,color:"#3a3010",letterSpacing:"0.06em",marginBottom:1}}>{label}</div>}
        <span style={{fontFamily:"'Crimson Text',serif",fontSize:14,color:numColor}}>{date.getDate()}</span>
        {hasSession && <div style={{width:4,height:4,borderRadius:2,background:"#c9a84c",margin:"2px auto 0",opacity:isSelected?1:0.9}}/>}
      </div>
    );
  }

  const NavBtn = ({onClick,children}) => (
    <button onClick={onClick} style={{background:"transparent",border:"none",color:"#6a5a30",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:18,padding:"0 10px",lineHeight:1,transition:"color 0.2s"}}
      onMouseOver={e=>e.currentTarget.style.color="#c9a84c"}
      onMouseOut={e=>e.currentTarget.style.color="#6a5a30"}>{children}</button>
  );
  const ToggleBtn = ({active,onClick,children}) => (
    <button onClick={onClick} style={{background:active?"rgba(201,168,76,0.12)":"transparent",border:`1px solid ${active?"#c9a84c":"#2e2408"}`,borderRadius:4,padding:"4px 12px",fontFamily:"'Cinzel',serif",fontSize:9,color:active?"#c9a84c":"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s"}}>{children}</button>
  );

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  return (
    <>
      <div style={{background:"#141008",border:"1px solid #252010",borderRadius:8,padding:"14px 12px",marginBottom:selectedDate?8:18}}>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:12}}>
          <ToggleBtn active={calView==="month"} onClick={()=>setCalView("month")}>Month</ToggleBtn>
          <ToggleBtn active={calView==="week"} onClick={()=>setCalView("week")}>Week</ToggleBtn>
        </div>

        {calView === "month" && (()=>{
          const firstDay = new Date(calYear,calMonth,1).getDay();
          const daysInMonth = new Date(calYear,calMonth+1,0).getDate();
          const monthName = new Date(calYear,calMonth).toLocaleString("default",{month:"long"});
          const cells = [];
          for (let i=0;i<firstDay;i++) cells.push(null);
          for (let d=1;d<=daysInMonth;d++) cells.push(new Date(calYear,calMonth,d));
          return (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <NavBtn onClick={()=>{ if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1); }}>‹</NavBtn>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase"}}>{monthName} {calYear}</p>
                <NavBtn onClick={()=>{ if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1); }}>›</NavBtn>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
                {["S","M","T","W","T","F","S"].map((d,i)=>(
                  <div key={i} style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:8,color:"#3a3010",letterSpacing:"0.06em",paddingBottom:3}}>{d}</div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                {cells.map((date,i)=>date?<DayCell key={i} date={date}/>:<div key={i}/>)}
              </div>
            </>
          );
        })()}

        {calView === "week" && (()=>{
          const days = [];
          for (let i=0;i<7;i++) { const d=new Date(weekStart); d.setDate(weekStart.getDate()+i); days.push(d); }
          const wkNum = getISOWeek(weekStart);
          const wkLabel = "Week "+wkNum+"  —  "+weekStart.toLocaleString("default",{month:"short"})+" "+weekStart.getDate();
          function prevWeek() { const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); }
          function nextWeek() { const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); }
          return (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <NavBtn onClick={prevWeek}>‹</NavBtn>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#c9a84c",letterSpacing:"0.1em",textTransform:"uppercase"}}>{wkLabel}</p>
                <NavBtn onClick={nextWeek}>›</NavBtn>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                {days.map((date,i)=><DayCell key={i} date={date} label={["S","M","T","W","T","F","S"][i]}/>)}
              </div>
            </>
          );
        })()}
      </div>

    </>
  );
}

// ── About screen ──────────────────────────────────────────────────────────
function AboutScreen({ onBack }) {
  const [tab, setTab] = useState("ministry");
  const P = ({children, mb=14}) => (
    <p style={{fontSize:17,lineHeight:1.78,color:"#8a7a5a",marginBottom:mb}}>{children}</p>
  );
  const Section = ({label, children}) => (
    <div className="card">
      <p className="label">{label}</p>
      {children}
    </div>
  );

  return (
    <div className="fade-in">
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"#6a5a30",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:6,padding:0}}>
        ← Back
      </button>
      <div style={{display:"flex",borderBottom:"1px solid #252010",marginBottom:20}}>
        <button className={`nav-tab ${tab==="ministry"?"active":""}`} onClick={()=>setTab("ministry")} style={{fontSize:"9px"}}>Midnight Ministries</button>
        <button className={`nav-tab ${tab==="howto"?"active":""}`} onClick={()=>setTab("howto")} style={{fontSize:"9px"}}>How to Use</button>
      </div>

      {tab === "ministry" && (
        <div>
          <div className="card" style={{textAlign:"center",paddingTop:24,paddingBottom:24}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><CrossIcon size={36}/></div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,letterSpacing:"0.1em",color:"#e4dcc8",marginBottom:6}}>MIDNIGHT MINISTRIES</h2>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"#5a4a20"}}>For all who read in the dark</p>
          </div>

          <Section label="Why This Exists">
            <P>Midnight Ministries was not built in a boardroom. It was built in the forge. Out of a season where the only anchor was His Word and the only company was God, a decision was made to stop waiting for permission to build what the people around us actually needed.</P>
            <P>Most people do not lack access to Scripture. They lack a practice. They open the Bible, read a few verses, close it, and carry nothing out. The knowledge sits on the page. The forge stays cold.</P>
            <P mb={0}>SELAH was built to fix that. Not by making Bible reading easier. By making it stick. The pause, the questions, the notes, the return verses; those are not features. That is how serious readers have always engaged His Word. We built a tool to hold the structure.</P>
          </Section>

          <Section label="The Name">
            <P>Selah appears 71 times in the Psalms and 3 times in Habakkuk, 74 occurrences in total. Scholars still debate its exact meaning. The most honest translation sits somewhere between pause and lift up. Both are true. You stop. You sit in what you just read. Then you carry it higher than where you found it.</P>
            <P>Selah does not appear in Paul's letters. Paul wrote in Greek to Greek-speaking churches, and Selah is a Hebrew term rooted in the Psalter and temple worship. But Paul quotes the Psalms repeatedly throughout his letters. The posture Selah names, the pause, the weight of the text, the return, is present in everything Paul wrote.</P>
            <P mb={0}>Paul also made clear, as did Jesus in Matthew 7:21-23 and Paul himself in Ephesians 2:8-9, that works in Christ alone do not produce salvation. Faith does. Not performance. Not religious habit. Not how often you open the app. What you do with what you read when no one is watching. That is the practice Selah was built to support.</P>
          </Section>

          <Section label="The Foundation">
            <P>Yahweh. Elohim. Neither masculine nor feminine in the way we assign those categories. He is beyond the categories. The one this ministry was handed to is a man, and he writes from that place without apology. But what was handed to him was not for men only.</P>
            <P mb={0}>His Word is for every person who has breath. This app is built on that. If you are a man, a woman, or a child who wants to know His Word with more honesty and less performance, this was built for you.</P>
          </Section>

          <Section label="The Standard">
            <P>Scripture is the final authority. Not tradition. Not preference. Not what feels right. His Word. Everything built inside this app bends toward Him.</P>
            <P>The questions will not be soft. The notes will not flatter you. The return verses are not chosen to make you feel good. They are chosen because they demand something. He demands something. That is the standard we build to. We must not lower it. He deserves better than we give Him.</P>
            <P mb={0}>If you are looking for something that tells you what you want to hear, this is the wrong app. If you are looking for something that tells you what is true, you are in the right place.</P>
          </Section>

          <Section label="Who We Build For">
            <P>The man in the truck before the sun comes up. The soldier sleeping in a bunk, waking up at 0200, prepared to get on a helicopter, the destination a target building. The father who wants to carry something into his house worth carrying. The man who is done with performance spirituality and wants to actually know the God he claims to follow.</P>
            <P>The woman who opens His Word in the margins of her day because it is the only place that does not move. The mother who opens His Word before the house wakes up because she knows what she carries out of that time is what she carries into them. The woman who has been told her whole life what to believe and is finally ready to read it for herself.</P>
            <P>The teenager who suspects there is more to this than what they have been handed in youth group. The child who is just beginning to open His Word for the first time.</P>
            <P mb={0}>We build for them.</P>
          </Section>

          <Section label="The Next Watch">
            <P>The children are not a footnote. They are the next watch. Every generation that has carried His Word faithfully did so because someone before them built something worth carrying. What we build now, how we build it, the standard we hold it to, determines what they receive when we hand them the torch.</P>
            <P mb={0}>That is not pressure. It is purpose. We do not build for metrics or downloads or ministry growth. We build so that when the time comes, what we place in their hands is honest, grounded, and prepared to outlast us.</P>
          </Section>

          <Section label="The App Learns">
            <P>Every session you log, every answer you write, every day you spend in His Word adds a stone. The app tracks where you are and calibrates what it gives you. Not as a reward. Not as a metric. Because a good teacher never keeps feeding milk to someone ready for meat.</P>
            <P>There are five depth levels: Seed, Root, Branch, Fruit, and Harvest. You move through them as your time and engagement accumulate. The questions deepen. The notes grow denser. The application demands more. You are always gathering. You are always one step ahead of where you started.</P>
            <P mb={0}>The app will never go below your demonstrated level. It reads where you are and stays just ahead of you. Not above you. Ahead of you. That is the difference between a teacher and a test.</P>
          </Section>

          <div style={{textAlign:"center",paddingTop:8,paddingBottom:16}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#2e2408",letterSpacing:"0.1em",textTransform:"uppercase"}}>Matthew 3:11</p>
          </div>
        </div>
      )}

      {tab === "howto" && (
        <div>
          <Section label="The Practice">
            <P>SELAH tracks one thing: time you actually spent in His Word. Not what you intended to read. Not what you bookmarked. What you opened and sat with. Every session is a record of that.</P>
            <P mb={0} style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"#4a3e1a",borderLeft:"2px solid #2e2408",paddingLeft:12,lineHeight:1.6}}>
              "For the word of God is living and active, sharper than any two-edged sword." — Hebrews 4:12
            </P>
          </Section>

          <div className="card">
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>01. Settings — Set Once</p>
            <P>Go to Settings first. Choose your translation, your gender, your age, and your time zone. The model uses these to calibrate what it gives back. Set them once. Come back when something changes.</P>
            <P mb={0} style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"#4a3e1a",borderLeft:"2px solid #2e2408",paddingLeft:12,lineHeight:1.6}}>
              "All Scripture is God-breathed and useful for teaching, for reproof, for correction, and for training in righteousness." — 2 Timothy 3:16
            </P>
          </div>

          {[
            ["02. Set Your Location", "Pick where you are. Home, vehicle, church, field; whatever is true. GPS tags the session if you allow it. That data never leaves your device."],
            ["03. Log Your Start", "Choose the book, chapter, and verse where you are opening. Tap Open His Word. The session clock starts. Put the phone down."],
          ].map(([title,body]) => (
            <div key={title} className="card">
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>{title}</p>
              <P mb={0}>{body}</P>
            </div>
          ))}

          <div className="card">
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>04. Read</p>
            <P>Read. Come back when you are done.</P>
            <P mb={0} style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"#4a3e1a",borderLeft:"2px solid #2e2408",paddingLeft:12,lineHeight:1.6}}>
              "His delight is in the law of the Lord, and on His law he meditates day and night." — Psalm 1:2
            </P>
          </div>

          {[
            ["05. Capture the Moment", "Optional. If someone is with you, or the place is worth remembering, take a photo. It saves to that session in your log and becomes part of the share card."],
            ["06. Close the Session", "Log where you landed. Book, chapter, verse. Add your own notes if anything made you stop. If something made you question what you knew. If something made you realize what you had never seen before. Then tap Close Session."],
          ].map(([title,body]) => (
            <div key={title} className="card">
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>{title}</p>
              <P mb={0}>{body}</P>
            </div>
          ))}

          <Section label="07. What You Receive">
            <P>First: context. Who wrote this, who they wrote it to, when, and what was happening around it. Ground before question.</P>
            <P>Then 3 to 5 questions the passage itself demands. Observation, interpretation, one application. If you can answer them without going back, they were not hard enough.</P>
            <P>Then field notes. What is actually happening. Historical grounding, original meaning, no padding.</P>
            <P>Then 2 to 4 verses to return to. Chosen because they require something.</P>
            <P mb={0} style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"#4a3e1a",borderLeft:"2px solid #2e2408",paddingLeft:12,lineHeight:1.6}}>
              "Be doers of the word, and not hearers only, deceiving yourselves." — James 1:22
            </P>
          </Section>

          <div className="card">
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>08. Set Reminders</p>
            <P>Life does not stop for reading time. A meeting will move it. A game will take it. A deployment will bury it. Set a daily reminder from any future day in the Log calendar. Choose the time and which days repeat. The reminder holds the slot so you do not have to fight for it every morning.</P>
            <P mb={0} style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#3a3010",letterSpacing:"0.08em",textTransform:"uppercase"}}>
              Native app delivers true background alarms. Web version fires when the app is open.
            </P>
          </div>

          <Section label="09. Save or Share">
            <P mb={0}>Generate a share card with your photo and passage for any platform. Or export a formatted note to Apple Notes or Files, filed under Selah by Midnight Ministries. Auto-folder creation is in the native app.</P>
          </Section>

          <Section label="10. The Log">
            <P mb={0}>Every session is saved. The calendar shows which days you were in His Word. Gold dot means a session. Tap any day, session or not, to open it.</P>
          </Section>

          <div style={{textAlign:"center",paddingTop:8,paddingBottom:16}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#2e2408",letterSpacing:"0.1em",textTransform:"uppercase"}}>Psalm 46:10</p>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Timezone Dropdown ────────────────────────────────────────────────────
const TZ_OPTIONS = [
  ["device","Use Device Time"],
  ["America/New_York","Eastern (ET)"],
  ["America/Chicago","Central (CT)"],
  ["America/Denver","Mountain (MT)"],
  ["America/Phoenix","Mountain, No DST (Arizona)"],
  ["America/Los_Angeles","Pacific (PT)"],
  ["America/Anchorage","Alaska (AKT)"],
  ["Pacific/Honolulu","Hawaii (HST)"],
  ["UTC","UTC"],
];

function TimezoneDropdown({ timezone, setTimezone }) {
  const [open, setOpen] = useState(false);
  const current = TZ_OPTIONS.find(([v]) => v === timezone) || TZ_OPTIONS[0];
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"#161208", border:`1px solid ${open?"#c9a84c":"#2e2408"}`,
        borderRadius:5, padding:"10px 13px", cursor:"pointer", transition:"border-color 0.2s"
      }}>
        <span style={{fontFamily:"'Crimson Text',serif",fontSize:16,color:"#e4dcc8"}}>{current[1]}</span>
        <span style={{color:"#6a5a30",fontSize:12,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:50,
          background:"#161208", border:"1px solid #3a3010", borderRadius:5,
          maxHeight:220, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.6)"
        }}>
          {TZ_OPTIONS.map(([val,label])=>(
            <div key={val} onClick={()=>{ setTimezone(val); setOpen(false); }}
              style={{
                padding:"10px 14px", cursor:"pointer",
                background:timezone===val?"rgba(201,168,76,0.1)":"transparent",
                borderBottom:"1px solid #252010",
                transition:"background 0.15s"
              }}
              onMouseOver={e=>e.currentTarget.style.background="rgba(201,168,76,0.07)"}
              onMouseOut={e=>e.currentTarget.style.background=timezone===val?"rgba(201,168,76,0.1)":"transparent"}>
              <span style={{fontFamily:"'Crimson Text',serif",fontSize:16,color:timezone===val?"#c9a84c":"#e4dcc8"}}>{label}</span>
              {timezone===val && <span style={{float:"right",color:"#c9a84c",fontSize:12}}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home");
  const [sessions, setSessions] = useState(loadSessions);
  const [activeSession, setActiveSession] = useState(null);
  const [bibleVersion, setBibleVersion] = useState(() => localStorage.getItem("selah_bible_version") || "NLT");
  const [gender, setGender] = useState(() => localStorage.getItem("selah_gender") || "Prefer not to say");
  const [age, setAge] = useState(() => localStorage.getItem("selah_age") || "Prefer not to say");
  const [clockFmt, setClockFmt] = useState(() => localStorage.getItem("selah_clock_fmt") || "12");
  const [timezone, setTimezone] = useState(() => localStorage.getItem("selah_timezone") || "device");
  const [form, setForm] = useState(() => {
    try {
      const last = JSON.parse(localStorage.getItem('selah_last_position') || '{}');
      return {
        locationType: last.locationType || 'Home', otherLocation: '',
        startBook: last.endBook || last.startBook || 'Genesis',
        startChapter: last.endChapter || '',
        startVerse: last.endVerse || '',
        endBook: last.endBook || last.startBook || 'Genesis',
        endChapter: '', endVerse: '', notes: ''
      };
    } catch { return { locationType:'Home', otherLocation:'', startBook:'Genesis', startChapter:'', startVerse:'', endBook:'Genesis', endChapter:'', endVerse:'', notes:'' }; }
  });
  const [useGps, setUseGps] = useState(true);
  const [sessionPhoto, setSessionPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [expandedSession, setExpandedSession] = useState(null);
  const [openSection, setOpenSection] = useState({ q:true, n:true, v:true });
  const [ticker, setTicker] = useState(0);
  const [exportSession, setExportSession] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [answerFeedback, setAnswerFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [alarms, setAlarms] = useState(() => { try { return JSON.parse(localStorage.getItem("selah_alarms")||"{}"); } catch { return {}; } });

  useEffect(() => { localStorage.setItem("selah_alarms", JSON.stringify(alarms)); }, [alarms]);

  function handleSaveAlarm(dayKey, alarm) {
    setAlarms(prev => ({ ...prev, [dayKey]: alarm }));
  }
  const [calJumpId, setCalJumpId] = useState(null);
  const [filterDate, setFilterDate] = useState(() => { const d=new Date(); d.setHours(0,0,0,0); return d; });
  const sessionRefs = useRef({});
  const timerRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (view==="session") { timerRef.current=setInterval(()=>setTicker(t=>t+1),15000); }
    return () => clearInterval(timerRef.current);
  }, [view]);

  useEffect(() => { saveSessions(sessions); }, [sessions]);
  useEffect(() => { localStorage.setItem("selah_bible_version", bibleVersion); }, [bibleVersion]);
  useEffect(() => { localStorage.setItem("selah_gender", gender); }, [gender]);
  useEffect(() => { localStorage.setItem("selah_age", age); }, [age]);
  useEffect(() => { localStorage.setItem("selah_clock_fmt", clockFmt); }, [clockFmt]);
  useEffect(() => { localStorage.setItem("selah_timezone", timezone); }, [timezone]);

  // Scroll to session after calendar tap
  useEffect(() => {
    if (calJumpId && sessionRefs.current[calJumpId]) {
      setTimeout(() => {
        sessionRefs.current[calJumpId]?.scrollIntoView({ behavior:"smooth", block:"start" });
        setExpandedSession(calJumpId);
        setCalJumpId(null);
      }, 100);
    }
  }, [calJumpId]);

  function resetForm() {
    setForm({ locationType:"Home",otherLocation:"",startBook:"Genesis",startChapter:"",startVerse:"",endBook:"Genesis",endChapter:"",endVerse:"",notes:"" });
    setResult(null); setActiveSession(null); setError(""); setSessionPhoto(null); setQuestionAnswers({}); setAnswerFeedback([]); setFeedbackSubmitted(false);
  }

  async function handlePhotoUpload(e) {
    const file=e.target.files?.[0]; if(!file) return;
    setSessionPhoto(await compressImage(file));
  }

  async function startSession() {
    if (!form.startChapter) { setError("Set a starting chapter."); return; }
    setError(""); setLocLoading(true);
    const coords = await getLocation();
    let geoLabel = null;
    if (useGps && coords) geoLabel = await reverseGeocode(coords.lat, coords.lng);
    setActiveSession({ ...form, coords, geoLabel, startTime:new Date().toISOString(), id:Date.now() });
    setLocLoading(false); setView("session");
  }

  async function endSession() {
    if (!form.endChapter) { setError("Log where you finished."); return; }
    setError(""); setLoading(true);
    const endTime = new Date().toISOString();
    const passage = `${activeSession.startBook} ${activeSession.startChapter}${activeSession.startVerse?":"+activeSession.startVerse:""} through ${form.endBook} ${form.endChapter}${form.endVerse?":"+form.endVerse:""}`;
    const depth = getDepthLevel(sessions);
    const versionNote = `The reader is using the ${bibleVersion} translation. Gender: ${gender}. Age group: ${age}. Depth level: ${depth.level} of 5 (${depth.name}) — ${depth.note} Calibrate examples, language, and application questions to reflect this. Do not alter the text or its meaning. His Word does not change. Framing and depth adjust. Never go below their demonstrated level. Aim one step ahead.`;
    try {
      const resp = await fetch("/.netlify/functions/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ system:SYSTEM_PROMPT + "\n\n" + versionNote, message:"Passage read: "+passage })
      });
      const data = await resp.json();
      const raw = data.content?.find(b=>b.type==="text")?.text||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const completed = { ...activeSession, endBook:form.endBook, endChapter:form.endChapter, endVerse:form.endVerse, personalNotes:form.notes, endTime, readingEndTime:endTime, passage, aiResult:parsed, photoData:sessionPhoto, bibleVersion, gender };
      try { localStorage.setItem('selah_last_position', JSON.stringify({ endBook:form.endBook, endChapter:form.endChapter, endVerse:form.endVerse })); } catch {}
      setSessions(prev=>[completed,...prev]);
      setResult(parsed); setActiveSession(completed); setView("result");
    } catch { setError("Connection failed. Check your signal and try again."); }
    setLoading(false);
  }

  async function submitAnswers() {
    if (!result?.questions || feedbackLoading) return;
    setFeedbackLoading(true);
    const answersArr = result.questions.map((_,i) => questionAnswers[i] || "");
    const qLines = result.questions.map((_q,_i) => {
      return "Q"+(_i+1)+": "+_q+"\nA"+(_i+1)+": "+(answersArr[_i]||"(no answer)");
    }).join("\n\n");
    const payload = "Passage: "+(activeSession?.passage||"")+"\n\nQuestions and answers:\n"+qLines;
    try {
      const resp = await fetch("/.netlify/functions/feedback", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ system:FEEDBACK_PROMPT, message:payload })
      });
      const data = await resp.json();
      const raw = data.content?.find(b=>b.type==="text")?.text||"[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const fb = Array.isArray(parsed)?parsed:[];
      setAnswerFeedback(fb);
      setFeedbackSubmitted(true);
      // Persist answers and feedback to the session log
      if (activeSession?.id) {
        setSessions(prev => prev.map(s => s.id === activeSession.id
          ? { ...s, questionAnswers: questionAnswers, answerFeedback: fb }
          : s
        ));
      }
    } catch(e) { setAnswerFeedback([]); setFeedbackSubmitted(true); }
    setFeedbackLoading(false);
  }

  function handleCalendarDay(sessionId) {
    setCalJumpId(sessionId);
  }

  function deleteSession(id) {
    setSessions(prev=>prev.filter(s=>s.id!==id));
    if (expandedSession===id) setExpandedSession(null);
  }

  const activeMins = activeSession ? Math.round((Date.now()-new Date(activeSession.startTime))/60000) : 0;

  const BIBLE_VERSIONS = ["NLT","ESV","KJV","NIV","NASB","CSB","MSG","AMP"];

  return (
    <div style={{minHeight:"100vh",background:"#0e0c06",color:"#e4dcc8",fontFamily:"'Crimson Text',Georgia,serif",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;600;700&display=swap');
        html,body{background:#0e0c06;}*{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#3a2e10;border-radius:2px;}
        input,select,textarea{background:#161208;border:1px solid #2e2408;color:#e4dcc8;border-radius:5px;padding:10px 13px;font-family:'Crimson Text',Georgia,serif;font-size:16px;outline:none;width:100%;transition:border-color 0.2s,box-shadow 0.2s;}
        input:focus,select:focus,textarea:focus{border-color:#c9a84c;box-shadow:0 0 0 2px rgba(201,168,76,0.08);}
        select option{background:#161208;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;appearance:textfield;}
        .btn-primary{background:linear-gradient(135deg,#c9a84c 0%,#a8832a 100%);color:#0e0c06;border:none;border-radius:5px;padding:14px 24px;font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:0.12em;cursor:pointer;transition:opacity 0.2s,transform 0.1s;text-transform:uppercase;width:100%;}
        .btn-primary:hover{opacity:0.88;transform:translateY(-1px);}
        .btn-primary:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
        .btn-ghost{background:transparent;color:#6a5a30;border:1px solid #2e2408;border-radius:5px;padding:11px 20px;font-family:'Cinzel',serif;font-size:11px;font-weight:600;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;width:100%;}
        .btn-ghost:hover{border-color:#c9a84c;color:#c9a84c;}
        .btn-export{display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;color:#c9a84c;border:1px solid rgba(201,168,76,0.4);border-radius:5px;padding:12px 20px;font-family:'Cinzel',serif;font-size:11px;font-weight:600;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;width:100%;}
        .btn-export:hover{background:rgba(201,168,76,0.07);border-color:#c9a84c;}
        .btn-export:disabled{opacity:0.4;cursor:not-allowed;}
        .btn-danger{background:transparent;color:#8a3020;border:1px solid #3a1810;border-radius:4px;padding:6px 12px;font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;}
        .btn-danger:hover{border-color:#c04030;color:#c04030;}
        .card{background:#141008;border:1px solid #252010;border-radius:8px;padding:18px;margin-bottom:14px;}
        .label{font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.14em;color:#6a5a30;text-transform:uppercase;display:block;margin-bottom:8px;}
        .divider{border:none;border-top:1px solid #252010;margin:14px 0;}
        .fade-in{animation:fadeIn 0.35s ease forwards;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .pulse{animation:pulse 1.8s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .nav-tab{background:transparent;border:none;color:#3a3010;font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;padding:10px 10px;border-bottom:2px solid transparent;transition:all 0.2s;flex:1;}
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
        .version-pill{background:transparent;border:1px solid #2e2408;border-radius:4px;padding:7px 12px;font-family:'Cinzel',serif;font-size:10px;color:#5a4a20;letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;}
        .version-pill.active{background:rgba(201,168,76,0.12);border-color:#c9a84c;color:#c9a84c;}
        .version-pill:hover:not(.active){border-color:#5a4a20;color:#8a7a4a;}
        @media (min-width:600px){.app-container{padding:0 24px 80px !important;}.card{padding:22px !important;}input,select,textarea{font-size:17px !important;}.btn-primary{font-size:13px !important;padding:16px 28px !important;}}
        @media (min-width:768px){.app-container{padding:0 32px 80px !important;max-width:600px !important;}h1{font-size:30px !important;}}
        @media (min-width:1024px){.app-container{max-width:640px !important;}}
      `}</style>

      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.5,zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`}}/>

      <div className="app-container" style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto",padding:"0 16px 80px"}}>

        {/* HEADER */}
        <div style={{textAlign:"center",padding:"28px 0 18px",position:"relative"}}>
          {view !== "session" && (
            <button onClick={()=>setView("settings")} style={{position:"absolute",right:0,top:28,background:"transparent",border:"none",color:"#3a3010",cursor:"pointer",padding:8,transition:"color 0.2s"}}
              onMouseOver={e=>e.currentTarget.style.color="#c9a84c"}
              onMouseOut={e=>e.currentTarget.style.color="#3a3010"}>
              <SettingsIcon/>
            </button>
          )}
          <div style={{position:"absolute",left:6,top:39}}>
            <CrossIcon size={30} glow={false}/>
          </div>
          <h1 style={{fontFamily:"'Cinzel',serif",fontSize:26,fontWeight:700,letterSpacing:"0.1em",color:"#c8bfa0",textShadow:"0 0 22px rgba(201,168,76,0.32), 0 0 55px rgba(201,168,76,0.14)"}}>SELAH</h1>
          <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:13,color:"#4a3e1a",marginTop:3}}>Read. Mark. Return.</p>
        </div>

        {/* NAV */}
        {view !== "session" && view !== "settings" && view !== "about" && (
          <div style={{display:"flex",borderBottom:"1px solid #252010",marginBottom:20}}>
            <button className={`nav-tab ${(view==="home"||view==="result")?"active":""}`} onClick={()=>{ resetForm(); setView("home"); }}>New Session</button>
            <button className={`nav-tab ${view==="history"?"active":""}`} onClick={()=>setView("history")}>
              Log {sessions.length>0&&`(${sessions.length})`}
            </button>
            <button className={`nav-tab ${view==="about"?"active":""}`} onClick={()=>setView("about")}>About</button>
          </div>
        )}

        {/* ══ HOME ══ */}
        {view === "home" && (
          <div className="fade-in">
            <div className="card">
              <label className="label">Where you are</label>
              <select value={form.locationType} onChange={e=>setForm(f=>({...f,locationType:e.target.value}))}>
                {LOCATION_TYPES.map(l=><option key={l}>{l}</option>)}
              </select>
              {form.locationType==="Other" && (
                <input style={{marginTop:8}} placeholder="Describe the place..." value={form.otherLocation} onChange={e=>setForm(f=>({...f,otherLocation:e.target.value}))}/>
              )}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid #252010"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{color:useGps?"#c9a84c":"#3a3010"}}><ShieldIcon/></div>
                  <div>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:useGps?"#6a5a30":"#3a3010"}}>Tag GPS Location</p>
                    <p style={{fontSize:13,color:"#3a3010",marginTop:2}}>{useGps?"Stored on device only. Never shared.":"Location will not be recorded"}</p>
                  </div>
                </div>
                <div onClick={()=>setUseGps(v=>!v)} style={{width:40,height:22,borderRadius:11,cursor:"pointer",flexShrink:0,background:useGps?"#c9a84c":"#252010",border:`1px solid ${useGps?"#c9a84c":"#3a3010"}`,position:"relative",transition:"background 0.2s,border-color 0.2s"}}>
                  <div style={{position:"absolute",top:2,left:useGps?18:2,width:16,height:16,borderRadius:8,background:useGps?"#0e0c06":"#4a3e1a",transition:"left 0.2s"}}/>
                </div>
              </div>
            </div>

            <div className="card">
              <label className="label">Opening at</label>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8}}>
                <select value={form.startBook} onChange={e=>setForm(f=>({...f,startBook:e.target.value,endBook:e.target.value}))}>
                  {BOOKS.map(b=><option key={b}>{b}</option>)}
                </select>
                <input placeholder="Ch." type="number" min="1" value={form.startChapter} onChange={e=>setForm(f=>({...f,startChapter:e.target.value,endChapter:e.target.value}))}/>
                <input placeholder="Vs." type="number" min="1" value={form.startVerse} onChange={e=>setForm(f=>({...f,startVerse:e.target.value}))}/>
              </div>
            </div>

            {/* Bible version quick display */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingLeft:2}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#3a3010",letterSpacing:"0.1em",textTransform:"uppercase"}}>Reading in</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:"0.1em"}}>{bibleVersion}</span>
            </div>

            {error && <p style={{color:"#a04030",fontSize:15,marginBottom:12,fontStyle:"italic"}}>{error}</p>}
            <button className="btn-primary" onClick={startSession} disabled={locLoading}>
              {locLoading ? "Finding location..." : "Open His Word"}
            </button>
          </div>
        )}

        {/* ══ SESSION ══ */}
        {view === "session" && activeSession && (
          <div className="fade-in">
            <div style={{background:"#141008",border:"1px solid #2e2408",borderRadius:8,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:activeSession.geoLabel?10:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,color:"#6a5a30",fontSize:13}}>
                  <ClockIcon/><span>{formatTime(activeSession.startTime)}</span>
                  <span className="pulse" style={{color:"#c9a84c",fontSize:10}}>●</span>
                  <span style={{color:"#8a7a4a"}}>{activeMins}m in His Word</span>
                </div>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase"}}>{activeSession.locationType}</span>
              </div>
              {activeSession.geoLabel && <div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div>}
            </div>

            <div style={{textAlign:"center",padding:"16px 0 20px"}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>In the Word — {bibleVersion}</p>
              <p style={{fontFamily:"'Crimson Text',serif",fontSize:24,color:"#c9a84c"}}>
                {activeSession.startBook} {activeSession.startChapter}{activeSession.startVerse?`:${activeSession.startVerse}`:""}
              </p>
            </div>

            <div className="card">
              <label className="label" style={{display:"flex",alignItems:"center",gap:6}}><CameraIcon/>Capture the Moment (optional)</label>
              {sessionPhoto ? (
                <div className="photo-preview">
                  <img src={sessionPhoto} alt="Session"/>
                  <button className="photo-remove" onClick={()=>setSessionPhoto(null)}>Remove</button>
                </div>
              ) : (
                <div className="photo-drop" onClick={()=>photoInputRef.current?.click()}>
                  <div style={{color:"#4a3e1a"}}><CameraIcon/></div>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#3a3010",letterSpacing:"0.1em",textTransform:"uppercase"}}>Add a photo</p>
                  <p style={{fontSize:14,color:"#2e2408"}}>Where you are. Who you're with. What surrounds this time.</p>
                </div>
              )}
              <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoUpload}/>
            </div>

            <div className="card">
              <label className="label">Closing at</label>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8}}>
                <select value={form.endBook} onChange={e=>setForm(f=>({...f,endBook:e.target.value}))}>
                  {BOOKS.map(b=><option key={b}>{b}</option>)}
                </select>
                <input placeholder="Ch." type="number" min="1" value={form.endChapter} onChange={e=>setForm(f=>({...f,endChapter:e.target.value}))}/>
                <input placeholder="Vs." type="number" min="1" value={form.endVerse} onChange={e=>setForm(f=>({...f,endVerse:e.target.value}))}/>
              </div>
            </div>

            <div className="card">
              <label className="label">Your notes (optional)</label>
              <textarea rows={3} placeholder="What hit you. What you noticed. What you're carrying out." style={{resize:"vertical"}}
                value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
            </div>

            {error && <p style={{color:"#a04030",fontSize:15,marginBottom:12,fontStyle:"italic"}}>{error}</p>}
            {loading ? (
              <div style={{textAlign:"center",padding:"28px 0"}}>
                <p className="pulse" style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:"0.18em"}}>READING HIS WORD...</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <button className="btn-primary" onClick={endSession}>End Reading</button>
                <button className="btn-ghost" onClick={()=>{ resetForm(); setView("home"); }}>Abandon</button>
              </div>
            )}
          </div>
        )}

        {/* ══ RESULT ══ */}
        {view === "result" && result && activeSession && (
          <div className="fade-in">
            {activeSession.photoData ? (
              <div style={{borderRadius:8,overflow:"hidden",marginBottom:14,position:"relative"}}>
                <img src={activeSession.photoData} alt="" style={{width:"100%",maxHeight:280,objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 45%,rgba(14,12,6,0.9) 100%)"}}/>
                <div style={{position:"absolute",bottom:14,left:16,right:16}}>
                  <p style={{fontFamily:"'Crimson Text',serif",fontSize:19,color:"#c9a84c",marginBottom:6}}>{activeSession.passage}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",alignItems:"center"}}>
                    {activeSession.geoLabel && <div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div>}
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#5a4a2a",letterSpacing:"0.08em"}}>
                      {elapsed(activeSession.startTime,activeSession.endTime)} · {activeSession.locationType}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{background:"linear-gradient(160deg,#181208,#0e0c06)",border:"1px solid #2e2408",borderRadius:8,padding:"18px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Session Complete</p>
                    <p style={{fontFamily:"'Crimson Text',serif",fontSize:20,color:"#c9a84c",lineHeight:1.3}}>{activeSession.passage}</p>
                  </div>
                  <div style={{textAlign:"right",fontSize:12,color:"#4a3e1a",flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end",marginBottom:5}}><ClockIcon/>{elapsed(activeSession.startTime,activeSession.readingEndTime||activeSession.endTime)} reading</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase"}}>{activeSession.locationType}</div>
                  </div>
                </div>
                {activeSession.geoLabel && <div style={{marginTop:10}}><div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div></div>}
              </div>
            )}

            {/* GROUND — context, deeper */}
            {result.context && (
              <div style={{background:"#120f06",border:"1px solid #1e1a08",borderLeft:"3px solid #3a3010",borderRadius:6,padding:"16px 18px",marginBottom:14}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:8}}>Ground</p>
                <p style={{fontSize:16,lineHeight:1.78,color:"#5a5030"}}>{result.context}</p>
              </div>
            )}

            {/* SUMMARY — not italic, not scripture */}
            {result.summary && (
              <div style={{borderLeft:"2px solid rgba(201,168,76,0.5)",paddingLeft:16,marginBottom:20}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#4a3e1a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:7}}>In One Sentence</p>
                <p style={{color:"#a09060",fontSize:18,lineHeight:1.6}}>{result.summary}</p>
              </div>
            )}

            {/* SAVE / SHARE — prominent, visible on first open, anchored by scripture */}
            <div style={{marginBottom:20}}>
              <button className="btn-export" style={{marginBottom:8}} onClick={()=>setExportSession(activeSession)}>
                <ShareIcon/> Save or Share This Session
              </button>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"#3a3010",textAlign:"center",lineHeight:1.5}}>
                "Let the redeemed of the Lord tell their story." — Psalm 107:2
              </p>
            </div>

            {/* QUESTIONS — fillable with answer feedback */}
            <div style={{background:"#141008",border:"1px solid #252010",borderRadius:8,marginBottom:14,overflow:"hidden"}}>
              <div className="section-head" style={{padding:"14px 18px"}} onClick={()=>setOpenSection(s=>({...s,q:!s.q}))}>
                <div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"#c9a84c",textTransform:"uppercase"}}>Questions from the Text</span>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:13,color:"#3a3010",marginTop:3}}>Tap a question to write your answer. Then submit.</p>
                </div>
                <ChevronIcon open={openSection.q}/>
              </div>
              {openSection.q && (
                <div style={{borderTop:"1px solid #1e1a08",padding:"14px 18px 18px"}}>
                  {result.questions?.map((q,i)=>(
                    <div key={i} style={{marginBottom:20,paddingBottom:20,borderBottom:i<result.questions.length-1?"1px solid #1a1608":"none"}}>
                      <div style={{display:"flex",gap:14,marginBottom:10,alignItems:"flex-start"}}>
                        <div style={{flexShrink:0,width:28,height:28,borderRadius:14,background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#6a5a30",fontWeight:600}}>{i+1}</span>
                        </div>
                        <p style={{fontSize:17,lineHeight:1.7,color:"#d4ccb8",paddingTop:4}}>{q}</p>
                      </div>
                      <AnswerInput
                        value={questionAnswers[i]||""}
                        onChange={val=>setQuestionAnswers(prev=>({...prev,[i]:val}))}
                        feedback={answerFeedback[i]}
                      />
                    </div>
                  ))}
                  {!feedbackSubmitted ? (
                    <button onClick={submitAnswers}
                      disabled={feedbackLoading||!Object.values(questionAnswers).some(a=>a&&a.trim().length>0)}
                      style={{width:"100%",padding:"12px",background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s",opacity:feedbackLoading||!Object.values(questionAnswers).some(a=>a&&a.trim().length>0)?0.4:1}}>
                      {feedbackLoading ? "Reading your answers..." : "Submit Answers"}
                    </button>
                  ) : (
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#3a3010",letterSpacing:"0.1em",textAlign:"center",textTransform:"uppercase"}}>Answers submitted</p>
                  )}
                </div>
              )}
            </div>

            {/* FIELD NOTES — informational, grounded */}
            <div style={{background:"#141008",border:"1px solid #252010",borderRadius:8,marginBottom:14,overflow:"hidden"}}>
              <div className="section-head" style={{padding:"14px 18px"}} onClick={()=>setOpenSection(s=>({...s,n:!s.n}))}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"#c9a84c",textTransform:"uppercase"}}>Field Notes</span>
                <ChevronIcon open={openSection.n}/>
              </div>
              {openSection.n && (
                <div style={{borderTop:"1px solid #1e1a08",padding:"14px 18px 18px"}}>
                  {result.notes?.map((n,i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
                      <span style={{color:"rgba(201,168,76,0.4)",fontSize:18,minWidth:10,paddingTop:1,lineHeight:1}}>—</span>
                      <p style={{fontSize:17,lineHeight:1.7,color:"#c0b898"}}>{n}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RETURN VERSES — sent back, directive */}
            <div style={{background:"#141008",border:"1px solid #252010",borderRadius:8,marginBottom:14,overflow:"hidden"}}>
              <div className="section-head" style={{padding:"14px 18px"}} onClick={()=>setOpenSection(s=>({...s,v:!s.v}))}>
                <div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"#c9a84c",textTransform:"uppercase"}}>Come Back To</span>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:13,color:"#3a3010",marginTop:3}}>Not comfort. A command to return.</p>
                </div>
                <ChevronIcon open={openSection.v}/>
              </div>
              {openSection.v && (
                <div style={{borderTop:"1px solid #1e1a08"}}>
                  {result.returnVerses?.map((v,i)=>(
                    <div key={i} style={{padding:"16px 18px",borderBottom:i<result.returnVerses.length-1?"1px solid #1a1608":"none"}}>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#c9a84c",letterSpacing:"0.04em",marginBottom:8}}>{v.ref}</p>
                      <p style={{fontSize:16,color:"#6a5a30",lineHeight:1.6,fontStyle:"italic"}}>{v.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeSession.personalNotes && (
              <div className="card" style={{borderColor:"#2e2408",marginBottom:14}}>
                <p className="label">Your Notes</p>
                <p style={{fontSize:17,lineHeight:1.65,color:"#6a5a30",fontStyle:"italic"}}>{activeSession.personalNotes}</p>
              </div>
            )}

            <button className="btn-primary" onClick={()=>{ resetForm(); setView("home"); }}>Close Session</button>
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {view === "history" && (
          <div className="fade-in">
            <SessionCalendar sessions={sessions} onDaySelect={handleCalendarDay} alarms={alarms} onSaveAlarm={handleSaveAlarm} onFilterChange={setFilterDate}/>
            {sessions.length === 0 ? (
              <div style={{textAlign:"center",padding:"30px 0"}}>
                <div style={{color:"#2e2408",marginBottom:12,display:"flex",justifyContent:"center"}}><BookIcon/></div>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#2e2408",letterSpacing:"0.14em"}}>NO SESSIONS LOGGED YET</p>
              </div>
            ) : (() => {
              const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
              const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
              const filteredSessions = filterDate
                ? sessions.filter(s => { const d=new Date(s.startTime); return d.getFullYear()===filterDate.getFullYear()&&d.getMonth()===filterDate.getMonth()&&d.getDate()===filterDate.getDate(); })
                : sessions;
              return (
              <>
                {/* Filter bar — above global strip when a day is selected */}
                {filterDate && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"7px 12px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:5}}>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#c9a84c",letterSpacing:"0.1em",textTransform:"uppercase"}}>
                      {dayNames[filterDate.getDay()]}, {months[filterDate.getMonth()]} {filterDate.getDate()}
                    </p>
                    <button onClick={()=>{ setFilterDate(null); }} style={{background:"transparent",border:"none",color:"#4a3e1a",fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>Show All</button>
                  </div>
                )}
                {/* Global strip — always visible, always total */}
                <StatsStrip sessions={sessions}/>
                {/* Day box or full list */}
                {filterDate ? (
                  <div style={{background:"#141008",border:"1px solid #252010",borderRadius:8,overflow:"hidden",marginBottom:10}}>
                    {filteredSessions.length === 0 ? (
                      <div style={{padding:"20px 16px",textAlign:"center"}}>
                        <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#2e2408",letterSpacing:"0.12em",textTransform:"uppercase"}}>No session on this day</p>
                      </div>
                    ) : (
                      filteredSessions.map(s=>(
                  <div key={s.id} className="hist-card" ref={el=>{ if(el) sessionRefs.current[s.id]=el; }}>
                    {s.photoData && (
                      <div style={{height:90,overflow:"hidden",position:"relative"}}>
                        <img src={s.photoData} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.65}}/>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(14,12,6,0.85))"}}/>
                      </div>
                    )}
                    <div className="hist-head" onClick={()=>setExpandedSession(expandedSession===s.id?null:s.id)}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontFamily:"'Crimson Text',serif",fontSize:18,color:"#c9a84c",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.passage}</p>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 14px",color:"#4a3e1a",fontSize:12,alignItems:"center"}}>
                          <span style={{display:"flex",alignItems:"center",gap:3}}><ClockIcon/>{formatDate(s.startTime)}</span>
                          <span>{elapsed(s.startTime,s.readingEndTime||s.endTime)} reading</span>
                          {s.geoLabel && <span style={{display:"flex",alignItems:"center",gap:3}}><PinIcon/>{s.geoLabel}</span>}
                          {s.bibleVersion && <span style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#3a3010",letterSpacing:"0.08em"}}>{s.bibleVersion}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8,flexShrink:0}}>
                        <button className="btn-danger" onClick={e=>{e.stopPropagation();deleteSession(s.id);}}>×</button>
                        <ChevronIcon open={expandedSession===s.id}/>
                      </div>
                    </div>
                    {expandedSession===s.id && s.aiResult && (
                      <div style={{padding:"0 16px 16px",borderTop:"1px solid #252010"}}>
                        {s.aiResult.context && (
                          <div style={{background:"#120f06",border:"1px solid #1e1a08",borderLeft:"3px solid #3a3010",borderRadius:6,padding:"12px 14px",margin:"12px 0 10px"}}>
                            <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#4a3e1a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>Ground</p>
                            <p style={{fontSize:14,lineHeight:1.7,color:"#5a5030"}}>{s.aiResult.context}</p>
                          </div>
                        )}
                        {s.aiResult.summary && (
                          <div style={{borderLeft:"2px solid rgba(201,168,76,0.4)",paddingLeft:12,margin:"10px 0"}}>
                            <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#4a3e1a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>In One Sentence</p>
                            <p style={{fontStyle:"italic",color:"#8a7a4a",fontSize:15,lineHeight:1.55}}>{s.aiResult.summary}</p>
                          </div>
                        )}
                        <hr className="divider"/>
                        <p className="label">Questions from the Text</p>
                        {s.aiResult.questions?.map((q,i)=>(
                          <div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:i<s.aiResult.questions.length-1?"1px solid #1a1608":"none"}}>
                            <p style={{fontSize:15,color:"#d4ccb8",lineHeight:1.6,marginBottom:6}}>{q}</p>
                            {s.questionAnswers?.[i] && (
                              <div style={{background:"#141008",border:"1px solid #2e2408",borderRadius:5,padding:"8px 12px",marginBottom:s.answerFeedback?.[i]?6:0}}>
                                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#3a3010",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Your Answer</p>
                                <p style={{fontSize:14,color:"#8a7a5a",lineHeight:1.6,fontStyle:"italic"}}>{s.questionAnswers[i]}</p>
                              </div>
                            )}
                            {s.answerFeedback?.[i] && (
                              <div style={{background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.12)",borderRadius:5,padding:"8px 12px"}}>
                                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Response</p>
                                <p style={{fontSize:14,color:"#8a7a5a",lineHeight:1.6}}>{s.answerFeedback[i]}</p>
                              </div>
                            )}
                          </div>
                        ))}
                        {s.aiResult.notes?.length > 0 && (
                          <>
                            <hr className="divider"/>
                            <p className="label">Field Notes</p>
                            {s.aiResult.notes.map((n,i)=>(
                              <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                                <span style={{color:"rgba(201,168,76,0.4)",fontSize:16,lineHeight:1}}>*</span>
                                <p style={{fontSize:14,lineHeight:1.65,color:"#c0b898"}}>{n}</p>
                              </div>
                            ))}
                          </>
                        )}
                        <hr className="divider"/>
                        <p className="label">Come Back To</p>
                        {s.aiResult.returnVerses?.map((v,i)=>(
                          <div key={i} style={{marginBottom:10,paddingLeft:10,borderLeft:"2px solid #2e2408"}}>
                            <p style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#c9a84c",marginBottom:4}}>{v.ref}</p>
                            <p style={{color:"#6a5a30",fontSize:13,fontStyle:"italic",lineHeight:1.55}}>{v.reason}</p>
                          </div>
                        ))}
                        {s.personalNotes && (<><hr className="divider"/><p className="label">Your Notes</p><p style={{fontStyle:"italic",color:"#5a4a20",fontSize:14,lineHeight:1.55}}>{s.personalNotes}</p></>)}
                        <hr className="divider"/>
                        <button className="btn-export" style={{fontSize:10,padding:"9px 16px"}} onClick={()=>setExportSession(s)}>
                          <ShareIcon/> Save or Share
                        </button>
                      </div>
                    )}
                  </div>
                ))
                    )}
                  </div>
                ) : (
                  // Show all sessions
                  sessions.map(s=>(
                    <div key={s.id} className="hist-card" ref={el=>{ if(el) sessionRefs.current[s.id]=el; }}>
                      {s.photoData && (
                        <div style={{height:90,overflow:"hidden",position:"relative"}}>
                          <img src={s.photoData} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.65}}/>
                          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(14,12,6,0.85))"}}/>
                        </div>
                      )}
                      <div className="hist-head" onClick={()=>setExpandedSession(expandedSession===s.id?null:s.id)}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontFamily:"'Crimson Text',serif",fontSize:18,color:"#c9a84c",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.passage}</p>
                          <div style={{display:"flex",flexWrap:"wrap",gap:"6px 14px",color:"#4a3e1a",fontSize:12,alignItems:"center"}}>
                            <span style={{display:"flex",alignItems:"center",gap:3}}><ClockIcon/>{formatDate(s.startTime)}</span>
                            <span>{elapsed(s.startTime,s.readingEndTime||s.endTime)} reading</span>
                            {s.geoLabel && <span style={{display:"flex",alignItems:"center",gap:3}}><PinIcon/>{s.geoLabel}</span>}
                            {s.bibleVersion && <span style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#3a3010",letterSpacing:"0.08em"}}>{s.bibleVersion}</span>}
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8,flexShrink:0}}>
                          <button className="btn-danger" onClick={e=>{e.stopPropagation();deleteSession(s.id);}}>×</button>
                          <ChevronIcon open={expandedSession===s.id}/>
                        </div>
                      </div>
                      {expandedSession===s.id && s.aiResult && (
                        <div style={{padding:"0 16px 16px",borderTop:"1px solid #252010"}}>
                          <p style={{fontStyle:"italic",color:"#5a4a20",fontSize:15,padding:"10px 0",lineHeight:1.55}}>{s.aiResult.summary}</p>
                          <button className="btn-export" style={{fontSize:10,padding:"9px 16px",marginBottom:10}} onClick={()=>setExportSession(s)}>
                            <ShareIcon/> Save or Share
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
              );
            })()}
          </div>
        )}

        {/* ══ ABOUT ══ */}
        {view === "about" && <AboutScreen onBack={()=>setView("home")}/>}

        {/* ══ SETTINGS ══ */}
        {view === "settings" && (
          <div className="fade-in">
            <button onClick={()=>setView("home")} style={{background:"transparent",border:"none",color:"#6a5a30",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6,padding:0}}>
              ← Back
            </button>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"#3a3010",textAlign:"center",marginBottom:16,lineHeight:1.5}}>
              Set these once. Come back when something changes.
            </p>
            <div className="card" style={{textAlign:"center",paddingTop:28,paddingBottom:28}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
                <CrossIcon size={32} glow={false}/>
              </div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,letterSpacing:"0.1em",color:"#e4dcc8",marginBottom:6}}>SELAH</h2>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",color:"#4a3e1a",fontSize:14,marginBottom:14}}>Read. Mark. Return.</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(201,168,76,0.5)",letterSpacing:"0.2em",textTransform:"uppercase"}}>MIDNIGHT MINISTRIES</p>
            </div>

            {/* Bible Version */}
            <div className="card">
              <p className="label">Bible Translation</p>
              <p style={{fontSize:15,color:"#5a4a20",lineHeight:1.6,marginBottom:14}}>
                Select the translation you read in. Questions and field notes are calibrated to your version's language.
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {BIBLE_VERSIONS.map(v=>(
                  <button key={v} className={`version-pill ${bibleVersion===v?"active":""}`}
                    onClick={()=>setBibleVersion(v)}>{v}</button>
                ))}
              </div>
            </div>

            {/* Gender + Age + Time */}
            <div className="card">
              <p className="label">I Am</p>
              <p style={{fontSize:15,color:"#5a4a20",lineHeight:1.6,marginBottom:14}}>
                The model adjusts language and examples to meet you where you are. His Word does not change.
              </p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Gender</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                {["Male","Female","Prefer not to say"].map(g=>(
                  <button key={g} className={`version-pill ${gender===g?"active":""}`}
                    onClick={()=>setGender(g)}>{g}</button>
                ))}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Age</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Child (under 13)","Teen (13-17)","Adult (18+)","Prefer not to say"].map(a=>(
                  <button key={a} className={`version-pill ${age===a?"active":""}`}
                    onClick={()=>setAge(a)}>{a}</button>
                ))}
              </div>
            </div>

            {/* Clock and Timezone */}
            <div className="card">
              <p className="label">Time Display</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Clock Format</p>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {[["12","12-Hour (2:30 PM)"],["24","24-Hour (14:30)"]].map(([val,label])=>(
                  <button key={val} className={`version-pill ${clockFmt===val?"active":""}`}
                    onClick={()=>setClockFmt(val)} style={{flex:1}}>{label}</button>
                ))}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Time Zone</p>
              <p style={{fontSize:13,color:"#3a3010",marginBottom:10,lineHeight:1.5}}>
                If your device drifts near state borders (Yuma area, AZ near CA), set manually.
              </p>
              <TimezoneDropdown timezone={timezone} setTimezone={setTimezone}/>
            </div>

            {/* Support the Ministry */}
            <div className="card" style={{borderColor:"rgba(201,168,76,0.2)"}}>
              <p className="label">Support the Ministry</p>
              <p style={{fontSize:16,lineHeight:1.7,color:"#6a5a30",marginBottom:14}}>
                SELAH is free. It will stay free. If it has been useful to you and you want to invest in what is being built, this is how.
              </p>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"#5a4a20",marginBottom:16,lineHeight:1.65,borderLeft:"2px solid #2e2408",paddingLeft:12}}>
                Sixty percent of every dollar given goes directly to the local church. Forty percent funds the tools this ministry was handed to build. When you give, you receive a receipt automatically. Every 30 days Midnight Ministries publishes what came in, what went out, and where it went. That is not a policy. That is a commitment.
              </p>
              <a href="https://donate.midnightministries.com" target="_blank" rel="noopener noreferrer"
                style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  background:"linear-gradient(135deg,#c9a84c,#a8832a)",
                  color:"#0e0c06",borderRadius:5,padding:"13px 20px",
                  fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,
                  letterSpacing:"0.1em",textTransform:"uppercase",
                  textDecoration:"none",transition:"opacity 0.2s"
                }}
                onMouseOver={e=>e.currentTarget.style.opacity="0.88"}
                onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Give to Midnight Ministries
              </a>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"#2e2408",textAlign:"center",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:10}}>
                URL updates when donation link is live
              </p>
            </div>

            <div className="card">
              <p className="label">Privacy</p>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{color:"#c9a84c",marginTop:2,flexShrink:0}}><ShieldIcon/></div>
                <p style={{fontSize:16,lineHeight:1.65,color:"#6a5a30"}}>GPS location and photos are stored only on this device. Nothing is transmitted or synced. Share cards and notes are generated locally and only leave the device when you choose to send them.</p>
              </div>
            </div>
            <div className="card">
              <p className="label">Storage</p>
              <p style={{fontSize:16,lineHeight:1.65,color:"#6a5a30",marginBottom:14}}>All sessions including photos are saved in your browser. Clearing browser data removes your log. Export to Notes or Files for permanent records.</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#4a3e1a",letterSpacing:"0.08em"}}>
                {sessions.length} session{sessions.length!==1?"s":""} — {sessions.filter(s=>s.photoData).length} with photos
              </p>
            </div>

            {/* Depth level */}
            {sessions.length > 0 && (()=>{
              const d = getDepthLevel(sessions);
              const totalMins = sessions.reduce((a,s)=>a+Math.round((new Date(s.endTime)-new Date(s.startTime))/60000),0);
              const levels = ["Seed","Root","Branch","Fruit","Harvest"];
              return (
                <div className="card">
                  <p className="label">Depth Level</p>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:28,color:"#c9a84c",fontWeight:700,lineHeight:1}}>{d.level}</p>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#4a3e1a",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:3}}>of 5</p>
                    </div>
                    <div>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:15,color:"#c9a84c",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{d.name}</p>
                      <p style={{fontFamily:"'Crimson Text',serif",fontSize:14,color:"#5a4a20"}}>{sessions.length} sessions · {totalMins < 60 ? totalMins+"m" : Math.floor(totalMins/60)+"h"} in His Word</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    {levels.map((l,i)=>(
                      <div key={l} style={{flex:1,height:4,borderRadius:2,background:i<d.level?"#c9a84c":"#252010",transition:"background 0.3s"}}/>
                    ))}
                  </div>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"#3a3010",marginTop:10,lineHeight:1.5}}>
                    The questions and notes adjust as you grow. You are always gathering.
                  </p>
                </div>
              );
            })()}
            <div className="card">
              <p className="label">Clear All Data</p>
              <p style={{fontSize:15,color:"#5a4a20",marginBottom:14,lineHeight:1.5}}>Removes every session from this device. Cannot be undone.</p>
              <button className="btn-danger" style={{width:"100%",padding:"12px"}}
                onClick={()=>{ if(window.confirm("Delete all sessions? This cannot be undone.")) { setSessions([]); saveSessions([]); }}}>
                Clear All Sessions
              </button>
            </div>
            <div style={{textAlign:"center",paddingTop:8}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#2e2408",letterSpacing:"0.1em",textTransform:"uppercase"}}>Psalm 46:10</p>
            </div>
          </div>
        )}

      </div>

      <MMFooter/>
      {exportSession && <ExportSheet session={exportSession} onClose={()=>setExportSession(null)}/>}
    </div>
  );
}
