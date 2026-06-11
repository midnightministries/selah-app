// sync-ns.js — namespaced data sync.
//
// Companion to sync.js: stores per-app data under separate Blob keys so that
// SENTINEL (and any future MM app) can save its own data without colliding
// with SELAH's existing root data object on `user/{email}`.
//
// Storage layout (Netlify Blobs, store name "selah"):
//   user/{email}          — main auth record (managed by auth.js + sync.js)
//   sentinel/{email}      — SENTINEL settings + state
//   shared/{email}        — cross-app shared profile (name, dob, translation)
//   {namespace}/{email}   — future apps (mm, etc.)
//
// Request body: { action, email, token, namespace, data }
//   action: "save" | "load"
//   namespace: "sentinel" | "shared" | "mm"
//   token: must match the user's auth record at user/{email}
//
// Response: same shape as sync.js — { ok, updatedAt } for save, { data, updatedAt } for load.

import { getStore } from "@netlify/blobs";

const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
const J = (code, obj) => new Response(JSON.stringify(obj), { status: code, headers });
const norm = (e) => String(e || "").trim().toLowerCase();

const ALLOWED_NAMESPACES = new Set(["sentinel", "shared", "mm"]);

function selahStore() {
  const siteID = process.env.BLOBS_SITE_ID, token = process.env.BLOBS_TOKEN;
  return (siteID && token) ? getStore({ name: "selah", siteID, token }) : getStore("selah");
}

export default async (req) => {
  if (req.method === "OPTIONS") return J(200, {});
  if (req.method !== "POST") return J(405, { error: "Method Not Allowed" });

  let body;
  try { body = await req.json(); } catch { return J(400, { error: "Bad request." }); }

  const { action, email, token, namespace, data } = body;
  const e = norm(email);
  const ns = String(namespace || "").trim().toLowerCase();

  if (!e || !e.includes("@")) return J(400, { error: "Missing or invalid email." });
  if (!ALLOWED_NAMESPACES.has(ns)) return J(400, { error: "Invalid namespace." });

  const store = selahStore();

  // Always verify the caller via the main auth record. No anonymous writes.
  const authRec = await store.get("user/" + e, { type: "json", consistency: "strong" });
  if (!authRec) return J(404, { error: "No account found." });
  if (!token || token !== authRec.token) return J(401, { error: "Not authorized." });

  const key = `${ns}/${e}`;

  if (action === "save") {
    const rec = {
      email: e,
      namespace: ns,
      data: (data && typeof data === "object") ? data : {},
      updatedAt: Date.now(),
    };
    await store.setJSON(key, rec);
    return J(200, { ok: true, updatedAt: rec.updatedAt });
  }

  if (action === "load") {
    const rec = await store.get(key, { type: "json", consistency: "strong" });
    return J(200, {
      data: rec ? (rec.data || {}) : {},
      updatedAt: rec ? (rec.updatedAt || 0) : 0,
    });
  }

  return J(400, { error: "Unknown action." });
};
