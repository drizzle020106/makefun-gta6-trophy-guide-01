[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/drizzle020106/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/drizzle020106/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI, all 55 PS5 trophies

An offline guide and tracker for the trophies of Grand Theft Auto VI on PlayStation 5: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden until earned. Every trophy shows its official name, description and grade, a guide written in our own words with its sources, and a checklist that saves in the browser.

## What it does

- **Checklist + progress**: tick trophies as you earn them; progress saves in localStorage, with total and per-grade bars and a "platinum needs N more" line.
- **Filters**: search by name, description or guide; filter by kind (story / missable / collectibles / activities / online — there are no online trophies, so that filter shows 0 and says so), by grade, and by earned/unearned.
- **Spoiler-safe mode**: hides the names and descriptions of the 18 hidden story trophies until you earn them.
- **Missable flag**: Positive Mental Attitude is the only trophy reported as possibly missable (Lucia's balcony meditation in Chapter 1) — it is flagged in red, and the report is labelled as not fully confirmed.
- **Platinum roadmap**: 7 steps, from Chapters 1–2 through the story, the six side-story finales, robberies, collectibles, and the long grind + 100% completion.
- **Export / import / reset**: export progress to a JSON file, import it back, or reset.
- **Offline**: static files under `app/`, zero network requests at run time. Serve with `node serve.ts` and open http://localhost:8080.

## Sources

Trophy names, descriptions, grades and hidden flags follow the official list as published on PlayStation, cross-checked between Exophase / PSNProfiles via [Planet GTA 6](https://www.planetgta6.com/en/gta-6-trophies/), [Output Lag](https://outputlag.com/guides/gta-6-trophy-list/) and [Push Square](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap). Each guide cites its sources beside the trophy. Five trophies (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) have no confirmed trigger at launch and are marked **Unconfirmed** rather than guessed at. Counts are stated only where the official description gives a number or at least two sources agree. Note: Push Square counts 27 hidden trophies where Exophase/PSNProfiles count 28; this guide follows the 28-count lists.

## Layout

- `app/index.html`, `app/app.js`, `app/style.css` — the guide
- `app/data/trophies.json` — the 55 trophies with official data, own-words guides and sources
- `main.ts` — copies `app/` + `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 real renders of the app (see `shots.json`)
- `serve.ts` — local static server for development

## License

MIT — see [LICENSE](LICENSE).
