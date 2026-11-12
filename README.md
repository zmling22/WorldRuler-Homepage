# WorldRuler

Project homepage for **WorldRuler: Interactive World Modeling under Configurable Rules**.

**Website:** https://zmling22.github.io/WorldRuler-Homepage/

The website uses plain HTML, CSS, and JavaScript. No build step, package installation, external font service, or application server is required.

## Preview

```sh
python3 -m http.server 8765
```

Open http://localhost:8765. Media paths are relative so the same files work under the GitHub Pages project path.

## Publish

GitHub Pages publishes the root directory of the `main` branch. `.nojekyll` keeps the files unchanged. Push changes to `main` to update the site.

## Content

- `index.html`: research narrative, authors, demonstrations, dataset, and citation.
- `styles.css`: responsive visual design inspired by [AlayaVista](https://alaya-lab.github.io/AlayaVista/).
- `showcase-data.js`: eight paired demonstrations, rule descriptions, categories, durations, and media filenames.
- `script.js`: category filters, keyboard-accessible sample tags, synchronized comparisons, chapter navigation, figure viewer, motion controls, and citation copying.
- `assets/`: optimized project-owned figures and video derivatives.
- [ASSETS.md](ASSETS.md): media provenance and interpretation.

The paper, code, and dataset links remain marked **Coming soon** until public releases are available. No draft PDF is included. Dataset statistics are descriptive counts, not experimental scores; unfinished experiment results are not presented as final results.

## Accessibility and playback

Navigation and comparison tabs support keyboard access. Figures open in a native dialog with Escape-to-close and focus restoration. Background motion respects reduced-motion preferences and pauses outside the viewport. The comparison player has shared play, pause, restart, and seek controls; individual MP4 links provide a fallback. Videos use standard H.264, YUV420p, and fast-start MP4.
