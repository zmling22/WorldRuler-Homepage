# Media provenance

The website uses author-provided WorldRuler assets. Sources were checked in the supplied OSS archive and the project's Inspire workspace. Only selected public-facing figures and media derivatives are included here; access credentials and private operational records are not part of this repository.

## Figures

| Website asset | Original selected asset | Interpretation |
| --- | --- | --- |
| `persistence.webp` | `worldruler_teaser_saved_graph_v16.png` | Conceptual illustration of rule-state persistence; not a measured save/restore recording. |
| `method.webp` | `worldruler_overview_demo_v14.png` | Method schematic; embedded scene images illustrate the mechanism. |
| `replacement.webp` | `worldruler_attribute_replacement_v4_editable.preview.png` | Attribute replacement and paired-training schematic. |
| `data-pipeline.webp` | `worldruler_data_pipeline_v7.png` | RuleVerse collection pipeline. |
| `dataset-statistics.webp` | `worldruler_dataset_statistics_v9.png` | RuleVerse descriptive statistics. |

PNG originals were converted to high-quality WebP for delivery, with no substantive visual changes. The method selection was verified against the current Inspire figure README. Counts and authors follow the November 11, 2026 manuscript: 3,200 pairs / 6,400 videos, with 2,900 training and 300 test pairs.

## Generated comparison videos

These are actual outputs of the **training-free WorldRuler H3 Ref2VA Turbo implementation**, with cross-window observation enabled and no trained attribute-writer checkpoint. They must not be relabeled as results of the trained writer.

Source run: `gtav_dlc_4x2_20261102_04`. The generated region was cropped from the right half of each comparison video, using `(x=1344, y=48, width=1344, height=768)`, then scaled to 960 pixels wide and encoded as H.264. No generated frames were synthesized or retouched. Posters are frames from the corresponding videos.

| Website video | Episode | Source SHA-256 |
| --- | --- | --- |
| `tank-on.mp4` | `pair_0035_positive` | `aa1f6be4001f105dea8fa7c54838c0cbfe8b73af39687dfc474114ffb706eaac` |
| `tank-off.mp4` | `pair_0035_negative` | `bb2938a74234ce4c948c6d5377d99d98792707bddd251044089da0d92b865633` |
| `vehicle-on.mp4` | `pair_0366_positive` | `30876d9cedaa32f09737dc2872b0d5b274481bee82a225532ac490720173422b` |
| `vehicle-off.mp4` | `pair_0366_negative` | `4b2f927d27da9d0ee18b191661a8750f12510306b1d2562e0a644bc77802c10f` |

The tank pair toggles native damage/effect behavior. The vehicle pair toggles a custom smoke visual effect on vehicle entry; smoke does not imply damage. The original clips' hashes match the source completion records and curated figure provenance. All source videos passed full decoding checks.

## Illustrative temple environment

The background uses an H3 reference clip (`temple_h3_ref2va_closed_until_insert_20261031/h3.mp4`, 19.5 seconds). Its source metadata explicitly identifies it as native Ref2VA reference generation, **not** a full WorldRuler pipeline run.

The temple walkthrough (`temple_rule_demo_20261031/worldruler_temple_demo.mp4`) adds offline 3D reconstruction, observed visual states, and scripted rule annotations to that clip. It is **not** a new closed-loop experiment or a save-and-restore recording. Ambiguous key-insertion events remain unconfirmed; the page makes that distinction visible.

- Original H3 video SHA-256: `1797a3b12ebe3a152afa37d834b9ff5b451ff116be74b2ef633ed15aed6e97e0`
- Original walkthrough SHA-256: `cd77d315e9e9068833a05bdfd46c6e5b2bddbe651c23330506b9f4e56776a89d`

The web versions are spatially resized and compressed, retain the original timing, and contain no audio.

## Design credit

The layout, dark palette, serif accents, and presentation rhythm are inspired by [AlayaVista](https://alaya-lab.github.io/AlayaVista/). The implementation is original; AlayaVista research prose and media are not reused.
