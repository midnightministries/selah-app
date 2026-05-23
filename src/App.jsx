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

// Bump this on every deploy so you can confirm which build is live.
const BUILD = "2026.05.22-b137";

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
- Language: strong nouns, active verbs, direct sentences. No em dashes. No therapy tone. No flattery.
- Honesty is the standard. Calibrate to where the reader actually is and aim one step ahead, never below their demonstrated level and never beyond reach. Growth is real and small: ten minutes, twelve verses, one book is a reader beginning to form. Name that honestly. Do not inflate it and do not diminish it. This is not about metrics. It is about telling the reader the truth about where they are and where they are headed.`;

// ── Brand colors held constant across every palette ──
const CROSS_RED = "#8e1c1c";     // blood-red cross, every palette
const SELAH_CREAM = "#ece0c6";   // beautiful cream wordmark, every palette

// Inline SELAH wordmark: cream with a hint of palette hue and a thin outline,
// scaled to whatever text it sits in. Use anywhere "SELAH" appears in prose.
function Selah() {
  return <span style={{ fontFamily:"'Cinzel',serif", fontWeight:600, fontSize:"0.92em", color:SELAH_CREAM, letterSpacing:"0.04em", WebkitTextStroke:"0.4px rgba(var(--accent-rgb),0.45)" }}>SELAH</span>;
}
// Walk prose children and swap the bare word "SELAH" for the wordmark component.
function withSelah(children) {
  const arr = Array.isArray(children) ? children : [children];
  const out = [];
  arr.forEach((child, ci) => {
    if (typeof child === "string" && child.includes("SELAH")) {
      const parts = child.split("SELAH");
      parts.forEach((p, i) => {
        if (p) out.push(p);
        if (i < parts.length - 1) out.push(<Selah key={"slh-" + ci + "-" + i} />);
      });
    } else {
      out.push(child);
    }
  });
  return out;
}
const CROSS_SRC = "data:image/png;base64,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";

// ── Chalky Cross Icon — rendered through a mask so it stays blood-red on any palette ──
function CrossIcon({ size = 24, glow = false }) {
  const imgH = Math.round(size * 1.5);
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: imgH,
        backgroundColor: CROSS_RED,
        WebkitMaskImage: `url("${CROSS_SRC}")`,
        maskImage: `url("${CROSS_SRC}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        filter: glow ? "drop-shadow(0 0 10px rgba(142,28,28,0.55))" : "none",
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
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="27" rx="16" ry="20" fill="url(#halo-foot)"/>
      <rect x="17" y="3" width="6" height="54" rx="1.5" fill="var(--accent)" filter="url(#chalk-foot)"/>
      <rect x="4" y="20" width="32" height="6" rx="1.5" fill="var(--accent)" filter="url(#chalk-foot)"/>
    </svg>
  );
}

function ChevronIcon({ open, size=14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
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
function SettingsIcon({ size=16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
    reader.onerror = () => resolve(null);
    reader.onload = (e) => {
      const dataURL = e.target.result;
      const img = new Image();
      // If the image can't be decoded/cropped (e.g. a format the canvas
      // can't handle), fall back to the raw data so the photo still attaches
      // instead of the upload silently hanging.
      img.onerror = () => resolve(dataURL || null);
      img.onload = () => {
        try {
          // Keep the WHOLE photo (no square crop) so the share editor can frame
          // it for 1:1 or 9:16 without losing the top/bottom. Just downscale.
          const MAX = 1280;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } catch { resolve(dataURL || null); }
      };
      img.src = dataURL;
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

const CARD_COLORS = [["#c9a84c","Gold"],["#ece0c6","Cream"],["#ffffff","White"],["#b5302f","Blood Red"],["#b07fe0","Purple"],["#5aa0d6","Sky"],["#5fae7a","Green"],["#0e0c06","Ink"]];
const BG_OPTIONS = [
  ["ink","Ink","#0e0c06","#0e0c06"],
  ["embers","Embers","#2a1408","#0c0905"],
  ["oxblood","Oxblood","#2a0c0c","#0c0606"],
  ["plum","Plum","#1d0b18","#0b0610"],
  ["nightsky","Night Sky","#0c1424","#070a12"],
  ["forest","Forest","#0c1a12","#070d08"],
  // second row — palette-derived fades
  ["midnight","Midnight","#241510","#100a07"],
  ["amber","Amber","#3a2410","#140c06"],
  ["rose","Rose","#2c1018","#100609"],
  ["cadet","Cadet","#16202c","#080c12"],
  ["steel","Steel","#1c2026","#0a0c10"],
  ["wine","Wine","#2e0c12","#100507"],
];
// blend two #rrggbb hex colors; t=0 -> a, t=1 -> b
function mixHex(a,b,t){
  const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
  const ar=(pa>>16)&255, ag=(pa>>8)&255, ab=pa&255;
  const br=(pb>>16)&255, bg=(pb>>8)&255, bb=pb&255;
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return "#"+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1);
}
const CARD_FONTS = { serif:"Georgia, serif", cinzel:"Cinzel, Georgia, serif", crimson:"'Crimson Text', Georgia, serif", sans:"Helvetica, Arial, sans-serif" };

function defaultLayout(session, hasPhoto, fam) {
  fam = fam || "Georgia, serif";
  return {
    aspect: (session && session.photoAspect) || "square",
    content: "session",
    photo: { show: !!hasPhoto, x: 0.5, y: 0.5 },
    els: {
      cross: { kind:"cross", show:true, xf:0.12, yf:0.11, size:0.085, rot:0, color:"#d6b860", opacity:1, glow:0, glowColor:"#0e0c06" },
      selah: { kind:"text", show:true, xf:0.5, yf:0.13, size:0.085, rot:0, color:"#ece0c6", weight:"bold", italic:false, text:"SELAH", opacity:1, glow:0, glowColor:"#0e0c06" },
      body:  { kind:"text", show:true, xf:0.5, yf:0.5,  size:0.048, rot:0, color:"#c9a84c", weight:"", italic:true, text:(session.passage||""), opacity:1, glow:0, glowColor:"#0e0c06" },
      mm:    { kind:"text", show:true, xf:0.5, yf:0.93, size:0.024, rot:0, color:"#c9a84c", weight:"", italic:false, text:"MIDNIGHT MINISTRIES", opacity:1, glow:0, glowColor:"#0e0c06" },
    },
    fam,
  };
}

// Compose the final share image from the editor layout
function composeCard(session, layout) {
  const DIMS = { square:[1080,1080], portrait:[1080,1350], story:[1080,1920] };
  const [W,H] = DIMS[layout.aspect] || DIMS.square;
  const fam = CARD_FONTS[layout.font] || layout.fam || "Georgia, serif";
  return new Promise((resolve) => {
    const cv = document.createElement("canvas"); cv.width=W; cv.height=H; const ctx=cv.getContext("2d");
    const crossEl = document.querySelector('img[src^="data:image/png;base64,iVBOR"]');
    const els = layout.els;
    function paintBg(){
      const o = BG_OPTIONS.find(b=>b[0]===(layout.bg||"ink")) || BG_OPTIONS[0];
      let top=o[2], bot=o[3];
      if(layout.bgRev){ const t=top; top=bot; bot=t; }
      const fade = layout.bgFade==null?0.5:layout.bgFade;
      const end = mixHex(top, bot, fade);   // fade=0 -> solid top, fade=1 -> full bottom
      if(top===end){ ctx.fillStyle=top; ctx.fillRect(0,0,W,H); }
      else { const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,top); g.addColorStop(1,end); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
    }
    function drawText(el){
      if(!el.show || !el.text) return;
      const fpx = el.size*W;
      ctx.save(); ctx.translate(el.xf*W, el.yf*H); ctx.rotate((el.rot||0)*Math.PI/180);
      ctx.globalAlpha = (el.opacity==null?1:el.opacity);
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.font = `${el.weight||""} ${el.italic?"italic ":""}${fpx}px ${fam}`;
      if(el.glow){ ctx.shadowColor = el.glowColor||"#0e0c06"; ctx.shadowBlur = el.glow*fpx*0.3; }
      ctx.fillStyle = el.color;
      const lines = wrapText(ctx, el.text, W*0.86);
      let y = -(lines.length-1)*fpx*0.6;
      // paint glow first (heavier) then a crisp pass on top
      if(el.glow){ lines.forEach((l,k)=>ctx.fillText(l,0,-(lines.length-1)*fpx*0.6+k*fpx*1.2)); ctx.shadowBlur=0; }
      lines.forEach(l=>{ ctx.fillText(l,0,y); y+=fpx*1.2; });
      ctx.restore();
    }
    function drawCross(el){
      if(!el.show || !crossEl || !crossEl.naturalWidth) return;
      const ch=el.size*W*1.5, cw=ch*(crossEl.naturalWidth/crossEl.naturalHeight);
      const tmp=document.createElement("canvas"); tmp.width=Math.max(1,Math.round(cw)); tmp.height=Math.max(1,Math.round(ch));
      const t2=tmp.getContext("2d"); t2.drawImage(crossEl,0,0,tmp.width,tmp.height);
      t2.globalCompositeOperation="source-atop"; t2.fillStyle=el.color; t2.fillRect(0,0,tmp.width,tmp.height);
      ctx.save(); ctx.translate(el.xf*W, el.yf*H); ctx.rotate((el.rot||0)*Math.PI/180);
      ctx.globalAlpha = (el.opacity==null?1:el.opacity);
      if(el.glow){ ctx.shadowColor = el.glowColor||"#0e0c06"; ctx.shadowBlur = el.glow*ch*0.2; }
      ctx.drawImage(tmp,-cw/2,-ch/2,cw,ch); ctx.restore();
    }
    function finish(){
      if (layout.photo.show && session.photoData){
        const ov=ctx.createLinearGradient(0,0,0,H);
        ov.addColorStop(0,"rgba(10,8,4,0.5)"); ov.addColorStop(0.5,"rgba(10,8,4,0.28)"); ov.addColorStop(1,"rgba(10,8,4,0.7)");
        ctx.fillStyle=ov; ctx.fillRect(0,0,W,H);
      }
      drawCross(els.cross); drawText(els.selah); drawText(els.body); drawText(els.mm);
      cv.toBlob(b=>resolve(b),"image/png");
    }
    if (layout.photo.show && session.photoData){
      const img=new Image();
      img.onload=()=>{
        paintBg();
        const z=layout.photo.zoom||1;
        const r=Math.max(W/img.width,H/img.height), dw=img.width*r*z, dh=img.height*r*z;
        ctx.drawImage(img,(W-dw)*layout.photo.x,(H-dh)*layout.photo.y,dw,dh);
        finish();
      };
      img.src=session.photoData;
    } else {
      paintBg();
      finish();
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

// ── Account + cloud sync (Netlify functions) ──
const ACCOUNT_KEY = "selah_account";
function loadAccount() { try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY))||null; } catch { return null; } }
function saveAccount(a) { try { if (a) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a)); else localStorage.removeItem(ACCOUNT_KEY); } catch {} }

async function authRequest(action, email, password) {
  const r = await fetch("/.netlify/functions/auth", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, email, password })
  });
  const j = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(j.error || "Something went wrong. Try again.");
  return j; // { token, email, data }
}

async function syncRequest(action, account, data) {
  if (!account) return null;
  const r = await fetch("/.netlify/functions/sync", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, email: account.email, token: account.token, data })
  });
  const j = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(j.error || "Sync failed.");
  return j; // save: {ok,updatedAt} | load: {data,updatedAt}
}

// ── App icon themes (swap favicon + apple-touch at runtime) ──
const ICON_THEMES = {
  default: { label: "Gold Cross", base: "",            thumb: "/icon-192.png" },
  red:     { label: "Blood Red",  base: "/icons/red",    thumb: "/icons/red/icon-192.png" },
  nebula:  { label: "Nebula",     base: "/icons/nebula", thumb: "/icons/nebula/icon-192.png" },
  camo:    { label: "Tiger Camo", base: "/icons/camo",   thumb: "/icons/camo/icon-192.png" },
  pinkneb: { label: "Pink Cross",  base: "/icons/pinkneb", thumb: "/icons/pinkneb/icon-192.png" },
  pinksplatter: { label: "Pink Splatter", base: "/icons/pinksplatter", thumb: "/icons/pinksplatter/icon-192.png" },
  redneb:  { label: "Red Cross",   base: "/icons/redneb",  thumb: "/icons/redneb/icon-192.png" },
  selahred:{ label: "SELAH Red",   base: "/icons/selahred",thumb: "/icons/selahred/icon-192.png" },
  tigerpurple:    { label: "Purple Tiger",   base: "/icons/tigerpurple",    thumb: "/icons/tigerpurple/icon-192.png" },
  splatterpurple: { label: "Purple Splatter",base: "/icons/splatterpurple", thumb: "/icons/splatterpurple/icon-192.png" },
};
function applyAppIcon(name) {
  if (typeof document === "undefined") return;
  const t = ICON_THEMES[name] || ICON_THEMES.default;
  const b = t.base;
  // Cookie so the Netlify edge function can inject the right favicon into the
  // HTML on first paint (the only thing that fixes Safari's frozen tab icon).
  try { document.cookie = "selah_icon=" + encodeURIComponent(name) + ";path=/;max-age=31536000;samesite=lax"; } catch {}
  const v = "?v=" + encodeURIComponent(name) + "-" + Date.now();   // unique per application so the browser is forced to refetch and re-render the tab icon
  const head = document.head;
  // Recreate the link nodes instead of mutating href in place. Browsers
  // (Chrome especially) often ignore an in-place href change and keep the
  // cached favicon; removing + re-adding forces a refresh of the tab/dock icon.
  const swap = (sel, rel, attrs, file) => {
    document.querySelectorAll(sel).forEach(el => el.parentNode && el.parentNode.removeChild(el));
    const link = document.createElement("link");
    link.setAttribute("rel", rel);
    Object.entries(attrs).forEach(([k, val]) => link.setAttribute(k, val));
    link.setAttribute("href", b + file + v);
    head.appendChild(link);
  };
  swap('link[rel="icon"][type="image/x-icon"]', "icon", { type: "image/x-icon" }, "/favicon.ico");
  swap('link[rel="icon"][sizes="32x32"]', "icon", { type: "image/png", sizes: "32x32" }, "/favicon-32.png");
  swap('link[rel="icon"][sizes="16x16"]', "icon", { type: "image/png", sizes: "16x16" }, "/favicon-16.png");
  swap('link[rel="apple-touch-icon"]', "apple-touch-icon", { sizes: "180x180" }, "/apple-touch-icon.png");
  // older Safari reads rel="shortcut icon"; harmless elsewhere
  swap('link[rel="shortcut icon"]', "shortcut icon", {}, "/favicon.ico");
}

// ── Color palettes (override the theme variable package) ──
const PALETTES = {
  midnight: { label: "Midnight", swatch: ["#190f0b","#c9a84c","#6e1c1c"], vars: {
    "--bg":"#190f0b","--surface":"#20130f","--input":"#221610","--input2":"#160d0a",
    "--border":"#36241c","--border2":"#2e2408","--accent":"#c9a84c","--accent2":"#a8832a",
    "--ink":"#0e0c06","--text":"#e4dcc8","--text2":"#c8bfa0","--text3":"#c0b898","--text4":"#d4ccb8",
    "--m1":"#8a7a4a","--m1b":"#8a7a5a","--m2":"#6a5a30","--m3":"#5a4a20","--m3b":"#5a4a2a","--m4":"#4a3e1a","--m5":"#3a3010",
    "--accent-rgb":"201,168,76","--blood-rgb":"110,28,28","--surface-rgb":"32,19,15" } },
  warm: { label: "Warm Amber", swatch: ["#241108","#f5894a","#a4734e"], vars: {
    "--bg":"#241108","--surface":"#311a0e","--input":"#3a2012","--input2":"#2a1409",
    "--border":"#4a2e1c","--border2":"#3e2616","--accent":"#f5894a","--accent2":"#d2632a",
    "--ink":"#1a0d05","--text":"#f7e7d6","--text2":"#ecccb4","--text3":"#e2c0a6","--text4":"#f5e6d6",
    "--m1":"#c79874","--m1b":"#c79874","--m2":"#a4734e","--m3":"#875b3c","--m3b":"#875b3c","--m4":"#6a4630","--m5":"#523524",
    "--accent-rgb":"245,137,74","--blood-rgb":"150,40,40","--surface-rgb":"49,26,14" } },
  rose: { label: "Rose", swatch: ["#26101c","#f08fb5","#a86883"], vars: {
    "--bg":"#26101c","--surface":"#341624","--input":"#3c1a2b","--input2":"#2a1320",
    "--border":"#4e2840","--border2":"#432234","--accent":"#f08fb5","--accent2":"#cc6090",
    "--ink":"#1c0c14","--text":"#f8e7ee","--text2":"#edccd8","--text3":"#e2c0cf","--text4":"#f3dde8",
    "--m1":"#c98ba2","--m1b":"#c98ba2","--m2":"#a86883","--m3":"#8a536c","--m3b":"#8a536c","--m4":"#6c3f53","--m5":"#543141",
    "--accent-rgb":"240,143,181","--blood-rgb":"160,50,90","--surface-rgb":"52,22,36" } },
  blossom: { label: "Blossom", swatch: ["#1d1336","#cf9bff","#8772aa"], vars: {
    "--bg":"#1d1336","--surface":"#271a45","--input":"#2d1e4f","--input2":"#211541",
    "--border":"#3c2c63","--border2":"#322455","--accent":"#cf9bff","--accent2":"#a86fe0",
    "--ink":"#150c28","--text":"#f0e8fb","--text2":"#d8ccef","--text3":"#cdc0e6","--text4":"#e6dcf6",
    "--m1":"#a995c9","--m1b":"#a995c9","--m2":"#8772aa","--m3":"#6f5b90","--m3b":"#6f5b90","--m4":"#564574","--m5":"#43355c",
    "--accent-rgb":"207,155,255","--blood-rgb":"170,70,120","--surface-rgb":"39,26,69" } },
  cadet: { label: "Cadet Blue", swatch: ["#0b1a30","#4ec4ff","#5e7a9c"], vars: {
    "--bg":"#0b1a30","--surface":"#11233f","--input":"#13294a","--input2":"#0e1d36",
    "--border":"#25405f","--border2":"#1f3650","--accent":"#4ec4ff","--accent2":"#2e84cc",
    "--ink":"#08121f","--text":"#e4eef8","--text2":"#c4d8ee","--text3":"#bacfe6","--text4":"#d8e6f4",
    "--m1":"#7e9bbb","--m1b":"#7e9bbb","--m2":"#5e7a9c","--m3":"#4e6582","--m3b":"#4e6582","--m4":"#3e5168","--m5":"#314052",
    "--accent-rgb":"78,196,255","--blood-rgb":"60,100,170","--surface-rgb":"17,35,63" } },
  steel: { label: "Steel", swatch: ["#14181d","#93b6cf","#6a7c8a"], vars: {
    "--bg":"#14181d","--surface":"#1d232a","--input":"#212831","--input2":"#161b21",
    "--border":"#333c46","--border2":"#2a323b","--accent":"#93b6cf","--accent2":"#5f87a4",
    "--ink":"#0c1116","--text":"#e8edf2","--text2":"#cdd8e0","--text3":"#c2cfd8","--text4":"#dde6ed",
    "--m1":"#8a9aa8","--m1b":"#8a9aa8","--m2":"#6a7c8a","--m3":"#586774","--m3b":"#586774","--m4":"#45525d","--m5":"#364049",
    "--accent-rgb":"147,182,207","--blood-rgb":"100,120,150","--surface-rgb":"29,35,42" } },
  dark: { label: "Dark", swatch: ["#141215","#c7414c","#7a6f78"], vars: {
    "--bg":"#141215","--surface":"#1d1a20","--input":"#221e26","--input2":"#17141a",
    "--border":"#352f3e","--border2":"#2b2733","--accent":"#c7414c","--accent2":"#93303a",
    "--ink":"#14080a","--text":"#ece6ea","--text2":"#d4ccd2","--text3":"#c8bfc6","--text4":"#f0eaef",
    "--m1":"#9a8f98","--m1b":"#9a8f98","--m2":"#7a6f78","--m3":"#645b66","--m3b":"#645b66","--m4":"#4e4654","--m5":"#3c3542",
    "--accent-rgb":"199,65,76","--blood-rgb":"150,40,40","--surface-rgb":"29,26,32" } },
};
function ageFromBirthday(bday) {
  if (!bday) return null;
  const d = new Date(bday); if (isNaN(d)) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}
function applyPalette(name) {
  if (typeof document === "undefined") return;
  const p = PALETTES[name] || PALETTES.midnight;
  const root = document.documentElement;
  Object.entries(p.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // Tint the iOS Safari bars to the palette's background so the app and the browser
  // chrome read as one continuous surface, top to bottom (fluid, not a contrasting frost).
  const bg = p.vars["--bg"];
  if (bg) {
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "theme-color"); document.head.appendChild(m); }
    m.setAttribute("content", bg);
  }
}

// ── Auth + onboarding screen ──
function AuthScreen({ initialMode, intro, onAuthed, onSkip, onBack }) {
  const [mode, setMode] = useState(initialMode || "signup");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputStyle = { width:"100%", boxSizing:"border-box", background:"var(--input2)", border:"1px solid var(--border)", borderRadius:6, padding:"12px 14px", color:"var(--text)", fontFamily:"'Crimson Text',serif", fontSize:17, outline:"none", marginBottom:12 };
  async function submit() {
    setErr("");
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) { setErr("Enter a valid email."); return; }
    if (pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      const res = await authRequest(mode, e, pw);
      onAuthed({ email: res.email, token: res.token }, res.data || {}, mode === "signup");
    } catch (ex) { setErr(ex.message || "Something went wrong."); }
    setBusy(false);
  }
  return (
    <div className="fade-in">
      {onBack && (
        <button onClick={onBack} style={{background:"transparent",border:"none",color:"var(--m2)",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6,padding:0}}>← Back</button>
      )}
      {intro && (
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><CrossIcon size={40} glow={true}/></div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:24,fontWeight:700,letterSpacing:"0.12em",color:SELAH_CREAM,textShadow:"0 0 22px rgba(var(--accent-rgb),0.3)",marginBottom:6}}>SELAH</h2>
          <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m3)",lineHeight:1.5,marginBottom:4}}>Read. Mark. Return.</p>
          <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"var(--m4)",lineHeight:1.55,maxWidth:330,margin:"0 auto"}}>
            Make an account to carry your log and settings across every device. Or step straight in. Your reading stays yours.
          </p>
        </div>
      )}
      <div className="card">
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[["signup","Create Account"],["login","Sign In"]].map(([val,label])=>(
            <button key={val} className={`version-pill ${mode===val?"active":""}`} onClick={()=>{ setMode(val); setErr(""); }} style={{flex:1}}>{label}</button>
          ))}
        </div>
        <p className="label">Email</p>
        <input type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}/>
        <p className="label">Password</p>
        <input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="At least 6 characters" style={inputStyle}
          onKeyDown={e=>{ if(e.key==="Enter") submit(); }}/>
        {err && <p style={{color:"#d98a8a",fontFamily:"'Crimson Text',serif",fontSize:15,marginBottom:12,lineHeight:1.5}}>{err}</p>}
        <button className="btn-primary" style={{width:"100%",padding:"13px",opacity:busy?0.6:1}} disabled={busy} onClick={submit}>
          {busy ? "Working…" : (mode==="signup" ? "Create Account" : "Sign In")}
        </button>
        <p style={{fontFamily:"'Crimson Text',serif",fontSize:14,color:"var(--m3)",textAlign:"center",marginTop:12,lineHeight:1.55}}>
          Why sign in: so your reading log and settings follow you to every device. Your photos and location stay on this device. If you would rather not, you can continue without an account.
        </p>
      </div>
      {onSkip && (
        <div style={{textAlign:"center",marginTop:4}}>
          <button onClick={onSkip} style={{background:"transparent",border:"none",color:"var(--m2)",fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3,padding:8}}>
            Continue without an account
          </button>
        </div>
      )}
    </div>
  );
}

// ── Midnight Ministries footer (always visible) ──
function MMFooter({ onEggOpen, onHomeView }) {
  return (
    <div className="mm-shell">
     <div style={{
      background:"rgba(8,6,3,0.46)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
      borderTop:"1px solid rgba(255,255,255,0.05)",
      paddingTop:12, paddingBottom:"calc(56px + env(safe-area-inset-bottom))", marginBottom:"calc(-40px - env(safe-area-inset-bottom))",
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
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="var(--accent)" floodOpacity="0.45"/>
          </filter>
        </defs>
      </svg>
      <span onClick={()=>{ if(onHomeView) onEggOpen("mm"); }} style={{
        fontFamily:"'Cinzel',serif",
        fontSize:14,
        letterSpacing:"0.22em",
        textTransform:"uppercase",
        color:CROSS_RED,
        textShadow:"0 0 22px rgba(var(--accent-rgb),0.32), 0 0 55px rgba(var(--accent-rgb),0.14)",
        filter:"url(#chalk-mm)",
        paddingBottom:1,
        cursor:onHomeView?"pointer":"default",
        pointerEvents:"all"
      }}>
        MIDNIGHT MINISTRIES
      </span>
     </div>
    </div>
  );
}

// ── Export bottom sheet ──
// ── Six-box PIN input ──
function PinBoxes({ value, onChange, autoFocus }) {
  const refs = useRef([]);
  const set = (i, raw) => {
    const d = (raw || "").replace(/\D/g, "");
    if (d.length > 1) { const nv = d.slice(0, 6); onChange(nv); refs.current[Math.min(nv.length, 5)] && refs.current[Math.min(nv.length, 5)].focus(); return; }
    const arr = (value || "").padEnd(6, " ").split("");
    arr[i] = d || " ";
    const nv = arr.join("").replace(/ /g, "").slice(0, 6);
    onChange(nv);
    if (d && i < 5 && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  const onKey = (i, e) => { if (e.key === "Backspace" && !value[i] && i > 0 && refs.current[i - 1]) refs.current[i - 1].focus(); };
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={el => refs.current[i] = el} value={value[i] || ""} inputMode="numeric" maxLength={1}
          autoFocus={autoFocus && i === 0}
          onChange={e => set(i, e.target.value)} onKeyDown={e => onKey(i, e)}
          style={{ flex: 1, minWidth: 0, height: 54, textAlign: "center", background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontFamily: "'Crimson Text',serif", fontSize: 26, outline: "none" }} />
      ))}
    </div>
  );
}

// Custom slider: filled track follows the thumb exactly, thumb reaches both
// ends, fully smooth (no native range quirks).
function Slider({ value, min, max, step, onChange, onCommit, width=240 }) {
  const ref = useRef(null);
  const drag = useRef(false);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const setFromX = (clientX) => {
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    let p = (clientX - r.left) / r.width; p = Math.max(0, Math.min(1, p));
    let v = min + p * (max - min);
    if (step) v = Math.round(v / step) * step;
    onChange(Math.max(min, Math.min(max, v)));
  };
  const down = (e) => { e.stopPropagation(); drag.current = true; ref.current?.setPointerCapture?.(e.pointerId); setFromX(e.clientX); };
  const move = (e) => { if (drag.current) setFromX(e.clientX); };
  const up = (e) => { if(drag.current && onCommit) onCommit(); drag.current = false; ref.current?.releasePointerCapture?.(e.pointerId); };
  return (
    <div ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      style={{position:"relative",width,height:30,maxWidth:"82vw",touchAction:"none",cursor:"pointer",display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",left:0,right:0,height:5,borderRadius:3,background:"rgba(255,255,255,0.2)"}}/>
      <div style={{position:"absolute",left:0,width:`${pct*100}%`,height:5,borderRadius:3,background:"var(--accent)"}}/>
      <div style={{position:"absolute",left:`calc(${pct*100}% - 10px)`,width:20,height:20,borderRadius:"50%",background:"var(--accent)",border:"2px solid var(--bg)",boxShadow:"0 1px 3px rgba(0,0,0,0.35)"}}/>
    </div>
  );
}

// Good element positions per format, so switching 1:1 <-> 9:16 always lands
// the lettering and cross composed for that frame.
const DEFAULT_POS = {
  square: { cross:{xf:0.12,yf:0.11,size:0.085}, selah:{xf:0.5,yf:0.13,size:0.085}, body:{xf:0.5,yf:0.5,size:0.048}, mm:{xf:0.5,yf:0.93,size:0.028} },
  story:  { cross:{xf:0.13,yf:0.09,size:0.08},  selah:{xf:0.5,yf:0.115,size:0.08}, body:{xf:0.5,yf:0.47,size:0.046}, mm:{xf:0.5,yf:0.955,size:0.028} },
};

function ExportSheet({ session, onClose }) {
  const hasRV = !!(session.aiResult && session.aiResult.returnVerses && session.aiResult.returnVerses[0]);
  const hasPhoto = !!session.photoData;
  const [layout, setLayout] = useState(()=>{
    const L=defaultLayout(session, hasPhoto);
    const ap=L.aspect, dp=DEFAULT_POS[ap]||DEFAULT_POS.square, els={...L.els};
    Object.keys(dp).forEach(k=>{ if(els[k]) els[k]={...els[k], ...dp[k]}; });
    // legible defaults: red cross (matches Midnight Ministries), cream text.
    // Auto-contrast (below) flips the text to black on a light photo.
    if(els.cross) els.cross={...els.cross, color:"#b5302f"};
    ["selah","body"].forEach(k=>{ if(els[k]) els[k]={...els[k], color:"#ece0c6"}; });
    if(els.mm) els.mm={...els.mm, color:"#b5302f"};
    return { ...L, els, font:"serif", photo:{ show:!!hasPhoto, x:0.5, y:0.5, zoom:1 } };
  });
  const [sel, setSel] = useState(null);
  const [nat, setNat] = useState({ w:1, h:1 });
  const [shareFile, setShareFile] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [tool, setTool] = useState("color");   // active control for the selected element
  const [bgOpen, setBgOpen] = useState(true);   // background picker visible (when no photo)
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [stageDim, setStageDim] = useState(null);   // explicit px size so aspect never breaks on big screens
  const ptrs = useRef(new Map());
  const dragRef = useRef(null);
  const pinch = useRef(null);
  const tapRef = useRef(null);   // tap-to-cycle through overlapping elements

  const DIMS = { square:[1080,1080], story:[1080,1920] };
  const [W,H] = DIMS[layout.aspect] || DIMS.square;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const setEl=(k,p)=>setLayout(L=>({ ...L, els:{ ...L.els, [k]:{ ...L.els[k], ...p } } }));
  const setPhoto=(p)=>setLayout(L=>({ ...L, photo:{ ...L.photo, ...p } }));
  // remembers element positions per aspect so switching format keeps each one composed
  const posMem = useRef({
    square:{ els:{...DEFAULT_POS.square}, photo:{zoom:1,x:0.5,y:0.5} },
    story: { els:{...DEFAULT_POS.story},  photo:{zoom:1,x:0.5,y:0.5} },
  });
  function switchAspect(na){
    setLayout(L=>{
      if(L.aspect===na) return L;
      // remember this format's element positions AND photo zoom/position
      const cur={}; ["cross","selah","body","mm"].forEach(k=>{ const e=L.els[k]; if(e) cur[k]={xf:e.xf,yf:e.yf,size:e.size}; });
      posMem.current[L.aspect]={ els:cur, photo:{zoom:L.photo.zoom,x:L.photo.x,y:L.photo.y} };
      const mem=posMem.current[na]||{};
      const tEls=mem.els||DEFAULT_POS[na]; const els={...L.els};
      Object.keys(tEls).forEach(k=>{ if(els[k]) els[k]={...els[k], ...tEls[k]}; });
      const tPhoto=mem.photo||{zoom:1,x:0.5,y:0.5};
      return {...L, aspect:na, els, photo:{...L.photo, ...tPhoto}};
    });
  }

  // Size the stage to the LARGEST box with the right aspect ratio that fits the
  // screen — works on phones, all iPads, landscape, etc. (avoids the width:100% +
  // maxHeight aspect-break that mangled the editor on big devices). Recompute on
  // resize and whenever the format (W/H) changes.
  useEffect(()=>{
    const fit=()=>{ const c=containerRef.current; if(!c) return; const cw=c.clientWidth, ch=c.clientHeight, ar=W/H; let w=cw, h=cw/ar; if(h>ch){ h=ch; w=ch*ar; } setStageDim({w:Math.round(w),h:Math.round(h)}); };
    fit();
    window.addEventListener("resize",fit);
    window.visualViewport && window.visualViewport.addEventListener("resize",fit);
    return ()=>{ window.removeEventListener("resize",fit); window.visualViewport && window.visualViewport.removeEventListener("resize",fit); };
  },[W,H]);

  useEffect(()=>{ if(session.photoData){ const im=new Image(); im.onload=()=>{
    setNat({w:im.width,h:im.height});
    // auto-contrast: sample the photo; if it's light, flip the text to black so it reads
    try{
      const c=document.createElement("canvas"); c.width=24;c.height=24;
      const cx=c.getContext("2d"); cx.drawImage(im,0,0,24,24);
      const d=cx.getImageData(0,0,24,24).data; let s=0;
      for(let i=0;i<d.length;i+=4){ s += 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; }
      const lum = s/((d.length/4)*255);
      if(lum>0.5){ setLayout(L=>({...L, els:{...L.els, selah:{...L.els.selah,color:"#0e0c06"}, body:{...L.els.body,color:"#0e0c06"}}})); }
    }catch{}
  }; im.src=session.photoData; } },[]);
  useEffect(()=>{ let alive=true; const t=setTimeout(()=>{ composeCard(session, layout).then(b=>{ if(alive&&b) setShareFile(new File([b],"selah-session.png",{type:"image/png"})); }); },120); return ()=>{ alive=false; clearTimeout(t); }; },[layout]);

  const baseRatio=Math.max(W/nat.w,H/nat.h), z=layout.photo.zoom||1;
  const fitRatio=Math.min(W/nat.w,H/nat.h);
  const minZoom=fitRatio/baseRatio;   // zoom-out limit: photo just fits inside frame
  const bgWpct=(nat.w*baseRatio*z)/W*100, bgHpct=(nat.h*baseRatio*z)/H*100;
  const bgOpt=BG_OPTIONS.find(b=>b[0]===(layout.bg||"ink"))||BG_OPTIONS[0];
  const selectedBgLabel=bgOpt[1];
  const bgTop = layout.bgRev?bgOpt[3]:bgOpt[2], bgBot = layout.bgRev?bgOpt[2]:bgOpt[3];
  const bgEnd = mixHex(bgTop, bgBot, layout.bgFade==null?0.5:layout.bgFade);
  const stageBg = bgTop===bgEnd ? bgTop : `linear-gradient(180deg,${bgTop},${bgEnd})`;

  function stageDown(e){
    ptrs.current.set(e.pointerId,{x:e.clientX,y:e.clientY}); stageRef.current?.setPointerCapture?.(e.pointerId);
    if(layout.photo.show && hasPhoto){
      if(ptrs.current.size>=2){ const v=[...ptrs.current.values()]; pinch.current={ d:Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y), z:layout.photo.zoom||1 }; dragRef.current=null; }
      else dragRef.current={ type:"photo", sx:e.clientX, sy:e.clientY, ox:layout.photo.x, oy:layout.photo.y };
    }
    setSel(null);
  }
  function stageMove(e){
    if(ptrs.current.has(e.pointerId)) ptrs.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(tapRef.current && (Math.abs(e.clientX-tapRef.current.x)>5 || Math.abs(e.clientY-tapRef.current.y)>5)) tapRef.current.moved=true;
    const r=stageRef.current?.getBoundingClientRect(); if(!r) return;
    if(pinch.current && ptrs.current.size>=2){ const v=[...ptrs.current.values()]; const d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y); setPhoto({zoom:clamp(pinch.current.z*(d/pinch.current.d),minZoom,3)}); return; }
    const d=dragRef.current; if(!d) return;
    if(d.type==="photo"){ const slX=r.width*(bgWpct/100-1), slY=r.height*(bgHpct/100-1); let nx=layout.photo.x, ny=layout.photo.y; if(slX>1) nx=clamp(d.ox-(e.clientX-d.sx)/slX,0,1); if(slY>1) ny=clamp(d.oy-(e.clientY-d.sy)/slY,0,1); setPhoto({x:nx,y:ny}); }
    else if(d.type==="el"){ setEl(d.key,{ xf:clamp(d.ox+(e.clientX-d.sx)/r.width,0.02,0.98), yf:clamp(d.oy+(e.clientY-d.sy)/r.height,0.02,0.98) }); }
  }
  function stageUp(e){ ptrs.current.delete(e.pointerId); if(ptrs.current.size<2) pinch.current=null; if(ptrs.current.size===0) dragRef.current=null;
    const t=tapRef.current;
    if(t && !t.moved && !t.fresh && t.stack.length>1){ const i=t.stack.indexOf(t.chosen); setSel(t.stack[(i+1)%t.stack.length]); }
    if(ptrs.current.size===0) tapRef.current=null; }
  function overlapStack(x,y){ const seen=new Set(), out=[]; try{ document.elementsFromPoint(x,y).forEach(n=>{ const k=n.getAttribute&&n.getAttribute("data-elkey"); if(k&&!seen.has(k)){ seen.add(k); out.push(k); } }); }catch{} return out; }
  function elDown(e,key){ e.stopPropagation(); setTool("color"); setShareOpen(false);
    // Tap-to-cycle: a clean tap selects the top element; tapping the same spot again
    // steps to the next element underneath, so overlapping pieces are reachable
    // without having to drag the front one out of the way. Dragging still moves
    // whatever is currently selected.
    const stack=overlapStack(e.clientX,e.clientY); const list=stack.length?stack:[key];
    let chosen, fresh;
    if(sel && list.includes(sel)){ chosen=sel; fresh=false; } else { chosen=list[0]||key; fresh=true; }
    setSel(chosen);
    tapRef.current={ x:e.clientX, y:e.clientY, stack:list, chosen, fresh, moved:false };
    // Midnight Ministries is locked in place — selectable for color/size, not draggable.
    if(chosen==="mm") return;
    dragRef.current={ type:"el", key:chosen, sx:e.clientX, sy:e.clientY, ox:layout.els[chosen].xf, oy:layout.els[chosen].yf }; ptrs.current.set(e.pointerId,{x:e.clientX,y:e.clientY}); stageRef.current?.setPointerCapture?.(e.pointerId); }

  const FONT_ORDER=["serif","cinzel","crimson","sans"], FONT_LABEL={serif:"Serif",cinzel:"Cinzel",crimson:"Crimson",sans:"Sans"};
  const CONTENT_ORDER=[["session","Passage"],...(hasRV?[["return","Verse"]]:[]),["anchor","RMR"]];
  function cycleContent(){ const i=CONTENT_ORDER.findIndex(c=>c[0]===layout.content); const next=CONTENT_ORDER[(i+1)%CONTENT_ORDER.length][0]; let text=session.passage||""; if(next==="return"&&hasRV) text=session.aiResult.returnVerses[0].ref; else if(next==="anchor") text="Read. Mark. Return."; setLayout(L=>({ ...L, content:next, els:{ ...L.els, body:{ ...L.els.body, text } } })); }
  const contentLabel = (CONTENT_ORDER.find(c=>c[0]===layout.content)||CONTENT_ORDER[0])[1];

  function handleShareImage(){ if(!shareFile) return; try{ if(navigator.share && navigator.canShare?.({files:[shareFile]})) navigator.share({files:[shareFile],title:"SELAH",text:`${session.passage} — Selah by Midnight Ministries`}).catch(()=>{}); else { const u=URL.createObjectURL(shareFile); const a=document.createElement("a"); a.href=u; a.download="selah-session.png"; a.click(); URL.revokeObjectURL(u);} }catch{} }

  const elName={ cross:"Cross", selah:"SELAH", body:"Verse", mm:"Ministry" };
  const renderEl=(key)=>{ const el=layout.els[key]; if(!el.show) return null;
    const selected=sel===key;
    const gc=el.glowColor||"#0e0c06";
    // selection = a crisp gold outline ring (NOT a glow), so it never mixes with
    // the element's own glow color; offset so it doesn't hug the letters.
    const base={ position:"absolute", left:el.xf*100+"%", top:el.yf*100+"%", transform:`translate(-50%,-50%) rotate(${el.rot||0}deg)`, touchAction:"none", cursor:"grab", opacity:(el.opacity==null?1:el.opacity), outline:selected?"1.5px solid rgba(201,168,76,0.9)":"none", outlineOffset:"5px" };
    if(el.kind==="cross"){
      // Real cross glow: a blurred, glow-colored copy of the cross shape behind it.
      // (drop-shadow on a CSS-masked element doesn't render reliably across browsers.)
      const mask={ position:"absolute", inset:0, WebkitMaskImage:`url("${CROSS_SRC}")`, maskImage:`url("${CROSS_SRC}")`, WebkitMaskRepeat:"no-repeat", maskRepeat:"no-repeat", WebkitMaskSize:"contain", maskSize:"contain", WebkitMaskPosition:"center", maskPosition:"center" };
      return <div key={key} data-elkey={key} onPointerDown={e=>elDown(e,key)} style={{ ...base, width:el.size*100+"%", height:el.size*1.5*100+"%" }}>
        {el.glow ? <div style={{ ...mask, backgroundColor:gc, filter:`blur(${(el.glow*9).toFixed(1)}px)` }}/> : null}
        <div style={{ ...mask, backgroundColor:el.color }}/>
      </div>;
    }
    // text glow = text-shadow (true color, no drag trails).
    const ts = el.glow ? `0 0 ${(el.glow*7).toFixed(1)}px ${gc}, 0 0 ${(el.glow*14).toFixed(1)}px ${gc}` : "none";
    return <div key={key} data-elkey={key} onPointerDown={e=>elDown(e,key)} style={{ ...base, width:"86%", textAlign:"center", color:el.color, textShadow:ts, fontFamily:CARD_FONTS[layout.font], fontWeight:el.weight==="bold"?700:400, fontStyle:el.italic?"italic":"normal", fontSize:`calc(${el.size} * var(--stagew,320px))`, lineHeight:1.2, letterSpacing:key==="mm"?"0.16em":(key==="selah"?"0.08em":"0"), textTransform:key==="mm"?"uppercase":"none", whiteSpace:key==="selah"?"nowrap":"normal" }}>{el.text}</div>;
  };
  const selEl = sel ? layout.els[sel] : null;
  // Derive three distinct shades from the active palette accent so the circles
  // read as border (dark) / fill (barely visible) / letters (light) instead of
  // one flat color — works even on single-hue palettes like the pinks.
  const accentHex = ((typeof document!=="undefined" && getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())||"#c9a84c");
  const circBorder = mixHex(accentHex, "#0e0c06", 0.62);   // clearly darker shade for the outline
  const circText   = mixHex(accentHex, "#ffffff", 0.34);   // clearly lighter shade for the letters
  const circle = (extra)=>({ width:52,height:52,borderRadius:"50%",background:"rgba(14,10,6,0.22)",border:"1.5px solid "+circBorder,boxShadow:"0 1px 6px rgba(0,0,0,0.45)",textShadow:"0 1px 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:circText,fontWeight:700,...extra });

  return (
    <div ref={containerRef} style={{position:"fixed",inset:0,zIndex:400,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",touchAction:"none"}}>
      {/* stage sized to fit any screen while keeping its true aspect ratio */}
      <div ref={stageRef}
        onPointerDown={stageDown} onPointerMove={stageMove} onPointerUp={stageUp} onPointerCancel={stageUp}
        style={{position:"relative",width:(stageDim?stageDim.w:0)+"px",height:(stageDim?stageDim.h:0)+"px","--stagew":(stageDim?stageDim.w:320)+"px",overflow:"hidden",background:stageBg,touchAction:"none",userSelect:"none"}}>
        {layout.photo.show && hasPhoto
          && <div style={{position:"absolute",inset:0,backgroundImage:`url(${session.photoData})`,backgroundRepeat:"no-repeat",backgroundSize:`${bgWpct}% ${bgHpct}%`,backgroundPosition:`${layout.photo.x*100}% ${layout.photo.y*100}%`}}/>}
        {layout.photo.show && hasPhoto && <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(180deg,rgba(10,8,4,0.5),rgba(10,8,4,0.22),rgba(10,8,4,0.62))"}}/>}
        {["cross","selah","body","mm"].map(renderEl)}
      </div>

      {/* TOP-LEFT: close X (glow, no circle) */}
      <button onClick={onClose} aria-label="Close" style={{position:"absolute",top:"calc(env(safe-area-inset-top,0px) + 6px)",left:18,background:"transparent",border:"none",cursor:"pointer",fontSize:52,lineHeight:1,color:"var(--accent)",textShadow:"0 0 14px rgba(var(--accent-rgb),0.85), 0 0 4px rgba(0,0,0,0.8)",padding:0,fontWeight:300,zIndex:4}}>×</button>

      {/* TOP-RIGHT stack: Share, Verse/content, Font, Hide Photo, Format */}
      <div style={{position:"absolute",top:"calc(env(safe-area-inset-top,0px) + 8px)",right:14,display:"flex",flexDirection:"column",gap:9,alignItems:"center",zIndex:4}}>
        <button onClick={()=>setShareOpen(o=>!o)} style={circle({background:"rgba(var(--accent-rgb),0.5)",border:"1.5px solid "+circBorder,color:"var(--ink)",textShadow:"none"})}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><polyline points="8 7 12 3 16 7"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </button>
        <button onClick={cycleContent} style={circle({fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.04em",lineHeight:1.1,textAlign:"center",padding:4})}>{contentLabel}</button>
        <button onClick={()=>setLayout(L=>({...L,font:FONT_ORDER[(FONT_ORDER.indexOf(L.font)+1)%FONT_ORDER.length]}))} style={circle({fontFamily:CARD_FONTS[layout.font],fontSize:18})}>Aa</button>
        {hasPhoto && <button onClick={()=>setPhoto({show:!layout.photo.show})} style={circle({fontFamily:"'Cinzel',serif",fontSize:7,letterSpacing:"0.03em",textAlign:"center",lineHeight:1.1,padding:3})}>{layout.photo.show?"Hide Photo":"Show Photo"}</button>}
        <button onClick={()=>switchAspect(layout.aspect==="square"?"story":"square")} style={circle({fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"0.04em"})}>{layout.aspect==="square"?"1:1":"9:16"}</button>
      </div>

      {/* Share menu — centered so it's visible in any format */}
      {shareOpen && (
        <div onPointerDown={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(env(safe-area-inset-top,0px) + 70px)",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",gap:8,width:240,maxWidth:"86vw",background:"rgba(14,10,6,0.92)",border:"1px solid var(--border)",borderRadius:12,padding:12,boxShadow:"0 6px 24px rgba(0,0,0,0.6)",zIndex:5}}>
          <button onClick={()=>{ handleShareImage(); }} disabled={!shareFile} className="btn-primary" style={{padding:"12px",opacity:shareFile?1:0.5}}>Share Image</button>
          <button onClick={()=>{ shareAsNote(session); }} className="btn-ghost" style={{padding:"11px"}}>Save text to Notes / Files</button>
        </div>
      )}

      {/* SELECTED ELEMENT — floating bubbles at the very bottom, no box */}
      {selEl && (
        <div onPointerDown={e=>e.stopPropagation()} style={{position:"absolute",left:0,right:0,bottom:"calc(env(safe-area-inset-bottom,0px) + 54px)",display:"flex",flexDirection:"column",alignItems:"center",gap:10,zIndex:4}}>
          <div style={{maxWidth:"94%",display:"flex",justifyContent:"center"}}>
            {tool==="color" && (
              <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
                {CARD_COLORS.map(([hex,lbl])=>(<button key={hex} title={lbl} onClick={()=>setEl(sel,{color:hex})} style={{width:30,height:30,borderRadius:"50%",background:hex,border:selEl.color===hex?"2px solid #fff":"1px solid rgba(255,255,255,0.4)",boxShadow:"0 1px 6px rgba(0,0,0,0.6)",cursor:"pointer",padding:0}}/>))}
              </div>
            )}
            {tool==="glow" && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:9,justifyContent:"center"}}>
                  {[["#0e0c06","Dark"],...CARD_COLORS.slice(0,7)].map(([hex,lbl])=>(<button key={hex} title={lbl} onClick={()=>setEl(sel,{glowColor:hex})} style={{width:26,height:26,borderRadius:"50%",background:hex,border:(selEl.glowColor||"#0e0c06")===hex?"2px solid #fff":"1px solid rgba(255,255,255,0.4)",boxShadow:"0 1px 6px rgba(0,0,0,0.6)",cursor:"pointer",padding:0}}/>))}
                </div>
                <Slider value={selEl.glow||0} min={0} max={1} step={0.02} onChange={v=>setEl(sel,{glow:v})} width={210}/>
              </div>
            )}
            {tool==="size" && <Slider value={selEl.size} min={0.02} max={0.16} step={0.002} onChange={v=>setEl(sel,{size:v})}/>}
            {tool==="rotate" && <Slider value={selEl.rot||0} min={-45} max={45} step={1} onChange={v=>setEl(sel,{rot:v})}/>}
            {tool==="opacity" && <Slider value={selEl.opacity==null?1:selEl.opacity} min={0.1} max={1} step={0.02} onChange={v=>setEl(sel,{opacity:v})}/>}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",background:"rgba(14,10,6,0.72)",borderRadius:24,padding:"6px 8px"}}>
            {[["color","Color"],["size","Size"],["rotate","Turn"],["opacity","Fade"],["glow","Glow"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setTool(id)} style={{borderRadius:16,padding:"7px 11px",background:tool===id?"var(--accent)":"transparent",color:tool===id?"var(--ink)":"var(--accent)",border:"none",fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",cursor:"pointer"}}>{lbl}</button>
            ))}
            <button onClick={()=>{ setEl(sel,{show:false}); setSel(null); }} style={{borderRadius:16,padding:"7px 11px",background:"transparent",color:"var(--text2)",border:"none",fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",cursor:"pointer"}}>Hide</button>
          </div>
        </div>
      )}

      {/* restore hidden pieces (when nothing selected) */}
      {!selEl && Object.keys(layout.els).some(k=>!layout.els[k].show) && (
        <div style={{position:"absolute",left:14,right:14,bottom:"calc(env(safe-area-inset-bottom,0px) + 14px)",display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",zIndex:4}}>
          {Object.keys(layout.els).filter(k=>!layout.els[k].show).map(k=>(<button key={k} onClick={()=>{ setEl(k,{show:true}); setSel(k); setTool("color"); }} style={{background:"rgba(14,10,6,0.95)",backdropFilter:"blur(4px)",border:"1px solid rgba(201,168,76,0.65)",boxShadow:"0 2px 10px rgba(0,0,0,0.45)",borderRadius:20,padding:"9px 16px",color:"var(--accent)",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.06em",cursor:"pointer"}}>+ {elName[k]}</button>))}
        </div>
      )}

      {/* background picker (when no photo showing and nothing selected) — no box, floating */}
      {!selEl && (!hasPhoto || !layout.photo.show) && (bgOpen ? (
        <div onPointerDown={e=>e.stopPropagation()} style={{position:"absolute",left:10,right:10,bottom:"calc(env(safe-area-inset-bottom,0px) + 64px)",display:"flex",flexDirection:"column",gap:9,alignItems:"center",zIndex:4}}>
          {/* name + Done, centered above the colors */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",textShadow:"0 1px 4px rgba(0,0,0,0.95)"}}>Background · {selectedBgLabel}</span>
            <button onClick={()=>setBgOpen(false)} style={{borderRadius:14,padding:"5px 13px",background:"rgba(var(--accent-rgb),0.85)",color:"var(--ink)",border:"none",fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",cursor:"pointer"}}>Done</button>
          </div>
          {/* horizontal scroll wheel of swatches — one row, swipe through them */}
          <div className="no-sb" style={{display:"flex",flexWrap:"nowrap",gap:11,overflowX:"auto",width:"100%",padding:"3px 6px 6px",scrollSnapType:"x proximity",WebkitOverflowScrolling:"touch",touchAction:"pan-x"}}>
            {BG_OPTIONS.map(([id,lbl,top,bot])=>{ const t=layout.bgRev?bot:top, b=layout.bgRev?top:bot; const on=(layout.bg||"ink")===id; return (
              <button key={id} title={lbl} onClick={()=>setLayout(L=>({...L,bg:id}))} style={{flex:"0 0 auto",width:44,height:44,borderRadius:"50%",background:t===b?t:`linear-gradient(180deg,${t},${b})`,border:on?"3px solid #fff":"1.5px solid rgba(255,255,255,0.7)",boxShadow:on?"0 0 12px rgba(var(--accent-rgb),0.85)":"0 1px 6px rgba(0,0,0,0.7)",cursor:"pointer",padding:0,scrollSnapAlign:"center"}}/>
            ); })}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:700,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",textShadow:"0 1px 4px rgba(0,0,0,0.95)"}}>Fade</span>
            <Slider value={layout.bgFade==null?0.5:layout.bgFade} min={0} max={1} step={0.02} onChange={v=>setLayout(L=>({...L,bgFade:v}))} width={150}/>
            <button onClick={()=>setLayout(L=>({...L,bgRev:!L.bgRev}))} style={{borderRadius:14,padding:"6px 11px",background:layout.bgRev?"var(--accent)":"transparent",color:layout.bgRev?"var(--ink)":"var(--accent)",border:"1px solid var(--accent2)",fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",cursor:"pointer"}}>Flip</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setBgOpen(true)} style={{position:"absolute",right:16,bottom:"calc(env(safe-area-inset-bottom,0px) + 16px)",background:"rgba(14,10,6,0.55)",border:"1.5px solid "+circBorder,borderRadius:18,padding:"9px 16px",color:circText,fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",textShadow:"0 1px 4px rgba(0,0,0,0.95)",cursor:"pointer",zIndex:4}}>Background</button>
      ))}
    </div>
  );
}

// ── Depth level system ───────────────────────────────────────────────────
function getDepthLevel(sessions, isKid=false) {
  const n = sessions.length;
  if (isKid) {
    if (n >= 151) return { level:5, name:"Wildfire", note:"This kid has spent a lot of time in the Word. Use bigger ideas but still in kid words. Ask them to connect the story to their own life and to other stories they know. Still explain hard words. Strong, not babyish." };
    if (n >= 61)  return { level:4, name:"Torch",    note:"Growing strong. Ask what the people in the story learned and why it matters. Add one question that makes them think, not just remember. Short and clear." };
    if (n >= 21)  return { level:3, name:"Flame",    note:"Getting it. Mix in a little 'why did this happen' with 'what happened.' Keep words simple and concrete. One real challenge question." };
    if (n >= 6)   return { level:2, name:"Ember",    note:"Starting to grow. Ask what happened and who was there, plus one easy 'how would you feel' or 'what would you do' question." };
    return          { level:1, name:"Spark",    note:"Brand new. Ask only simple 'what happened' and 'who is in the story' questions. Explain every word. Keep it short, clear, and exciting." };
  }
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
function AnswerInput({ value, onChange, feedback, onTouch }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || "");

  function done() { onChange(draft); setOpen(false); }
  function cancel() { setDraft(value||""); setOpen(false); }

  return (
    <div>
      {!open && (
        <div onClick={()=>{ setDraft(value||""); setOpen(true); }} style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:6,
          padding:"10px 14px",cursor:"pointer",transition:"border-color 0.2s",marginTop:10
        }}
          onMouseOver={e=>e.currentTarget.style.borderColor="var(--accent)"}
          onMouseOut={e=>e.currentTarget.style.borderColor="var(--border2)"}>
          <p style={{
            fontFamily:value?"'Crimson Text',serif":"'Cinzel',serif",
            fontSize:value?15:10,color:value?"var(--m1b)":"var(--m5)",
            letterSpacing:value?"0":"0.1em",textTransform:value?"none":"uppercase",
            fontStyle:value?"italic":"normal",
            flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"
          }}>
            {value||"Write your answer"}
          </p>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--m4)" strokeWidth="2" style={{marginLeft:10,flexShrink:0}}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
      )}

      {open && (
        <div style={{marginTop:10,background:"var(--surface)",border:"1px solid var(--accent)",borderRadius:6,overflow:"hidden"}}>
          <textarea
            autoFocus
            rows={5}
            value={draft}
            onFocus={()=>{ if(onTouch) onTouch(); }}
            onChange={e=>{ if(onTouch) onTouch(); setDraft(e.target.value); }}
            placeholder="Write your answer here..."
            style={{
              width:"100%",background:"var(--surface)",border:"none",
              color:"var(--text4)",fontFamily:"'Crimson Text',Georgia,serif",
              fontSize:16,lineHeight:1.65,padding:"12px 14px",
              resize:"none",outline:"none",display:"block"
            }}
          />
          <div style={{display:"flex",borderTop:"1px solid var(--border)",padding:"8px 12px",justifyContent:"flex-end",gap:8}}>
            <button onClick={cancel} style={{background:"transparent",border:"1px solid var(--border2)",borderRadius:4,padding:"6px 14px",fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Cancel</button>
            <button onClick={done} style={{background:"rgba(var(--accent-rgb),0.12)",border:"1px solid rgba(var(--accent-rgb),0.4)",borderRadius:4,padding:"6px 16px",fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Done</button>
          </div>
        </div>
      )}

      {feedback && !open && (
        <div style={{marginTop:8,background:"rgba(var(--accent-rgb),0.04)",border:"1px solid rgba(var(--accent-rgb),0.12)",borderRadius:5,padding:"10px 14px"}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>Response</p>
          <p style={{fontSize:15,lineHeight:1.65,color:"var(--m1b)"}}>{feedback}</p>
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
    <div style={{display:"flex",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,overflow:"hidden",marginBottom:18}}>
      {stats.map(([l,v],i)=>(
        <div key={l} style={{flex:1,padding:"12px 8px",textAlign:"center",borderRight:i<stats.length-1?"1px solid var(--border)":"none"}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:16,color:"var(--accent)",fontWeight:600}}>{v}</p>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:3}}>{l}</p>
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

// Rotating content for the log photo lightbox — varies each time it opens.
function pickReadingItem(s) {
  const pool = [];
  if (s.personalNotes) pool.push({ label: "From This Reading", text: s.personalNotes });
  (s.aiResult?.returnVerses || []).forEach(v => { if (v?.reason) pool.push({ label: "Come Back To — " + (v.ref||""), text: v.reason }); });
  (s.aiResult?.questions || []).forEach((q, i) => { const a = s.questionAnswers?.[i]; if (q) pool.push({ label: "A Question", text: a ? q + "  —  " + a : q }); });
  if (s.aiResult?.summary) pool.push({ label: "In One Sentence", text: s.aiResult.summary });
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

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
      <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:"12px 12px 0 0",padding:"22px 20px 36px",width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:3,background:"var(--m5)",borderRadius:2,margin:"0 auto 18px"}}/>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m2)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>
          {dayNames[date.getDay()]}
        </p>
        <p style={{fontFamily:"'Crimson Text',serif",fontSize:22,color:"var(--accent)",marginBottom:16}}>
          {months[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
        </p>

        {(() => {
          const vKey = date.toISOString().slice(0,10) + Math.floor(Date.now()/500).toString();
          const verse = isPast ? pickVerse(VERSES_PAST, vKey) : isToday ? pickVerse(VERSES_TODAY, vKey) : pickVerse(VERSES_FUTURE, vKey);
          return session ? (
            <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:7,padding:"14px 16px",cursor:"pointer",marginBottom:14}}
              onClick={()=>{ onSessionClick(session.id); onClose(); }}>
              <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--accent)",marginBottom:6}}>{session.passage}</p>
              <div style={{display:"flex",gap:12,alignItems:"center",color:"var(--m4)",fontSize:12}}>
                <span style={{display:"flex",alignItems:"center",gap:3}}><ClockIcon/>{formatTime(session.startTime)}</span>
                <span>{elapsed(session.startTime,session.endTime)}</span>
                {session.locationType && <span>{session.locationType}</span>}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m5)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:8}}>Tap to open session</p>
            </div>
          ) : (
            <div style={{padding:"4px 0 20px",borderBottom:"1px solid var(--border)",marginBottom:16}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--border2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>No Session Logged</p>
              {isToday && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>His Word is still here. Today can still be the day.</p>}
              {isPast && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m4)",lineHeight:1.6,marginBottom:14}}>His Word was here. He was not absent.</p>}
              {isFuture && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>His Word will be here. So will He.</p>}
              <div style={{borderLeft:"2px solid var(--border2)",paddingLeft:14}}>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:16,color:"var(--m2)",lineHeight:1.65,fontStyle:"italic",marginBottom:6}}>"{verse.text}"</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m4)",letterSpacing:"0.1em"}}>{verse.ref}</p>
              </div>
            </div>
          );
        })()}

        {/* Alarm section — available on future and today */}
        {(isFuture || isToday) && (
          <div>
            {existingAlarm && !showAlarm ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(var(--accent-rgb),0.06)",border:"1px solid rgba(var(--accent-rgb),0.15)",borderRadius:6,padding:"10px 14px",marginBottom:10}}>
                <div>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Alarm Set</p>
                  <p style={{fontFamily:"'Crimson Text',serif",fontSize:15,color:"var(--m1)"}}>{existingAlarm.time} — {existingAlarm.repeat}</p>
                </div>
                <button onClick={()=>setShowAlarm(true)} style={{background:"transparent",border:"1px solid var(--border2)",borderRadius:4,padding:"5px 10px",fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m2)",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>Edit</button>
              </div>
            ) : !showAlarm ? (
              <button onClick={()=>setShowAlarm(true)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"transparent",border:"1px solid var(--border2)",borderRadius:6,padding:"12px",marginBottom:10,fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m2)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s"}}
                onMouseOver={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)";}}
                onMouseOut={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--m2)";}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Set a Reminder
              </button>
            ) : null}

            {showAlarm && (
              <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:7,padding:"16px",marginBottom:10}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--accent)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Set Reminder</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m4)",marginBottom:14,lineHeight:1.5}}>
                  Life does not stop for reading time. A reminder holds the slot when a game, a meeting, or a mission tries to take it.
                </p>
                <label style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Time</label>
                <input type="time" value={alarmTime} onChange={e=>setAlarmTime(e.target.value)}
                  style={{marginBottom:14,fontFamily:"'Crimson Text',serif",fontSize:16}}/>
                <label style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:8}}>Repeat</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                  {REPEAT_OPTS.map(([val,label])=>(
                    <button key={val} onClick={()=>setRepeatMode(val)}
                      style={{background:repeatMode===val?"rgba(var(--accent-rgb),0.12)":"transparent",border:`1px solid ${repeatMode===val?"var(--accent)":"var(--border2)"}`,borderRadius:4,padding:"5px 10px",fontFamily:"'Cinzel',serif",fontSize:9,color:repeatMode===val?"var(--accent)":"var(--m4)",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s"}}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveAlarm} style={{flex:1,background:"linear-gradient(135deg,var(--accent),var(--accent2))",color:"var(--ink)",border:"none",borderRadius:5,padding:"11px",fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Save</button>
                  <button onClick={()=>setShowAlarm(false)} style={{flex:1,background:"transparent",border:"1px solid var(--border2)",borderRadius:5,padding:"11px",fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Cancel</button>
                </div>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--border2)",letterSpacing:"0.08em",textAlign:"center",marginTop:10,lineHeight:1.6,textTransform:"uppercase"}}>
                  Native app delivers true background alarms. Web version fires when the app is open.
                </p>
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} style={{width:"100%",marginTop:6,padding:"11px",background:"transparent",border:"1px solid var(--border2)",borderRadius:6,fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Close</button>
      </div>
    </div>
  );
}

// ── Empty-day panel for the log (rotating verse + reminder) ──────────────
function EmptyDayPanel({ date, alarms, onSaveAlarm, suppressPast }) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  const isToday = d.getTime() === now.getTime();
  const isPast = d.getTime() < now.getTime();
  const isFuture = d.getTime() > now.getTime();
  const dayKey = d.toISOString().slice(0,10);
  const existingAlarm = alarms?.[dayKey];

  const REPEAT_OPTS = [
    ["daily","Every Day"],["weekdays","Weekdays"],["weekends","Weekends"],
    ["sun","Sun"],["mon","Mon"],["tue","Tue"],["wed","Wed"],["thu","Thu"],["fri","Fri"],["sat","Sat"]
  ];
  const [showAlarm, setShowAlarm] = useState(false);
  const [alarmTime, setAlarmTime] = useState("06:00");
  const [repeatMode, setRepeatMode] = useState("daily");

  function doSave() { onSaveAlarm(dayKey, { time: alarmTime, repeat: repeatMode }); setShowAlarm(false); }
  function saveAlarm() {
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().finally(doSave);
      } else { doSave(); }
    } catch { doSave(); }
  }

  const verse = pickVerse(isPast ? VERSES_PAST : isToday ? VERSES_TODAY : VERSES_FUTURE, dayKey);

  // For a brand-new reader (no sessions yet), don't hit them with conviction
  // for past days they couldn't have used the app. Stay quiet on past days.
  if (isPast && suppressPast) {
    return (
      <div style={{padding:"18px 16px"}}>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--border2)",letterSpacing:"0.12em",textTransform:"uppercase"}}>No Session On This Day</p>
      </div>
    );
  }

  return (
    <div style={{padding:"18px 16px"}}>
      <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--border2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>No Session Logged</p>
      {isToday && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>His Word is still here. Today can still be the day.</p>}
      {isPast && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m4)",lineHeight:1.6,marginBottom:14}}>His Word was here. He was not absent.</p>}
      {isFuture && <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>His Word will be here. So will He.</p>}
      <div style={{borderLeft:"2px solid var(--border2)",paddingLeft:14,marginBottom:(isFuture||isToday)?16:0}}>
        <p style={{fontFamily:"'Crimson Text',serif",fontSize:16,color:"var(--m2)",lineHeight:1.65,fontStyle:"italic",marginBottom:6}}>"{verse.text}"</p>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m4)",letterSpacing:"0.1em"}}>{verse.ref}</p>
      </div>

      {(isFuture || isToday) && (
        <div>
          {existingAlarm && !showAlarm ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(var(--accent-rgb),0.06)",border:"1px solid rgba(var(--accent-rgb),0.15)",borderRadius:6,padding:"10px 14px"}}>
              <div>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Reminder Set</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:15,color:"var(--m1)"}}>{existingAlarm.time} — {existingAlarm.repeat}</p>
              </div>
              <button onClick={()=>setShowAlarm(true)} style={{background:"transparent",border:"1px solid var(--border2)",borderRadius:4,padding:"5px 10px",fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m2)",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>Edit</button>
            </div>
          ) : !showAlarm ? (
            <button onClick={()=>setShowAlarm(true)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"transparent",border:"1px solid var(--border2)",borderRadius:6,padding:"12px",fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m2)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Set a Reminder
            </button>
          ) : null}

          {showAlarm && (
            <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:7,padding:"16px"}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--accent)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Set Reminder</p>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m4)",marginBottom:14,lineHeight:1.5}}>Life does not stop for reading time. A reminder holds the slot when a game, a meeting, or a mission tries to take it.</p>
              <label style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Time</label>
              <input type="time" value={alarmTime} onChange={e=>setAlarmTime(e.target.value)} style={{marginBottom:14,fontFamily:"'Crimson Text',serif",fontSize:16}}/>
              <label style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:8}}>Repeat</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                {REPEAT_OPTS.map(([val,label])=>(
                  <button key={val} onClick={()=>setRepeatMode(val)} style={{background:repeatMode===val?"rgba(var(--accent-rgb),0.12)":"transparent",border:`1px solid ${repeatMode===val?"var(--accent)":"var(--border2)"}`,borderRadius:4,padding:"5px 10px",fontFamily:"'Cinzel',serif",fontSize:9,color:repeatMode===val?"var(--accent)":"var(--m4)",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>{label}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveAlarm} style={{flex:1,background:"linear-gradient(135deg,var(--accent),var(--accent2))",color:"var(--ink)",border:"none",borderRadius:5,padding:"11px",fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Save</button>
                <button onClick={()=>setShowAlarm(false)} style={{flex:1,background:"transparent",border:"1px solid var(--border2)",borderRadius:5,padding:"11px",fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Cancel</button>
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--border2)",letterSpacing:"0.08em",textAlign:"center",marginTop:10,lineHeight:1.6,textTransform:"uppercase"}}>Native app delivers true background alarms. Web version fires when the app is open.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionCalendar({ sessions, onDaySelect, alarms, onSaveAlarm, onFilterChange, activeDate }) {
  const now = new Date();
  const [calView, setCalView] = useState("month");
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  useEffect(() => {
    if (activeDate) setSelectedDate(activeDate);
  }, [activeDate ? activeDate.getTime() : 0]);
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
    const bg = isSelected ? "rgba(var(--accent-rgb),0.05)" : isToday && !todayDimmed ? "rgba(var(--accent-rgb),0.08)" : "transparent";
    const border = isSelected ? "1px solid rgba(var(--accent-rgb),0.85)" : isToday && todayDimmed ? "1px solid rgba(var(--accent-rgb),0.12)" : isToday ? "1px solid rgba(var(--accent-rgb),0.2)" : "1px solid transparent";
    const numColor = isSelected ? "var(--accent)" : hasSession ? "var(--accent)" : isToday ? "var(--m2)" : "var(--m5)";
    return (
      <div onClick={()=>handleDayClick(date)}
        style={{textAlign:"center",padding:"6px 2px",borderRadius:4,position:"relative",cursor:"pointer",
          background:bg, border:border, transition:"all 0.2s"}}
        onMouseOver={e=>{ if(!isSelected&&!isToday) e.currentTarget.style.background="rgba(var(--accent-rgb),0.05)"; }}
        onMouseOut={e=>{ if(!isSelected&&!isToday) e.currentTarget.style.background="transparent"; }}>
        {label && <div style={{fontFamily:"'Cinzel',serif",fontSize:7,color:"var(--m5)",letterSpacing:"0.06em",marginBottom:1}}>{label}</div>}
        <span style={{fontFamily:"'Crimson Text',serif",fontSize:14,color:numColor}}>{date.getDate()}</span>
        {hasSession && <div style={{width:4,height:4,borderRadius:2,background:"var(--accent)",margin:"2px auto 0",opacity:isSelected?1:0.9}}/>}
      </div>
    );
  }

  const NavBtn = ({onClick,children}) => (
    <button onClick={onClick} style={{background:"transparent",border:"none",color:"var(--m2)",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:18,padding:"0 10px",lineHeight:1,transition:"color 0.2s"}}
      onMouseOver={e=>e.currentTarget.style.color="var(--accent)"}
      onMouseOut={e=>e.currentTarget.style.color="var(--m2)"}>{children}</button>
  );
  const ToggleBtn = ({active,onClick,children}) => (
    <button onClick={onClick} style={{background:active?"rgba(var(--accent-rgb),0.12)":"transparent",border:`1px solid ${active?"var(--accent)":"var(--border2)"}`,borderRadius:4,padding:"4px 12px",fontFamily:"'Cinzel',serif",fontSize:9,color:active?"var(--accent)":"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s"}}>{children}</button>
  );

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  return (
    <>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"14px 12px",marginBottom:selectedDate?8:18}}>
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
                <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--accent)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{monthName} {calYear}</p>
                <NavBtn onClick={()=>{ if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1); }}>›</NavBtn>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
                {["S","M","T","W","T","F","S"].map((d,i)=>(
                  <div key={i} style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m5)",letterSpacing:"0.06em",paddingBottom:3}}>{d}</div>
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
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{wkLabel}</p>
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
function AboutScreen({ onBack, onFaith }) {
  const [tab, setTab] = useState("ministry");
  const P = ({children, mb=14}) => (
    <p style={{fontSize:17,lineHeight:1.78,color:"var(--m1b)",marginBottom:mb}}>{withSelah(children)}</p>
  );
  const Section = ({label, children}) => (
    <div className="card">
      <p className="label">{label}</p>
      {children}
    </div>
  );

  return (
    <div className="fade-in">
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"var(--m2)",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:6,padding:0}}>
        ← Back
      </button>
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:20}}>
        <button className={`nav-tab ${tab==="ministry"?"active":""}`} onClick={()=>setTab("ministry")} style={{fontSize:"9px"}}>Midnight Ministries</button>
        <button className={`nav-tab ${tab==="howto"?"active":""}`} onClick={()=>setTab("howto")} style={{fontSize:"9px"}}>How to Use</button>
      </div>

      {tab === "ministry" && (
        <div>
          <div className="card" style={{textAlign:"center",paddingTop:24,paddingBottom:24}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><CrossIcon size={36}/></div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,letterSpacing:"0.1em",color:"var(--text)",textShadow:"0 1px 10px rgba(142,28,28,0.5), 0 0 2px rgba(142,28,28,0.65)",marginBottom:6}}>MIDNIGHT MINISTRIES</h2>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m3)"}}>For all who read in the dark</p>
          </div>

          <Section label="What SELAH Is">
            <P>SELAH is not a business. It is a tool, the first one Midnight Ministries has put into your hands, built for a purpose inside the ministry. Midnight Ministries is the work. SELAH is one thing the work produced.</P>
            <P>It is a companion to your Bible. It does not replace it. Nothing should. Your Bible stays open beside it; SELAH holds the practice around it, the pause, the questions, the notes, the return.</P>
            <P mb={0}>It will live everywhere you do: phone, tablet, and computer, as an app and on the web. There is no excuse not to have it. Read. Mark. Return.</P>
          </Section>

          <Section label="Why This Exists">
            <P>Midnight Ministries was not built in a boardroom. It was built in the forge. Out of a season where the only anchor was His Word and the only company was God, a decision was made to stop waiting for permission to build what the people around us actually needed.</P>
            <P>Most people do not lack access to Scripture. They lack a practice. They open the Bible, read a few verses, close it, and carry nothing out. The knowledge sits on the page. The forge stays cold.</P>
            <P mb={0}>SELAH was built to fix that. Not by making Bible reading easier. By making it stick. The pause, the questions, the notes, the return verses are not features we hope will land. This is how serious readers have always engaged His Word. We built the tool to help you hold it.</P>
          </Section>

          <Section label="The Name">
            <P>Selah appears 71 times in the Psalms and 3 times in Habakkuk, 74 occurrences in total. Scholars still debate its exact meaning. The most honest translation sits somewhere between pause and lift up. Both are true. You stop. You sit in what you just read. Then you carry it higher than where you found it.</P>
            <P>Why would a ministry built on the Psalms lean so hard on a man who never wrote one? Midnight Ministries holds the apostle Paul close. Not for his story. Not because he may be the most influential writer this world has seen. We hold him close for who handed it to him. He carried two names his whole life, Saul among the Hebrews and Paul among the Greeks. What changed on the road to Damascus was not the name but the man: the persecutor undone by Christ and remade, carrying out something that was never his own.</P>
            <P>Paul quotes the Psalms again and again throughout his letters. Selah does not appear in them; Paul wrote in Greek to Greek-speaking churches, and Selah is a Hebrew term rooted in the Psalter and temple worship. Yet the posture Selah names, the pause, the weight of the text, the return, all of it is present in everything Paul writes.</P>
            <P mb={0}>Paul also made clear, as did Jesus in Matthew 7:21-23 and Paul himself in Ephesians 2:8-9, that works in Christ alone do not produce salvation. Faith does. Not performance. Not religious habit. Not how often you open the app. What you do with what you read when no one is watching. That is the practice SELAH was built to support.</P>
          </Section>

          <Section label="The Foundation">
            <P>God is Spirit. This is what John gives us in chapter 4, verse 24, and no word we own can hold Him. He spoke the heavens and the earth into being and hung the stars by His voice alone; we see this in Genesis 1. No man can see His face and live. Moses was hidden in the rock and shown only His back, as told in Exodus 33:20-23. How do you define the One who defines everything?</P>
            <P>He reveals Himself as Father, and that is the name we keep. Yet in the original Hebrew the word for Spirit, Ruach, is grammatically feminine; the verbs and modifiers the Scriptures attach to it are feminine, and He sets that Spirit inside every one of us. It is why He calls us His bride, as Paul tells us in Ephesians 5. Father, Son, and Spirit: three and one, not bound to time, space, or matter.</P>
            <P>Then the Son came in the flesh, born of a virgin, fully man and fully God, the last Adam, to finish what the first Adam did not and to cleanse us by His blood, as Paul tells us more than once, in Romans 5 and Ephesians 1. Not by accident. With purpose, in a set direction. Moses could not look at His face; we are given Christ to look upon, as John tells us in chapter 14 and Paul in Colossians 1.</P>
            <P>We are made to be masters of His Word and novices in the mystery, and to rest there. What we cannot define, we trust, and that trust becomes <span onClick={(e)=>{ e.stopPropagation(); onFaith && onFaith(); }} role="button" tabIndex={0} style={{color:CROSS_RED,cursor:"pointer",textShadow:"0 0 8px rgba(160,40,40,0.5), 0 1px 2px rgba(0,0,0,0.9)"}}>faith</span>, and through faith we will find relationship. That is the foundation.</P>
            <P>The one this ministry was handed to is a man, and he writes from that place without apology. What was handed to him was not for men only.</P>
            <P mb={0}>His Word is for every person who has breath. This app is built on that. If you are a man, a woman, or a child who wants to know His Word with more honesty and less performance, this was built for you.</P>
          </Section>

          <Section label="The Standard">
            <P>Scripture is the final authority. Not tradition. Not preference. Not what feels right. His Word. Everything built inside this app bends toward Him.</P>
            <P>The questions will not be soft. The notes will not flatter you. The return verses are not chosen to make you feel good. They are chosen because they demand something. He demands something. That is the standard we build to. We must not lower it. He deserves better than we give Him.</P>
            <P>If you are looking for something that tells you what you want to hear, this is the wrong app. We have confidence that if you stay in trust and in faith, you will shed the need to be fed falsities that guard your feelings. And if you are looking for something that tells you what is true, no matter your capacity or your depth, you are in the right place.</P>
            <P mb={0}>The standard does not bend for the certain or the unsure. It does not change for anyone. We move together in Christ toward a greater plan, set in motion before the expanses were separated and creation was given dominion. So we move forward, together, with purpose.</P>
          </Section>

          <Section label="Who We Build For">
            <P>The man in the truck before the sun comes up. The soldier sleeping in a bunk, waking up at 0200, prepared to get on a helicopter, the destination a target building. The father who wants to carry something into his house worth carrying. The man who is done with performance spirituality and wants to actually know the God he claims to follow.</P>
            <P>The woman who opens His Word in the margins of her day because it is the only place that does not move. The mother who opens His Word before the house wakes up because she knows what she carries out of that time is what she carries into them. The woman who has been told her whole life what to believe and is finally ready to read it for herself.</P>
            <P>The teenager who suspects there is more to this than what they have been handed in youth group. The child who is just beginning to open his or her Bible for the first time.</P>
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
            <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--border2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Matthew 3:11</p>
          </div>
        </div>
      )}

      {tab === "howto" && (
        <div>
          <div className="card">
            <p className="label" style={{color:"var(--accent)"}}>The Whole Flow</p>
            <P mb={0}>SELAH holds the practice around your Bible. The app is your companion to His Word. Open your Bible, sit with it, answer what it asks. That is it. Five steps.</P>
          </div>
          {[
            ["1 · Set Up Once","In Settings, pick your translation, your gender, and your age. That is the whole setup. The model uses what you give it, the time you spend, and how you answer to keep you one step ahead of where you are. Come back only when something changes."],
            ["2 · Start a Session","Choose where you are and the book, chapter, and verse you are opening. Tap Open His Word and the clock starts. Put the phone down."],
            ["3 · Read","Read your Bible. SELAH does not replace it; it sits beside it. Come back when you are done."],
            ["4 · Close It Out","Log where you finished and add any notes. SELAH gives you the ground (context), a few questions the passage demands, plain field notes, and verses to return to."],
            ["5 · Return","Every session is saved in your Log. Set a reminder so your time holds its place. Share your card or save to Notes whenever you want."],
          ].map(([title,body])=>(
            <div key={title} className="card">
              <p className="label" style={{color:"var(--accent)"}}>{title}</p>
              <P mb={0}>{body}</P>
            </div>
          ))}
          <div className="card" style={{borderColor:"rgba(var(--accent-rgb),0.2)"}}>
            <p className="label" style={{color:"var(--accent)"}}>Before You Start</p>
            <P mb={0}>This is not built to make you feel good. The questions will not be soft. The notes will not flatter you. The verses are chosen because they demand something. If you want easy answers or a pat on the back, this is the wrong app. We ask for your translation, your age, the time you spend, and how you answer because that is how the model stays honest and stays one step ahead of you. We will not lower the standard. He deserves better than we give Him.</P>
          </div>
          <div style={{textAlign:"center",paddingTop:8,paddingBottom:16}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--border2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Psalm 46:10</p>
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
        background:"var(--input)", border:`1px solid ${open?"var(--accent)":"var(--border2)"}`,
        borderRadius:5, padding:"10px 13px", cursor:"pointer", transition:"border-color 0.2s"
      }}>
        <span style={{fontFamily:"'Crimson Text',serif",fontSize:16,color:"var(--text)"}}>{current[1]}</span>
        <span style={{color:"var(--m2)",fontSize:12,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:50,
          background:"rgba(var(--surface-rgb),0.4)", backdropFilter:"blur(9px) saturate(1.4)", WebkitBackdropFilter:"blur(9px) saturate(1.4)",
          border:"1px solid var(--m5)", borderRadius:5,
          maxHeight:220, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.6)"
        }}>
          {TZ_OPTIONS.map(([val,label])=>(
            <div key={val} onClick={()=>{ setTimezone(val); setOpen(false); }}
              style={{
                padding:"10px 14px", cursor:"pointer",
                background:timezone===val?"rgba(var(--accent-rgb),0.1)":"transparent",
                borderBottom:"1px solid var(--border)",
                transition:"background 0.15s"
              }}
              onMouseOver={e=>e.currentTarget.style.background="rgba(var(--accent-rgb),0.07)"}
              onMouseOut={e=>e.currentTarget.style.background=timezone===val?"rgba(var(--accent-rgb),0.1)":"transparent"}>
              <span style={{fontFamily:"'Crimson Text',serif",fontSize:16,color:timezone===val?"var(--accent)":"var(--text)",textShadow:"0 1px 2px rgba(0,0,0,0.5)"}}>{label}</span>
              {timezone===val && <span style={{float:"right",color:"var(--accent)",fontSize:12}}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Display controls popover (brightness + text size, smooth) ──
function DisplayControls({ layerRef, brightness, textScale, baseScale=1, onCommit, onClose }) {
  const [b, setB] = useState(brightness);
  const [t, setT] = useState(textScale);
  const rafB = useRef(0);
  const debT = useRef(0);
  const lastZoom = useRef(0);
  // Brightness uses CSS filter (GPU-composited, cheap) -> apply live each frame.
  function applyFilter(bv) { const el = layerRef.current; if (el) el.style.filter = bv !== 1 ? `brightness(${bv})` : "none"; }
  // Text size uses zoom (forces a full layout reflow, costly). Apply it live but
  // THROTTLED to ~11x/sec so the page tracks your finger without trying to
  // re-lay-out on every frame. baseScale bumps the whole thing up on tablets.
  function applyZoom(tv) { const el = layerRef.current; if (el) el.style.zoom = tv * baseScale; }
  function changeB(v) { setB(v); if (rafB.current) cancelAnimationFrame(rafB.current); rafB.current = requestAnimationFrame(() => applyFilter(v)); }
  function changeT(v) {
    setT(v);
    const now = (typeof performance !== "undefined" ? performance.now() : Date.now());
    if (now - lastZoom.current > 90) { lastZoom.current = now; applyZoom(v); }
    if (debT.current) clearTimeout(debT.current);
    debT.current = setTimeout(() => applyZoom(v), 100); // guarantee final value lands
  }
  function commit() { if (debT.current) clearTimeout(debT.current); applyFilter(b); applyZoom(t); onCommit(b, t); }
  const pill = { background:"transparent",border:"1px solid var(--border)",borderRadius:4,padding:"4px 10px",color:"var(--text2)",fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",textShadow:"0 1px 2px rgba(0,0,0,0.55)" };
  const cap = { fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,color:"var(--m1)",letterSpacing:"0.08em",textShadow:"0 1px 2px rgba(0,0,0,0.55)" };
  const head = { fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,color:"var(--accent)",letterSpacing:"0.12em",textTransform:"uppercase",textShadow:"0 1px 2px rgba(0,0,0,0.5)" };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:290}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:"calc(env(safe-area-inset-top, 0px) + 62px)",right:"max(12px, calc(50vw - 320px))",zIndex:300,background:"rgba(var(--surface-rgb),0.25)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1px solid var(--border)",borderRadius:8,padding:"14px 16px",width:236,boxShadow:"0 10px 34px rgba(0,0,0,0.6)"}}>
        <p style={{...head,marginBottom:10}}>Brightness</p>
        <Slider value={b} min={0.85} max={1.45} step={0.01} onChange={changeB} onCommit={commit} width="100%"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",marginTop:8}}>
          <span style={{...cap,textAlign:"left"}}>DARKER</span>
          <button onClick={()=>{ setB(1.22); applyFilter(1.22); onCommit(1.22,t); }} style={pill}>Reset</button>
          <span style={{...cap,textAlign:"right"}}>BRIGHTER</span>
        </div>
        <p style={{...head,margin:"16px 0 10px"}}>Text Size</p>
        <Slider value={t} min={0.9} max={1.3} step={0.01} onChange={changeT} onCommit={commit} width="100%"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",marginTop:8}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:"var(--m1)",textShadow:"0 1px 2px rgba(0,0,0,0.6)",textAlign:"left"}}>A</span>
          <button onClick={()=>{ setT(1); applyZoom(1); onCommit(b,1); }} style={pill}>Reset</button>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:"var(--m1)",textShadow:"0 1px 2px rgba(0,0,0,0.6)",textAlign:"right"}}>A</span>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(() => {
    // Restore the last navigational screen on reload. Transient views (a live session,
    // a result, the auth/profile-pick flow) fall back to home since their state is gone.
    try { const v = localStorage.getItem("selah_view"); return ["home","history","settings","about","profiles"].includes(v) ? v : "home"; } catch { return "home"; }
  });
  const [sessions, setSessions] = useState(loadSessions);
  const [activeSession, setActiveSession] = useState(null);
  const [bibleVersion, setBibleVersion] = useState(() => localStorage.getItem("selah_bible_version") || "NLT");
  const [gender, setGender] = useState(() => localStorage.getItem("selah_gender") || "Prefer not to say");
  const [age, setAge] = useState(() => localStorage.getItem("selah_age") || "Prefer not to say");
  const [birthday, setBirthday] = useState(() => localStorage.getItem("selah_birthday") || "");
  const [appIcon, setAppIcon] = useState(() => localStorage.getItem("selah_app_icon") || "default");
  const [palette, setPalette] = useState(() => localStorage.getItem("selah_palette") || "midnight");
  const [profileIcon, setProfileIcon] = useState(() => localStorage.getItem("selah_profile_icon") || "default");
  const [askProfile, setAskProfile] = useState(() => localStorage.getItem("selah_ask_profile") !== "0");
  const [guidanceOff, setGuidanceOff] = useState(() => localStorage.getItem("selah_guidance_off") === "1");
  const [helpOpen, setHelpOpen] = useState(false);
  const [passcode, setPasscode] = useState(() => localStorage.getItem("selah_passcode") || "");
  const [lockPrompt, setLockPrompt] = useState(null);
  const [lockEntry, setLockEntry] = useState("");
  const [lockErr, setLockErr] = useState("");
  const [removeId, setRemoveId] = useState(null);   // kid profile pending passcode-gated removal
  const [removeEntry, setRemoveEntry] = useState("");
  const [removeErr, setRemoveErr] = useState("");
  const [pcDraft, setPcDraft] = useState("");
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
  const [photoView, setPhotoView] = useState(null);
  const [lightItem, setLightItem] = useState(null);
  const [brightness, setBrightness] = useState(() => { const v = parseFloat(localStorage.getItem("selah_brightness")); return (v >= 0.85 && v <= 1.45) ? v : 1.22; });
  const [textScale, setTextScale] = useState(() => { const v = parseFloat(localStorage.getItem("selah_textscale")); return (v >= 0.9 && v <= 1.3) ? v : 1; });
  // Tablets (iPad mini/Air/Pro, Android tablets) start a touch bigger than phones.
  // The text-size slider still has its full range; this just raises the baseline.
  const tabletScale = useRef((()=>{ try { return (navigator.maxTouchPoints>1 && Math.min(window.screen.width,window.screen.height)>=700) ? 1.14 : 1; } catch { return 1; } })()).current;
  useEffect(() => { localStorage.setItem("selah_textscale", String(textScale)); }, [textScale]);
  useEffect(() => { localStorage.setItem("selah_birthday", birthday); }, [birthday]);
  useEffect(() => { localStorage.setItem("selah_app_icon", appIcon); applyAppIcon(appIcon); }, [appIcon]);
  useEffect(() => { localStorage.setItem("selah_palette", palette); applyPalette(palette); }, [palette]);
  useEffect(() => { localStorage.setItem("selah_profile_icon", profileIcon); }, [profileIcon]);
  useEffect(() => { localStorage.setItem("selah_ask_profile", askProfile ? "1" : "0"); }, [askProfile]);
  useEffect(() => { localStorage.setItem("selah_guidance_off", guidanceOff ? "1" : "0"); }, [guidanceOff]);
  useEffect(() => { localStorage.setItem("selah_passcode", passcode); }, [passcode]);
  const [showBright, setShowBright] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const displayRef = useRef(null);
  const hydratedRef = useRef(false);
  const firstAnswerAt = useRef(null);
  const questionStamps = useRef([]);   // first-engagement timestamp (ms) per question index
  const eggScrollRef = useRef(null);
  const logScrollY = useRef(0);   // remembers your scroll position in the Log
  const viewRef = useRef("home");
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { localStorage.setItem("selah_brightness", String(brightness)); }, [brightness]);
  useEffect(() => {
    const onScroll = () => { setShowTop(window.scrollY > 420); if (viewRef.current === "history") logScrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Quick jump back to the Log, restoring where you were (not the top).
  const gotoLog = () => { setView("history"); setTimeout(() => window.scrollTo({ top: logScrollY.current || 0, behavior: "auto" }), 60); };
  const [sessionPhoto, setSessionPhoto] = useState(null);
  const [photoAspect, setPhotoAspect] = useState("square");   // "square" (1:1) | "story" (9:16), chosen at capture
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
  const [eggOpen, setEggOpen] = useState(null); // "mm" | "cross" | null
  const [faithOpen, setFaithOpen] = useState(false);   // Hebrews 11 (ESV) reader
  const [faithText, setFaithText] = useState("");
  const [faithErr, setFaithErr] = useState("");
  const faithScrollRef = useRef(null);
  useEffect(()=>{
    if(!faithOpen || faithText) return;
    setFaithErr("");
    const cached = localStorage.getItem("selah_esv_heb11");
    if(cached){ setFaithText(cached); return; }
    fetch("/.netlify/functions/esv?ref="+encodeURIComponent("Hebrews 11"))
      .then(r=>r.json())
      .then(d=>{ if(d.text){ setFaithText(d.text); try{localStorage.setItem("selah_esv_heb11",d.text);}catch{} } else setFaithErr("Hebrews 11 will appear here once the ESV key is connected."); })
      .catch(()=>setFaithErr("Could not load right now. Check your connection and try again."));
  },[faithOpen, faithText]);
  const [account, setAccount] = useState(loadAccount);
  const [authIntro, setAuthIntro] = useState(false);
  const [syncState, setSyncState] = useState("idle"); // idle | saving | synced | error
  const [kidName, setKidName] = useState("");
  const [kidForm, setKidForm] = useState({ name:"", birthday:"", gender:"Prefer not to say", bible:"NIrV", palette:"midnight", icon:"default" });
  const [torchOpen, setTorchOpen] = useState(true);
  const [visualsOpen, setVisualsOpen] = useState(false);
  const [showAddReader, setShowAddReader] = useState(false);
  const syncTimer = useRef(null);
  const syncStateRef = useRef("idle");      // mirror of syncState for use inside stable effects
  const applySyncRef = useRef(null);        // always points at the latest applySync closure

  // ── Profiles (owner + up to 2 kids). Sessions are tagged with profileId and
  //   kept in one device store; per-profile content settings swap on switch. ──
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("selah_profiles") || '{"owner":{"name":"You","kid":false}}'); }
    catch { return { owner: { name: "You", kid: false } }; }
  });
  const [activeProfileId, setActiveProfileId] = useState(() => localStorage.getItem("selah_active_profile") || "owner");
  // saved per-profile content settings for inactive profiles; persisted locally so a
  // reload doesn't wipe them (otherwise switching back to a profile reset its translation
  // and re-triggered setup).
  const profileSnaps = useRef((() => { try { return JSON.parse(localStorage.getItem("selah_profile_snaps") || "{}") || {}; } catch { return {}; } })());
  const saveSnaps = () => { try { localStorage.setItem("selah_profile_snaps", JSON.stringify(profileSnaps.current)); } catch {} };
  useEffect(() => { localStorage.setItem("selah_profiles", JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem("selah_active_profile", activeProfileId); }, [activeProfileId]);
  // First-run guidance: auto-show the orientation card once per profile (unless turned off).
  // (Placed after activeProfileId is declared to avoid a temporal-dead-zone crash.)
  useEffect(() => {
    if (view === "home" && !guidanceOff && !needsSetup && localStorage.getItem("selah_help_seen_" + activeProfileId) !== "1") setHelpOpen(true);
  }, [view, guidanceOff, needsSetup, activeProfileId]);

  const visibleSessions = sessions.filter(s => (s.profileId || "owner") === activeProfileId);

  // Snapshot the live content settings (these belong to the active profile).
  function liveSettings() {
    let lastPosition = null;
    try { lastPosition = JSON.parse(localStorage.getItem("selah_last_position") || "null"); } catch {}
    return {
      bibleVersion, gender, age, birthday, palette, profileIcon,
      alarms,
      lastPosition,
      setupDone: localStorage.getItem("selah_setup_done") === "1",
    };
  }
  // Load a profile's content settings into the live state.
  function loadSettings(st) {
    st = st || {};
    setBibleVersion(st.bibleVersion || "NLT");
    setGender(st.gender || "Prefer not to say");
    setAge(st.age || "Prefer not to say");
    setBirthday(typeof st.birthday === "string" ? st.birthday : "");
    setAlarms(st.alarms && typeof st.alarms === "object" ? st.alarms : {});
    setPalette(st.palette && PALETTES[st.palette] ? st.palette : "midnight");
    setProfileIcon(st.profileIcon && ICON_THEMES[st.profileIcon] ? st.profileIcon : "default");
    try { localStorage.setItem("selah_last_position", JSON.stringify(st.lastPosition || null)); } catch {}
    localStorage.setItem("selah_setup_done", st.setupDone ? "1" : "0");
    const lp = st.lastPosition;
    if (lp) setForm(prev => ({ ...prev,
      locationType: lp.locationType || prev.locationType,
      startBook: lp.endBook || lp.startBook || prev.startBook,
      startChapter: lp.endChapter || prev.startChapter,
      startVerse: lp.endVerse || prev.startVerse,
      endBook: lp.endBook || lp.startBook || prev.endBook,
    }));
    // No saved position (e.g. a brand-new profile) — start fresh at Genesis 1,
    // never inherit the previous profile's book.
    else setForm(prev => ({ ...prev, startBook:"Genesis", startChapter:"", startVerse:"", endBook:"Genesis", endChapter:"", endVerse:"" }));
  }
  function switchProfile(id) {
    if (id === activeProfileId || !profiles[id]) return;
    profileSnaps.current[activeProfileId] = liveSettings();      // save current
    const target = profileSnaps.current[id];
    if (target && Object.keys(target).length) {
      loadSettings(target);                                      // restore saved settings (incl. translation)
      setNeedsSetup(!target.setupDone);
    } else {
      // No saved snapshot for this profile (e.g. lost on reload). Don't wipe the
      // translation to defaults or force setup on an existing profile.
      setNeedsSetup(false);
    }
    setActiveProfileId(id);
    saveSnaps();
  }
  function requestSwitch(id) {
    if (passcode && profiles[activeProfileId] && profiles[activeProfileId].kid && profiles[id] && !profiles[id].kid) {
      setLockPrompt(id); setLockEntry(""); setLockErr("");
    } else {
      switchProfile(id);
    }
  }
  function createKidProfile(opts) {
    opts = opts || {};
    const kidIds = Object.keys(profiles).filter(k => profiles[k].kid);
    if (kidIds.length >= 3) return;
    const id = "kid_" + Date.now();
    profileSnaps.current[activeProfileId] = liveSettings();
    profileSnaps.current[id] = {
      bibleVersion: opts.bible || "NIrV",
      gender: opts.gender || "Prefer not to say",
      age: "Kids (5-12)",
      birthday: opts.birthday || "",
      palette: opts.palette || "midnight",
      profileIcon: opts.icon || "default",
      alarms: {}, lastPosition: null, setupDone: true,
    };
    setProfiles(p => ({ ...p, [id]: { name: (opts.name || "Child").slice(0, 24), kid: true } }));
    loadSettings(profileSnaps.current[id]);
    setActiveProfileId(id);
    setNeedsSetup(false);
    setTorchOpen(false);
    saveSnaps();
  }
  function deleteKidProfile(id) {
    if (!profiles[id] || !profiles[id].kid) return;
    setSessions(prev => { const next = prev.filter(s => (s.profileId || "owner") !== id); saveSessions(next); return next; });
    delete profileSnaps.current[id];
    setProfiles(p => { const n = { ...p }; delete n[id]; return n; });
    if (activeProfileId === id) { loadSettings(profileSnaps.current["owner"] || {}); setActiveProfileId("owner"); }
    saveSnaps();
  }

  useEffect(() => { localStorage.setItem("selah_alarms", JSON.stringify(alarms)); }, [alarms]);

  // ── Cloud sync: gather / apply / handlers ──
  function gatherSync() {
    // Strip heavy base64 photo data; keep a flag so other devices know one exists.
    const lean = sessions.map(s => {
      const { photoData, ...rest } = s;
      const tagged = { ...rest, profileId: rest.profileId || "owner" };
      return s.photoData ? { ...tagged, hasPhoto: true } : tagged;
    });
    const snaps = { ...profileSnaps.current, [activeProfileId]: liveSettings() };
    const profileSettings = {};
    Object.keys(profiles).forEach(id => { profileSettings[id] = snaps[id] || {}; });
    return { v: 2, appIcon, askProfile, passcode, clockFmt, timezone, activeProfileId, profiles, profileSettings, sessions: lean };
  }
  function applySync(data) {
    if (!data || typeof data !== "object") return;
    // account-level settings
    if (data.appIcon && ICON_THEMES[data.appIcon]) setAppIcon(data.appIcon);
    if (data.clockFmt) setClockFmt(data.clockFmt);
    if (data.timezone) setTimezone(data.timezone);
    if (typeof data.askProfile === "boolean") setAskProfile(data.askProfile);
    if (typeof data.passcode === "string") setPasscode(data.passcode);
    const localById = {};
    sessions.forEach(s => { if (s.photoData) localById[s.id] = s.photoData; });
    if (data.v === 2 && data.profiles && data.profileSettings) {
      const merged = (Array.isArray(data.sessions) ? data.sessions : []).map(s => localById[s.id] ? { ...s, photoData: localById[s.id] } : s);
      setSessions(merged); saveSessions(merged);
      setProfiles(data.profiles);
      profileSnaps.current = { ...data.profileSettings };
      const aid = (data.activeProfileId && data.profiles[data.activeProfileId]) ? data.activeProfileId : "owner";
      setActiveProfileId(aid);
      loadSettings(profileSnaps.current[aid] || {});
    } else {
      // legacy v1 -> migrate into a single owner profile
      const merged = (Array.isArray(data.sessions) ? data.sessions : []).map(s => {
        const t = localById[s.id] ? { ...s, photoData: localById[s.id] } : s;
        return { ...t, profileId: t.profileId || "owner" };
      });
      setSessions(merged); saveSessions(merged);
      setProfiles({ owner: { name: "You", kid: false } });
      setActiveProfileId("owner");
      profileSnaps.current = {};
      loadSettings({
        bibleVersion: data.bibleVersion, gender: data.gender, age: data.age, birthday: data.birthday,
        palette: data.palette, profileIcon: data.appIcon, alarms: data.alarms, lastPosition: data.lastPosition, setupDone: data.setupDone,
      });
    }
  }
  applySyncRef.current = applySync;
  function setupIsDone() {
    return localStorage.getItem("selah_setup_done") === "1";
  }
  function handleAuthed(acc, serverData, isNew) {
    setAccount(acc); saveAccount(acc);
    localStorage.setItem("selah_onboarded", "1");
    setAuthIntro(false);
    const hasServer = serverData && Object.keys(serverData).length > 0;
    let multiProfile = false;
    if (!isNew && hasServer) {
      applySync(serverData);
      setNeedsSetup(!setupIsDone());
      const ask = (typeof serverData.askProfile === 'boolean') ? serverData.askProfile : true;
      multiProfile = ask && serverData.v === 2 && serverData.profiles && Object.keys(serverData.profiles).length > 1;
    } else {
      // new signup, or login with nothing stored. A fresh account must always be
      // asked the setup questions — never inherit this device's prior "setup done"
      // flag or pre-filled answers.
      if (isNew) { loadSettings({}); localStorage.setItem("selah_setup_done","0"); }
      syncRequest("save", acc, gatherSync()).then(()=>setSyncState("synced")).catch(()=>{});
      setNeedsSetup(true);
    }
    hydratedRef.current = true; // safe to auto-save now
    setView(multiProfile ? "profilepick" : "home");
  }
  function handleSkipAuth() {
    localStorage.setItem("selah_onboarded", "1");
    setAuthIntro(false);
    setNeedsSetup(localStorage.getItem("selah_setup_done") !== "1");
    setView("home");
  }
  function completeSetup() {
    localStorage.setItem("selah_setup_done", "1");
    setNeedsSetup(false);
    if (account) { syncRequest("save", account, gatherSync()).then(()=>setSyncState("synced")).catch(()=>{}); }
  }
  function handleSignOut() {
    setAccount(null); saveAccount(null);
    setSyncState("idle");
    setView("home");
  }

  // On launch: first-timers see onboarding; signed-in users refresh from server.
  useEffect(() => {
    const onboarded = localStorage.getItem("selah_onboarded");
    if (account) {
      syncRequest("load", account, null)
        .then(res => { if (res && res.data) { applySync(res.data); setNeedsSetup(!setupIsDone()); } setSyncState("synced"); })
        .catch(() => setSyncState("error"))
        .finally(() => { hydratedRef.current = true; });
    } else if (!onboarded) {
      setAuthIntro(true);
      setView("auth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-sync of log + content settings (display stays per-device).
  // Gated on hydration so a device can never overwrite the server with its
  // local data before the initial load has come back.
  useEffect(() => {
    if (!account || !hydratedRef.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setSyncState("saving");
    syncTimer.current = setTimeout(() => {
      syncRequest("save", account, gatherSync())
        .then(()=>setSyncState("synced"))
        .catch(()=>setSyncState("error"));
    }, 1500);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, sessions, bibleVersion, gender, age, birthday, appIcon, palette, profileIcon, askProfile, passcode, clockFmt, timezone, alarms, profiles, activeProfileId]);

  // Profile structure changes (add/remove/switch) save immediately, not debounced.
  useEffect(() => {
    if (!account || !hydratedRef.current) return;
    syncRequest("save", account, gatherSync()).then(()=>setSyncState("synced")).catch(()=>setSyncState("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, activeProfileId]);

  // Keep a ref copy of sync state so the focus/online listeners (bound once) can read it.
  useEffect(() => { syncStateRef.current = syncState; }, [syncState]);

  // Installed/pinned app stays current: re-pull from the server whenever the app
  // regains focus, becomes visible again, or reconnects. A standalone PWA keeps
  // the page alive in the background, so the launch load never re-runs; without
  // this, a home-screen icon could show stale data even while online.
  useEffect(() => {
    if (!account) return;
    let busy = false;
    const refresh = () => {
      if (busy) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      if (!hydratedRef.current) return;            // initial load not finished
      if (syncStateRef.current === "saving") return; // a local edit is mid-save; don't clobber
      busy = true;
      syncRequest("load", account, null)
        .then(res => { if (res && res.data && applySyncRef.current) applySyncRef.current(res.data); setSyncState("synced"); })
        .catch(() => {})
        .finally(() => { busy = false; });
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // Track viewport width so the edge-glow can scale with screen size.
  const [vw, setVw] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 0));
  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Lock background scroll behind any open modal (simple overflow lock — no
  // layout shift, so it doesn't glitch taps on the modal's close button).
  useEffect(() => {
    const open = !!(eggOpen || photoView || exportSession || faithOpen);
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [eggOpen, photoView, exportSession, faithOpen]);

  // Footer is a normal in-flow bar at the bottom of the page (not a fixed overlay), so
  // the page flows full-height like a regular site and the iOS toolbar just glasses over
  // the content. Nothing is pinned to the viewport, so there is nothing to bounce.

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
  useEffect(() => { try { localStorage.setItem("selah_view", view); } catch {} }, [view]);
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
    try {
      const last = JSON.parse(localStorage.getItem("selah_last_position") || "{}");
      setForm({
        locationType: "Home", otherLocation: "",
        startBook: last.endBook || last.startBook || "Genesis",
        startChapter: last.endChapter || "",
        startVerse: last.endVerse || "",
        endBook: last.endBook || last.startBook || "Genesis",
        endChapter: "", endVerse: "", notes: ""
      });
    } catch {
      setForm({ locationType:"Home",otherLocation:"",startBook:"Genesis",startChapter:"",startVerse:"",endBook:"Genesis",endChapter:"",endVerse:"",notes:"" });
    }
    setResult(null); setActiveSession(null); setError(""); setSessionPhoto(null); setPhotoAspect("square"); setQuestionAnswers({}); setAnswerFeedback([]); setFeedbackSubmitted(false); firstAnswerAt.current = null; questionStamps.current = [];
  }

  async function handlePhotoUpload(e) {
    const file=e.target.files?.[0];
    e.target.value="";   // reset so re-picking the SAME photo still fires onChange
    if(!file) return;
    const data = await compressImage(file);
    if (data) setSessionPhoto(data);
    else setError("Couldn't read that photo. Try a different one, or pick it from your library.");
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
    const isKid = age.startsWith("Kids");
    const depth = getDepthLevel(visibleSessions, isKid);
    const kidNote = isKid ? ` This reader is a child between 5 and 12. Write everything for a young child. Use short, simple sentences and plain words a child knows. Explain any hard word in the verse the moment you use it. Keep the context to 2 or 3 short sentences that tell the story simply. Make the questions concrete and about what happened, who was there, and what they did, not abstract ideas. Notes should be short and clear. Return verses should be easy to picture. Stay warm and honest. Do not water down the truth, just say it in words a child understands. Never frighten or shame the child.` : "";
    const nivNote = bibleVersion === "NIV" ? ` For the NIV, follow the classic NIV wording. Do not adopt the 2011 revision's gender-neutral language choices.` : "";
    const book = (activeSession?.startBook || form.startBook || "").trim();
    const DENSE = ["Romans","Hebrews","Galatians","Ephesians","Colossians","Revelation","Daniel","Isaiah","Ezekiel","Leviticus","Job","1 Corinthians","2 Corinthians","Zechariah","Acts"];
    const GENDER_BOOKS = ["Proverbs","Song of Solomon","Titus","Ephesians","1 Timothy","2 Timothy","1 Peter","Ruth","Esther","1 Corinthians"];
    const bookNote = DENSE.includes(book)
      ? ` ${book} is a dense, argument-driven book whose meaning depends on what came before it. Where a chapter opens on a connective like "therefore," ground the context in the preceding argument or book so the reader is not lost. Give fuller historical and theological context here than you would for narrative or wisdom.`
      : ` This book reads more directly than the dense epistles; keep the context clear and grounded without bloating it, but never thin.`;
    const genderNote = GENDER_BOOKS.includes(book)
      ? ` This book speaks directly to how God designed men and women and what He wrote into us. Let the reader's gender (${gender}) meaningfully shape the application and examples here.`
      : ` Gender (${gender}) may lightly inform examples but should not dominate; the text governs.`;
    const recentT = visibleSessions.filter(x=>x.timing).slice(0,5);
    let engageNote = "";
    if (recentT.length) {
      const avg = (k)=>Math.round(recentT.reduce((a,x)=>a+(x.timing[k]||0),0)/recentT.length);
      engageNote = ` Engagement signals (never mention to the reader): over the last ${recentT.length} sessions this reader averages ${avg("readingMin")} min reading, a ${avg("gapSec")} sec pause before answering, and ${avg("answeringSec")} sec writing answers. Long reading, long pauses, and a long answering span mean they wrestle, return to the text between questions, and labor over their words; push real depth and rigor and richer context. Short times mean skimming; tighten and force a return to the passage.`;
    }
    const versionNote = `The reader is using the ${bibleVersion} translation. Gender: ${gender}. Age group: ${age}. Depth level: ${depth.level} of 5 (${depth.name}) — ${depth.note}${kidNote}${nivNote}${bookNote}${genderNote}${engageNote} Scale the depth and density of the context, the notes, and the questions to the depth level: at higher levels include more historical, literary, and theological grounding and connect to the surrounding chapters and books. Do not hand a beginner and a Harvest-level reader the same context for the same passage. Do not alter the text or its meaning. His Word does not change. Framing and depth adjust.${isKid ? "" : " Never go below their demonstrated level. Aim one step ahead."}`;
    try {
      const resp = await fetch("/.netlify/functions/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ system:SYSTEM_PROMPT + "\n\n" + versionNote, message:"Passage read: "+passage })
      });
      const data = await resp.json();
      const raw = data.content?.find(b=>b.type==="text")?.text||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const completed = { ...activeSession, endBook:form.endBook, endChapter:form.endChapter, endVerse:form.endVerse, personalNotes:form.notes, endTime, readingEndTime:endTime, passage, aiResult:parsed, photoData:sessionPhoto, photoAspect, bibleVersion, gender, profileId:activeProfileId };
      try { localStorage.setItem('selah_last_position', JSON.stringify({ endBook:form.endBook, endChapter:form.endChapter, endVerse:form.endVerse })); } catch {}
      firstAnswerAt.current = null; questionStamps.current = [];
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
    // ── Timestamp protocol ──────────────────────────────────────────────
    // Raw clock: openAt (start reading) -> readEndAt (logged stop) ->
    // questionAt[i] (first engagement per question) -> submitAt (clock stops).
    const _start = activeSession?.startTime ? new Date(activeSession.startTime).getTime() : null;
    const _readEnd = activeSession?.readingEndTime ? new Date(activeSession.readingEndTime).getTime() : null;
    const _fa = firstAnswerAt.current;
    const _now = Date.now();
    const stamps = questionStamps.current.slice();   // sparse: index -> ms
    const readingMin = (_start && _readEnd) ? Math.max(0, Math.round((_readEnd-_start)/60000)) : null;
    const gapSec = (_readEnd && _fa) ? Math.max(0, Math.round((_fa-_readEnd)/1000)) : null;
    const totalMin = _start ? Math.max(0, Math.round((_now-_start)/60000)) : null;
    const answeringSec = (_fa) ? Math.max(0, Math.round((_now-_fa)/1000)) : null;
    // Per-question dwell: order the touched questions by time; each runs until
    // the next question is touched (last runs until submit).
    const touched = stamps.map((t,idx)=>({idx,t})).filter(o=>o.t!=null).sort((a,b)=>a.t-b.t);
    const perQuestionSec = touched.map((o,k)=>{
      const next = (k+1<touched.length) ? touched[k+1].t : _now;
      return { q: o.idx+1, sec: Math.max(0, Math.round((next-o.t)/1000)) };
    });
    // ── Invariants pulled from the active profile on every submission ─────
    const _sc = parseInt(activeSession?.startChapter,10), _ec = parseInt(activeSession?.endChapter,10);
    const sameBook = activeSession?.startBook && activeSession?.startBook === activeSession?.endBook;
    const chaptersRead = (sameBook && Number.isFinite(_sc) && Number.isFinite(_ec)) ? Math.max(1, _ec-_sc+1) : null;
    const invariants = {
      age, gender, bibleVersion,
      book: activeSession?.startBook || "",
      startRef: `${activeSession?.startBook||""} ${activeSession?.startChapter||""}${activeSession?.startVerse?":"+activeSession.startVerse:""}`.trim(),
      endRef: `${activeSession?.endBook||""} ${activeSession?.endChapter||""}${activeSession?.endVerse?":"+activeSession.endVerse:""}`.trim(),
      chaptersRead,
    };
    const timing = {
      openAt:_start, readEndAt:_readEnd, questionAt:stamps, submitAt:_now,
      readingMin, gapSec, totalMin, answeringSec, perQuestionSec, invariants,
    };
    const perQStr = perQuestionSec.length ? perQuestionSec.map(o=>`Q${o.q} ${o.sec}s`).join(", ") : "unknown";
    const engagement = `\n\nReader engagement (calibration only, never mention to the reader). Profile this submission: age ${age}; gender ${gender}; translation ${bibleVersion}; book ${invariants.book}; passage ${invariants.startRef} to ${invariants.endRef}${chaptersRead?` (about ${chaptersRead} chapter${chaptersRead>1?"s":""})`:""}. Timeline: reading ${readingMin==null?"unknown":readingMin+" min"}; pause before first answer ${gapSec==null?"unknown":gapSec+" sec"}; time per question [${perQStr}]; total time writing answers ${answeringSec==null?"unknown":answeringSec+" sec"}; whole session ${totalMin==null?"unknown":totalMin+" min"}. A long answering span and long per-question times mean they returned to the Word for each question and labored over the response, real effort and engagement; meet that with deeper, more rigorous feedback. Quick, short times may be skimming; press them gently back to the passage.`;
    const payload = "Passage: "+(activeSession?.passage||"")+"\n\nQuestions and answers:\n"+qLines+engagement;
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
          ? { ...s, questionAnswers: questionAnswers, answerFeedback: fb, timing }
          : s
        ));
      }
    } catch(e) { setAnswerFeedback([]); setFeedbackSubmitted(true); }
    setFeedbackLoading(false);
  }

  function handleCalendarDay(sessionId) {
    setCalJumpId(sessionId);
  }

  function toggleSession(id) {
    const y = window.scrollY;
    setExpandedSession(prev => prev === id ? null : id);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" })));
  }

  function deleteSession(id) {
    setSessions(prev=>prev.filter(s=>s.id!==id));
    if (expandedSession===id) setExpandedSession(null);
  }

  const activeMins = activeSession ? Math.round((Date.now()-new Date(activeSession.startTime))/60000) : 0;

  const STD_VERSIONS = ["NLT","ESV","KJV","NIV","NASB","CSB"];
  const KID_VERSIONS = ["NIrV","ICB","NLT"];
  const isKidAge = age.startsWith("Kids");
  const BIBLE_VERSIONS = isKidAge ? KID_VERSIONS : STD_VERSIONS;
  // Edge-glow spread scales with screen width so it hugs the edges on phones
  // and stays a thin halo on big screens, instead of bleeding into the middle.
  const glowGold = Math.max(14, Math.min(Math.round((vw || 1200) * 0.05), 70));
  const glowRed = Math.max(30, Math.min(Math.round((vw || 1200) * 0.11), 150));

  return (
    <div className="app-root" style={{background:"var(--bg)",color:"var(--text)",fontFamily:"'Crimson Text',Georgia,serif",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;600;700&display=swap');
        :root{
          --bg:#190f0b;--surface:#20130f;--input:#221610;--input2:#160d0a;
          --border:#36241c;--border2:#2e2408;--accent:#c9a84c;--accent2:#a8832a;
          --ink:#0e0c06;--text:#e4dcc8;--text2:#c8bfa0;--text3:#c0b898;--text4:#d4ccb8;
          --m1:#8a7a4a;--m1b:#8a7a5a;--m2:#6a5a30;--m3:#5a4a20;--m3b:#5a4a2a;--m4:#4a3e1a;--m5:#3a3010;
          --accent-rgb:201,168,76;--blood-rgb:110,28,28;--surface-rgb:32,19,15;
        }
        html,body{background:var(--bg);-webkit-overflow-scrolling:touch;}*{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
        input,select,textarea{background:var(--input);border:1px solid var(--border2);color:var(--text);border-radius:5px;padding:10px 13px;font-family:'Crimson Text',Georgia,serif;font-size:16px;outline:none;width:100%;transition:border-color 0.2s,box-shadow 0.2s;}
        input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 2px rgba(var(--accent-rgb),0.08);}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active{-webkit-text-fill-color:var(--text)!important;-webkit-box-shadow:0 0 0 1000px var(--input) inset!important;caret-color:var(--text)!important;transition:background-color 9999s ease-in-out 0s;}
        select option{background:var(--input);}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;appearance:textfield;}
        .btn-primary{background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 100%);color:var(--ink);border:none;border-radius:5px;padding:14px 24px;font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:0.12em;cursor:pointer;transition:opacity 0.2s,transform 0.1s;text-transform:uppercase;width:100%;}
        .btn-primary:hover{opacity:0.88;transform:translateY(-1px);}
        .btn-primary:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
        .btn-ghost{background:transparent;color:var(--m2);border:1px solid var(--border2);border-radius:5px;padding:11px 20px;font-family:'Cinzel',serif;font-size:11px;font-weight:600;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;width:100%;}
        .btn-ghost:hover{border-color:var(--accent);color:var(--accent);}
        .btn-export{display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;color:var(--accent);border:1px solid rgba(var(--accent-rgb),0.4);border-radius:5px;padding:12px 20px;font-family:'Cinzel',serif;font-size:11px;font-weight:600;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;width:100%;}
        .btn-export:hover{background:rgba(var(--accent-rgb),0.07);border-color:var(--accent);}
        .btn-export:disabled{opacity:0.4;cursor:not-allowed;}
        .btn-danger{background:transparent;color:#8a3020;border:1px solid #3a1810;border-radius:4px;padding:6px 12px;font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;}
        .btn-danger:hover{border-color:#c04030;color:#c04030;}
        .card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:18px;margin-bottom:14px;}
        .label{font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.14em;color:var(--m2);text-transform:uppercase;display:block;margin-bottom:8px;overflow-wrap:break-word;word-break:break-word;}
        .divider{border:none;border-top:1px solid var(--border);margin:14px 0;}
        .fade-in{animation:fadeIn 0.35s ease forwards;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .pulse{animation:pulse 1.8s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes edgeGlow{0%,100%{opacity:0.4}50%{opacity:0.95}}
        .nav-tab{background:transparent;border:none;color:var(--m5);font-family:'Cinzel',serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;padding:10px 10px;border-bottom:2px solid transparent;transition:all 0.2s;flex:1;}
        .nav-tab.active{color:var(--accent);border-bottom-color:var(--accent);}
        .nav-tab:hover:not(.active){color:var(--m1);}
        .section-head{display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:14px 0;user-select:none;}
        .hist-card{background:var(--surface);border:1px solid var(--border);border-radius:7px;margin-bottom:10px;overflow:hidden;transition:border-color 0.2s;}
        .hist-card:hover{border-color:var(--border2);}
        .hist-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;}
        .rv-item{border-left:2px solid var(--border2);padding-left:14px;margin-bottom:13px;}
        .q-item{display:flex;gap:12px;margin-bottom:14px;align-items:flex-start;}
        .n-item{display:flex;gap:10px;margin-bottom:13px;align-items:flex-start;}
        .geo-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(var(--accent-rgb),0.06);border:1px solid rgba(var(--accent-rgb),0.15);border-radius:20px;padding:4px 10px;font-family:'Cinzel',serif;font-size:9px;color:var(--m1);letter-spacing:0.08em;text-transform:uppercase;}
        .photo-drop{border:1px dashed var(--m5);border-radius:6px;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:center;}
        .photo-drop:hover{border-color:var(--accent);background:rgba(var(--accent-rgb),0.03);}
        .no-sb{scrollbar-width:none;-ms-overflow-style:none;}
        .no-sb::-webkit-scrollbar{display:none;}
        .mm-shell{position:fixed;left:0;right:0;top:0;height:100vh;height:100dvh;pointer-events:none;display:flex;flex-direction:column;justify-content:flex-end;z-index:100;}
        .app-root{min-height:100vh;min-height:100svh;display:flex;flex-direction:column;}
        .photo-preview{width:100%;border-radius:6px;overflow:hidden;position:relative;}
        .photo-preview img{width:100%;display:block;max-height:260px;object-fit:cover;}
        .photo-remove{position:absolute;top:8px;right:8px;background:rgba(10,8,4,0.8);border:1px solid #3a1810;color:#a04030;border-radius:4px;padding:4px 10px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;cursor:pointer;text-transform:uppercase;}
        .version-pill{background:transparent;border:1px solid var(--border2);border-radius:4px;padding:7px 12px;font-family:'Cinzel',serif;font-size:10px;color:var(--m3);letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;}
        .version-pill.active{background:rgba(var(--accent-rgb),0.12);border-color:var(--accent);color:var(--accent);}
        .version-pill:hover:not(.active){border-color:var(--m3);color:var(--m1);}
        @media (min-width:600px){.app-container{padding:0 24px calc(76px + env(safe-area-inset-bottom)) !important;}.card{padding:22px !important;}input,select,textarea{font-size:17px !important;}.btn-primary{font-size:13px !important;padding:16px 28px !important;}}
        @media (min-width:768px){.app-container{padding:0 32px calc(76px + env(safe-area-inset-bottom)) !important;max-width:600px !important;}h1{font-size:30px !important;}}
        @media (min-width:1024px){.app-container{max-width:640px !important;}}
      `}</style>

      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.5,zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`}}/>

      {/* Pulsing gold edge-glow vignette */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:3,boxShadow:`inset 0 0 ${glowGold}px rgba(var(--accent-rgb),0.17), inset 0 0 ${glowRed}px rgba(var(--blood-rgb),0.10)`,animation:"edgeGlow 6s ease-in-out infinite"}}/>

      <div className="app-container" style={{position:"relative",zIndex:1,flex:1,width:"100%",maxWidth:480,margin:"0 auto",padding:"0 16px calc(76px + env(safe-area-inset-bottom))",overflowAnchor:"none"}}>

        {/* HEADER */}
        <div style={{textAlign:"center",padding:"calc(env(safe-area-inset-top, 0px) + 28px) 0 18px",position:"relative"}}>
          {view !== "session" && view !== "auth" && view !== "profilepick" && (
            <button onClick={()=>setView("settings")} style={{position:"absolute",right:0,top:"calc(env(safe-area-inset-top, 0px) + 28px)",background:"transparent",border:"none",color:"var(--m5)",cursor:"pointer",padding:8,transition:"color 0.2s"}}
              onMouseOver={e=>e.currentTarget.style.color="var(--accent)"}
              onMouseOut={e=>e.currentTarget.style.color="var(--m5)"}>
              <SettingsIcon size={19}/>
            </button>
          )}
          {view !== "session" && view !== "auth" && view !== "profilepick" && (
            <button onClick={()=>setShowBright(s=>!s)} aria-label="Quick actions" style={{position:"absolute",right:33,top:"calc(env(safe-area-inset-top, 0px) + 28px)",background:"transparent",border:"none",color:showBright?"var(--accent)":"var(--m5)",cursor:"pointer",padding:8,transition:"color 0.2s"}}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2 4 13.5h6L9 22l9-12h-6l1-8z"/></svg>
            </button>
          )}
          {view === "home" && !guidanceOff && (
            <button onClick={()=>setHelpOpen(true)} aria-label="Help" style={{position:"absolute",right:66,top:"calc(env(safe-area-inset-top, 0px) + 28px)",background:"transparent",border:"none",color:"var(--m5)",cursor:"pointer",padding:8,transition:"color 0.2s"}}
              onMouseOver={e=>e.currentTarget.style.color="var(--accent)"} onMouseOut={e=>e.currentTarget.style.color="var(--m5)"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M9.1 9.2a3 3 0 0 1 5.8 1c0 2-2.9 2.5-2.9 4"/><circle cx="12" cy="17.6" r="0.7" fill="currentColor" stroke="none"/></svg>
            </button>
          )}
          <div style={{position:"absolute",left:(profiles[activeProfileId] && profiles[activeProfileId].kid)?10:6,top:"calc(env(safe-area-inset-top, 0px) + 34px)",cursor:view==="home"?"pointer":"default"}} onClick={()=>{ if(view==="home") setEggOpen("cross"); }}>
            {profiles[activeProfileId] && profiles[activeProfileId].kid
              ? <img src={(ICON_THEMES[profileIcon]||ICON_THEMES.default).thumb} alt="" width={40} height={40} style={{borderRadius:10,display:"block",border:"1px solid var(--border)"}}/>
              : <CrossIcon size={30} glow={false}/>}
          </div>
          <h1 onClick={()=>{ resetForm(); setView("home"); }} style={{fontFamily:"'Cinzel',serif",fontSize:26,fontWeight:700,letterSpacing:"0.1em",color:SELAH_CREAM,textShadow:"0 0 22px rgba(var(--accent-rgb),0.32), 0 0 55px rgba(var(--accent-rgb),0.14)",cursor:"pointer"}}>SELAH</h1>
          <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:13,color:"var(--m4)",marginTop:3}}>Read. Mark. Return.</p>
        </div>

        {/* DISPLAY LAYER — brightness + text-size apply here, not the header (keeps gold/cross true color) */}
        <div ref={displayRef} style={{filter:brightness!==1?`brightness(${brightness})`:"none",zoom:textScale*tabletScale}}>

        {/* NAV */}
        {view !== "session" && view !== "settings" && view !== "about" && view !== "auth" && view !== "profiles" && view !== "profilepick" && (
          <div style={{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:20}}>
            <button className={`nav-tab ${(view==="home"||view==="result")?"active":""}`} onClick={()=>{ resetForm(); setView("home"); }}>New Session</button>
            <button className={`nav-tab ${view==="history"?"active":""}`} onClick={()=>setView("history")}>
              Log {visibleSessions.length>0&&`(${visibleSessions.length})`}
            </button>
            <button className={`nav-tab ${view==="about"?"active":""}`} onClick={()=>setView("about")}>About</button>
          </div>
        )}

        {/* ══ AUTH / ONBOARDING ══ */}
        {view === "auth" && (
          <AuthScreen
            initialMode="signup"
            intro={authIntro}
            onAuthed={handleAuthed}
            onSkip={authIntro ? handleSkipAuth : null}
            onBack={authIntro ? null : ()=>setView("settings")}
          />
        )}

        {/* ══ PROFILE PICKER (Netflix-style, after sign-in) ══ */}
        {view === "profilepick" && (
          <div className="fade-in" style={{paddingTop:10}}>
            <div style={{textAlign:"center",marginBottom:26}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><CrossIcon size={34} glow={true}/></div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,letterSpacing:"0.1em",color:SELAH_CREAM}}>Who is Reading?</h2>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:18,justifyContent:"center"}}>
              {Object.entries(profiles).map(([id,p])=>{
                const pic = (id===activeProfileId ? profileIcon : ((profileSnaps.current[id]||{}).profileIcon)) || "default";
                const thumb = (ICON_THEMES[pic]||ICON_THEMES.default).thumb;
                return (
                  <button key={id} onClick={()=>{ switchProfile(id); setView("home"); }}
                    style={{background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:10,width:120,padding:0}}>
                    <div style={{width:96,height:96,borderRadius:18,overflow:"hidden",border:"1px solid var(--border)",boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}>
                      <img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                    </div>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"0.06em",color:"var(--text2)"}}>{p.name || (p.kid?"Child":"You")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ PROFILES (manage) ══ */}
        {view === "profiles" && (()=>{
          const ownerBday = activeProfileId==="owner" ? birthday : ((profileSnaps.current["owner"]||{}).birthday || "");
          const ownerAge = ageFromBirthday(ownerBday);
          const kidIds = Object.keys(profiles).filter(k=>profiles[k].kid);
          const canAddKid = ownerAge!==null && ownerAge>=18 && kidIds.length<3;
          const isKidActive = !!(profiles[activeProfileId] && profiles[activeProfileId].kid);
          const KIDV = ["NIrV","ICB","NLT"];
          const dateStyle = {width:"100%",maxWidth:"100%",minWidth:0,display:"block",boxSizing:"border-box",background:"var(--input)",border:"1px solid var(--border)",borderRadius:6,padding:"11px 14px",color:"var(--text)",fontFamily:"'Crimson Text',serif",fontSize:16,outline:"none",colorScheme:"dark",WebkitAppearance:"none",appearance:"none"};
          const tileThumb = (id) => (ICON_THEMES[(id===activeProfileId ? profileIcon : ((profileSnaps.current[id]||{}).profileIcon)) || "default"]||ICON_THEMES.default).thumb;
          return (
            <div className="fade-in">
              <button onClick={()=>setView("settings")} style={{background:"transparent",border:"none",color:"var(--m2)",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6,padding:0}}>← Settings</button>

              {/* Who is reading */}
              <div className="card">
                <p className="label">Who is Reading</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
                  {Object.entries(profiles).map(([id,p])=>(
                    <button key={id} onClick={()=>requestSwitch(id)}
                      style={{background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,width:78,padding:0}}>
                      <div style={{width:64,height:64,borderRadius:14,overflow:"hidden",border:activeProfileId===id?"2px solid var(--accent)":"2px solid var(--border)",boxShadow:activeProfileId===id?"0 0 12px rgba(var(--accent-rgb),0.3)":"none"}}>
                        <img src={tileThumb(id)} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      </div>
                      <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.04em",color:activeProfileId===id?"var(--accent)":"var(--m2)",textAlign:"center"}}>{p.name || (p.kid?"Child":"You")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* This profile: name + icon */}
              <div className="card">
                <p className="label">This Profile</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Profile Name</p>
                <input value={profiles[activeProfileId]?.name || ""} onFocus={e=>e.target.select()} onChange={e=>{ const v=e.target.value.slice(0,24); setProfiles(p=>({...p,[activeProfileId]:{...p[activeProfileId],name:v}})); }}
                  placeholder={profiles[activeProfileId]?.kid?"Child's name":"Your name"}
                  style={{width:"100%",boxSizing:"border-box",background:"var(--input)",border:"1px solid var(--border)",borderRadius:6,padding:"11px 14px",color:"var(--text)",fontFamily:"'Crimson Text',serif",fontSize:16,outline:"none",marginBottom:14}}/>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Profile Icon</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {Object.entries(ICON_THEMES).map(([key,t])=>(
                    <button key={key} onClick={()=>setProfileIcon(key)} style={{background:"transparent",border:"none",padding:0,cursor:"pointer"}}>
                      <div style={{width:50,height:50,borderRadius:11,overflow:"hidden",border:profileIcon===key?"2px solid var(--accent)":"2px solid var(--border)"}}>
                        <img src={t.thumb} alt={t.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:13,color:"var(--m4)",lineHeight:1.5,marginTop:10}}>
                  This icon shows at sign-in and at the top of the screen as a reminder of whose reading is open. It does not change your home-screen app icon, which you set under Visuals.
                </p>
              </div>

              {/* Collapsible teaching */}
              <div className="card">
                <button onClick={()=>setTorchOpen(o=>!o)} style={{width:"100%",background:"transparent",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span className="label" style={{marginBottom:0}}>The Next Watch</span>
                  <span style={{color:"var(--accent)",fontSize:18,transform:torchOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>⌄</span>
                </button>
                {torchOpen && (
                  <div style={{marginTop:14}}>
                    <p style={{fontSize:16,lineHeight:1.7,color:"var(--m2)",marginBottom:12}}>
                      The young readers section is for the ones you disciple. Your own, or one set under your charge.
                    </p>
                    <p style={{fontSize:16,lineHeight:1.7,color:"var(--m2)",marginBottom:12}}>
                      Discipleship is not a lecture series. It is atmosphere. The young read what we live long before they read what we say. They absorb the room.
                    </p>
                    <p style={{fontSize:16,lineHeight:1.7,color:"var(--m2)",marginBottom:12}}>
                      What we carry moves down the line. Not only sin, but habit, hunger, and posture. So we put the Word in front of them early, and we read beside them. Not flattery. Formation.
                    </p>
                    <p style={{fontSize:16,lineHeight:1.7,color:"var(--m2)",marginBottom:12}}>
                      You are not holding their place. You are handing them the torch.
                    </p>
                    <p style={{fontSize:16,lineHeight:1.7,color:"var(--m2)",marginBottom:14}}>
                      What you carry, they will carry. Read like they are watching, because they are.
                    </p>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--accent)",letterSpacing:"0.14em",textTransform:"uppercase",textAlign:"right"}}>Midnight Ministries</p>
                  </div>
                )}
              </div>

              {/* Young readers (owner only) */}
              {!isKidActive && (
              <div className="card">
                <p className="label">Young Readers</p>
                {canAddKid ? (
                  !showAddReader ? (
                    <button className="btn-primary" style={{width:"100%",padding:"13px"}} onClick={()=>setShowAddReader(true)}>Add a Young Reader</button>
                  ) : (
                    <>
                      <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>Up to three young readers under your account. You can adjust anytime.</p>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Name</p>
                      <input value={kidForm.name} onChange={e=>setKidForm(f=>({...f,name:e.target.value}))} placeholder="First name"
                        style={{width:"100%",boxSizing:"border-box",background:"var(--input)",border:"1px solid var(--border)",borderRadius:6,padding:"11px 14px",color:"var(--text)",fontFamily:"'Crimson Text',serif",fontSize:16,outline:"none",marginBottom:14}}/>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Birthday</p>
                      <input type="date" onClick={e=>{try{e.target.showPicker&&e.target.showPicker();}catch(_){}}} value={kidForm.birthday} onChange={e=>setKidForm(f=>({...f,birthday:e.target.value}))} style={{...dateStyle,marginBottom:14}}/>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Gender</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
                        {["Male","Female","Prefer not to say"].map(g=>(
                          <button key={g} className={`version-pill ${kidForm.gender===g?"active":""}`} onClick={()=>setKidForm(f=>({...f,gender:g}))}>{g}</button>
                        ))}
                      </div>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Bible (kids translations)</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
                        {KIDV.map(v=>(
                          <button key={v} className={`version-pill ${kidForm.bible===v?"active":""}`} onClick={()=>setKidForm(f=>({...f,bible:v}))}>{v}</button>
                        ))}
                      </div>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Their Icon</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
                        {Object.entries(ICON_THEMES).map(([key,t])=>(
                          <button key={key} onClick={()=>setKidForm(f=>({...f,icon:key}))} style={{background:"transparent",border:"none",padding:0,cursor:"pointer"}}>
                            <div style={{width:42,height:42,borderRadius:9,overflow:"hidden",border:kidForm.icon===key?"2px solid var(--accent)":"2px solid var(--border)"}}>
                              <img src={t.thumb} alt={t.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Their Palette</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                        {Object.entries(PALETTES).map(([key,p])=>(
                          <button key={key} onClick={()=>setKidForm(f=>({...f,palette:key}))}
                            style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:kidForm.palette===key?"1px solid var(--accent)":"1px solid var(--border)",borderRadius:6,padding:"5px 9px",cursor:"pointer"}}>
                            <span style={{display:"flex",borderRadius:4,overflow:"hidden"}}>{p.swatch.map((c,i)=><span key={i} style={{width:12,height:16,background:c}}/>)}</span>
                            <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.05em",color:kidForm.palette===key?"var(--accent)":"var(--m3)"}}>{p.label}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn-ghost" style={{flex:1,padding:"12px"}} onClick={()=>{ setShowAddReader(false); setKidForm({name:"",birthday:"",gender:"Prefer not to say",bible:"NIrV",palette:"midnight",icon:"default"}); }}>Cancel</button>
                        <button className="btn-primary" style={{flex:2,padding:"12px"}}
                          onClick={()=>{ if(kidForm.name.trim()){ createKidProfile({name:kidForm.name.trim(),birthday:kidForm.birthday,gender:kidForm.gender,bible:kidForm.bible,palette:kidForm.palette,icon:kidForm.icon}); setKidForm({name:"",birthday:"",gender:"Prefer not to say",bible:"NIrV",palette:"midnight",icon:"default"}); setShowAddReader(false); setView("settings"); } }}>
                          Add Reader
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6}}>
                    {kidIds.length>=3 ? "You have added the maximum of three young readers." : "Set your own birthday in Settings (you must be 18 or older) to add a young reader."}
                  </p>
                )}
                {kidIds.length>0 && (
                  <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border2)"}}>
                    {kidIds.map(id=>(
                      <div key={id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--text2)"}}>{profiles[id].name||"Child"}</span>
                        <button onClick={()=>{ if(passcode){ setRemoveId(id); setRemoveEntry(""); setRemoveErr(""); } else if(window.confirm(`Remove ${profiles[id].name||"this reader"} and all of their sessions? This cannot be undone.`)) deleteKidProfile(id); }}
                          style={{background:"transparent",border:"1px solid var(--border)",borderRadius:5,padding:"5px 10px",color:"var(--m3)",fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* Sign-in behavior (owner only) */}
              {!isKidActive && (
              <div className="card">
                <p className="label">At Sign-In</p>
                <button onClick={()=>setAskProfile(a=>!a)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",border:"none",padding:0,cursor:"pointer"}}>
                  <span style={{fontSize:16,color:"var(--m2)",textAlign:"left",lineHeight:1.5,paddingRight:12}}>Ask who is reading at sign-in</span>
                  <span style={{flexShrink:0,width:46,height:26,borderRadius:13,background:askProfile?"var(--accent)":"var(--border)",position:"relative",transition:"background 0.2s"}}>
                    <span style={{position:"absolute",top:3,left:askProfile?23:3,width:20,height:20,borderRadius:"50%",background:"var(--text4)",transition:"left 0.2s"}}/>
                  </span>
                </button>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:13,color:"var(--m4)",lineHeight:1.5,marginTop:10}}>
                  Off means you go straight into the last profile you used.
                </p>
              </div>
              )}

              {/* Guidance cards (owner only) */}
              {!isKidActive && (
              <div className="card">
                <p className="label">Guidance</p>
                <button onClick={()=>setGuidanceOff(g=>!g)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",border:"none",padding:0,cursor:"pointer"}}>
                  <span style={{fontSize:16,color:"var(--m2)",textAlign:"left",lineHeight:1.5,paddingRight:12}}>Show guidance cards</span>
                  <span style={{flexShrink:0,width:46,height:26,borderRadius:13,background:!guidanceOff?"var(--accent)":"var(--border)",position:"relative",transition:"background 0.2s"}}>
                    <span style={{position:"absolute",top:3,left:!guidanceOff?23:3,width:20,height:20,borderRadius:"50%",background:"var(--text4)",transition:"left 0.2s"}}/>
                  </span>
                </button>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:13,color:"var(--m4)",lineHeight:1.5,marginTop:10}}>
                  The first-run helper on the home screen and the "?" button. Turn it off once you know your way around.
                </p>
              </div>
              )}

              {/* Profile lock (owner only) */}
              {!isKidActive && (
              <div className="card">
                <p className="label">Profile Lock</p>
                <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>
                  Set a 6-digit code. When it is on, a young reader cannot leave their profile and switch into yours without it. Good for when they have the device.
                </p>
                {passcode ? (
                  <button className="btn-ghost" style={{width:"100%",padding:"12px"}} onClick={()=>{ if(window.confirm("Remove the profile lock?")) setPasscode(""); }}>Lock is on — Remove</button>
                ) : (
                  <>
                    <PinBoxes value={pcDraft} onChange={setPcDraft}/>
                    <button className="btn-primary" style={{width:"100%",padding:"13px",marginTop:14,opacity:pcDraft.length===6?1:0.5}}
                      onClick={()=>{ if(pcDraft.length===6){ setPasscode(pcDraft); setPcDraft(""); } }}>Set Lock</button>
                  </>
                )}
              </div>
              )}
            </div>
          );
        })()}

        {/* ══ HOME ══ */}
        {view === "home" && (
          <div className="fade-in">
            {helpOpen && (
              <div className="card" style={{border:"1px solid rgba(var(--accent-rgb),0.35)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <p className="label" style={{margin:0,color:"var(--accent)"}}>{isKidAge ? "How it works" : "Getting started"}</p>
                  <button onClick={()=>{ setHelpOpen(false); try{localStorage.setItem("selah_help_seen_"+activeProfileId,"1");}catch(_){} }} aria-label="Close" style={{background:"transparent",border:"none",color:"var(--m3)",fontSize:20,lineHeight:1,cursor:"pointer",padding:0}}>×</button>
                </div>
                {isKidAge ? (
                  <p style={{fontSize:15,color:"var(--m1b)",lineHeight:1.6,marginBottom:12}}>Pick a book and chapter, then tap Open His Word. Read your Bible, then come back. <Selah /> gives you questions and notes to help you understand it, and your fire grows the more you read.</p>
                ) : (
                  <p style={{fontSize:16,color:"var(--m1b)",lineHeight:1.7,marginBottom:12}}>Set your translation, age, and gender once and you are ready. Choose where you are and the book, chapter, and verse, then Open His Word. <Selah /> times your reading and meets you with context, questions, field notes, and verses to return to. Change your translation, age, or gender anytime in Settings, where you can also add a young reader, lock profiles, and turn these guidance cards off.</p>
                )}
                <button className="btn-primary" style={{width:"100%",padding:"11px"}} onClick={()=>{ setHelpOpen(false); try{localStorage.setItem("selah_help_seen_"+activeProfileId,"1");}catch(_){} }}>Got it</button>
              </div>
            )}
            {isKidAge && (()=>{
              const d = getDepthLevel(visibleSessions, true);
              const FLAME = "M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z";
              const stages = [["Spark",22],["Ember",27],["Flame",32],["Torch",38],["Wildfire",46]];
              return (
                <div className="card" style={{textAlign:"center"}}>
                  <p className="label">Your Fire</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:24,color:"#f5894a",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",margin:"2px 0 16px",textShadow:"0 0 18px rgba(245,137,74,0.55)"}}>{d.name}</p>
                  <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:12}}>
                    {stages.map(([name,size],i)=>{
                      const lit = i < d.level, current = i === d.level-1;
                      return (
                        <div key={name} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
                          <svg width={size} height={size} viewBox="0 0 24 24" className={current?"pulse":""} style={{filter:lit?"drop-shadow(0 0 7px rgba(245,137,74,0.9))":"none"}}>
                            <path d={FLAME} fill={lit?(current?"#ffc05a":"#f5894a"):"none"} stroke={lit?"none":"var(--m5)"} strokeWidth={lit?0:1.5} strokeLinejoin="round"/>
                          </svg>
                          <span style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:"0.03em",textTransform:"uppercase",color:lit?"#f5894a":"var(--m5)",fontWeight:current?700:400}}>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m3)",marginTop:16}}>You're a {d.name}! Keep reading His Word and watch your fire grow.</p>
                </div>
              );
            })()}
            <div className="card">
              <label className="label">Where you are</label>
              <select value={form.locationType} onChange={e=>setForm(f=>({...f,locationType:e.target.value}))}>
                {LOCATION_TYPES.map(l=><option key={l}>{l}</option>)}
              </select>
              {form.locationType==="Other" && (
                <input style={{marginTop:8}} placeholder="Describe the place..." value={form.otherLocation} onChange={e=>setForm(f=>({...f,otherLocation:e.target.value}))}/>
              )}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{color:useGps?"var(--accent)":"var(--m5)"}}><ShieldIcon/></div>
                  <div>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:useGps?"var(--m2)":"var(--m5)"}}>Tag GPS Location</p>
                    <p style={{fontSize:13,color:"var(--m5)",marginTop:2}}>{useGps?"Stored on device only. Never shared.":"Location will not be recorded"}</p>
                  </div>
                </div>
                <div onClick={()=>setUseGps(v=>!v)} style={{width:40,height:22,borderRadius:11,cursor:"pointer",flexShrink:0,background:useGps?"var(--accent)":"var(--border)",border:`1px solid ${useGps?"var(--accent)":"var(--m5)"}`,position:"relative",transition:"background 0.2s,border-color 0.2s"}}>
                  <div style={{position:"absolute",top:2,left:useGps?18:2,width:16,height:16,borderRadius:8,background:useGps?"var(--ink)":"var(--m4)",transition:"left 0.2s"}}/>
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
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m5)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Reading in</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--accent)",letterSpacing:"0.1em"}}>{bibleVersion}</span>
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
            <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:8,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:activeSession.geoLabel?10:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--m2)",fontSize:13}}>
                  <ClockIcon/><span>{formatTime(activeSession.startTime)}</span>
                  <span className="pulse" style={{color:"var(--accent)",fontSize:10}}>●</span>
                  <span style={{color:"var(--m1)"}}>{activeMins}m in His Word</span>
                </div>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{activeSession.locationType}</span>
              </div>
              {activeSession.geoLabel && <div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div>}
            </div>

            <div style={{textAlign:"center",padding:"16px 0 20px"}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>In the Word — {bibleVersion}</p>
              <p style={{fontFamily:"'Crimson Text',serif",fontSize:24,color:"var(--accent)"}}>
                {activeSession.startBook} {activeSession.startChapter}{activeSession.startVerse?`:${activeSession.startVerse}`:""}
              </p>
            </div>

            <div className="card">
              <label className="label" style={{display:"flex",alignItems:"center",gap:6}}><CameraIcon/>Capture the Moment (optional)</label>
              {sessionPhoto ? (
                <>
                  <div className="photo-preview" style={{aspectRatio: photoAspect==="story"?"9 / 16":"1 / 1", width: photoAspect==="story"?"auto":"100%", maxHeight:420, margin:"0 auto"}}>
                    <img src={sessionPhoto} alt="Session" style={{width:"100%",height:"100%",objectFit:"cover",maxHeight:"none",display:"block"}}/>
                    <button className="photo-remove" onClick={()=>{ setSessionPhoto(null); setPhotoAspect("square"); }}>Remove</button>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    {[["square","1:1"],["story","9:16"]].map(([id,lbl])=>(
                      <button key={id} onClick={()=>setPhotoAspect(id)} style={{flex:1,padding:"9px",borderRadius:6,border:photoAspect===id?"1px solid var(--accent)":"1px solid var(--border2)",background:photoAspect===id?"rgba(var(--accent-rgb),0.12)":"transparent",color:photoAspect===id?"var(--accent)":"var(--m4)",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.08em",cursor:"pointer"}}>{lbl}</button>
                    ))}
                  </div>
                  <p style={{fontSize:12,color:"var(--m5)",textAlign:"center",marginTop:6}}>Sets the share format. You can fine-tune it later.</p>
                </>
              ) : (
                <div className="photo-drop" onClick={()=>photoInputRef.current?.click()}>
                  <div style={{color:"var(--m4)"}}><CameraIcon/></div>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m5)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Add a photo</p>
                  <p style={{fontSize:14,color:"var(--border2)"}}>Where you are. Who you're with. What surrounds this time.</p>
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
              <p style={{fontSize:14,color:"var(--m4)",fontStyle:"italic",lineHeight:1.55,marginBottom:8,overflowWrap:"break-word"}}>What you noticed. What you're carrying out. What you want to hold onto.</p>
              <textarea rows={3} placeholder="Write here…" style={{resize:"vertical"}}
                value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
            </div>

            {error && <p style={{color:"#a04030",fontSize:15,marginBottom:12,fontStyle:"italic"}}>{error}</p>}
            {loading ? (
              <div style={{textAlign:"center",padding:"28px 0"}}>
                <p className="pulse" style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--accent)",letterSpacing:"0.18em"}}>READING HIS WORD...</p>
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
                <img src={activeSession.photoData} alt="" style={{width:"100%",aspectRatio:"1 / 1",objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 45%,rgba(14,12,6,0.9) 100%)"}}/>
                <div style={{position:"absolute",bottom:14,left:16,right:16}}>
                  <p style={{fontFamily:"'Crimson Text',serif",fontSize:19,color:"var(--accent)",marginBottom:6}}>{activeSession.passage}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",alignItems:"center"}}>
                    {activeSession.geoLabel && <div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div>}
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m3b)",letterSpacing:"0.08em"}}>
                      {elapsed(activeSession.startTime,activeSession.endTime)} · {activeSession.locationType}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{background:"linear-gradient(160deg,var(--input2),var(--ink))",border:"1px solid var(--border2)",borderRadius:8,padding:"18px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Session Complete</p>
                    <p style={{fontFamily:"'Crimson Text',serif",fontSize:20,color:"var(--accent)",lineHeight:1.3}}>{activeSession.passage}</p>
                  </div>
                  <div style={{textAlign:"right",fontSize:12,color:"var(--m4)",flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end",marginBottom:5}}><ClockIcon/>{elapsed(activeSession.startTime,activeSession.readingEndTime||activeSession.endTime)} reading</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase"}}>{activeSession.locationType}</div>
                  </div>
                </div>
                {activeSession.geoLabel && <div style={{marginTop:10}}><div className="geo-badge"><PinIcon/>{activeSession.geoLabel}</div></div>}
              </div>
            )}

            {/* GROUND — context, deeper */}
            {result.context && (
              <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderLeft:"3px solid var(--m5)",borderRadius:6,padding:"16px 18px",marginBottom:14}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:8}}>Ground</p>
                <p style={{fontSize:16,lineHeight:1.78,color:"var(--m2)"}}>{result.context}</p>
              </div>
            )}

            {/* SUMMARY — not italic, not scripture */}
            {result.summary && (
              <div style={{borderLeft:"2px solid rgba(var(--accent-rgb),0.5)",paddingLeft:16,marginBottom:20}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m4)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:7}}>In One Sentence</p>
                <p style={{color:"var(--m1)",fontSize:18,lineHeight:1.6}}>{result.summary}</p>
              </div>
            )}

            {/* SAVE / SHARE — prominent, visible on first open, anchored by scripture */}
            <div style={{marginBottom:20}}>
              <button className="btn-export" style={{marginBottom:8}} onClick={()=>setExportSession(activeSession)}>
                <ShareIcon/> Save or Share This Session
              </button>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m5)",textAlign:"center",lineHeight:1.5}}>
                "Let the redeemed of the Lord tell their story." — Psalm 107:2
              </p>
            </div>

            {/* QUESTIONS — fillable with answer feedback */}
            <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,marginBottom:14,overflow:"hidden"}}>
              <div className="section-head" style={{padding:"14px 18px"}} onClick={()=>setOpenSection(s=>({...s,q:!s.q}))}>
                <div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"var(--accent)",textTransform:"uppercase"}}>Questions from the Text</span>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:13,color:"var(--m5)",marginTop:3}}>Tap a question to write your answer. Then submit.</p>
                </div>
                <ChevronIcon open={openSection.q}/>
              </div>
              {openSection.q && (
                <div style={{borderTop:"1px solid var(--border2)",padding:"14px 18px 18px"}}>
                  {result.questions?.map((q,i)=>(
                    <div key={i} style={{marginBottom:20,paddingBottom:20,borderBottom:i<result.questions.length-1?"1px solid var(--border2)":"none"}}>
                      <div style={{display:"flex",gap:14,marginBottom:10,alignItems:"flex-start"}}>
                        <div style={{flexShrink:0,width:28,height:28,borderRadius:14,background:"rgba(var(--accent-rgb),0.08)",border:"1px solid rgba(var(--accent-rgb),0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m2)",fontWeight:600}}>{i+1}</span>
                        </div>
                        <p style={{fontSize:17,lineHeight:1.7,color:"var(--text4)",paddingTop:4}}>{q}</p>
                      </div>
                      <AnswerInput
                        value={questionAnswers[i]||""}
                        onTouch={()=>{ const t=Date.now(); if(questionStamps.current[i]==null) questionStamps.current[i]=t; if(firstAnswerAt.current==null) firstAnswerAt.current=t; }}
                        onChange={val=>{ if(firstAnswerAt.current==null && val && val.trim()) firstAnswerAt.current = Date.now(); setQuestionAnswers(prev=>({...prev,[i]:val})); }}
                        feedback={answerFeedback[i]}
                      />
                    </div>
                  ))}
                  {!feedbackSubmitted ? (
                    <button onClick={submitAnswers}
                      disabled={feedbackLoading||!Object.values(questionAnswers).some(a=>a&&a.trim().length>0)}
                      style={{width:"100%",padding:"12px",background:"rgba(var(--accent-rgb),0.08)",border:"1px solid rgba(var(--accent-rgb),0.3)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s",opacity:feedbackLoading||!Object.values(questionAnswers).some(a=>a&&a.trim().length>0)?0.4:1}}>
                      {feedbackLoading ? "Reading your answers..." : "Submit Answers"}
                    </button>
                  ) : (
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m5)",letterSpacing:"0.1em",textAlign:"center",textTransform:"uppercase"}}>Answers submitted</p>
                  )}
                </div>
              )}
            </div>

            {/* FIELD NOTES — informational, grounded */}
            <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,marginBottom:14,overflow:"hidden"}}>
              <div className="section-head" style={{padding:"14px 18px"}} onClick={()=>setOpenSection(s=>({...s,n:!s.n}))}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"var(--accent)",textTransform:"uppercase"}}>Field Notes</span>
                <ChevronIcon open={openSection.n}/>
              </div>
              {openSection.n && (
                <div style={{borderTop:"1px solid var(--border2)",padding:"14px 18px 18px"}}>
                  {result.notes?.map((n,i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
                      <span style={{color:"rgba(var(--accent-rgb),0.4)",fontSize:18,minWidth:10,paddingTop:1,lineHeight:1}}>—</span>
                      <p style={{fontSize:17,lineHeight:1.7,color:"var(--text3)"}}>{n}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RETURN VERSES — sent back, directive */}
            <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,marginBottom:14,overflow:"hidden"}}>
              <div className="section-head" style={{padding:"14px 18px"}} onClick={()=>setOpenSection(s=>({...s,v:!s.v}))}>
                <div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.14em",color:"var(--accent)",textTransform:"uppercase"}}>Come Back To</span>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:13,color:"var(--m5)",marginTop:3}}>Not comfort. A command to return.</p>
                </div>
                <ChevronIcon open={openSection.v}/>
              </div>
              {openSection.v && (
                <div style={{borderTop:"1px solid var(--border2)"}}>
                  {result.returnVerses?.map((v,i)=>(
                    <div key={i} style={{padding:"16px 18px",borderBottom:i<result.returnVerses.length-1?"1px solid var(--border2)":"none"}}>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"var(--accent)",letterSpacing:"0.04em",marginBottom:8}}>{v.ref}</p>
                      <p style={{fontSize:16,color:"var(--m2)",lineHeight:1.6,fontStyle:"italic"}}>{v.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeSession.personalNotes && (
              <div className="card" style={{borderColor:"var(--border2)",marginBottom:14}}>
                <p className="label">Your Notes</p>
                <p style={{fontSize:17,lineHeight:1.65,color:"var(--m2)",fontStyle:"italic"}}>{activeSession.personalNotes}</p>
              </div>
            )}

            <button className="btn-primary" onClick={()=>{ resetForm(); setView("home"); }}>Close Session</button>
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {view === "history" && (
          <div className="fade-in" style={{overflowAnchor:"none"}}>
            <SessionCalendar sessions={visibleSessions} onDaySelect={handleCalendarDay} alarms={alarms} onSaveAlarm={handleSaveAlarm} onFilterChange={setFilterDate} activeDate={filterDate}/>
            {visibleSessions.length === 0 ? (
              <>
                <div style={{textAlign:"center",padding:"12px 0 18px"}}>
                  <div style={{color:"var(--border2)",marginBottom:10,display:"flex",justifyContent:"center"}}><BookIcon/></div>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--border2)",letterSpacing:"0.14em"}}>NO SESSIONS LOGGED YET</p>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m4)",marginTop:8}}>Tap today or a day ahead to set a reminder.</p>
                </div>
                <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",marginBottom:10}}>
                  <EmptyDayPanel date={filterDate || (()=>{const d=new Date();d.setHours(0,0,0,0);return d;})()} alarms={alarms} onSaveAlarm={handleSaveAlarm} suppressPast/>
                </div>
              </>
            ) : (() => {
              const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
              const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
              const activeFd = filterDate || (() => { const d=new Date(); d.setHours(0,0,0,0); return d; })();
              const filteredSessions = visibleSessions.filter(s => { const d=new Date(s.startTime); return d.getFullYear()===activeFd.getFullYear()&&d.getMonth()===activeFd.getMonth()&&d.getDate()===activeFd.getDate(); });
              return (
              <>
                {/* Global strip — always visible, always total */}
                <StatsStrip sessions={visibleSessions}/>
                {/* Filter bar — permanent, always visible */}
                {(() => {
                  const fd = filterDate || (() => { const d=new Date(); d.setHours(0,0,0,0); return d; })();
                  const isToday = (() => { const t=new Date(); t.setHours(0,0,0,0); return fd.getTime()===t.getTime(); })();
                  // Sorted unique session dates
                  const sessionDates = [...new Set(visibleSessions.map(s => { const d=new Date(s.startTime); d.setHours(0,0,0,0); return d.getTime(); }))].sort((a,b)=>a-b);
                  const curTime = fd.getTime();
                  const prevTime = sessionDates.filter(t=>t<curTime).slice(-1)[0];
                  const nextTime = sessionDates.filter(t=>t>curTime)[0];
                  const NavBtn = ({onClick,disabled,children}) => (
                    <button onClick={onClick} disabled={disabled} style={{background:"transparent",border:"none",color:disabled?"var(--border)":"var(--m2)",fontFamily:"'Cinzel',serif",fontSize:16,cursor:disabled?"default":"pointer",padding:"0 6px",lineHeight:1,transition:"color 0.2s"}}
                      onMouseOver={e=>{ if(!disabled) e.currentTarget.style.color="var(--accent)"; }}
                      onMouseOut={e=>{ if(!disabled) e.currentTarget.style.color="var(--m2)"; }}>
                      {children}
                    </button>
                  );
                  return (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"7px 10px",background:"rgba(var(--accent-rgb),0.06)",border:"1px solid rgba(var(--accent-rgb),0.15)",borderRadius:5}}>
                      <NavBtn onClick={()=>{ const d=new Date(prevTime); d.setHours(0,0,0,0); setFilterDate(d); }} disabled={!prevTime}>‹</NavBtn>
                      <div style={{textAlign:"center",flex:1}}>
                        <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--accent)",letterSpacing:"0.12em",textTransform:"uppercase"}}>
                          {dayNames[fd.getDay()]}, {months[fd.getMonth()]} {fd.getDate()}
                        </p>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <NavBtn onClick={()=>{ const d=new Date(nextTime); d.setHours(0,0,0,0); setFilterDate(d); }} disabled={!nextTime}>›</NavBtn>
                        {!isToday && (
                          <button onClick={()=>{ const d=new Date(); d.setHours(0,0,0,0); setFilterDate(d); }} style={{background:"transparent",border:"1px solid rgba(var(--accent-rgb),0.25)",borderRadius:3,padding:"2px 8px",fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginLeft:4}}>Today</button>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {/* Empty day keeps a box; sessions render as separate floating cards so the page background shows in the gaps */}
                {filteredSessions.length === 0 ? (
                  <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",marginBottom:10}}>
                    <EmptyDayPanel date={activeFd} alarms={alarms} onSaveAlarm={handleSaveAlarm}/>
                  </div>
                ) : (
                      filteredSessions.map(s=>(
                  <div key={s.id} className="hist-card" ref={el=>{ if(el) sessionRefs.current[s.id]=el; }}>
                    {s.photoData && (
                      <div onClick={(e)=>{e.stopPropagation();setLightItem(pickReadingItem(s));setPhotoView(s);}} style={{height:90,overflow:"hidden",position:"relative",cursor:"pointer"}}>
                        <img src={s.photoData} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.65}}/>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(14,12,6,0.85))"}}/>
                        <div style={{position:"absolute",bottom:8,right:10,display:"flex",alignItems:"center",gap:5,fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--accent)"}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>
                          View
                        </div>
                      </div>
                    )}
                    <div className="hist-head" onClick={()=>toggleSession(s.id)}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontFamily:"'Crimson Text',serif",fontSize:18,color:"var(--accent)",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.passage}</p>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 14px",color:"var(--m4)",fontSize:12,alignItems:"center"}}>
                          <span style={{display:"flex",alignItems:"center",gap:3}}><ClockIcon/>{formatDate(s.startTime)}</span>
                          <span>{elapsed(s.startTime,s.readingEndTime||s.endTime)} reading</span>
                          {s.geoLabel && <span style={{display:"flex",alignItems:"center",gap:3}}><PinIcon/>{s.geoLabel}</span>}
                          {s.bibleVersion && <span style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m5)",letterSpacing:"0.08em"}}>{s.bibleVersion}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginLeft:8,flexShrink:0}}>
                        <button className="btn-danger" aria-label="Delete session" onClick={e=>{e.stopPropagation();deleteSession(s.id);}} style={{padding:0,width:29,height:29,display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid #b5302f",background:"rgba(181,48,47,0.10)",color:"#b5302f",borderRadius:6,boxSizing:"border-box",lineHeight:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b5302f" strokeWidth="2.6" strokeLinecap="round" style={{display:"block"}}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
                        <ChevronIcon open={expandedSession===s.id} size={24}/>
                      </div>
                    </div>
                    {expandedSession===s.id && s.aiResult && (
                      <div style={{padding:"0 16px 16px",borderTop:"1px solid var(--border)"}}>
                        {s.aiResult.context && (
                          <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderLeft:"3px solid var(--m5)",borderRadius:6,padding:"12px 14px",margin:"12px 0 10px"}}>
                            <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m4)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>Ground</p>
                            <p style={{fontSize:14,lineHeight:1.7,color:"var(--m2)"}}>{s.aiResult.context}</p>
                          </div>
                        )}
                        {s.aiResult.summary && (
                          <div style={{borderLeft:"2px solid rgba(var(--accent-rgb),0.4)",paddingLeft:12,margin:"10px 0"}}>
                            <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>In One Sentence</p>
                            <p style={{fontStyle:"italic",color:"var(--m1)",fontSize:15,lineHeight:1.55}}>{s.aiResult.summary}</p>
                          </div>
                        )}
                        <hr className="divider"/>
                        <p className="label">Questions from the Text</p>
                        {s.aiResult.questions?.map((q,i)=>(
                          <div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:i<s.aiResult.questions.length-1?"1px solid var(--border2)":"none"}}>
                            <p style={{fontSize:15,color:"var(--text4)",lineHeight:1.6,marginBottom:6}}>{q}</p>
                            {s.questionAnswers?.[i] && (
                              <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:5,padding:"8px 12px",marginBottom:s.answerFeedback?.[i]?6:0}}>
                                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m5)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Your Answer</p>
                                <p style={{fontSize:14,color:"var(--m1b)",lineHeight:1.6,fontStyle:"italic"}}>{s.questionAnswers[i]}</p>
                              </div>
                            )}
                            {s.answerFeedback?.[i] && (
                              <div style={{background:"rgba(var(--accent-rgb),0.04)",border:"1px solid rgba(var(--accent-rgb),0.12)",borderRadius:5,padding:"8px 12px"}}>
                                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Response</p>
                                <p style={{fontSize:14,color:"var(--m1b)",lineHeight:1.6}}>{s.answerFeedback[i]}</p>
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
                                <span style={{color:"rgba(var(--accent-rgb),0.4)",fontSize:16,lineHeight:1}}>*</span>
                                <p style={{fontSize:14,lineHeight:1.65,color:"var(--text3)"}}>{n}</p>
                              </div>
                            ))}
                          </>
                        )}
                        <hr className="divider"/>
                        <p className="label">Come Back To</p>
                        {s.aiResult.returnVerses?.map((v,i)=>(
                          <div key={i} style={{marginBottom:10,paddingLeft:10,borderLeft:"2px solid var(--border2)"}}>
                            <p style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"var(--accent)",marginBottom:4}}>{v.ref}</p>
                            <p style={{color:"var(--m2)",fontSize:13,fontStyle:"italic",lineHeight:1.55}}>{v.reason}</p>
                          </div>
                        ))}
                        {s.personalNotes && (<><hr className="divider"/><p className="label">Your Notes</p><p style={{fontStyle:"italic",color:"var(--m3)",fontSize:14,lineHeight:1.55}}>{s.personalNotes}</p></>)}
                        <hr className="divider"/>
                        <button className="btn-export" style={{fontSize:10,padding:"9px 16px"}} onClick={()=>setExportSession(s)}>
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
        {view === "about" && <AboutScreen onBack={()=>setView("home")} onFaith={()=>setFaithOpen(true)}/>}

        {/* ══ SETTINGS ══ */}
        {view === "settings" && (
          <div className="fade-in">
            <button onClick={()=>setView("home")} style={{background:"transparent",border:"none",color:"var(--m2)",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6,padding:0}}>
              ← Back
            </button>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"var(--m5)",textAlign:"center",marginBottom:16,lineHeight:1.5}}>
              Set these once. Come back when something changes.
            </p>
            <div className="card" style={{textAlign:"center",paddingTop:28,paddingBottom:28}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
                <CrossIcon size={32} glow={false}/>
              </div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,letterSpacing:"0.1em",color:SELAH_CREAM,marginBottom:6}}>SELAH</h2>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",color:"var(--m4)",fontSize:14,marginBottom:14}}>Read. Mark. Return.</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(var(--accent-rgb),0.5)",letterSpacing:"0.2em",textTransform:"uppercase"}}>MIDNIGHT MINISTRIES</p>
            </div>

            {/* Account */}
            <div className="card">
              <p className="label">Account</p>
              {account ? (
                <>
                  <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6,marginBottom:6}}>Signed in as</p>
                  <p style={{fontFamily:"'Crimson Text',serif",fontSize:18,color:"var(--accent)",marginBottom:12,wordBreak:"break-all"}}>{account.email}</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,color:syncState==="error"?"#d98a8a":"var(--m4)"}}>
                    {syncState==="saving" ? "Syncing…" : syncState==="error" ? "Sync failed — will retry" : "Log and settings synced"}
                  </p>
                  <button className="btn-ghost" style={{width:"100%",padding:"12px"}} onClick={handleSignOut}>Sign Out</button>
                  <p style={{fontFamily:"'Crimson Text',serif",fontSize:13,color:"var(--m4)",textAlign:"center",marginTop:10,lineHeight:1.5}}>Signing out leaves your log on this device. It stays safe in your account.</p>
                </>
              ) : (
                <>
                  <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>
                    Create an account to carry your log and content settings across every device. Brightness and text size stay set per device.
                  </p>
                  <button className="btn-primary" style={{width:"100%",padding:"13px",marginBottom:10}} onClick={()=>{ setAuthIntro(false); setView("auth"); }}>Create Account or Sign In</button>
                </>
              )}
              <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>What syncs, what stays</p>
                <p style={{fontSize:15,color:"var(--m2)",lineHeight:1.65,marginBottom:8}}>
                  An account exists for one reason: so your reading carries across your devices. It stores your reading log (passages, notes, questions, answers, return verses, times), your reading position, and your content settings — translation, age group, birthday, gender, reminders, clock and time zone.
                </p>
                <p style={{fontSize:15,color:"var(--m2)",lineHeight:1.65}}>
                  Your photos and GPS location never leave this device. Brightness and text size are set per device, so each screen reads right in its own light. Nothing is sold, shared, or used for anything but syncing your account.
                </p>
              </div>
            </div>

            {/* Bible Version */}
            <div className="card">
              <p className="label">Bible Translation</p>
              <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>
                {isKidAge
                  ? "These are easy-to-read translations made for young readers. Questions and field notes are calibrated to a child's reading level."
                  : "Select the translation you read in. Questions and field notes are calibrated to your version's language."}
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {BIBLE_VERSIONS.map(v=>(
                  <button key={v} className={`version-pill ${bibleVersion===v?"active":""}`}
                    onClick={()=>setBibleVersion(v)}>{v}</button>
                ))}
              </div>
              {isKidAge && (
                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m5)",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:10,lineHeight:1.6}}>
                  Kids set selected. Switch your age group above to see the full translation list.
                </p>
              )}
              {!isKidAge && bibleVersion==="NIV" && (
                <div style={{marginTop:12,background:"rgba(var(--accent-rgb),0.05)",border:"1px solid rgba(var(--accent-rgb),0.18)",borderLeft:"3px solid var(--accent)",borderRadius:6,padding:"11px 14px"}}>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--accent)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>A Note on the NIV</p>
                  <p style={{fontFamily:"'Crimson Text',serif",fontSize:14,color:"var(--m1)",lineHeight:1.6}}><Selah /> follows the classic NIV wording. It is not calibrated to the 2011 revision and its gender-language changes.</p>
                </div>
              )}
            </div>

            {/* Gender + Age + Time */}
            <div className="card">
              <p className="label">I Am</p>
              <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>
                The model adjusts language and examples to meet you where you are. His Word does not change.
              </p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Gender</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                {["Male","Female","Prefer not to say"].map(g=>(
                  <button key={g} className={`version-pill ${gender===g?"active":""}`}
                    onClick={()=>setGender(g)}>{g}</button>
                ))}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Age</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Kids (5-12)","Teen (13-17)","Adult (18+)","Prefer not to say"].map(a=>(
                  <button key={a} className={`version-pill ${age===a?"active":""}`}
                    onClick={()=>{
                      setAge(a);
                      if (a.startsWith("Kids") && !["NIrV","ICB","NLT"].includes(bibleVersion)) setBibleVersion("NIrV");
                    }}>{a}</button>
                ))}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",margin:"16px 0 8px"}}>Birthday</p>
              <input type="date" onClick={e=>{try{e.target.showPicker&&e.target.showPicker();}catch(_){}}} value={birthday} onChange={e=>setBirthday(e.target.value)}
                style={{width:"100%",maxWidth:"100%",minWidth:0,display:"block",boxSizing:"border-box",background:"var(--input2)",border:"1px solid var(--border)",borderRadius:6,padding:"11px 14px",color:"var(--text)",fontFamily:"'Crimson Text',serif",fontSize:16,outline:"none",colorScheme:"dark",WebkitAppearance:"none",appearance:"none"}}/>
            </div>

            {/* Profiles launcher */}
            {account && (
              <div className="card">
                <p className="label">Profiles</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Who is Reading</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:16}}>
                  {Object.entries(profiles).map(([id,p])=>{
                    const pic=(id===activeProfileId?profileIcon:((profileSnaps.current[id]||{}).profileIcon))||"default";
                    return (
                      <button key={id} onClick={()=>requestSwitch(id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,width:64,padding:0}}>
                        <div style={{width:54,height:54,borderRadius:12,overflow:"hidden",border:activeProfileId===id?"2px solid var(--accent)":"2px solid var(--border)",boxShadow:activeProfileId===id?"0 0 10px rgba(var(--accent-rgb),0.3)":"none"}}>
                          <img src={(ICON_THEMES[pic]||ICON_THEMES.default).thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                        </div>
                        <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.04em",color:activeProfileId===id?"var(--accent)":"var(--m2)",textAlign:"center"}}>{p.name||(p.kid?"Child":"You")}</span>
                      </button>
                    );
                  })}
                </div>
                <button className="btn-primary" style={{width:"100%",padding:"13px"}} onClick={()=>setView("profiles")}>Open Profiles</button>
              </div>
            )}

            {/* Clock and Timezone */}
            <div className="card">
              <p className="label">Time Display</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Clock Format</p>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {[["12","12-Hour (2:30 PM)"],["24","24-Hour (14:30)"]].map(([val,label])=>(
                  <button key={val} className={`version-pill ${clockFmt===val?"active":""}`}
                    onClick={()=>setClockFmt(val)} style={{flex:1}}>{label}</button>
                ))}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Time Zone</p>
              <p style={{fontSize:13,color:"var(--m5)",marginBottom:10,lineHeight:1.5}}>
                If your device drifts near state borders (Yuma area, AZ near CA), set manually.
              </p>
              <TimezoneDropdown timezone={timezone} setTimezone={setTimezone}/>
            </div>

            {/* Visuals */}
            <div className="card">
              <button onClick={()=>setVisualsOpen(o=>!o)} style={{width:"100%",background:"transparent",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:visualsOpen?14:0}}>
                <span className="label" style={{marginBottom:0}}>Visuals</span>
                <span style={{color:"var(--accent)",fontSize:18,transform:visualsOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>⌄</span>
              </button>
              {visualsOpen && (<>
              <p style={{fontSize:15,color:"var(--m3)",lineHeight:1.6,marginBottom:14}}>
                Make it yours. The Word does not change; the look can.
              </p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>App Icon</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:12}}>
                {Object.entries(ICON_THEMES).map(([key,t])=>(
                  <button key={key} onClick={()=>setAppIcon(key)}
                    style={{background:"transparent",border:"none",padding:0,cursor:"pointer",textAlign:"center",width:64}}>
                    <div style={{width:64,height:64,borderRadius:14,overflow:"hidden",border:appIcon===key?"2px solid var(--accent)":"2px solid var(--border)",boxShadow:appIcon===key?"0 0 14px rgba(var(--accent-rgb),0.35)":"none",transition:"all 0.2s"}}>
                      <img src={t.thumb} alt={t.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                    </div>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:"0.06em",textTransform:"uppercase",marginTop:6,color:appIcon===key?"var(--accent)":"var(--m3)"}}>{t.label}</p>
                  </button>
                ))}
              </div>
              <div style={{background:"rgba(var(--accent-rgb),0.05)",border:"1px solid rgba(var(--accent-rgb),0.16)",borderRadius:6,padding:"11px 14px"}}>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:14,color:"var(--m1)",lineHeight:1.6}}>
                  On a computer the browser tab updates right away. On iPhone or iPad, pick your icon first, then add <Selah /> to your home screen and it carries that icon. Samsung and other Android phones currently only show the default icon. We are building the piece that lets the installed app override that, and it is coming.
                </p>
              </div>

              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",margin:"20px 0 10px"}}>Color Palette</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {Object.entries(PALETTES).map(([key,p])=>(
                  <button key={key} onClick={()=>setPalette(key)}
                    style={{display:"flex",alignItems:"center",gap:12,background:"transparent",border:palette===key?"1px solid var(--accent)":"1px solid var(--border)",borderRadius:8,padding:"10px 12px",cursor:"pointer",transition:"border-color 0.2s"}}>
                    <div style={{display:"flex",gap:0,borderRadius:6,overflow:"hidden",border:"1px solid var(--border2)",flexShrink:0}}>
                      {p.swatch.map((c,i)=>(<div key={i} style={{width:20,height:28,background:c}}/>))}
                    </div>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"0.06em",color:palette===key?"var(--accent)":"var(--m2)",flex:1,textAlign:"left"}}>{p.label}</span>
                    {palette===key && <span style={{color:"var(--accent)",fontSize:14}}>✓</span>}
                  </button>
                ))}
              </div>
              </>)}
            </div>

            {/* Support the Ministry */}
            <div className="card" style={{borderColor:"rgba(var(--accent-rgb),0.2)"}}>
              <p className="label">Support the Ministry</p>
              <p style={{fontSize:16,lineHeight:1.7,color:"var(--m2)",marginBottom:14}}>
                <Selah /> is free. It will stay free. If it has been useful to you and you want to invest in what is being built, this is how.
              </p>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"var(--m3)",marginBottom:16,lineHeight:1.65,borderLeft:"2px solid var(--border2)",paddingLeft:12}}>
                Sixty percent of every dollar given goes directly to the local church. Forty percent funds the tools this ministry was handed to build. When you give, you receive a receipt automatically. Every 30 days Midnight Ministries publishes what came in, what went out, and where it went. That is not a policy. That is a commitment.
              </p>
              <a href="https://donate.midnightministries.com" target="_blank" rel="noopener noreferrer"
                style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  background:"linear-gradient(135deg,var(--accent),var(--accent2))",
                  color:"var(--ink)",borderRadius:5,padding:"13px 20px",
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
              <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--border2)",textAlign:"center",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:10}}>
                URL updates when donation link is live
              </p>
            </div>

            <div className="card">
              <p className="label">Privacy</p>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{color:"var(--accent)",marginTop:2,flexShrink:0}}><ShieldIcon/></div>
                <p style={{fontSize:16,lineHeight:1.65,color:"var(--m2)"}}>Photos and GPS location stay on this device and are never uploaded. With an account, your reading log and content settings sync so you can pick up on any device; without one, nothing leaves this device. Share cards are generated locally and only leave when you choose to send them.</p>
              </div>
            </div>
            <div className="card">
              <p className="label">Storage</p>
              <p style={{fontSize:16,lineHeight:1.65,color:"var(--m2)",marginBottom:14}}>All sessions including photos are saved in your browser. Clearing browser data removes your log. Export to Notes or Files for permanent records.</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m4)",letterSpacing:"0.08em"}}>
                {visibleSessions.length} session{visibleSessions.length!==1?"s":""} — {visibleSessions.filter(s=>s.photoData).length} with photos
              </p>
            </div>

            {/* Depth level */}
            {visibleSessions.length > 0 && (()=>{
              const d = getDepthLevel(visibleSessions, isKidAge);
              const totalMins = visibleSessions.reduce((a,s)=>a+Math.round((new Date(s.endTime)-new Date(s.startTime))/60000),0);
              const levels = isKidAge ? ["Spark","Ember","Flame","Torch","Wildfire"] : ["Seed","Root","Branch","Fruit","Harvest"];
              const nextLine = d.level >= 5
                ? `You have reached ${d.name}, the deepest level. Keep gathering. The standard does not drop.`
                : `This is where you are now, not a finish line. Growth comes at your own pace; the questions and notes deepen as you go, never softer.`;
              return (
                <div className="card">
                  <p className="label">Depth Level</p>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:28,color:"var(--accent)",fontWeight:700,lineHeight:1}}>{d.level}</p>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:3}}>of 5</p>
                    </div>
                    <div>
                      <p style={{fontFamily:"'Cinzel',serif",fontSize:15,color:"var(--accent)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{d.name}</p>
                      <p style={{fontFamily:"'Crimson Text',serif",fontSize:14,color:"var(--m3)"}}>{visibleSessions.length} sessions · {totalMins < 60 ? totalMins+"m" : Math.floor(totalMins/60)+"h"} in His Word</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {levels.map((l,i)=>(
                      <div key={l} style={{flex:1,textAlign:"center"}}>
                        <div style={{height:5,borderRadius:3,background:i<d.level?"var(--accent)":"var(--border)",transition:"background 0.3s"}}/>
                        <span style={{display:"block",marginTop:5,fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:"0.03em",textTransform:"uppercase",color:i===d.level-1?"var(--accent)":"var(--m5)",fontWeight:i===d.level-1?700:400}}>{l}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m4)",marginTop:12,lineHeight:1.5}}>
                    {nextLine}
                  </p>
                </div>
              );
            })()}
            <div className="card">
              <p className="label">Clear All Data</p>
              <p style={{fontSize:15,color:"var(--m3)",marginBottom:14,lineHeight:1.5}}>Removes every session from this device. Cannot be undone.</p>
              <button className="btn-danger" style={{width:"100%",padding:"12px"}}
                onClick={()=>{ if(window.confirm("Delete all sessions for this profile? This cannot be undone.")) { setSessions(prev=>{const n=prev.filter(s=>(s.profileId||"owner")!==activeProfileId); saveSessions(n); return n;}); }}}>
                Clear All Sessions
              </button>
            </div>
            <div className="card" style={{textAlign:"center",paddingTop:20,paddingBottom:20}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Contact Midnight Ministries</p>
              <a href="mailto:midnightministries.co@gmail.com" style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"var(--accent)",textDecoration:"none",letterSpacing:"0.04em"}}>midnightministries.co@gmail.com</a>
              <p style={{fontSize:14,color:"var(--m3)",lineHeight:1.6,marginTop:14,overflowWrap:"break-word"}}><Selah /> is new. If something looks broken, glitches, or does not work right, email us. We want to know. We would rather hear it from you now and fix it than let it stand. Tell us the device you are on and what happened.</p>
            </div>
            <div style={{textAlign:"center",paddingTop:8}}>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--border2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Psalm 46:10</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--border2)",letterSpacing:"0.12em",textTransform:"uppercase",marginTop:8}}>Build {BUILD}</p>
            </div>
          </div>
        )}

        </div>{/* end display layer */}
      </div>

      <MMFooter onEggOpen={setEggOpen} onHomeView={view==="home"}/>
      {exportSession && <ExportSheet session={exportSession} onClose={()=>setExportSession(null)}/>}

      {/* ══ PHOTO LIGHTBOX ══ */}
      {showTop && (<>
        {/* Calendar/date — quick jump back to the Log where you were; faint calendar behind the day number */}
        <button onClick={gotoLog} aria-label="Go to log calendar" style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom, 0px) + 126px)",right:13,zIndex:110,background:"rgba(var(--surface-rgb),0.6)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1.5px solid var(--accent)",borderRadius:"50%",width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.5)",opacity:0.85,padding:0}}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,calc(-50% - 2px))",opacity:0.12}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
          <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,lineHeight:1}}>{new Date().getDate()}</span>
        </button>
        {/* Back to top */}
        <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top" style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom, 0px) + 52px)",right:13,zIndex:110,background:"rgba(var(--surface-rgb),0.6)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1.5px solid var(--accent)",borderRadius:"50%",width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.5)",opacity:0.85,padding:0}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
      </>)}

      {showBright && (
        <DisplayControls
          layerRef={displayRef}
          brightness={brightness}
          textScale={textScale}
          baseScale={tabletScale}
          onCommit={(bv,tv)=>{ setBrightness(bv); setTextScale(tv); }}
          onClose={()=>setShowBright(false)}
        />
      )}

      {/* ══ FIRST-TIME SETUP (floating over New Session) ══ */}
      {/* ══ PROFILE LOCK PROMPT ══ */}
      {lockPrompt && (
        <div style={{position:"fixed",inset:0,zIndex:460,background:"rgba(6,5,2,0.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{width:"100%",maxWidth:340,textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><CrossIcon size={30}/></div>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:"0.1em",color:SELAH_CREAM,marginBottom:6}}>Enter Passcode</p>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"var(--m3)",marginBottom:16}}>to switch into {profiles[lockPrompt]?.name || "this profile"}</p>
            <div style={{marginBottom:lockErr?8:16}}>
              <PinBoxes value={lockEntry} autoFocus onChange={(v)=>{ setLockEntry(v); setLockErr(""); if(v.length===6){ if(v===passcode){ switchProfile(lockPrompt); setLockPrompt(null); setLockEntry(""); } else { setLockErr("Incorrect code."); setLockEntry(""); } } }}/>
            </div>
            {lockErr && <p style={{color:"#d98a8a",fontSize:14,marginBottom:12}}>{lockErr}</p>}
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" style={{flex:1,padding:"12px"}} onClick={()=>{ setLockPrompt(null); setLockEntry(""); setLockErr(""); }}>Cancel</button>
              <button className="btn-primary" style={{flex:1,padding:"12px"}} onClick={()=>{ if(lockEntry===passcode){ switchProfile(lockPrompt); setLockPrompt(null); setLockEntry(""); } else setLockErr("Incorrect code."); }}>Unlock</button>
            </div>
          </div>
        </div>
      )}

      {removeId && (
        <div style={{position:"fixed",inset:0,zIndex:460,background:"rgba(6,5,2,0.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{width:"100%",maxWidth:340,textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><CrossIcon size={30}/></div>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:"0.1em",color:SELAH_CREAM,marginBottom:6}}>Enter Passcode</p>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"var(--m3)",marginBottom:16}}>to remove {profiles[removeId]?.name || "this reader"} and all of their sessions</p>
            <div style={{marginBottom:removeErr?8:16}}>
              <PinBoxes value={removeEntry} autoFocus onChange={(v)=>{ setRemoveEntry(v); setRemoveErr(""); if(v.length===6){ if(v===passcode){ const rid=removeId; setRemoveId(null); setRemoveEntry(""); deleteKidProfile(rid); } else { setRemoveErr("Incorrect code."); setRemoveEntry(""); } } }}/>
            </div>
            {removeErr && <p style={{color:"#d98a8a",fontSize:14,marginBottom:12}}>{removeErr}</p>}
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" style={{flex:1,padding:"12px"}} onClick={()=>{ setRemoveId(null); setRemoveEntry(""); setRemoveErr(""); }}>Cancel</button>
              <button className="btn-danger" style={{flex:1,padding:"12px"}} onClick={()=>{ if(removeEntry===passcode){ const rid=removeId; setRemoveId(null); setRemoveEntry(""); deleteKidProfile(rid); } else setRemoveErr("Incorrect code."); }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {needsSetup && (
        <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(6,5,2,0.78)",backdropFilter:"blur(2px)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"calc(env(safe-area-inset-top,0px) + 28px) 16px calc(env(safe-area-inset-bottom,0px) + 28px)",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          <div style={{width:"100%",maxWidth:440}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><CrossIcon size={34} glow={true}/></div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,letterSpacing:"0.1em",color:"var(--text)",marginBottom:6}}>Set the Basics</h2>
              <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--m2)",lineHeight:1.55,maxWidth:360,margin:"0 auto"}}>
                A few quick things so <Selah /> meets you where you are. The model calibrates its language and questions to these. His Word does not change. You can adjust all of it anytime in Settings.
              </p>
            </div>

            <div className="card">
              <p className="label">Bible Translation</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {BIBLE_VERSIONS.map(v=>(
                  <button key={v} className={`version-pill ${bibleVersion===v?"active":""}`} onClick={()=>setBibleVersion(v)}>{v}</button>
                ))}
              </div>
            </div>

            <div className="card">
              <p className="label">I Am</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Age Group</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                {["Kids (5-12)","Teen (13-17)","Adult (18+)","Prefer not to say"].map(a=>(
                  <button key={a} className={`version-pill ${age===a?"active":""}`}
                    onClick={()=>{ setAge(a); if (a.startsWith("Kids") && !["NIrV","ICB","NLT"].includes(bibleVersion)) setBibleVersion("NIrV"); }}>{a}</button>
                ))}
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Birthday</p>
              <input type="date" onClick={e=>{try{e.target.showPicker&&e.target.showPicker();}catch(_){}}} value={birthday} onChange={e=>setBirthday(e.target.value)}
                style={{width:"100%",maxWidth:"100%",minWidth:0,display:"block",boxSizing:"border-box",background:"var(--input2)",border:"1px solid var(--border)",borderRadius:6,padding:"11px 14px",color:"var(--text)",fontFamily:"'Crimson Text',serif",fontSize:16,outline:"none",marginBottom:16,colorScheme:"dark",WebkitAppearance:"none",appearance:"none"}}/>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Gender</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Male","Female","Prefer not to say"].map(g=>(
                  <button key={g} className={`version-pill ${gender===g?"active":""}`} onClick={()=>setGender(g)}>{g}</button>
                ))}
              </div>
            </div>

            <div className="card" style={{borderColor:"rgba(var(--accent-rgb),0.18)"}}>
              <p className="label" style={{color:"var(--accent)"}}>Before You Begin</p>
              <p style={{fontSize:15,color:"var(--m2)",lineHeight:1.65,marginBottom:10}}>
                Take your time in here. Read the passage, sit with it, and answer honestly and fully. This is not a race. The care you bring to it is the care you get back.
              </p>
              <p style={{fontSize:14,color:"var(--m3)",lineHeight:1.6}}>
                What you log — passages, notes, answers, and times — is saved on this device, and carries to your other devices if you made an account. Your photos and location never leave this device, and nothing is sold or shared.
              </p>
            </div>

            <button className="btn-primary" style={{width:"100%",padding:"14px",marginTop:4}} onClick={completeSetup}>Begin</button>
            <p style={{fontFamily:"'Crimson Text',serif",fontSize:13,color:"var(--m4)",textAlign:"center",marginTop:10,lineHeight:1.5}}>You can change any of this later under Settings.</p>
          </div>
        </div>
      )}

      {photoView && (
        <div onClick={()=>setPhotoView(null)} style={{position:"fixed",inset:0,zIndex:450,background:"rgba(6,5,2,0.95)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 18px",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",cursor:"pointer"}}>
          <div style={{width:"100%",maxWidth:440,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <button onClick={()=>setPhotoView(null)} aria-label="Close" style={{position:"fixed",top:"calc(env(safe-area-inset-top, 0px) + 16px)",right:14,zIndex:500,background:"rgba(var(--surface-rgb),0.45)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1.5px solid var(--accent)",borderRadius:"50%",width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",fontSize:22,cursor:"pointer",lineHeight:1,boxShadow:"0 2px 14px rgba(0,0,0,0.55)",padding:0,opacity:0.62}}>×</button>
            <img src={photoView.photoData} alt="" style={{width:"100%",aspectRatio:"1 / 1",objectFit:"cover",borderRadius:10,border:"1px solid var(--border)",display:"block"}}/>
            <p style={{fontFamily:"'Crimson Text',serif",fontSize:20,color:"var(--accent)",textAlign:"center",marginTop:16,marginBottom:4}}>{photoView.passage}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",justifyContent:"center",alignItems:"center",marginBottom:photoView.personalNotes?16:0}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m3b)",letterSpacing:"0.08em",textTransform:"uppercase"}}>{formatDate(photoView.startTime)}</span>
              {photoView.geoLabel && <span style={{display:"flex",alignItems:"center",gap:3,color:"var(--m3b)",fontSize:12}}><PinIcon/>{photoView.geoLabel}</span>}
            </div>
            {lightItem && (
              <div style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderLeft:"3px solid var(--accent)",borderRadius:6,padding:"14px 16px"}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--m4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>{lightItem.label}</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,color:"var(--text3)",lineHeight:1.65}}>{lightItem.text}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ EASTER EGG SHEETS ══ */}
      {faithOpen && (
        <div ref={faithScrollRef} style={{position:"fixed",inset:0,zIndex:420,background:"var(--bg)",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain"}}>
          <button onClick={()=>setFaithOpen(false)} aria-label="Back" style={{position:"fixed",top:"calc(env(safe-area-inset-top, 0px) + 14px)",left:14,zIndex:430,background:"rgba(var(--surface-rgb),0.45)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1.5px solid var(--accent)",borderRadius:"50%",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",cursor:"pointer",boxShadow:"0 2px 14px rgba(0,0,0,0.55)",padding:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{maxWidth:640,margin:"0 auto",padding:"calc(env(safe-area-inset-top, 0px) + 78px) 24px calc(env(safe-area-inset-bottom, 0px) + 40px)"}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--accent)",textAlign:"center",marginBottom:5}}>Hebrews 11</p>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:14,color:"var(--m4)",textAlign:"center",marginBottom:26}}>English Standard Version</p>
            {faithText
              ? <div style={{fontFamily:"'Crimson Text',Georgia,serif",fontSize:18,lineHeight:1.9,color:"var(--text4)",whiteSpace:"pre-wrap"}}>{faithText}</div>
              : <p style={{textAlign:"center",color:"var(--m4)",fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:16,padding:"48px 0"}}>{faithErr || "Loading…"}</p>}
            <p style={{fontSize:11,lineHeight:1.65,color:"var(--m5)",marginTop:34,borderTop:"1px solid var(--border)",paddingTop:16}}>
              Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
            </p>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"0.22em",textTransform:"uppercase",color:CROSS_RED,textAlign:"center",marginTop:22}}>Midnight Ministries</p>
          </div>
          <button onClick={()=>faithScrollRef.current?.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top" style={{position:"fixed",right:14,bottom:"calc(env(safe-area-inset-bottom, 0px) + 18px)",zIndex:430,background:"rgba(var(--surface-rgb),0.45)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1.5px solid var(--accent)",borderRadius:"50%",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.5)",opacity:0.85,padding:0}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
        </div>
      )}

      {eggOpen && (
        <div ref={eggScrollRef} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(8,6,3,0.96)",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"0 14px"}}
          onClick={()=>setEggOpen(null)}>
          <button onClick={()=>setEggOpen(null)} aria-label="Close" style={{position:"fixed",top:"calc(env(safe-area-inset-top, 0px) + 16px)",right:14,zIndex:500,background:"rgba(var(--surface-rgb),0.45)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1.5px solid var(--accent)",borderRadius:"50%",width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",fontSize:22,cursor:"pointer",lineHeight:1,boxShadow:"0 2px 14px rgba(0,0,0,0.55)",padding:0,opacity:0.62}}>×</button>
          <button onClick={(e)=>{e.stopPropagation();eggScrollRef.current?.scrollTo({top:0,behavior:"smooth"});}} aria-label="Back to top" style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom, 0px) + 18px)",right:14,zIndex:500,background:"rgba(var(--surface-rgb),0.45)",backdropFilter:"blur(9px) saturate(1.4)",WebkitBackdropFilter:"blur(9px) saturate(1.4)",border:"1.5px solid var(--accent)",borderRadius:"50%",width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.5)",opacity:0.82,padding:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"26px 22px 32px",width:"100%",maxWidth:480,margin:"58px auto 58px"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:3,background:"var(--border)",borderRadius:2,margin:"0 auto 24px"}}/>

            {eggOpen === "cross" && (
              <>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m2)",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>John 19:30</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:19,color:"var(--accent)",lineHeight:1.6,marginBottom:24,borderLeft:"2px solid rgba(var(--accent-rgb),0.3)",paddingLeft:14}}>
                  "When he had received the drink, Jesus said, 'It is finished.' With that, he bowed his head and gave up his spirit."
                </p>
                {[
                  ["One word in Greek. Tetelestai.", "In the first century this word was stamped on debt certificates when a debt had been paid in full. Not reduced. Not deferred. Not restructured. Cancelled. The creditor could not come back. The obligation was gone."],
                  ["He said it once.", "He did not whisper it. He said it with what breath he had left, which means it cost him something to say it. He chose to spend his last breath on a declaration, not a plea. Not a question. A statement of completion."],
                  ["Everything the Law required, he met.", "Every sin ever committed, he covered. Every wall between man and God, he removed. He did not do most of it. He did not do enough of it. He finished it."],
                  ["The cross is not a symbol.", "It is a receipt. You are not working toward something he left undone. You are standing on something he completed. That changes what prayer is. That changes what failure is. That changes what you owe."],
                ].map(([head, body], i) => (
                  <div key={i} style={{marginBottom:20}}>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--text2)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{head}</p>
                    <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.75}}>{body}</p>
                  </div>
                ))}
                <p style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"var(--text2)",letterSpacing:"0.14em",textTransform:"uppercase",marginTop:28,textAlign:"center"}}>Tetelestai. It is finished. Walk like it.</p>
              </>
            )}

            {eggOpen === "mm" && (
              <>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m2)",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Matthew 3:11</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:18,color:"var(--accent)",lineHeight:1.6,marginBottom:20,borderLeft:"2px solid rgba(var(--accent-rgb),0.3)",paddingLeft:14}}>
                  "I baptize you with water for repentance, but he who is coming after me is mightier than I, whose sandals I am not worthy to carry. He will baptize you with the Holy Spirit and with fire."
                </p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--text2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14}}>Three baptisms. Not one.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:20}}>Most people stop at the first. They get wet, they sign the card, they shake the pastor's hand and go home. They are not wrong. Water is real. Water is the gate. But John said it himself, plainly, with no apology: water is not the end.</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--text2)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Water is the first. It is a declaration.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>Not just to the people watching from the bank. Not just to the pastor lowering you in. The Levitical tradition required living water, running water, water that moved. There is theology in that. What is still cannot cleanse what is dead. The water has to be going somewhere. And so does the man going under.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:20}}>When you go beneath the surface you are making a declaration to every room that exists. To the witnesses standing there in sandals. To the angels watching from above. To the principalities and powers Paul warned us about in Ephesians 6, the ones that have nothing to do with flesh and blood and everything to do with the war that is actually being fought. Your baptism of water is a line drawn in the spiritual realm before it is ever photographed. You are announcing: I am no longer what I was. You are telling the enemy the same thing you are telling your family. It is a burial. Public, declared, witnessed across dimensions.</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--text2)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>The Holy Spirit is the second.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>And here is where precision matters, because this is where the pushback always comes. There are sincere people, pastors who have served for decades, who will tell you the Holy Spirit enters at the moment of salvation. I understand that position. But I believe the full picture is more layered than that, and I believe Scripture bears it out.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>We are not born indwelt. But we are not born alone either.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>The Spirit of God was hovering over the surface of the deep before anything existed. He postures. He orbits. He aligns things in advance of the moment He inhabits them. That is not a lesser work. That is the same God who kept your lungs inflating through seasons you did not deserve to survive, who turned you aside to see certain things and shielded you from others. He was near before He was in. He was assigned before He inhabited.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>But there is a difference between orbiting and indwelling. An enormous one.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>When He comes in, He does not come in quietly. He does not enter with caution or ask for a small corner of the room. The accounts in Acts are not subtle. When the Spirit falls on the Gentiles in Acts 11, nobody in that room needs to ask what just happened. That is not a feeling. That is not an emotional response to a worship song. That is the in-dwelling presence of God himself taking permanent residence in a human being. He becomes your counsel, your correction, your compass. He reorders how you hear, how you read, how you carry pain. Without this baptism you are religious. With it you are alive.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>There was a day, undisclosed, when the door opened.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:20}}>He did not walk in. He flooded. I have lived for some time consumed by that fire. I cannot unsee what I have seen. The Spirit does not come in and leave the furniture where it was. He redefines the room. He measures you differently. And even if a man turns from the flame, the flame does not turn from him. You do not forget what it felt like to be inhabited. You cannot go back to casual Sunday attendance after being branded with that kind of holy presence. You can run from it. You cannot unsee it.</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--text2)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Fire is the third.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:20}}>This is the one most avoid. Fire does not comfort. Fire consumes. It burns what cannot survive the kingdom and refines what can. Every forge season, every loss, every stripping away of what you thought you were, that is fire doing its work. You do not come out of fire the way you went in. What was pretending to be you does not survive it. What He put in you does. The indwelt man is not the same man who walked in. He is the one who was always in there, buried under the old shell, waiting for the fire to finish what baptism started.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:15,color:"var(--m4)",lineHeight:1.7,marginBottom:4,borderLeft:"2px solid rgba(var(--accent-rgb),0.2)",paddingLeft:12}}>"His winnowing fork is in his hand, and he will clear his threshing floor and gather his wheat into the barn, but the chaff he will burn with unquenchable fire."</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--m4)",letterSpacing:"0.1em",marginBottom:20,paddingLeft:12}}>Matthew 3:12</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:20}}>He is not only coming. He is already equipped. The floor is already being prepared. The separation is already in process. And the fire John is describing is the same fire Malachi saw coming from the other direction, the day that sets them ablaze so completely it leaves neither root nor branch. Unquenchable. That is not a word that leaves room for negotiation.</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--text2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14}}>Two persons. Three baptisms. One arc.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>John administers the first. Water. Declaration. The beginning of the sequence. He is the human instrument, humble enough to know exactly where his authority ends. He says it plainly: I am not worthy to carry his sandals. That is not false modesty. That is a man who understands jurisdiction. He can start it. He cannot finish it. The same way a father can put his child in the water and cannot put Christ in his child. You can mark the beginning. Only Christ delivers what comes next.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:12}}>Christ administers the second and the third. Holy Spirit and fire. Different substance. Different weight. Same person receiving, but a different Person delivering.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontSize:17,color:"var(--m2)",lineHeight:1.8,marginBottom:24}}>There will be a final baptism. Not of water. Not even of the Spirit as we know Him now. The final baptism is of glory and fire. We will not receive Him then. We will be one with Him. Eternity does not begin at death. It begins at indwelling. For those who have been marked, it has already started.</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--text2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>The arc begins in water. It ends in fire.</p>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--text2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:20,textAlign:"center"}}>John declared it. Christ delivers it.</p>
                <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",fontSize:19,color:"var(--accent)",lineHeight:1.6,textAlign:"center"}}>It was already declared before you arrived. John just read it out loud.</p>
              </>
            )}

            <button onClick={()=>setEggOpen(null)} style={{width:"100%",marginTop:24,padding:"12px",background:"transparent",border:"1px solid var(--border2)",borderRadius:6,fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--m5)",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
