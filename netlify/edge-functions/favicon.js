// Rewrites the favicon / apple-touch links in the served HTML based on the
// reader's chosen app icon (stored in a cookie by the app). This makes the
// correct icon appear on FIRST paint in every browser — including Safari, which
// ignores JavaScript that swaps the favicon after load.

const ALLOWED = ["red","nebula","camo","pinkneb","pinksplatter","redneb","selahred","tigerpurple","splatterpurple"];

export default async (request, context) => {
  const res = await context.next();
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("text/html")) return res;

  const headers = new Headers(res.headers);
  // Always force the HTML shell to revalidate so a fresh deploy's bundle is
  // picked up immediately, instead of a stale cached index pointing at an old
  // hashed bundle. The bundles themselves are content-hashed and cached long.
  headers.set("Cache-Control", "no-cache");

  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)selah_icon=([^;]+)/);
  let theme = m ? decodeURIComponent(m[1]) : "";
  // "default" (or anything not whitelisted) keeps the HTML's built-in icon
  if (!theme || theme === "default" || !ALLOWED.includes(theme)) {
    return new Response(res.body, { status: res.status, headers });
  }

  const base = "/icons/" + theme;
  let html = await res.text();
  html = html
    .replace('href="/favicon.ico"', `href="${base}/favicon.ico"`)
    .replace('href="/favicon-32.png"', `href="${base}/favicon-32.png"`)
    .replace('href="/favicon-16.png"', `href="${base}/favicon-16.png"`)
    .replace('href="/apple-touch-icon.png"', `href="${base}/apple-touch-icon.png"`);

  return new Response(html, { status: res.status, headers });
};

export const config = { path: "/" };
