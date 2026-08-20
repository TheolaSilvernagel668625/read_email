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

function redactText(value, secrets = []) {
  let output = String(value ?? "");
  for (const secret of secrets) {
    if (typeof secret === "string" && secret.length >= 8) {
      output = output.split(secret).join("[REDACTED]");
    }
  }
  return output;
}

function redactValue(value, secrets = [], depth = 0) {
  if (depth > 8) return "[MAX_DEPTH]";
  if (typeof value === "string") return redactText(value, secrets);
  if (value === null || value === undefined || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((item) => redactValue(item, secrets, depth + 1));
  if (typeof value === "object") {
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      if (/password|refresh.?token|access.?token|authorization/i.test(key)) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = redactValue(item, secrets, depth + 1);
      }
    }
    return output;
  }
  return String(value);
}

function headersToObject(headers) {
  try {
    return Object.fromEntries(headers.entries());
  } catch {
    return {};
  }
}

function makeProviderError(message, options = {}) {
  const error = new Error(message);
  error.code = options.code || "PROVIDER_ERROR";
  error.provider = options.provider || "microsoft";
  error.providerStatus = Number.isInteger(options.status) ? options.status : null;
  error.providerDetails = options.details || null;
  return error;
}

function safeErrorDetails(error, secrets = []) {
  const details = {
    name: error && error.name ? String(error.name) : "Error",
    message: redactText(error && error.message ? error.message : String(error), secrets)
  };

  const preferredKeys = [
    "code",
    "responseStatus",
    "responseText",
    "serverResponseCode",
    "authenticationFailed",
    "command",
    "response",
    "statusCode"
  ];

  for (const key of preferredKeys) {
    if (error && error[key] !== undefined) {
      details[key] = redactValue(error[key], secrets);
    }
  }

  if (error && typeof error === "object") {
    for (const [key, value] of Object.entries(error)) {
      if (key === "stack" || key in details) continue;
      if (/password|refresh.?token|access.?token|authorization|auth/i.test(key)) {
        details[key] = "[REDACTED]";
      } else {
        details[key] = redactValue(value, secrets);
      }
    }
  }

  return details;
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

async function readResponse(response, secrets = []) {
  const rawBody = await response.text();
  let payload = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = null;
    }
  }

  return {
    rawBody: redactText(rawBody, secrets),
    payload: redactValue(payload, secrets),
    headers: redactValue(headersToObject(response.headers), secrets)
  };
}

async function getAccessToken(account, scope) {
  const tokenEndpoint = process.env.MS_TOKEN_ENDPOINT || DEFAULT_TOKEN_ENDPOINT;
  const body = new URLSearchParams({
    client_id: account.clientId,
    grant_type: "refresh_token",
    refresh_token: account.refreshToken,
    scope
  });

  let response;
  try {
    response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(30000)
    });
  } catch (error) {
    const isTimeout = error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw makeProviderError(
      isTimeout ? "Microsoft token request timed out." : "Microsoft token request failed before a response was received.",
      {
        provider: "microsoft_token",
        code: isTimeout ? "MICROSOFT_TOKEN_TIMEOUT" : "MICROSOFT_TOKEN_NETWORK_ERROR",
        details: {
          endpoint: tokenEndpoint,
          scope,
          cause: safeErrorDetails(error, [account.refreshToken])
        }
      }
    );
  }

  const responseData = await readResponse(response, [account.refreshToken]);

  if (!response.ok) {
    const payload = responseData.payload || {};
    const errorName = payload.error || "token_error";
    const description = payload.error_description || responseData.rawBody || "Token exchange failed.";

    throw makeProviderError(`${errorName}: ${description}`, {
      provider: "microsoft_token",
      code: errorName,
      status: response.status,
      details: {
        endpoint: tokenEndpoint,
        scope,
        status: response.status,
        statusText: response.statusText,
        headers: responseData.headers,
        payload: responseData.payload,
        rawBody: responseData.rawBody
      }
    });
  }

  const payload = responseData.payload || {};
  if (!payload.access_token) {
    throw makeProviderError("Microsoft token response did not include access_token.", {
      provider: "microsoft_token",
      code: "TOKEN_RESPONSE_MISSING_ACCESS_TOKEN",
      status: response.status,
      details: {
        endpoint: tokenEndpoint,
        scope,
        status: response.status,
        statusText: response.statusText,
        headers: responseData.headers,
        payload: redactValue(payload, [account.refreshToken])
      }
    });
  }

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
        try {
          parsed = await simpleParser(row.source);
        } catch {
          parsed = null;
        }
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
  } catch (error) {
    if (error && error.provider) throw error;

    throw makeProviderError(error && error.message ? error.message : "Microsoft IMAP request failed.", {
      provider: "microsoft_imap",
      code: (error && error.code) || "IMAP_ERROR",
      status: error && Number.isInteger(error.responseStatus) ? error.responseStatus : null,
      details: {
        host: "outlook.office365.com",
        port: 993,
        mailbox: "INBOX",
        error: safeErrorDetails(error, [account.refreshToken, accessToken])
      }
    });
  } finally {
    if (lock) lock.release();
    if (client.usable) {
      try {
        await client.logout();
      } catch {
        client.close();
      }
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

  let response;
  try {
    response = await fetch(url, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        prefer: 'outlook.body-content-type="text"'
      },
      signal: AbortSignal.timeout(30000)
    });
  } catch (error) {
    const isTimeout = error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw makeProviderError(
      isTimeout ? "Microsoft Graph request timed out." : "Microsoft Graph request failed before a response was received.",
      {
        provider: "microsoft_graph",
        code: isTimeout ? "MICROSOFT_GRAPH_TIMEOUT" : "MICROSOFT_GRAPH_NETWORK_ERROR",
        details: {
          endpoint: url.toString(),
          cause: safeErrorDetails(error, [account.refreshToken, accessToken])
        }
      }
    );
  }

  const responseData = await readResponse(response, [account.refreshToken, accessToken]);

  if (!response.ok) {
    const detail = responseData.payload && responseData.payload.error ? responseData.payload.error : {};
    const code = detail.code || `GRAPH_HTTP_${response.status}`;
    const message = detail.message || responseData.rawBody || "Mailbox read failed.";

    throw makeProviderError(`Microsoft Graph ${response.status}: ${message}`, {
      provider: "microsoft_graph",
      code,
      status: response.status,
      details: {
        endpoint: url.toString(),
        status: response.status,
        statusText: response.statusText,
        headers: responseData.headers,
        payload: responseData.payload,
        rawBody: responseData.rawBody
      }
    });
  }

  const payload = responseData.payload || {};
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

module.exports = {
  parseAccount,
  getAccessToken,
  readMailbox,
  readImap,
  readGraph
};
