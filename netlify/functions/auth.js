import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const J = (code, obj) => ({
  statusCode: code,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(obj),
});
const norm = (e) => String(e || "").trim().toLowerCase();
const key = (e) => "user/" + norm(e);
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString("hex");

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return J(200, {});
  if (event.httpMethod !== "POST") return J(405, { error: "Method Not Allowed" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return J(400, { error: "Bad request." }); }
  const { action, email, password } = body;
  const e = norm(email);

  if (!e || !e.includes("@")) return J(400, { error: "Enter a valid email." });
  if (!password || String(password).length < 6) return J(400, { error: "Password must be at least 6 characters." });

  const store = getStore("selah");
  const existing = await store.get(key(e), { type: "json" });

  if (action === "signup") {
    if (existing) return J(409, { error: "An account with that email already exists. Try signing in." });
    const salt = crypto.randomBytes(16).toString("hex");
    const token = crypto.randomBytes(24).toString("hex");
    const rec = { email: e, salt, hash: hashPw(password, salt), token, data: {}, createdAt: Date.now() };
    await store.setJSON(key(e), rec);
    return J(200, { token, email: e, data: {} });
  }

  if (action === "login") {
    if (!existing) return J(404, { error: "No account found for that email." });
    if (hashPw(password, existing.salt) !== existing.hash) return J(401, { error: "Incorrect password." });
    return J(200, { token: existing.token, email: e, data: existing.data || {} });
  }

  return J(400, { error: "Unknown action." });
};
