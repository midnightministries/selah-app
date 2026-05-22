// Proxies Crossway's official ESV API so the key stays server-side and ESV text
// is displayed under license. Set ESV_API_KEY in Netlify env (free key from
// api.esv.org). Without the key it returns a graceful flag, not the text.
const https = require("https");

exports.handler = async (event) => {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  const key = process.env.ESV_API_KEY;
  if (!key) return { statusCode: 200, headers: cors, body: JSON.stringify({ error: "no-key" }) };

  const ref = (event.queryStringParameters && event.queryStringParameters.ref) || "Hebrews 11";
  const params =
    "q=" + encodeURIComponent(ref) +
    "&include-headings=true" +
    "&include-footnotes=false" +
    "&include-verse-numbers=true" +
    "&include-first-verse-numbers=true" +
    "&include-passage-references=false" +
    "&include-short-copyright=false" +
    "&include-copyright=false";

  try {
    const data = await new Promise((resolve, reject) => {
      const req = https.request(
        { hostname: "api.esv.org", path: "/v3/passage/text/?" + params, method: "GET", headers: { Authorization: "Token " + key } },
        (res) => { let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => { try { resolve(JSON.parse(b)); } catch (e) { reject(new Error("parse")); } }); }
      );
      req.on("error", reject);
      req.setTimeout(12000, () => req.destroy(new Error("timeout")));
      req.end();
    });
    const text = (data.passages && data.passages[0]) ? data.passages[0].trim() : "";
    return { statusCode: 200, headers: cors, body: JSON.stringify({ text }) };
  } catch (err) {
    return { statusCode: 200, headers: cors, body: JSON.stringify({ error: "fetch-failed" }) };
  }
};
