# Security Policy

## Reporting a Vulnerability

Please report security issues privately through GitHub Security Advisories or by email to `pandaxpanther@gmail.com`.

Do not open a public issue for vulnerabilities, secrets, auth bypasses, supply chain problems, or data exposure risks.

## Scope

In scope:

- Source code in this repository
- GitHub Actions workflow behavior
- Static site assets served by LocalLedger
- Data pipeline handling of public API responses

Out of scope:

- Vulnerabilities in upstream public data providers
- Denial of service against third party public APIs
- Social engineering

## Secrets

API keys must not be committed. Use local `.env.local` files and GitHub Actions secrets only.
