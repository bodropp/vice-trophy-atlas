# Vice Trophy Atlas

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bodropp/vice-trophy-atlas/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bodropp/vice-trophy-atlas/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide + tracker for all **55 PS5 trophies of Grand Theft Auto VI** — an entry for [Make GTA 6 Trophy Guide](https://make.fun/bounty/gta6-trophy-guide-01) on [make.fun](https://make.fun).

## What it is

- **The data first:** every one of the 55 official trophies with its exact official name, description and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), in `app/data/trophies.json`.
- **A guide to each trophy in our own words**, citing its sources — what to do, where, and when it can be missed. The game launched 19 Nov 2026, so anything beyond the official description is marked as a reasoned read, never presented as fact.
- **A roadmap to the platinum** in 7 stages, and a missable verdict built from the official descriptions: no trophy in the list is one-time-only; three story-beat trophies (#20, #45, #47) are flagged as a watch-list.
- **A tracker:** a checklist saved in the browser (localStorage) with export and import, filters by grade, kind, missable watch-list and earned state, and a spoiler setting that hides story trophies until earned.
- **Fully offline:** no network requests, no external fonts or images, no Rockstar logo or artwork. Open `app/index.html` in a desktop browser.

## Run it

```sh
node main.ts            # writes /output (or set MAKEFUN_OUTPUT_DIR=out)
```

Open `app/index.html` directly, or serve it locally (e.g. `node serve.ts` from the kit, or any static server) and open it in desktop Chrome.
