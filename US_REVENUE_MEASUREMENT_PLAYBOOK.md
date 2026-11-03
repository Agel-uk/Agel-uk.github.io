# DealLens AI — US Revenue Measurement Playbook

Updated: 2026-11-03. This is an operating checklist, **not** a live analytics report.

## Verified baseline (user-provided Amazon Associates report, updated 2026-11-02)
- Tracking ID: `deallensai-20`
- Last 30 days: 24 Amazon clicks; $0.00 commissions; $0.00 bounties
- This month: 1 click; 0 ordered items; 0 shipped items; 0.00% conversion; $0.00 earnings
- Amazon payment onboarding remains incomplete. Complete it through the account owner's secure Amazon dashboard. Never put payment details in GitHub.
- GA4 measurement ID in site code: `G-J09RWN8FZX`; no verified GA4 conversion/event report is available here.

## Weekly scorecard (fill in from first-party dashboards; do not guess)
| Week ending | US organic clicks (Search Console) | US organic impressions | US sessions (GA4) | retailer_outbound_click events (GA4) | Amazon clicks | Ordered items | Shipped items | Amazon earnings USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| YYYY-MM-DD | — | — | — | — | — | — | — | — |

**Definitions and caveats:** Search Console clicks are visits from Google Search; GA4 sessions are consent-dependent and not directly interchangeable. GA4 `retailer_outbound_click` fires only for visitors who allow optional analytics, so it will undercount total outbound clicks. Amazon Associates clicks use Amazon's own reporting and may differ from GA4 because of attribution, filtering and timing. An Amazon click is not a purchase. Never present earnings as verified without a fresh Amazon report.

## First-party verification procedure
1. **GitHub Pages:** Check the latest deployment workflow is `completed/success`. Confirm the live homepage and three priority guides open on desktop and mobile.
2. **Search Console:** Select the verified `https://agel-uk.github.io/` property. Compare last 28 days to previous 28 days, filter country **United States**, and export **Queries** and **Pages**. Review indexing and the sitemap status separately. Indexing is not guaranteed.
3. **GA4:** In Reports, filter country **United States** and record sessions and landing pages. In Realtime or DebugView, opt into analytics on the site, then click an Amazon link from the US guide hub and check for `retailer_outbound_click`. Test both same-tab and new-tab links; browser blockers and consent can prevent event delivery. Do not manufacture test clicks or purchases to inflate affiliate reporting.
4. **Amazon Associates US:** In Reports, select the same date range and `deallensai-20` (or note when using combined IDs). Record clicks, ordered items, shipped items, conversion, commissions and bounties. Check payment onboarding independently.
5. **Compare:** Investigate whether the bottleneck is (a) low US search impressions, (b) low organic click-through, (c) weak retailer outbound activity, or (d) Amazon clicks without orders. Avoid claiming a conversion defect based on 24 clicks alone.

## Thirty-day decision gates
- **Days 1–7:** Establish the scorecard and verify Search Console country filtering, GA4 consent-based events and Amazon tracking tags.
- **Days 8–14:** Use actual US search queries to improve only pages with relevant impressions. Avoid keyword stuffing and invented product rankings.
- **Days 15–21:** Compare US landing pages and retailer click paths. Improve unclear calls to action only where user behavior supports it.
- **Days 22–30:** Recheck impressions, clicks, orders and earnings against baseline. If US impressions remain minimal, prioritize distribution and original useful content rather than cosmetic site changes. If Amazon clicks increase but orders remain zero, inspect offer relevance and traffic quality without claiming a statistically proven issue.

## Three priority buyer journeys
- [Headphones for calls and travel](guide-wireless-headphones.html)
- [Robot vacuums for pets and carpet](guide-robot-vacuums.html)
- [Mesh Wi-Fi for larger homes](guide-mesh-wifi.html)

The website does not show live product prices, guaranteed rankings, verified hands-on tests or guaranteed earnings. This document contains no private credentials.
