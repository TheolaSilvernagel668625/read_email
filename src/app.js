const express = require("express");
const HOME_HTML = require("./ui");
const { parseAccount, readMailbox } = require("./mail");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(express.text({ type: "text/plain", limit: "64kb" }));

const UI_LAYOUT_FIX = String.raw`<style id="read-email-layout-fix">
  .row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
  .row > .field {
    min-width: 0;
    margin-bottom: 1rem;
  }
  .row .field-label {
    min-height: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: .75rem;
  }
  .row select {
    height: 47px;
    min-height: 47px;
  }
  .notice {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  @media (max-width: 620px) {
    .row { grid-template-columns: minmax(0, 1fr); }
  }
</style>`;

const PAGE_HTML = HOME_HTML.replace("</head>", UI_LAYOUT_FIX + "</head>");

function apiKeyMiddleware(req, res, next) {
  const configured = process.env.READER_API_KEY;

  // READER_API_KEY is optional. If it is not configured, allow requests.
  if (!configured) {
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

function buildErrorResponse(error) {
  const message = error && error.message ? error.message : "Mailbox read failed.";
  const diagnostics = {};

  if (error && error.code) diagnostics.code = error.code;
  if (error && error.provider) diagnostics.provider = error.provider;
  if (error && Number.isInteger(error.providerStatus)) diagnostics.providerStatus = error.providerStatus;
  if (error && error.providerDetails) diagnostics.details = error.providerDetails;

  const hasDiagnostics = Object.keys(diagnostics).length > 0;
  const fullMessage = hasDiagnostics
    ? `${message}\n\n${JSON.stringify(diagnostics, null, 2)}`
    : message;

  return {
    ok: false,
    error: fullMessage,
    message,
    ...diagnostics
  };
}

function responseStatusForError(error) {
  if (error && ["INVALID_ACCOUNT_FORMAT", "INVALID_EMAIL"].includes(error.code)) {
    return 400;
  }

  if (error && Number.isInteger(error.providerStatus) && error.providerStatus >= 400 && error.providerStatus <= 599) {
    return error.providerStatus;
  }

  return 502;
}

app.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("html").send(PAGE_HTML);
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
    const payload = buildErrorResponse(error);
    console.error("read_email error:", JSON.stringify(payload));
    return res.status(responseStatusForError(error)).json(payload);
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
