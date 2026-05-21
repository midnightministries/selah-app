import { getStore } from "@netlify/blobs";

const J = (code, obj) => ({
  statusCode: code,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(obj),
});
const norm = (e) => String(e || "").trim().toLowerCase();
const key = (e) => "user/" + norm(e);

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return J(200, {});
  if (event.httpMethod !== "POST") return J(405, { error: "Method Not Allowed" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return J(400, { error: "Bad request." }); }
  const { action, email, token, data } = body;
  const e = norm(email);

  const store = getStore("selah");
  const rec = await store.get(key(e), { type: "json" });
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
