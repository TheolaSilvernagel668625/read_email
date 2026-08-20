# read_email

Node.js HTTP API for reading **one Outlook/Hotmail mailbox that you own or are authorized to access**.

Input format:

```text
email|password|refresh_token|client_id
```

The `password` field is accepted only to keep compatibility with that 4-field format. **The app does not use the password.** Authentication uses the Microsoft refresh token and client ID to obtain a short-lived OAuth access token.

## Features

- Node.js 22
- Deployable to Vercel
- Deployable to Heroku
- Local Express server
- Outlook IMAP + OAuth2/XOAUTH2
- Microsoft Graph `Mail.Read`
- Does not persist submitted account credentials
- API-key protection for production deployments
- Maximum 25 messages per request

## API

### Health check

```http
GET /health
```

### Read inbox

```http
POST /api/read
Content-Type: application/json
x-api-key: YOUR_READER_API_KEY
```

JSON body:

```json
{
  "account": "user@example.com|PASSWORD_NOT_USED|REFRESH_TOKEN|CLIENT_ID",
  "limit": 10,
  "backend": "imap"
}
```

`backend` can be `imap` or `graph`.

You can also send the 4-field account line directly as `text/plain`.

The response never echoes the password, refresh token, or access token.

## Local

```bash
npm install
npm start
```

Server defaults to `http://localhost:3000`.

Syntax check:

```bash
npm run check
```

## Vercel

This repo includes `api/index.js` and `vercel.json`.

Set environment variable:

```text
READER_API_KEY=<a-long-random-secret>
```

Optional:

```text
MAIL_BACKEND=graph
MS_TOKEN_ENDPOINT=https://login.microsoftonline.com/consumers/oauth2/v2.0/token
```

For serverless deployment, Graph is usually the simplest backend because it only uses HTTPS. IMAP remains available when outbound IMAP connectivity is permitted.

## Heroku

The root `Procfile` contains:

```text
web: node server.js
```

`server.js` listens on `process.env.PORT`.

Set config vars such as:

```text
READER_API_KEY=<a-long-random-secret>
MAIL_BACKEND=imap
```

## Microsoft OAuth permissions

For IMAP, the refresh token must be usable with:

```text
https://outlook.office.com/IMAP.AccessAsUser.All
```

For Graph, the user/app needs delegated:

```text
Mail.Read
```

The default token endpoint targets Microsoft personal accounts:

```text
https://login.microsoftonline.com/consumers/oauth2/v2.0/token
```

Override it with `MS_TOKEN_ENDPOINT` when your tenant requires another Microsoft v2 endpoint.

## Production protection

On Vercel, Heroku, or when `NODE_ENV=production`, `/api/read` refuses requests until `READER_API_KEY` is configured. Send it using the `x-api-key` header.

Do not put real mailbox passwords, refresh tokens, access tokens, or account lines in the repository or deployment logs.
