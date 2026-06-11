import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};
const J = (code, obj) => new Response(JSON.stringify(obj), { status: code, headers });
const norm = (e) => String(e || "").trim().toLowerCase();
const key = (e) => "user/" + norm(e);
function selahStore() {
  const siteID = process.env.BLOBS_SITE_ID, token = process.env.BLOBS_TOKEN;
  return (siteID && token) ? getStore({ name: "selah", siteID, token }) : getStore("selah");
}

export default async (req) => {
  if (req.method === "OPTIONS") return J(200, {});
  if (req.method !== "POST") return J(405, { error: "Method Not Allowed" });

  let body;
  try { body = await req.json(); } catch { return J(400, { error: "Bad request." }); }
  const { action, email, token, data } = body;
  const e = norm(email);

  const store = selahStore();
  const rec = await store.get(key(e), { type: "json", consistency: "strong" });
  if (!rec) return J(404, { error: "No account found." });
  if (!token || token !== rec.token) return J(401, { error: "Not authorized." });

  if (action === "save") {
    rec.data = data && typeof data === "object" ? data : {};
    rec.updatedAt = Date.now();
    await store.setJSON(key(e), rec);
    return J(200, { ok: true, updatedAt: rec.updatedAt });
  }

  if (action === "load") {
    return J(200, { data: rec.data || {}, updatedAt: rec.updatedAt || 0 });
  }

  return J(400, { error: "Unknown action." });
};
