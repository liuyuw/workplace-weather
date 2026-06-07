# Workplace Weather

Employee-first anonymous mood check-in prototype.

## Product Idea

Workplace Weather lets employees anonymously check in on how work feels today, then turns aggregated sentiment into a weather-style company mood report.

This is not positioned as an HR surveillance tool. It is an employee-first emotional signal product:

- quick daily check-in
- anonymous company-level mood aggregation
- burnout / dread / morale weather
- shareable result cards
- no comments or free-text workplace stories

## MVP Scope

- No login.
- No real company verification.
- No backend.
- Local-only prototype data in the browser.
- Company name, mood, reason, and shift timing are stored in localStorage.
- Public results are mocked locally and should not be treated as real company data.
- No free-text comments. The product should collect structured mood signals only.

## Core Safety Rules

- Never show company-level results below a minimum response threshold in a real backend.
- Never expose department, location, title, or small cohort data without privacy thresholds.
- Use language like self-reported sentiment, not objective claims about a company.
- Do not collect real names in the early product.
- Do not build a comment section.
- Do not collect or display free-text workplace complaints.
- Sell or display only aggregate trends, never individual-level data.

## Run Locally

This prototype is static.

1. Run: cd projects/workplace-weather && python3 -m http.server 5181
2. Open: http://127.0.0.1:5181
