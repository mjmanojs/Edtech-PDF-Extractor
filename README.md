# EdTech PDF Extractor V1


𝕏 **Also, follow me on X**: [@SDummy1245](https://twitter.com/SDummy1245)

[![GitHub followers](https://img.shields.io/github/followers/mjmanojs?style=social)](https://github.com/mjmanojs)
![madewithlove](https://img.shields.io/badge/made%20with-%E2%9D%A4-red.svg)
![GitHub license](https://img.shields.io/github/license/mjmanojs/Edtech-PDF-Extractor)

An Application that automates the process of extracting, reconstructing, and downloading PDFs from highly restricted educational courses. EdTech PDF Extractor Version 1 is a robust suite designed to bypass sophisticated EdTech PDF viewers, outsmarting canvas-rendering and virtualization locks so you can finally download the courses you paid for.

**Note**: EdTech PDF Extractor needs Node.js installed to function effectively for the background server, or a Chromium-based browser (Chrome, Edge, Opera GX) for the native extension.

## Features
- 📚 **Canvas Lazy-Loading Bypass** (Extracts virtualized pages continuously while scrolling)
- 🔓 **Raw API Hooking** (Hooks directly into `window.PDFViewerApplication` memory space)
- 💾 **Background Node Saver** (Bypasses Chrome restrictions by saving natively to `Downloads/extracted pdf/`)
- 🌐 **Universal Extension Protocol** (Ships with an unpacked Chrome Extension to extract natively)
- 🎨 **Dark Mode Interface** (Sleek TailwindCSS local web dashboard)

## Versions
EdTech PDF Extractor has two distinct versions included in this repository:
1. **Node.js Puppeteer Server** (The primary automated bypass engine)
2. **Native Chrome Extension** (Located in the `/extension` directory)

If you would like to submit your own version/fork of the PDF Extractor, please open an issue describing the changes you made to the fork.

## Installation

```bash
git clone https://github.com/mjmanojs/Edtech-PDF-Extractor.git

cd EdTech-PDF-Extractor

# Install the Node.js requirements
npm install
```

## Usage

```bash
# Run the application server
node server.js
```
Then, open your web browser and navigate to `http://localhost:3000` to launch the dashboard.

## Documentation
All relevant documentation regarding the Chrome extension setup can be performed simply by loading the unpacked `/extension` folder in your browser's Developer Options.

## Scripts
For easier usage, there is an `Install-Extension.bat` script that can be used to set up the Chrome extension environment directly on Windows machines without the need for manual file transfers.

## Contributing
Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests to us. 

## Code of Conduct
Please read `CODE_OF_CONDUCT.md` for details on our code of conduct, and the process for submitting pull requests to us.

## License
EdTech PDF Extractor is licensed under Affero General Public License v3.0. See `LICENSE` for more information.

## Acknowledgments
- pdf.js internals
- jsPDF 

## Disclaimer
This project is for educational purposes only. The author will not be responsible for any misuse of the information provided. All the information on this website/repository is published in good faith and for general information purpose only. The author does not make any warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find in this repository, is strictly at your own risk. The author will not be liable for any losses and/or damages in connection with the use of this project. Respect the copyright restrictions of the platforms you browse.
