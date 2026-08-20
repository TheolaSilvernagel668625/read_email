const express = require("express");
const HOME_HTML = require("./ui");
const { parseAccount, readMailbox } = require("./mail");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(express.text({ type: "text/plain", limit: "64kb" }));

function deploymentNeedsApiKey() {
  return Boolean(process.env.VERCEL || process.env.DYNO || process.env.NODE_ENV === "production");
}

function apiKeyMiddleware(req, res, next) {
  const configured = process.env.READER_API_KEY;
  if (!configured) {
    if (deploymentNeedsApiKey()) {
      return res.status(503).json({ ok: false, error: "READER_API_KEY is not configured on this deployment." });
    }
    return next();
  }

  const supplied = req.get("x-api-key");
  if (supplied !== configured) {
    return res.status(401).json({ ok: false, error: "Invalid or missing x-api-key." });
  }
  next();
}

function getAccountLine(req) {
  if (typeof req.body === "string") return req.body.trim();
  if (req.body && typeof req.body === "object") {
    const value = req.body.account ?? req.body.line;
    return typeof value === "string" ? value.trim() : "";
  }
  return "";
}

app.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("html").send(HOME_HTML);
});

app.get("/health", (req, res) => {
  res.json({ ok: true, runtime: process.version });
});

app.post("/api/read", apiKeyMiddleware, async (req, res) => {
  try {
    const line = getAccountLine(req);
    if (!line) {
      return res.status(400).json({ ok: false, error: "Provide account as email|password|refresh_token|client_id." });
    }

    const account = parseAccount(line);
    const requestedLimit = req.body && typeof req.body === "object" ? Number(req.body.limit ?? 10) : 10;
    const limit = Number.isFinite(requestedLimit) ? Math.min(25, Math.max(1, Math.trunc(requestedLimit))) : 10;
    const requestedBackend = req.body && typeof req.body === "object" && typeof req.body.backend === "string"
      ? req.body.backend.toLowerCase()
      : String(process.env.MAIL_BACKEND || "imap").toLowerCase();

    if (!["imap", "graph"].includes(requestedBackend)) {
      return res.status(400).json({ ok: false, error: "backend must be 'imap' or 'graph'." });
    }

    const messages = await readMailbox(account, { backend: requestedBackend, limit });
    return res.json({ ok: true, email: account.email, backend: requestedBackend, count: messages.length, messages });
  } catch (error) {
    console.error("read_email error:", error && error.message ? error.message : error);
    const status = error && ["INVALID_ACCOUNT_FORMAT", "INVALID_EMAIL"].includes(error.code) ? 400 : 502;
    return res.status(status).json({ ok: false, error: error && error.message ? error.message : "Mailbox read failed." });
  }
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Not found." });
});

app.use((error, req, res, next) => {
  console.error("Express error:", error && error.message ? error.message : error);
  res.status(500).json({ ok: false, error: "Internal server error." });
});

module.exports = app;
