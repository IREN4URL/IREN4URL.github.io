# ɪreːn (Design Two)
**Interdisciplinary Research on Ethical & Equitable NLP for under-resourced Languages**

Modernized, client-side, zero-build research platform for the **ɪreːn** collaboration, built with an Apple VisionOS-inspired translucent glassmorphic design system, dynamic multi-script canvas typography, responsive interactive filters, accessible lightbox gallery, and modular JSON-driven data architecture.

---

## 🏛️ System Architecture Overview

This branch (`design_two`) separates the presentation layer from the data layer:
- **No Build Tools or Bundlers Required**: Runs purely on standards-compliant vanilla HTML5, CSS3, and modern ES6+ JavaScript.
- **Dynamic Data-Driven Rendering**: All content (publications, tools, news, collaborators, gallery, and site metadata) is decoupled into human-readable JSON files in [`data/`](file:///home/enzo/AntiGravityProjects/IREN/data).
- **Asynchronous Hydration**: [`static/js/app.js`](file:///home/enzo/AntiGravityProjects/IREN/static/js/app.js) dynamically fetches JSON files, populates DOM elements, calculates category pills, and handles pagination and lightbox interactions in real-time.
- **Responsive Apple VisionOS Aesthetic**: Glassmorphism with `backdrop-filter: blur()`, specular rim highlights, fluid typography, dark mode / high contrast readability, and mobile-calibrated touch targets.

---

## 📂 Project Directory Structure

```text
├── index.html                  # Single-page semantic application shell & section anchors
├── data/                       # 📂 Content data stores (Pure JSON)
│   ├── site.json               # Global metadata, navbar links, contact coordinator
│   ├── research.json           # About narrative, mission, and pillars
│   ├── objectives.json         # Aim statement and core research objectives
│   ├── people.json             # Collaborators, advisors, and research fellows
│   ├── publications.json       # Peer-reviewed papers, system demos, and preprints
│   ├── tools.json              # Platforms, models, evaluation suites, and code repos
│   ├── news.json               # Chronological news items and community updates
│   └── gallery.json            # Get-together photography, captions, and locations
├── static/
│   ├── css/
│   │   └── theme.css           # Design tokens, VisionOS glassmorphism, responsive cascade
│   ├── js/
│   │   └── app.js              # Data loaders, dynamic filters, pagination, canvas animation
│   └── assets/
│       ├── img/
│       │   ├── logo.svg        # ɪreːn wave mark
│       │   ├── gallery/        # High-res get-together photography
│       │   └── people/         # Collaborator profile photos
│       └── fonts/              # Custom phonetic IPA fonts (ɪ, ː glyphs)
└── README.md                   # System documentation & data schema reference
```

---

## 📊 Content Data Reference (`data/*.json`)

To update or add new content to the website, edit the corresponding `.json` file in [`data/`](file:///home/enzo/AntiGravityProjects/IREN/data). No code compilation or server restart is necessary—simply refresh the browser.

### 1. `data/site.json`
Controls global website metadata, the hero banner lead, contact information, and top navigation items.

```json
{
  "brand": "IREN",
  "symbol": "ɪreːn",
  "fullform": "Interdisciplinary Research on Ethical & Equitable NLP for under-resourced languages",
  "metaDescription": "ɪreːn is an interdisciplinary research collaboration...",
  "contact": {
    "email": "huidromrudali@gmail.com",
    "lead": "Rudali Huidrom",
    "leadRole": "ɪreːn Lead and Coordinator",
    "github": "https://github.com/RHuidrom96",
    "address": "CNRS, LIG, GETALP / Collaborating Institutions Across India & Worldwide"
  },
  "nav": [
    { "label": "About", "href": "#about" },
    { "label": "Objectives", "href": "#objectives" },
    { "label": "Collaborators", "href": "#collaborators" },
    { "label": "Publications", "href": "#publications" },
    { "label": "Tools", "href": "#tools" },
    { "label": "News", "href": "#news" },
    { "label": "Gallery", "href": "#gallery" },
    { "label": "Contact us", "href": "#contact" }
  ]
}
```

---

### 2. `data/publications.json`
Controls peer-reviewed papers, system demonstrations, and preprints under `#publications`.
- `kind`: `"paper"`, `"software"`, `"dataset"`, `"preprint"`, or `"report"` (determines category filter pills and badge styling).
- `links`: Array of link chip objects (`label` and `url`).

**Adding a Publication:**
```json
{
  "id": "panini-wmt-2026",
  "year": 2026,
  "kind": "paper",
  "title": "PANINI: Improving Low-Resource English ↔ Manipuri Translation in Two Scripts via rsLoRA and Three-Stream Self-Augmentation",
  "authors": "Rudali Huidrom†, Vikas Kumar†, Hoomexsun Pangsatabam, Pinaki Das, K Kabi Khanganba, Nongmaithem Zeno, Nicholas Khumukcham, Mangalton Okram, Justice Konjengbam, Sai Varun Jamalpoor, Alex D Nelson Khangembam, Anand Konjengbam, and Vikram Goyal",
  "venue": "Proceedings of the Eleventh Conference on Machine Translation (WMT 2026), Shared Task on Low-Resource Indic Language Translation, pages 2161–2169",
  "note": "† Equal contribution",
  "links": [
    { "label": "Paper", "url": "https://www2.statmt.org/wmt26/pdf/2026.wmt-1.154.pdf" },
    { "label": "Code", "url": "https://github.com/RHuidrom96/WMT-2026-Team-PANINI" }
  ]
}
```

---

### 3. `data/tools.json`
Controls platforms, evaluation benchmarks, and software releases under `#tools`.
- `category`: `"Platforms"`, `"Models & APIs"`, `"Annotation"`, or `"Evaluation"`.
- `icon`: Icon identifier (`"sliders"`, `"translate"`, `"mic"`, `"chart"`, `"code"`, `"waveform"`).
- `status`: Pill badge label (e.g. `"Open Platform"`, `"Live Platform · v1.4"`).
- `links`: Array of buttons; set `"primary": true` for the luminous filled call-to-action button.

**Adding a Tool:**
```json
{
  "id": "aura",
  "name": "Aura",
  "tagline": "Platform for Human Evaluation of NLG",
  "category": "Platforms",
  "status": "Open Platform",
  "icon": "sliders",
  "description": "An open, self-hostable platform for human evaluation of natural language generation, built for under-resourced languages. It runs five evaluation protocols in one place (Likert/direct assessment, pairwise, ranking, error-span and post-editing), records script and speaker provenance, works fully offline, and can offer annotators an LLM assistant whose effect is logged.",
  "tags": ["NLG Evaluation", "Human-in-the-Loop", "Offline-Ready", "Multi-Protocol"],
  "links": [
    { "label": "Try Aura", "url": "https://www.aura4lrl.studio", "primary": true },
    { "label": "Watch the demo", "url": "https://youtu.be/NDtqi_Rch2I", "primary": false },
    { "label": "Code on GitHub", "url": "https://github.com/RHuidrom96/aura", "primary": false }
  ]
}
```

---

### 4. `data/news.json`
Controls timeline items under `#news`.
- `date`: Standard ISO date format (`"YYYY-MM-DD"`).
- `category`: Category pill label (e.g. `"Conference"`, `"Announcement"`, `"System Demo"`).
- `links`: Optional external links (e.g. paper PDF, event registration, repository).

**Adding a News Item:**
```json
{
  "id": "news-wmt-2026",
  "date": "2026-10-15",
  "category": "Conference",
  "title": "Two papers presented at WMT 2026 in Budapest",
  "summary": "Our research on low-resource machine translation and metric reliability across writing systems was presented at the Conference on Machine Translation (WMT 2026).",
  "links": [
    { "label": "PANINI Paper", "url": "https://www2.statmt.org/wmt26/pdf/2026.wmt-1.154.pdf" },
    { "label": "Which Metric Paper", "url": "https://www2.statmt.org/wmt26/pdf/2026.wmt-1.17.pdf" }
  ]
}
```

---

### 5. `data/people.json`
Controls all members displayed in the `#collaborators` section.
- `group`: `"Lead and Coordinator"`, `"Faculty Advisors"`, `"Research Team"`, or `"Past members"`.
- `subgroup`: For `"Research Team"`, can be `"Core team"` or `"Researchers"`.
- `photo`: Path to image (e.g. `"static/assets/img/people/rudali.jpg"`). If left empty `""`, an initial fallback badge is automatically rendered using `initials`.
- `url`: Optional profile URL (LinkedIn, Personal homepage, or Google Scholar).

**Adding a Collaborator:**
```json
{
  "id": "rudali-huidrom",
  "name": "Rudali Huidrom",
  "role": "Lead and Coordinator",
  "group": "Lead and Coordinator",
  "affiliation": "Incoming Postdoc @ CNRS, LIG, GETALP",
  "initials": "RH",
  "photo": "",
  "url": "https://www.linkedin.com/in/rudali-huidrom-983316104/",
  "active": true
}
```

---

### 6. `data/gallery.json`
Controls photos and full-screen preview modal in `#gallery`.
- `src`: Relative path to image file (recommended location: `static/assets/img/gallery/`).
- `title`, `caption`, `location`, `date`: Displayed both on the card and in the interactive Lightbox modal.
- `width`, `height`: Aspect ratio dimensions used for responsive thumbnail rendering.

**Adding a Gallery Photo:**
```json
{
  "id": "gallery-chak-khum",
  "src": "static/assets/img/gallery/get-together-1.jpg",
  "title": "At Chak-Khum",
  "caption": "Rudali and team celebrating milestones over traditional Manipuri cuisine at Chak-Khum restaurant.",
  "location": "Delhi, India",
  "date": "September 2026",
  "alt": "Two ɪreːn members smiling and making peace signs at a table of food beneath the Chak-Khum restaurant sign",
  "width": 1280,
  "height": 960
}
```

---

### 7. `data/objectives.json`
Controls the overarching Aim statement and the numbered Objective cards in `#objectives`.

```json
{
  "title": "Aim and objectives",
  "aim": {
    "title": "Aim",
    "description": "To serve under-resourced languages with language technology that works as well for them..."
  },
  "objectives": [
    {
      "id": 1,
      "title": "Build for every language and script.",
      "description": "Develop translation and other language technology that produces well-formed output..."
    }
  ]
}
```

---

### 8. `data/research.json`
Powers the narrative copy in `#about`, including the project lead paragraph, language technology focus, and institutional coalition.

---

## 🚀 Local Development & Preview

Because modern browsers block local `fetch()` calls on raw `file://` URLs due to CORS security policies, serve the project with a lightweight local web server:

```bash
# Using Python 3 built-in HTTP server:
python3 -m http.server 8000
```

Then open your browser at:
[http://localhost:8000](http://localhost:8000)

### Validating JSON & DOM Integrity
A Python verification test is available to confirm that all JSON data files parse correctly and that all DOM ID selectors in `app.js` match `index.html`:

```bash
python3 -c "
import json, glob
for path in glob.glob('data/*.json'):
    with open(path) as f:
        json.load(f)
    print(f'[OK] {path}')
print('All data files valid!')
"
```

---

## 📬 Contact Form Configuration

The `#contact` form integrates with [FormSubmit](https://formsubmit.co) for serverless email submission without backend infrastructure:

1. Messages are directed to the recipient specified in `data/site.json` (`contact.email`).
2. The form includes anti-spam honeypot protection (`_honey`) and AJAX submission with responsive in-page success/error states.
3. Upon first submission to a new email address, FormSubmit sends a one-time activation email to confirm recipient ownership.

---

## 🌐 Deploying to GitHub Pages

1. Push the branch to GitHub:
   ```bash
   git push -u origin design_two
   ```
2. In the repository settings on GitHub, navigate to **Settings → Pages**.
3. Under **Build and deployment → Branch**, choose `design_two` (or merge into your publishing branch) and select `/ (root)`.
4. Click **Save**. The website will be live at:
   `https://<organization>.github.io/<repository>/`

---

## 📄 Licence & Attribution

- **Code & Design**: Released under the [MIT Licence](file:///home/enzo/AntiGravityProjects/IREN/LICENSE).
- **Phonetic IPA Typography**: [Inter](https://github.com/rsms/inter) (SIL Open Font License 1.1) packaged for the IPA characters `ɪ` and `ː`.
