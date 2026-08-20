const express = require("express");
const HOME_HTML = require("./ui");
const { ENHANCEMENT_STYLE, ENHANCEMENT_SCRIPT } = require("./enhancements");
const { EMAIL_RENDERER_STYLE, EMAIL_RENDERER_SCRIPT } = require("./email-renderer");
const { parseAccount, readMailbox } = require("./mail");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(express.text({ type: "text/plain", limit: "64kb" }));

const LOADING_LAYOUT_FIX = String.raw`<style id="read-email-loading-layout-fix">
  /* Keep skeleton rows compact inside the fixed-height Inbox scroller. */
  .panel--inbox #results > .loading {
    min-height: 100% !important;
    align-content: start;
    grid-auto-rows: max-content;
    gap: .7rem;
  }
  .panel--inbox #results > .loading > .skeleton {
    height: 90px;
    min-height: 90px;
  }

  /* Center the Auto fetch switch thumb precisely inside its track. */
  .auto-switch {
    position: relative;
    flex: 0 0 auto;
    width: 58px;
    height: 34px;
    display: inline-grid;
    place-items: center;
    line-height: 0;
  }
  .auto-switch input {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
  }
  .auto-switch-track {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    box-sizing: border-box;
    border: 2px solid var(--color-rule-strong);
    border-radius: 999px;
    background: var(--color-paper);
    transition: background-color 150ms, border-color 150ms;
  }
  .auto-switch-track::after {
    content: "";
    position: absolute;
    width: 24px;
    height: 24px;
    left: 3px;
    top: 50%;
    box-sizing: border-box;
    border: 2px solid var(--color-ink);
    border-radius: 50%;
    background: var(--color-white);
    transform: translateY(-50%);
    transition: transform 160ms var(--ease-out), background-color 150ms;
  }
  .auto-switch input:checked + .auto-switch-track {
    border-color: var(--color-mint-deep);
    background: var(--color-mint);
  }
  .auto-switch input:checked + .auto-switch-track::after {
    transform: translate(24px, -50%);
  }
  .auto-switch input:focus-visible + .auto-switch-track {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }
</style>`;

const AUTO_FETCH_COUNTDOWN_STYLE = String.raw`<style id="read-email-auto-fetch-countdown-style">
  .auto-fetch-copy {
    flex: 1 1 auto;
  }
  .auto-fetch-note {
    font-variant-numeric: tabular-nums;
  }
  .auto-fetch-progress {
    display: block;
    width: min(190px, 100%);
    height: 3px;
    margin-top: .48rem;
    overflow: hidden;
    border-radius: 999px;
    background: var(--color-rule);
    opacity: .7;
  }
  .auto-fetch-progress-bar {
    display: block;
    width: 0%;
    height: 100%;
    border-radius: inherit;
    background: var(--color-cyan);
    transform-origin: left center;
    transition: width 220ms linear, background-color 160ms, opacity 160ms;
  }
  .auto-fetch.is-counting .auto-fetch-progress-bar {
    background: var(--color-cyan);
  }
  .auto-fetch.is-refreshing .auto-fetch-progress-bar {
    width: 100% !important;
    background: var(--color-mint-deep);
    animation: auto-fetch-pulse 850ms ease-in-out infinite alternate;
  }
  .auto-fetch.is-paused .auto-fetch-progress-bar,
  .auto-fetch.is-waiting .auto-fetch-progress-bar,
  .auto-fetch:not(.is-enabled) .auto-fetch-progress-bar {
    width: 0% !important;
    opacity: .45;
  }
  @keyframes auto-fetch-pulse {
    from { opacity: .35; }
    to { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .auto-fetch-progress-bar {
      transition: none;
      animation: none !important;
    }
  }
</style>`;

const AUTO_FETCH_COUNTDOWN_SCRIPT = String.raw`<script id="read-email-auto-fetch-countdown-script">
(function () {
  var AUTO_FETCH_MS = 30000;
  var tickTimer = null;
  var nextRefreshAt = 0;

  function accountLooksValid(value) {
    var parts = String(value || '').trim().split('|');
    return parts.length === 4 && parts[0].includes('@') && parts[2].trim() && parts[3].trim();
  }

  function pad2(value) {
    return String(Math.max(0, value)).padStart(2, '0');
  }

  function installCountdown() {
    var autoInput = document.getElementById('auto-fetch');
    var account = document.getElementById('account');
    var form = document.getElementById('reader-form');
    var readButton = document.getElementById('read-button');
    var row = autoInput ? autoInput.closest('.auto-fetch') : null;
    var note = row ? row.querySelector('.auto-fetch-note') : null;
    var copy = row ? row.querySelector('.auto-fetch-copy') : null;

    if (!autoInput || !account || !form || !readButton || !row || !note || !copy) return;
    if (row.dataset.countdownInstalled === '1') return;
    row.dataset.countdownInstalled = '1';

    var progress = document.createElement('span');
    progress.className = 'auto-fetch-progress';
    progress.setAttribute('aria-hidden', 'true');

    var progressBar = document.createElement('span');
    progressBar.className = 'auto-fetch-progress-bar';
    progress.appendChild(progressBar);
    copy.appendChild(progress);

    function setState(name) {
      row.classList.remove('is-enabled', 'is-counting', 'is-refreshing', 'is-paused', 'is-waiting');
      if (autoInput.checked) row.classList.add('is-enabled');
      if (name) row.classList.add(name);
    }

    function resetCountdown() {
      nextRefreshAt = Date.now() + AUTO_FETCH_MS;
    }

    function update() {
      if (!autoInput.checked) {
        setState('');
        note.textContent = 'Refresh every 30 seconds';
        progressBar.style.width = '0%';
        return;
      }

      if (!accountLooksValid(account.value)) {
        setState('is-waiting');
        note.textContent = 'Waiting for a valid account';
        progressBar.style.width = '0%';
        return;
      }

      if (document.hidden) {
        setState('is-paused');
        note.textContent = 'Paused while tab is hidden';
        progressBar.style.width = '0%';
        return;
      }

      if (readButton.disabled) {
        setState('is-refreshing');
        note.textContent = 'Refreshing…';
        return;
      }

      if (!nextRefreshAt) resetCountdown();

      var remaining = Math.max(0, nextRefreshAt - Date.now());
      var seconds = Math.ceil(remaining / 1000);
      var ratio = Math.max(0, Math.min(1, remaining / AUTO_FETCH_MS));

      setState('is-counting');
      note.textContent = 'Next refresh · 00:' + pad2(seconds);
      progressBar.style.width = (ratio * 100).toFixed(2) + '%';
    }

    form.addEventListener('submit', function () {
      resetCountdown();
      requestAnimationFrame(update);
    });

    autoInput.addEventListener('change', function () {
      if (autoInput.checked) resetCountdown();
      else nextRefreshAt = 0;
      requestAnimationFrame(update);
    });

    account.addEventListener('input', function () {
      if (autoInput.checked && accountLooksValid(account.value)) resetCountdown();
      update();
    });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && autoInput.checked && accountLooksValid(account.value)) {
        if (!nextRefreshAt || nextRefreshAt <= Date.now()) resetCountdown();
      }
      update();
    });

    var disabledObserver = new MutationObserver(function () {
      if (!readButton.disabled && autoInput.checked && accountLooksValid(account.value)) {
        if (!nextRefreshAt || nextRefreshAt <= Date.now()) resetCountdown();
      }
      update();
    });
    disabledObserver.observe(readButton, { attributes: true, attributeFilter: ['disabled'] });

    if (autoInput.checked && accountLooksValid(account.value)) resetCountdown();
    update();

    tickTimer = setInterval(update, 250);
  }

  function installWhenReady() {
    installCountdown();
    if (document.getElementById('auto-fetch')) return;

    var observer = new MutationObserver(function () {
      if (document.getElementById('auto-fetch')) {
        observer.disconnect();
        installCountdown();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installWhenReady, { once: true });
  } else {
    installWhenReady();
  }
})();
</script>`;

const PAGE_HTML = HOME_HTML
  .replace(
    "</head>",
    ENHANCEMENT_STYLE +
      LOADING_LAYOUT_FIX +
      AUTO_FETCH_COUNTDOWN_STYLE +
      EMAIL_RENDERER_STYLE +
      "</head>"
  )
  .replace(
    "</body>",
    ENHANCEMENT_SCRIPT +
      AUTO_FETCH_COUNTDOWN_SCRIPT +
      EMAIL_RENDERER_SCRIPT +
      "</body>"
  );

function apiKeyMiddleware(req, res, next) {
  const configured = process.env.READER_API_KEY;

  // READER_API_KEY is optional. If it is not configured, allow requests.
  if (!configured) return next();

  const supplied = req.get("x-api-key");
  if (supplied !== configured) {
    return res.status(401).json({
      ok: false,
      error: "Invalid or missing x-api-key."
    });
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
  if (error && Number.isInteger(error.providerStatus)) {
    diagnostics.providerStatus = error.providerStatus;
  }
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

  if (
    error &&
    Number.isInteger(error.providerStatus) &&
    error.providerStatus >= 400 &&
    error.providerStatus <= 599
  ) {
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
      return res.status(400).json({
        ok: false,
        error: "Provide account as email|password|refresh_token|client_id."
      });
    }

    const account = parseAccount(line);
    const requestedLimit =
      req.body && typeof req.body === "object" ? Number(req.body.limit ?? 10) : 10;
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(25, Math.max(1, Math.trunc(requestedLimit)))
      : 10;

    const requestedBackend =
      req.body && typeof req.body === "object" && typeof req.body.backend === "string"
        ? req.body.backend.toLowerCase()
        : String(process.env.MAIL_BACKEND || "imap").toLowerCase();

    if (!["imap", "graph"].includes(requestedBackend)) {
      return res.status(400).json({
        ok: false,
        error: "backend must be 'imap' or 'graph'."
      });
    }

    const messages = await readMailbox(account, {
      backend: requestedBackend,
      limit
    });

    return res.json({
      ok: true,
      email: account.email,
      backend: requestedBackend,
      count: messages.length,
      messages
    });
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