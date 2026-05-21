const https = require("https");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("ERROR: No API key found");
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured." }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { system, message } = body;
    if (typeof message !== "string" || !message.trim()) {
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: "Missing message." }) };
    }

    const payload = JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1000,
      system: system,
      messages: [{ role: "user", content: message }]
    });

    const data = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(payload)
        }
      }, (res) => {
        let body = "";
        console.log("Anthropic status:", res.statusCode);
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          console.log("Anthropic response length:", body.length);
          try { resolve(JSON.parse(body)); }
          catch(e) { reject(new Error("JSON parse failed: " + body.slice(0,200))); }
        });
      });
      req.on("error", (e) => { console.log("Request error:", e.message); reject(e); });
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.log("CATCH ERROR:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error: " + err.message })
    };
  }
};
