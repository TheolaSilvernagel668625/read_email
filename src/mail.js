const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");

const DEFAULT_TOKEN_ENDPOINT = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const GRAPH_MESSAGES_URL = "https://graph.microsoft.com/v1.0/me/messages";
const IMAP_SCOPE = "https://outlook.office.com/IMAP.AccessAsUser.All offline_access";
const GRAPH_SCOPE = "https://graph.microsoft.com/Mail.Read offline_access";

function makeError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function parseAccount(line) {
  const parts = String(line || "").trim().split("|");
  if (parts.length !== 4) {
    throw makeError("Expected exactly 4 fields: email|password|refresh_token|client_id.", "INVALID_ACCOUNT_FORMAT");
  }

  const [email, password, refreshToken, clientId] = parts.map((value) => value.trim());
  if (!email || !email.includes("@")) throw makeError("Invalid email address.", "INVALID_EMAIL");
  if (!refreshToken) throw makeError("refresh_token is empty.", "INVALID_ACCOUNT_FORMAT");
  if (!clientId) throw makeError("client_id is empty.", "INVALID_ACCOUNT_FORMAT");

  return { email, password, refreshToken, clientId };
}

async function getAccessToken(account, scope) {
  const tokenEndpoint = process.env.MS_TOKEN_ENDPOINT || DEFAULT_TOKEN_ENDPOINT;
  const body = new URLSearchParams({
    client_id: account.clientId,
    grant_type: "refresh_token",
    refresh_token: account.refreshToken,
    scope
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(30000)
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Microsoft token endpoint returned HTTP ${response.status}.`);
  }

  if (!response.ok) {
    const errorName = payload.error || "token_error";
    const description = payload.error_description || "Token exchange failed.";
    throw new Error(`${errorName}: ${description}`);
  }

  if (!payload.access_token) throw new Error("Microsoft token response did not include access_token.");
  return payload.access_token;
}

function addressToString(address) {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (address.address) return address.name ? `${address.name} <${address.address}>` : address.address;
  return "";
}

async function readImap(account, limit) {
  const accessToken = await getAccessToken(account, IMAP_SCOPE);
  const client = new ImapFlow({
    host: "outlook.office365.com",
    port: 993,
    secure: true,
    logger: false,
    auth: { user: account.email, accessToken },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000
  });

  const results = [];
  let lock;

  try {
    await client.connect();
    lock = await client.getMailboxLock("INBOX", { description: "read_email request" });

    const total = client.mailbox ? client.mailbox.exists : 0;
    if (!total) return [];

    const start = Math.max(1, total - limit + 1);
    const rows = await client.fetchAll(`${start}:${total}`, {
      envelope: true,
      internalDate: true,
      source: true,
      flags: true
    });

    for (const row of rows.reverse()) {
      let parsed = null;
      if (row.source) {
        try { parsed = await simpleParser(row.source); } catch { parsed = null; }
      }

      const envelope = row.envelope || {};
      const from = parsed && parsed.from
        ? parsed.from.text
        : (envelope.from || []).map(addressToString).filter(Boolean).join(", ");
      const to = parsed && parsed.to
        ? parsed.to.text
        : (envelope.to || []).map(addressToString).filter(Boolean).join(", ");
      const bodyText = parsed && typeof parsed.text === "string"
        ? parsed.text
        : parsed && typeof parsed.html === "string" ? parsed.html : "";

      results.push({
        id: String(row.uid || row.seq || ""),
        subject: (parsed && parsed.subject) || envelope.subject || "",
        from,
        to,
        date: (parsed && parsed.date && parsed.date.toISOString()) || (row.internalDate && row.internalDate.toISOString()) || null,
        unread: row.flags ? !row.flags.has("\\Seen") : null,
        body: bodyText.trim().slice(0, 10000)
      });
    }

    return results;
  } finally {
    if (lock) lock.release();
    if (client.usable) {
      try { await client.logout(); } catch { client.close(); }
    } else {
      client.close();
    }
  }
}

async function readGraph(account, limit) {
  const accessToken = await getAccessToken(account, GRAPH_SCOPE);
  const url = new URL(GRAPH_MESSAGES_URL);
  url.searchParams.set("$top", String(limit));
  url.searchParams.set("$orderby", "receivedDateTime desc");
  url.searchParams.set("$select", "id,subject,from,toRecipients,receivedDateTime,isRead,body,bodyPreview");

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      prefer: 'outlook.body-content-type="text"'
    },
    signal: AbortSignal.timeout(30000)
  });

  let payload;
  try { payload = await response.json(); }
  catch { throw new Error(`Microsoft Graph returned HTTP ${response.status}.`); }

  if (!response.ok) {
    const detail = payload.error || {};
    throw new Error(`Microsoft Graph ${response.status}: ${detail.message || "Mailbox read failed."}`);
  }

  return (payload.value || []).map((item) => ({
    id: item.id || "",
    subject: item.subject || "",
    from: (item.from && item.from.emailAddress && item.from.emailAddress.address) || "",
    to: (item.toRecipients || []).map((recipient) => recipient && recipient.emailAddress && recipient.emailAddress.address).filter(Boolean),
    date: item.receivedDateTime || null,
    unread: typeof item.isRead === "boolean" ? !item.isRead : null,
    body: ((item.body && typeof item.body.content === "string") ? item.body.content : (item.bodyPreview || "")).slice(0, 10000)
  }));
}

async function readMailbox(account, options = {}) {
  const backend = options.backend || "imap";
  const limit = options.limit || 10;
  return backend === "graph" ? readGraph(account, limit) : readImap(account, limit);
}

module.exports = { parseAccount, getAccessToken, readMailbox, readImap, readGraph };
