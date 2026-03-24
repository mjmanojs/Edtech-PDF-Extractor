# Universal EdTech PDF Extractor 🚀

An open-source, robust suite of tools designed to extract protected, non-downloadable PDF lessons from EdTech platforms (like PDF.js viewers or Canvas-rendered documents) and download them natively as clean, perfectly-sequenced PDF files.

## Features
- **Dynamic Bypass**: Neutralizes lazy-loading / virtualized scrolling "tricks" by capturing canvases concurrently during a simulated scroll.
- **Raw API Hooking**: Intercepts `window.PDFViewerApplication` memory directly from internal iframes to pull original, text-searchable PDFs without relying on image screenshots.
- **Background Node.js Saver**: Bypasses browser download restrictions (like dropping `.pdf` extensions on large data URIs) by routing the extracted Base64 payloads directly to your local file system (`Downloads/extracted pdf/`).
- **Dark Mode UI**: Sleek, clean TailwindCSS interface for easy operation.
- **Universal Chrome Extension**: Included unpacked Chrome Extension (`/extension`) configured for `<all_urls>` so you don't even need the backend if you're already logged in via Opera GX or Chrome!

## Quick Start (Node.js Server)
1. Clone this repository.
2. Run `npm install`
3. Start the server: `node server.js`
4. Visit `http://localhost:3000`
5. Paste your target lesson URL and click **Launch Browser**.
6. Once the Puppeteer instance launches, log in if required.
7. Click **Extract & Download PDF**. Your PDF will be elegantly assembled and dropped directly into your `Downloads` directory!

## Manual Extension Installation
If you prefer not to use the Puppeteer Node server, simply install the `/extension` folder directly into Chrome, Edge, or Opera GX via `chrome://extensions` (Developer Mode -> Load Unpacked). 

---
_Disclaimer: Built for educational archiving and accessibility purposes. Respect copyright restrictions of the platforms you browse._
