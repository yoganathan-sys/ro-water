# Contributing to R-Tech Pure Water

Thank you for your interest in contributing to **R-Tech Pure Water**! We welcome improvements, bug reports, and code contributions that help provide clean water solutions and a world-class customer experience.

---

## 🛠️ Development Workflow

### 1. Fork & Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/ro-water.git
   cd ro-water
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/yoganathan-sys/ro-water.git
   ```

### 2. Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

---

## 🌿 Branch & Commit Guidelines

* **Branch Naming**:
  * Features: `feat/<feature-name>`
  * Fixes: `fix/<issue-name>`
  * Documentation / Style: `docs/<title>` or `style/<title>`
* **Commit Messages**: Follow Conventional Commits:
  * `feat: add booking SMS gateway fallback`
  * `fix: correct mobile navbar dropdown z-index`
  * `style: align footer contact cards with theme`

---

## 🔒 Security Standards

* **Never commit secrets**: Check `.env` files and verify that no real API keys, passwords, or tokens are tracked by Git.
* **Keep RLS active**: Database policies in `supabase/schema.sql` must strictly guard customer personally identifiable information (PII).
* **Sanitize Inputs**: All form inputs and dynamic text renders must be properly escaped to avoid XSS vulnerabilities.

---

## 🚀 Submitting a Pull Request

1. Ensure syntax passes cleanly:
   ```bash
   node -c dev-server.js
   node -c api/send-order-sms.js
   ```
2. Run a security check:
   ```bash
   npm audit
   ```
3. Push to your fork and submit a Pull Request targeting `main`.
4. Fill out the PR checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
