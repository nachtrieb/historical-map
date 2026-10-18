# Historical Map, 1700 to 2000

A scrollable map of national boundaries, 1700 to 2000, with charts of how large each empire was and how many people lived in it.

**Open it: https://nachtrieb.github.io/historical-map/**

Built for an iPad held in landscape, and it works in any current browser. The map is on the left, the charts on the right, and one year is shared between them.

## Using it

- **Region buttons** switch the map: Europe, Asia, Africa, South America, North America, Middle East & SE Asia.
- **Year:** the slider, the −10 / −1 / +1 / +10 buttons, or touch and drag along either chart. With a keyboard: arrow keys, Shift or Ctrl for ten years, Home and End.
- **Charts show:** the strip under the slider sets which years the charts cover. Drag its middle to slide, its edges to zoom. "Around year" shows 100 years, "All years" resets.
- **Empires** (top right) chooses which of the 18 empires are drawn. Each line takes the colour the map uses for that empire's largest ruler in that year, so a line can change colour when the ruler changes (Habsburg to Austria-Hungary, for example).
- **Notes** holds the credits, the data sources, and what the page is doing about offline use.

### On an iPad, offline

1. Open the address above in Safari. The first time a region is shown it downloads (9 to 29 MB each, about 110 MB for all six); a banner shows progress.
2. Notes → Offline counts up as the page saves every region on the device. When it says all six are saved, the page works with no network.
3. Share → **Add to Home Screen**, so iPadOS does not clear the saved copy after a week unused.

The small `vMMDD.HHMM` label next to "All years" is the build of the page (UTC), which helps when checking that a reload picked up an update.

## What is in this repository

```
README.md             this file
docs/                 the website (GitHub Pages serves this folder)
  index.html          the page: map, charts, controls (about 0.2 MB)
  data/               one file per region, frames-<region>.<hash>.txt
  sw.js               service worker: keeps the page and frames for offline use
  manifest.webmanifest, icon-180.png    Add to Home Screen
```

Everything in `docs/` is generated; edit the generator, not these files. The `data/` files are named by a hash of their content, so a rebuild only replaces regions that changed.

## Where the data comes from

- **Borders and rulers, 1700 to 2000:** [Chronas](https://chronas.org) (public API at api.chronas.org, pulled 2026-10-15). Chronas colours whole provinces by ruler, so an empire's area is the territory Chronas assigns to it, not effective control, and borders are province-sized and approximate. This project is not affiliated with Chronas.
- **Map frames:** one image per year and region, captured from the Chronas map with labels and interface hidden.
- **Area:** computed from the Chronas province polygons.
- **Population:** HYDE 3.5 baseline gridded population (Klein Goldewijk, Beusen, Vander Linden, Doelman; Utrecht University, 2025; [doi:10.24416/UU01-F45D44](https://doi.org/10.24416/UU01-F45D44), CC BY), intersected with the Chronas provinces. Chronas's own population field is incomplete, so it is not used.
- **Which rulers make up each empire** is a hand-kept table (`empires.csv`); anything not listed is left out of the charts.

## How it is built

The generator lives in a separate working folder (`chronas_frames/`), as a chain of small Python tools:

| Step | Tool | Result |
|---|---|---|
| Capture a map image per year and region | `chronas_frames.py`, `regions.py` | `<region>/frames/<year>.jpg` |
| Area per empire per year | `chronas_series.py` | `series/*.csv` |
| Population per empire per year | `chronas_hyde.py` | `series/*_hyde.csv`, the chart page |
| Join regions and chart into one page | `combine.py` | `index.html` (needs the frame folders beside it) |
| Single self-contained file, or this site | `standalone.py` | `standalone/historical_map.html`, or `--site` for `docs/` |

To refresh this site after a rebuild, from the working folder:

```
python3 chronas_frames/standalone.py --site standalone/site
cd standalone/site
git add -A && git commit -m "Update" && git push
```

`--site` re-encodes frames to AVIF (1300 px wide, quality 45, cached between runs), writes `docs/`, and leaves this README alone.

## Technical notes

- **Frames** are AVIF images, stored base64 in text files and fetched when a region is first shown. AVIF needs iPadOS or macOS 16 or newer; `--format webp` builds for older systems.
- **Offline:** a service worker keeps the page (network first, so updates arrive on the next load) and the region files (cache first). Service workers need https, which GitHub Pages provides.
- **Safari quirk:** Safari reports an image as loaded before it is decoded, and drawing it then paints nothing. The page waits for each frame's `decode()` before drawing it.
- **No tracking, no accounts, no outside requests:** after the first load the page talks only to its own files.
