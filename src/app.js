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

  .notice.is-error {
    padding: 0;
    overflow: hidden;
    white-space: normal;
  }
  .error-shell {
    display: grid;
    gap: .85rem;
    padding: 1rem;
  }
  .error-top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: start;
  }
  .error-eyebrow {
    margin: 0 0 .35rem;
    color: var(--color-coral-deep);
    font: 700 .62rem/1 var(--font-label);
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .error-message {
    margin: 0;
    color: var(--color-ink);
    font-size: .9rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .error-mark {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--color-ink);
    border-radius: 50%;
    background: var(--color-pear);
    font: 800 .8rem/1 var(--font-label);
  }
  .error-meta {
    display: flex;
    flex-wrap: wrap;
    gap: .45rem;
  }
  .error-chip {
    display: inline-flex;
    align-items: center;
    min-height: 27px;
    max-width: 100%;
    padding: 0 .65rem;
    border: 1px solid var(--color-rule-strong);
    border-radius: var(--radius-pill);
    background: var(--color-paper);
    color: var(--color-ink-2);
    font: 600 .6rem/1 var(--font-label);
    letter-spacing: .04em;
    overflow-wrap: anywhere;
  }
  .error-details {
    border-top: 1px solid var(--color-rule);
    padding-top: .75rem;
  }
  .error-details > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 34px;
    cursor: pointer;
    list-style: none;
    color: var(--color-ink-2);
    font: 700 .68rem/1 var(--font-label);
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .error-details > summary::-webkit-details-marker { display: none; }
  .error-details > summary::after {
    content: "+";
    font-size: 1rem;
  }
  .error-details[open] > summary::after { content: "−"; }
  .error-detail-actions {
    display: flex;
    justify-content: flex-end;
    margin: .5rem 0;
  }
  .error-copy {
    min-height: 31px;
    padding: 0 .7rem;
    border: 1px solid var(--color-rule-strong);
    border-radius: var(--radius-pill);
    background: var(--color-paper);
    color: var(--color-ink);
    cursor: pointer;
    font: 700 .62rem/1 var(--font-label);
  }
  .error-copy:hover { background: var(--color-paper-2); }
  .error-raw {
    margin: 0;
    max-height: 320px;
    overflow: auto;
    padding: .85rem;
    border: 1px solid var(--color-rule);
    border-radius: 12px;
    background: var(--color-paper);
    color: var(--color-ink-2);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: 500 .68rem/1.55 var(--font-label);
    scrollbar-width: thin;
  }

  @media (max-width: 620px) {
    .row { grid-template-columns: minmax(0, 1fr); }
    .error-top { grid-template-columns: minmax(0, 1fr); }
    .error-mark { display: none; }
    .error-raw { max-height: 260px; }
  }
</style>`;

const ERROR_UI_SCRIPT = String.raw`<script id="read-email-error-ui">
(function () {
  function enhanceErrorNotice(notice) {
    if (!notice || !notice.classList.contains('is-error')) return;
    if (notice.querySelector('.error-shell')) return;

    var raw = String(notice.textContent || '').trim();
    if (!raw) return;

    var message = raw;
    var diagnosticText = '';
    var diagnostics = null;
    var marker = raw.indexOf('\n\n{');

    if (marker !== -1) {
      message = raw.slice(0, marker).trim();
      diagnosticText = raw.slice(marker + 2).trim();
      try { diagnostics = JSON.parse(diagnosticText); } catch (error) { diagnostics = null; }
    }

    notice.textContent = '';

    var shell = document.createElement('div');
    shell.className = 'error-shell';

    var top = document.createElement('div');
    top.className = 'error-top';

    var copy = document.createElement('div');
    var eyebrow = document.createElement('p');
    eyebrow.className = 'error-eyebrow';
    eyebrow.textContent = diagnostics && diagnostics.provider ? 'Microsoft request failed' : 'Request failed';

    var body = document.createElement('p');
    body.className = 'error-message';
    body.textContent = message;

    copy.appendChild(eyebrow);
    copy.appendChild(body);

    var mark = document.createElement('span');
    mark.className = 'error-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '!';

    top.appendChild(copy);
    top.appendChild(mark);
    shell.appendChild(top);

    if (diagnostics) {
      var meta = document.createElement('div');
      meta.className = 'error-meta';

      [
        diagnostics.code ? 'code · ' + diagnostics.code : '',
        diagnostics.provider ? 'provider · ' + diagnostics.provider : '',
        diagnostics.providerStatus ? 'HTTP · ' + diagnostics.providerStatus : ''
      ].filter(Boolean).forEach(function (text) {
        var chip = document.createElement('span');
        chip.className = 'error-chip';
        chip.textContent = text;
        meta.appendChild(chip);
      });

      if (meta.childNodes.length) shell.appendChild(meta);
    }

    if (diagnosticText) {
      var details = document.createElement('details');
      details.className = 'error-details';

      var summary = document.createElement('summary');
      summary.textContent = 'Technical details';

      var actions = document.createElement('div');
      actions.className = 'error-detail-actions';

      var copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'error-copy';
      copyButton.textContent = 'Copy diagnostics';
      copyButton.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(raw);
          copyButton.textContent = 'Copied';
          setTimeout(function () { copyButton.textContent = 'Copy diagnostics'; }, 1400);
        } catch (error) {
          copyButton.textContent = 'Copy failed';
          setTimeout(function () { copyButton.textContent = 'Copy diagnostics'; }, 1400);
        }
      });

      var pre = document.createElement('pre');
      pre.className = 'error-raw';
      if (diagnostics) {
        pre.textContent = JSON.stringify(diagnostics, null, 2);
      } else {
        pre.textContent = diagnosticText;
      }

      actions.appendChild(copyButton);
      details.appendChild(summary);
      details.appendChild(actions);
      details.appendChild(pre);
      shell.appendChild(details);
    }

    notice.appendChild(shell);
  }

  function install() {
    var account = document.getElementById('account');
    if (account) account.removeAttribute('required');

    var notice = document.getElementById('notice');
    if (!notice) return;

    var observer = new MutationObserver(function () {
      if (notice.classList.contains('is-error')) {
        enhanceErrorNotice(notice);
      }
    });

    observer.observe(notice, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class']
    });

    enhanceErrorNotice(notice);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
</script>`;

const PAGE_HTML = HOME_HTML
  .replace("</head>", UI_LAYOUT_FIX + "</head>")
  .replace("</body>", ERROR_UI_SCRIPT + "</body>");

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
