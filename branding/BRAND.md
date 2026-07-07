# LocalLedger brand system (2026 rework)

## Conceptual hook

LocalLedger is two rooms. Upstairs, the Ledger: official economic data for every
state, county, and metro, with a citation on every number and nothing invented.
Downstairs, the Machine: a ten-million-citizen model economy that you are allowed
to destroy. Print money until prices triple in a quarter. Crash the stock market.
Put the country back on gold. Then walk back upstairs and see what the real
numbers did in 1929, 1973, and 2008.

One sentence: "Real data upstairs, a crash-test economy downstairs."

## Typography

- Display: Fraunces (Google Fonts, optical sizing 9..144, weights 400/600/700/900).
  Wonky editorial serif. All headings.
- Body: Author (Fontshare, weights 400/500/600/700). Warm humanist sans with
  personality. Fallback chain goes to Fraunces (also loaded), never to a system sans.
- Technical: JetBrains Mono. Timestamps, tick labels, table numerics, HUD chrome.
  Tabular numerals (`tnum`) on every money or numeric cell (Stripe discipline).

Banned everywhere: Inter, Roboto, Arial, Helvetica, system-ui, Space Grotesk, and
every other font on the SARAS_TASTE banlist.

## Color

- Ledger cream (page): #F7F1E3
- Panel cream: #EFE7D3
- Card surface: #FCF8EE
- Ink: #181410 (text, dark surfaces, the machine room)
- Signature accent, "machine orange": #E8540A. The color stenciled on equipment
  you are not supposed to touch. One filled CTA per band, spark lines, live values.
- Functional (never decorative): profit green #1E6B4A, loss red #B3372E,
  data blue #33586E, brass #8C6D1F.
- Machine room (simulator, footer): ink background, cream text #F3EBD8,
  bright accent #FF6A1F, panel #1D1913, hairline #332C1E.

No gradients as decoration. No purple. Color states are paired with text or icons.

## Logo

A square ledger tile: four corner brackets (ink), horizontal ledger ruling, and a
single orange spark line that rises, crashes, and recovers, ending above where it
started. The crash-and-recovery line is the whole thesis: the site lets you break
an economy and understand the recovery.

Deconstructed elements reused across the site:

1. Corner brackets: HUD frames on featured cards and section markers.
2. The spark line: hero animation (draws itself on load), section dividers,
   the simulator's live pulse.
3. Ledger ruling: subtle horizontal ruling on page backgrounds, chart grids.

## Voice

Educational, specific, a little dry. Microcopy leans on machine-room language:
"ALL SAFETIES OFF", "SCENARIO 03 / WEIMAR 1923", "0 FABRICATED DATA POINTS".
Never generic SaaS copy. Never exclamation points. No em dashes (build fails).

## Structural reference

Stripe DESIGN.md for financial-data discipline: tabular numerals, hairline-border
cards (8 to 10px radius), one filled CTA per band, dark featured panels.
Visual identity is editorial-brutalist warm, per SARAS_TASTE.md, not Stripe indigo.
