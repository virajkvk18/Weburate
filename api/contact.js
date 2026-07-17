const allowedKeys = new Set(["name", "email", "phone", "business", "service", "budget", "message", "website", "startedAt"]);

function json(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}
function text(value, max) { return typeof value === "string" ? value.trim().replace(/\0/g, "").slice(0, max) : ""; }
function singleLine(value, max) { return text(value, max).replace(/[\r\n]+/g, " "); }
function escapeHtml(value) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return json(res, 405, { message: "Method not allowed." }); }
  if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) return json(res, 415, { message: "Send JSON content." });
  const length = Number(req.headers["content-length"] || 0);
  if (length > 16000) return json(res, 413, { message: "Request is too large." });
  const origin = String(req.headers.origin || "");
  const allowedOrigins = ["https://weburate.online", "https://www.weburate.online", "http://localhost:4173", "http://127.0.0.1:4173"];
  if ((origin && !allowedOrigins.includes(origin)) || (process.env.VERCEL_ENV === "production" && !origin)) return json(res, 403, { message: "Request origin is not allowed." });
  let parsed = req.body;
  if (typeof parsed === "string") { try { parsed = JSON.parse(parsed); } catch { return json(res, 400, { message: "Invalid JSON." }); } }
  const body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  if (body && JSON.stringify(body).length > 16000) return json(res, 413, { message: "Request is too large." });
  if (!body) return json(res, 400, { message: "Invalid request body." });
  if (Object.keys(body).some((key) => !allowedKeys.has(key))) return json(res, 400, { message: "Unexpected form field." });
  if (text(body.website, 200)) return json(res, 200, { ok: true });
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2000 || Date.now() - startedAt > 24 * 60 * 60 * 1000) return json(res, 400, { message: "Please refresh the page and try again." });
  const data = { name: singleLine(body.name, 100), email: singleLine(body.email, 254).toLowerCase(), phone: singleLine(body.phone, 30), business: singleLine(body.business, 120), service: singleLine(body.service, 80), budget: singleLine(body.budget, 80), message: text(body.message, 3000) };
  if (!data.name || data.name.length < 2) return json(res, 400, { message: "Enter your name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(data.email)) return json(res, 400, { message: "Enter a valid email address." });
  if (data.message.length < 20) return json(res, 400, { message: "Add at least 20 characters about the project." });
  if (process.env.CONTACT_DEV_MODE === "true" && process.env.VERCEL_ENV !== "production") return json(res, 200, { ok: true, development: true });
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) return json(res, 503, { message: "The contact form is not configured yet." });
  const rows = Object.entries(data).filter(([, value]) => value).map(([key, value]) => `<tr><th align="left" valign="top">${escapeHtml(key)}</th><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`).join("");
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.CONTACT_FROM_EMAIL, to: [process.env.CONTACT_TO_EMAIL], reply_to: data.email, subject: `Weburate enquiry from ${data.name}`, html: `<h1>New website enquiry</h1><table cellpadding="8" cellspacing="0">${rows}</table>` }) });
    if (!response.ok) { console.error("Contact delivery failed", { status: response.status }); return json(res, 502, { message: "The message could not be delivered right now." }); }
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Contact delivery error", { name: error?.name || "Error" });
    return json(res, 502, { message: "The message could not be delivered right now." });
  }
};
