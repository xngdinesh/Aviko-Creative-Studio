# Aviko Media — Strategic Design & Commercial Video Production Agency

[![Live Site](https://img.shields.io/badge/Live_Site-aviko--creative--studio.vercel.app-C9A227?style=for-the-badge&logo=vercel&logoColor=white)](https://aviko-creative-studio.vercel.app/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary%20%7C%20All%20Rights%20Reserved-red?style=for-the-badge)](LICENSE)
[![Tech](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-F16529?style=for-the-badge&logo=html5&logoColor=white)](https://aviko-creative-studio.vercel.app/)

A high-performance, multi-page digital showcase engineered for **Aviko Media**, a premier creative agency specializing in strategic brand identity, packaging architecture, digital product design, and 4K commercial motion reels.

🌐 **Production URL:** [https://aviko-creative-studio.vercel.app/](https://aviko-creative-studio.vercel.app/)

---

## ✨ Features & Architecture

### 1. Multi-Page Static Site Architecture
Clean semantic routing without heavy client-side frameworks:
- **`index.html`** — Comprehensive flagship homepage with hero metrics, capabilities overview, featured spotlight carousel, portfolio grid, video reel showcase, studio overview, and proposal inquiry form.
- **`services.html`** — Dedicated capabilities index spanning Brand Identity, Commercial Video Production, 3D Motion, Packaging, Digital Products, Social Campaigns, and Strategy.
- **`portfolio.html`** — Dedicated archive featuring discipline filter pills, 3D spotlight reel, and full masonry grid.
- **`showreel.html`** — Cinema-grade video portfolio with interactive trailer previews, client metrics, and production breakdown.
- **`about.html`** — Studio heritage, creative philosophy, leadership, and agency milestones.
- **`contact.html`** — Strategic proposal booking interface with input validation and direct mail dispatch.
- **`terms.html` & `privacy.html`** — Legal and governance policies.

### 2. VengeanceUI Diagonal Carousel
- Custom diagonal motion engine ported to vanilla JavaScript.
- Physics-based diagonal rotation (`rotate(distance * step)`) and vertical offsets (`translateY(distance * step)`).
- Floating glassmorphic control pill with morphing indicator dots (`w-2` to `w-7`).
- Full navigation support: keyboard arrow keys (`←` / `→`), mobile touch swipe, and click-to-center.
- Direct click integration opening the active slide in the fullscreen 4K lightbox.

### 3. Interactive 4K Lightbox Modal
- Deep inspection modal supporting mouse wheel zooming, pinch-to-zoom on touch devices, and click-drag panning.
- On-screen zoom percentage indicator and reset controls.
- Keyboard shortcuts: `Escape` (close), `ArrowLeft` / `ArrowRight` (previous/next slide), `+` / `-` (zoom), `0` (reset).

### 4. Commercial Video Showreel Player
- Inline interactive previews with custom hover triggers and mute/unmute toggles.
- Zero-layout-shift aspect ratio containers with poster fallbacks.

### 5. Technical SEO & Performance
- Complete OpenGraph (`og:*`) and Twitter Card metadata.
- Structured JSON-LD schemas (`Organization` and `WebSite`).
- Dynamic sitemap ([`sitemap.xml`](sitemap.xml)) and crawl rules ([`robots.txt`](robots.txt)).
- Responsive images via `<picture>` delivering modern `.webp` with `.jpg` fallbacks.
- Native lazy loading (`loading="lazy"`) and asynchronous image decoding (`decoding="async"`).

---

## 🎨 Design System

| Token | Value | Description |
|---|---|---|
| `--bg-base` | `#090A0F` | Deep obsidian canvas |
| `--bg-surface` | `#12141D` | Elevated dark card container |
| `--gold-primary` | `#C9A227` | Signature Aviko warm metallic gold |
| `--gold-light` | `#DFBA44` | High-contrast accent & hover state |
| `--gold-gradient` | `linear-gradient(135deg, #ECC85D 0%, #C9A227 50%, #9E7B15 100%)` | Metallic luxury gradient |
| `--font-heading` | `'Plus Jakarta Sans', sans-serif` | Editorial headings |
| `--font-body` | `'Inter', sans-serif` | Precision body typography |

---

## 📁 Repository Structure

```text
.
├── assets/
│   ├── images/              # Optimized portfolio visuals (.webp & .jpg)
│   └── videos/              # Video showreels & motion reel clips (.mp4)
├── index.html               # Flagship homepage
├── services.html            # Services & creative capabilities
├── portfolio.html           # Full portfolio index & filtering
├── showreel.html            # Commercial film & video production reel
├── about.html               # Studio philosophy & agency team
├── contact.html             # Creative proposal consultation form
├── terms.html               # Terms of service
├── privacy.html             # Privacy governance
├── style.css                # Global stylesheet & design tokens
├── app.js                   # Application logic, carousel engine & lightbox
├── robots.txt               # Search engine crawler directives
├── sitemap.xml              # XML sitemap for search indexes
└── README.md                # Project documentation
```

---

## 🚀 Local Development

No Node.js build step or package installations required. Run any static file server from the root directory:

### Option A: Python Built-in Server
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Node / npx
```bash
npx serve .
```

### Option C: VS Code Live Server
Right-click `index.html` and choose **"Open with Live Server"**.

---

## 🚢 Deployment

The repository is configured for zero-configuration instant deployment on [Vercel](https://vercel.com):

1. Push changes to the `main` branch:
   ```bash
   git push origin main
   ```
2. Vercel automatically deploys the static files to [https://aviko-creative-studio.vercel.app/](https://aviko-creative-studio.vercel.app/).

---

## 📄 License & Usage

**Proprietary & Confidential — All Rights Reserved.** Copyright &copy; 2026 Aviko Media.

This is a personal, private showcase repository. It is **not** open-source and not intended for external or third-party reuse. No permission is granted to copy, reproduce, fork for redistribution, modify, sublicense, or deploy any portion of this codebase, design assets, or media without explicit prior written authorization from the owner.
