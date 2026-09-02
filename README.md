# Go Green Sod — homepage concept

A redesign concept for [gogreensod.com](https://gogreensod.com), a farm-direct
sod supplier serving Metro Atlanta. Single static page, no build step, no
dependencies.

Design concept by NEXTLYN. Not affiliated with or endorsed by Go Green Sod.

## Run it

Any static server, or open `index.html` directly:

    python3 -m http.server 8899

## Structure

    index.html          the whole page: markup, CSS and JS
    assets/img/         photography
    scripts/build-artifact.py   bundles everything into one self-contained file

## Content

Copy, pricing, sun requirements and FAQ answers are taken from the current
live site. Photography is open-license placeholder imagery, not the client's
own fields; the four turf close-ups are generic and should be reshot before
this goes to production.

## Notes

- Theme is locked dark. One accent (`--accent: #8FC24A`), one radius scale.
- Nav links are in-page anchors only. No secondary pages exist yet.
- The pallet estimator sizes on 450 sq ft per pallet, the coverage the live
  site publishes for Zeon Zoysia, and enforces the three pallet minimum.
