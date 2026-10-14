# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take the security of **R-Tech Pure Water** seriously. If you discover a security vulnerability, we appreciate your help in disclosing it to us responsibly.

### How to Report
Please **DO NOT** create a public GitHub issue for security vulnerabilities. Instead, please report vulnerabilities privately via email to:

* **Primary Maintainer:** `yoganathan541541@gmail.com`
* **Security & Contributor Contact:** `01jackrichard@gmail.com`

Include the following details in your report:
1. Description of the vulnerability and its potential impact.
2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
3. The affected component, file, or API endpoint.
4. Suggested remediation or patch, if available.

### Response Timeline
* **Initial Acknowledgement:** Within 24 hours of receipt.
* **Assessment & Validation:** Within 72 hours.
* **Fix & Public Advisory:** Deployed promptly upon confirmation.

---

## Defensive Security Architecture Implemented

The application implements defense-in-depth principles across all layers:

1. **Database Row-Level Security (RLS)**:
   * PostgreSQL RLS enabled on all Supabase tables (`customers`, `water_bookings`, `contacts`).
   * Anonymous public users can only perform validated `INSERT` operations.
   * `SELECT`, `UPDATE`, and `DELETE` access is strictly restricted to authenticated owner sessions (`yoganathan541541@gmail.com`).

2. **HTTP Hardened Security Headers** (`vercel.json`):
   * `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing attacks)
   * `X-Frame-Options: SAMEORIGIN` (Protects against clickjacking)
   * `X-XSS-Protection: 1; mode=block` (Blocks cross-site scripting in legacy browsers)
   * `Referrer-Policy: strict-origin-when-cross-origin` (Protects referrer metadata)
   * `Permissions-Policy: camera=(), microphone=(), geolocation=()` (Disables unnecessary device hardware APIs)
   * `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (Enforces HTTPS HSTS)

3. **API Rate Limiting & Input Sanitization**:
   * IP-based rate limiting on `/api/send-order-sms` to prevent SMS abuse and endpoint flooding.
   * Regex-based input sanitization stripping HTML tags, script injection, and payload padding.

4. **Anti-Spam Honeypots**:
   * Hidden, non-tabbable honeypot fields on booking and contact forms to neutralize automated bots.

5. **Client-Side HTML Sanitization**:
   * Admin dashboard tables dynamically render customer data with strict DOM text encoding, avoiding unsafe `innerHTML` injection.
