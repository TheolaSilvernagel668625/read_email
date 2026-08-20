const HOME_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>read_email · Outlook mailbox reader</title>
  <style>
    :root {
      --bg: #070b14;
      --panel: rgba(15, 23, 42, 0.72);
      --line: rgba(148, 163, 184, 0.18);
      --text: #eef2ff;
      --muted: #94a3b8;
      --accent: #8b5cf6;
      --accent-2: #22d3ee;
      --good: #34d399;
      --danger: #fb7185;
      --shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
      --radius: 24px;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 10% 0%, rgba(124, 58, 237, 0.22), transparent 34rem),
        radial-gradient(circle at 100% 14%, rgba(6, 182, 212, 0.15), transparent 30rem),
        linear-gradient(180deg, #080c16 0%, #05070d 100%);
      overflow-x: hidden;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: 0.18;
      background-image:
        linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
      background-size: 34px 34px;
      mask-image: linear-gradient(to bottom, black, transparent 78%);
    }
    .shell {
      width: min(1160px, calc(100% - 32px));
      margin: 0 auto;
      padding: 34px 0 70px;
      position: relative;
      z-index: 1;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 42px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text);
      text-decoration: none;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    .logo {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--accent), #5b21b6 52%, var(--accent-2));
      box-shadow: 0 12px 30px rgba(124, 58, 237, 0.35);
      font-size: 20px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 13px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.58);
      color: #cbd5e1;
      font-size: 13px;
      backdrop-filter: blur(18px);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--good);
      box-shadow: 0 0 0 5px rgba(52, 211, 153, 0.1);
    }
    .hero { max-width: 820px; margin-bottom: 30px; }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      color: #c4b5fd;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.14em;
      font-weight: 800;
    }
    h1 {
      margin: 0;
      max-width: 760px;
      font-size: clamp(42px, 8vw, 82px);
      line-height: 0.98;
      letter-spacing: -0.065em;
      background: linear-gradient(180deg, #ffffff 10%, #d7dcff 70%, #a5b4fc 100%);
      -webkit-background-clip: text;
      color: transparent;
    }
    .hero p {
      margin: 22px 0 0;
      max-width: 680px;
      color: var(--muted);
      font-size: 17px;
      line-height: 1.7;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      gap: 20px;
      align-items: start;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--panel);
      box-shadow: var(--shadow);
      backdrop-filter: blur(22px);
      overflow: hidden;
    }
    .card-header {
      padding: 24px 24px 0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .card-title { margin: 0; font-size: 18px; letter-spacing: -0.025em; }
    .card-subtitle { margin: 7px 0 0; color: var(--muted); font-size: 13px; line-height: 1.55; }
    form { padding: 22px 24px 24px; }
    .field { margin-bottom: 17px; }
    label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
      color: #dbeafe;
      font-size: 13px;
      font-weight: 700;
    }
    .hint { color: #64748b; font-size: 11px; font-weight: 600; }
    textarea, input, select {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 14px;
      outline: none;
      background: rgba(2, 6, 23, 0.72);
      color: #f8fafc;
      font: inherit;
      transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
    }
    textarea:focus, input:focus, select:focus {
      border-color: rgba(139, 92, 246, 0.72);
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
    }
    textarea {
      min-height: 128px;
      padding: 14px 15px;
      resize: vertical;
      line-height: 1.55;
      word-break: break-all;
    }
    input, select { padding: 12px 14px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .actions { display: flex; gap: 10px; margin-top: 22px; }
    button { border: 0; cursor: pointer; font: inherit; }
    .primary {
      flex: 1;
      min-height: 48px;
      border-radius: 14px;
      padding: 0 18px;
      font-weight: 800;
      color: white;
      background: linear-gradient(135deg, #7c3aed, #6366f1 54%, #0891b2);
      box-shadow: 0 15px 34px rgba(79, 70, 229, 0.25);
      transition: transform .18s ease, filter .18s ease, opacity .18s ease;
    }
    .primary:hover { transform: translateY(-1px); filter: brightness(1.08); }
    .primary:disabled { cursor: wait; opacity: .6; transform: none; }
    .secondary {
      min-width: 86px;
      border-radius: 14px;
      color: #cbd5e1;
      background: rgba(30, 41, 59, 0.78);
      border: 1px solid var(--line);
    }
    .security {
      margin-top: 14px;
      display: flex;
      gap: 10px;
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.55;
    }
    .security svg { flex: 0 0 auto; margin-top: 2px; }
    .results-card { min-height: 548px; }
    .results-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 20px 22px;
      border-bottom: 1px solid var(--line);
    }
    .result-title-wrap { min-width: 0; }
    .result-title {
      margin: 0;
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result-meta { margin-top: 5px; color: var(--muted); font-size: 12px; }
    .count-badge {
      min-width: 34px;
      height: 34px;
      padding: 0 10px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: rgba(139, 92, 246, 0.14);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.2);
      font-weight: 800;
      font-size: 12px;
    }
    .empty {
      min-height: 470px;
      display: grid;
      place-items: center;
      padding: 30px;
      text-align: center;
      color: var(--muted);
    }
    .empty-inner { max-width: 330px; }
    .empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      margin: 0 auto 18px;
      display: grid;
      place-items: center;
      font-size: 30px;
      background: linear-gradient(145deg, rgba(124,58,237,.18), rgba(34,211,238,.08));
      border: 1px solid var(--line);
    }
    .empty h2 { margin: 0 0 8px; color: #e2e8f0; font-size: 17px; }
    .empty p { margin: 0; line-height: 1.6; font-size: 13px; }
    .message-list {
      display: none;
      max-height: 720px;
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(139,92,246,.45) transparent;
    }
    .mail {
      padding: 19px 22px;
      border-bottom: 1px solid var(--line);
      transition: background .15s ease;
    }
    .mail:hover { background: rgba(30, 41, 59, 0.28); }
    .mail:last-child { border-bottom: 0; }
    .mail-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 7px;
    }
    .from {
      min-width: 0;
      font-size: 13px;
      font-weight: 800;
      color: #c7d2fe;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .date { flex: 0 0 auto; color: #64748b; font-size: 11px; }
    .subject { margin: 0; color: #f8fafc; font-size: 15px; line-height: 1.45; letter-spacing: -0.01em; }
    .mail-body {
      margin-top: 10px;
      color: #94a3b8;
      font-size: 12.5px;
      line-height: 1.65;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .mail.expanded .mail-body { display: block; max-height: 360px; overflow: auto; }
    .mail-footer { display: flex; align-items: center; gap: 8px; margin-top: 11px; }
    .mini-btn, .unread-pill { padding: 6px 9px; border-radius: 9px; font-size: 11px; font-weight: 750; }
    .mini-btn { background: rgba(51, 65, 85, 0.54); border: 1px solid var(--line); color: #cbd5e1; }
    .unread-pill { color: #6ee7b7; background: rgba(16,185,129,.09); border: 1px solid rgba(16,185,129,.16); }
    .alert {
      display: none;
      margin: 20px 22px 0;
      padding: 13px 14px;
      border-radius: 13px;
      color: #fecdd3;
      background: rgba(190, 18, 60, 0.1);
      border: 1px solid rgba(251, 113, 133, 0.22);
      font-size: 12px;
      line-height: 1.5;
    }
    .spinner {
      width: 15px;
      height: 15px;
      display: none;
      border: 2px solid rgba(255,255,255,.28);
      border-top-color: white;
      border-radius: 999px;
      animation: spin .75s linear infinite;
      vertical-align: -2px;
      margin-right: 7px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    footer {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 20px;
      color: #475569;
      font-size: 11px;
    }
    footer a { color: #64748b; text-decoration: none; }
    footer a:hover { color: #a5b4fc; }
    @media (max-width: 850px) {
      .layout { grid-template-columns: 1fr; }
      .results-card { min-height: 460px; }
      .empty { min-height: 380px; }
      .topbar { margin-bottom: 30px; }
    }
    @media (max-width: 560px) {
      .shell { width: min(100% - 20px, 1160px); padding-top: 18px; }
      .status-pill { display: none; }
      .hero { margin-bottom: 22px; }
      h1 { font-size: clamp(42px, 17vw, 68px); }
      .hero p { font-size: 14px; }
      .grid-2 { grid-template-columns: 1fr; }
      .card-header, form { padding-left: 18px; padding-right: 18px; }
      .results-toolbar, .mail { padding-left: 18px; padding-right: 18px; }
      .actions { flex-direction: column; }
      .secondary { min-height: 44px; }
      footer { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="read_email home"><span class="logo">✉</span><span>read_email</span></a>
      <div class="status-pill"><span class="status-dot"></span> API online</div>
    </header>

    <section class="hero">
      <div class="eyebrow">Outlook · OAuth mailbox reader</div>
      <h1>Your inbox, without the clutter.</h1>
      <p>Paste one authorized Outlook/Hotmail account line, choose a backend, and read the newest messages through Microsoft OAuth. Credentials stay in this request and are not stored by the app.</p>
    </section>

    <section class="layout">
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Mailbox connection</h2>
            <p class="card-subtitle">Format: email | password | refresh_token | client_id</p>
          </div>
        </div>

        <form id="reader-form" autocomplete="off">
          <div class="field">
            <label for="account">Account line <span class="hint">required</span></label>
            <textarea id="account" spellcheck="false" placeholder="email|password|refresh_token|client_id" required></textarea>
          </div>
          <div class="field">
            <label for="api-key">Reader API key <span class="hint">production</span></label>
            <input id="api-key" type="password" placeholder="x-api-key" autocomplete="off" />
          </div>
          <div class="grid-2">
            <div class="field">
              <label for="backend">Backend</label>
              <select id="backend"><option value="graph">Microsoft Graph</option><option value="imap">IMAP OAuth2</option></select>
            </div>
            <div class="field">
              <label for="limit">Messages</label>
              <select id="limit"><option value="5">5 newest</option><option value="10" selected>10 newest</option><option value="15">15 newest</option><option value="25">25 newest</option></select>
            </div>
          </div>
          <div class="actions">
            <button class="primary" id="submit-btn" type="submit"><span class="spinner" id="spinner"></span><span id="submit-label">Read inbox</span></button>
            <button class="secondary" id="clear-btn" type="button">Clear</button>
          </div>
          <div class="security">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 5 6v5c0 4.7 2.8 8.9 7 10 4.2-1.1 7-5.3 7-10V6l-7-3Z" stroke="currentColor" stroke-width="1.7"/><path d="m9.4 12.1 1.6 1.6 3.7-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>The password field is accepted only for compatibility and is not used for Microsoft authentication. Do not use this page for mailboxes you are not authorized to access.</span>
          </div>
        </form>
      </div>

      <div class="card results-card">
        <div class="results-toolbar">
          <div class="result-title-wrap"><h2 class="result-title" id="result-title">Inbox preview</h2><div class="result-meta" id="result-meta">Waiting for a mailbox connection</div></div>
          <div class="count-badge" id="count-badge">0</div>
        </div>
        <div class="alert" id="alert"></div>
        <div class="empty" id="empty-state"><div class="empty-inner"><div class="empty-icon">☁</div><h2>No messages loaded</h2><p>Your newest emails will appear here. Message bodies are rendered as plain text for safer previewing.</p></div></div>
        <div class="message-list" id="message-list"></div>
      </div>
    </section>

    <footer><span>read_email · Node.js · Vercel / Heroku ready</span><span><a href="/health" target="_blank" rel="noreferrer">Health endpoint ↗</a></span></footer>
  </main>

  <script>
    (function () {
      var form = document.getElementById("reader-form");
      var account = document.getElementById("account");
      var apiKey = document.getElementById("api-key");
      var backend = document.getElementById("backend");
      var limit = document.getElementById("limit");
      var submitBtn = document.getElementById("submit-btn");
      var submitLabel = document.getElementById("submit-label");
      var spinner = document.getElementById("spinner");
      var clearBtn = document.getElementById("clear-btn");
      var list = document.getElementById("message-list");
      var empty = document.getElementById("empty-state");
      var alertBox = document.getElementById("alert");
      var resultTitle = document.getElementById("result-title");
      var resultMeta = document.getElementById("result-meta");
      var countBadge = document.getElementById("count-badge");

      function setLoading(value) {
        submitBtn.disabled = value;
        spinner.style.display = value ? "inline-block" : "none";
        submitLabel.textContent = value ? "Reading…" : "Read inbox";
      }
      function showError(message) { alertBox.textContent = message; alertBox.style.display = "block"; }
      function clearError() { alertBox.textContent = ""; alertBox.style.display = "none"; }
      function formatDate(value) {
        if (!value) return "Unknown date";
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      }
      function safeString(value) { if (Array.isArray(value)) return value.join(", "); return value == null ? "" : String(value); }
      function addText(parent, className, text, tagName) {
        var el = document.createElement(tagName || "div");
        if (className) el.className = className;
        el.textContent = text;
        parent.appendChild(el);
        return el;
      }
      function renderMessages(data) {
        list.replaceChildren();
        var messages = Array.isArray(data.messages) ? data.messages : [];
        resultTitle.textContent = data.email || "Inbox preview";
        resultMeta.textContent = (data.backend || "mail") + " · newest messages";
        countBadge.textContent = String(messages.length);
        if (!messages.length) {
          list.style.display = "none";
          empty.style.display = "grid";
          empty.querySelector("h2").textContent = "Inbox is empty";
          empty.querySelector("p").textContent = "No messages were returned for this request.";
          return;
        }
        empty.style.display = "none";
        list.style.display = "block";
        messages.forEach(function (message) {
          var article = document.createElement("article");
          article.className = "mail";
          var top = document.createElement("div");
          top.className = "mail-top";
          addText(top, "from", safeString(message.from) || "Unknown sender");
          addText(top, "date", formatDate(message.date));
          article.appendChild(top);
          addText(article, "subject", safeString(message.subject) || "(No subject)", "h3");
          addText(article, "mail-body", safeString(message.body) || "No text preview available.");
          var footer = document.createElement("div");
          footer.className = "mail-footer";
          if (message.unread === true) addText(footer, "unread-pill", "Unread");
          var expand = document.createElement("button");
          expand.type = "button";
          expand.className = "mini-btn";
          expand.textContent = "Expand body";
          expand.addEventListener("click", function () {
            var expanded = article.classList.toggle("expanded");
            expand.textContent = expanded ? "Collapse body" : "Expand body";
          });
          footer.appendChild(expand);
          article.appendChild(footer);
          list.appendChild(article);
        });
      }

      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearError();
        var accountValue = account.value.trim();
        if (!accountValue) { showError("Paste an account line first."); account.focus(); return; }
        setLoading(true);
        try {
          var headers = { "content-type": "application/json" };
          if (apiKey.value.trim()) headers["x-api-key"] = apiKey.value.trim();
          var response = await fetch("/api/read", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ account: accountValue, backend: backend.value, limit: Number(limit.value) })
          });
          var data;
          try { data = await response.json(); } catch (e) { throw new Error("Server returned a non-JSON response."); }
          if (!response.ok || !data.ok) throw new Error(data.error || "Mailbox read failed.");
          renderMessages(data);
        } catch (error) {
          showError(error && error.message ? error.message : "Mailbox read failed.");
        } finally {
          setLoading(false);
        }
      });

      clearBtn.addEventListener("click", function () {
        account.value = "";
        apiKey.value = "";
        clearError();
        list.replaceChildren();
        list.style.display = "none";
        empty.style.display = "grid";
        empty.querySelector("h2").textContent = "No messages loaded";
        empty.querySelector("p").textContent = "Your newest emails will appear here. Message bodies are rendered as plain text for safer previewing.";
        resultTitle.textContent = "Inbox preview";
        resultMeta.textContent = "Waiting for a mailbox connection";
        countBadge.textContent = "0";
        account.focus();
      });
    })();
  </script>
</body>
</html>`;

module.exports = HOME_HTML;
