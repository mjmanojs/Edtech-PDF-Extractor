const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const cors = require('cors');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

app.post('/api/save-pdf', (req, res) => {
    try {
        const { base64Data } = req.body;
        if (!base64Data) {
            return res.status(400).json({ success: false, error: 'No PDF data provided.' });
        }

        const downloadsDir = 'C:\\Users\\manoj\\Downloads\\extracted pdf';
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        let fileIndex = 1;
        let filePath = path.join(downloadsDir, `notes${fileIndex}.pdf`);
        while (fs.existsSync(filePath)) {
            fileIndex++;
            filePath = path.join(downloadsDir, `notes${fileIndex}.pdf`);
        }

        let binaryData = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, binaryData);

        res.json({ success: true, filePath: filePath, fileName: `notes${fileIndex}.pdf` });
    } catch (error) {
        console.error('Error saving PDF:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

let browser = null;
let page = null;

// Endpoint to start the browser
app.post('/api/start-browser', async (req, res) => {
    try {
        const targetUrl = req.body.url || 'https://learn.iplus.guru/';
        if (!browser) {
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null, // Full HD or max resolution
                userDataDir: path.join(__dirname, 'browser_profile'), // Re-use session cookies
                args: ['--start-maximized']
            });
            const pages = await browser.pages();
            page = pages.length > 0 ? pages[0] : await browser.newPage();
            try {
                await page.goto(targetUrl);
            } catch (e) {
                console.error("Navigation error:", e.message);
            }

            // Handle browser close event
            browser.on('disconnected', () => {
                browser = null;
                page = null;
            });

            res.json({ success: true, message: 'Browser launched. Please log in and navigate to the lesson, then click "Download PDF" on this app.' });
        } else {
            res.json({ success: true, message: 'Browser is already running.' });
        }
    } catch (error) {
        console.error('Error launching browser:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to capture PDF
app.post('/api/capture-pdf', async (req, res) => {
    if (!browser || !page) {
        return res.status(400).json({ success: false, error: 'Browser not active. Please start the browser first.' });
    }

    try {
        // Strategy 1: Look for PDF.js instance across all frames (Advanced Extraction)
        let extractedRawPdf = null;
        for (const frame of page.frames()) {
            try {
                const pdfBase64 = await frame.evaluate(async () => {
                    if (typeof window.PDFViewerApplication !== 'undefined' && window.PDFViewerApplication.pdfDocument) {
                        try {
                            const data = await window.PDFViewerApplication.pdfDocument.getData();
                            let binary = '';
                            const bytes = new Uint8Array(data);
                            for (let i = 0; i < bytes.byteLength; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            return window.btoa(binary);
                        } catch (e) {
                            return null;
                        }
                    }
                    return null;
                });
                if (pdfBase64) {
                    extractedRawPdf = pdfBase64;
                    break;
                }
            } catch (e) {
                // Ignore cross-origin frame access errors
            }
        }

        if (extractedRawPdf) {
            return res.json({ success: true, method: 'pdfjs', base64: extractedRawPdf });
        }

        // Strategy 2: Evaluate script on the active page to extract canvas or img data fallback
        const extractedPages = await page.evaluate(async () => {
            // Wait function
            const delay = (ms) => new Promise(res => setTimeout(res, ms));

            // Strategy: scroll through the document container to lazy load everything
            // Different websites have different scrollable containers.
            // Let's scroll the window as well as any scrollable internal divs.

            const scrollContainers = Array.from(document.querySelectorAll('div')).filter(el =>
                el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY !== 'hidden' && getComputedStyle(el).overflowY !== 'visible'
            );
            const containersToScroll = [...scrollContainers, window];
            let pageImages = [];
            let seenUrls = new Set();
            
            const captureCanvases = () => {
                const canvases = document.querySelectorAll('canvas');
                for (const canvas of canvases) {
                    if (canvas.width > 200 && canvas.height > 200) {
                        try {
                            const url = canvas.toDataURL('image/jpeg', 0.95);
                            if (!seenUrls.has(url)) {
                                seenUrls.add(url);
                                pageImages.push({
                                    url: url,
                                    width: canvas.width,
                                    height: canvas.height,
                                    type: 'canvas'
                                });
                            }
                        } catch (e) {
                            // ignore CORS taint errors
                        }
                    }
                }
            };

            for (const container of containersToScroll) {
                captureCanvases(); // Initial capture
                if (container === window) {
                    let prevHeight = -1;
                    while (document.documentElement.scrollHeight > document.documentElement.scrollTop + window.innerHeight) {
                        window.scrollBy(0, window.innerHeight / 1.5);
                        await delay(400); // Wait for lazy load
                        captureCanvases(); // Capture newly mounted ones
                        if (prevHeight === document.documentElement.scrollTop) break;
                        prevHeight = document.documentElement.scrollTop;
                    }
                } else {
                    let prevTop = -1;
                    while (container.scrollHeight > container.scrollTop + container.clientHeight) {
                        container.scrollBy(0, container.clientHeight / 1.5);
                        await delay(400);
                        captureCanvases();
                        if (prevTop === container.scrollTop) break;
                        prevTop = container.scrollTop;
                    }
                }
            }

            // Scroll back to top just in case
            window.scrollTo(0, 0);

            // Strategy 2: If no canvases, look for images that might be the pages
            if (pageImages.length === 0) {
                const images = document.querySelectorAll('img');
                const validImages = Array.from(images).filter(img => img.width > 200 && img.height > 200 && img.src && !img.src.includes('logo') && !img.src.includes('icon')); // Heuristics
                for (const img of validImages) {
                    // To handle cross-origin images, drawing to canvas might fail, so we just get url, and server will fetch if needed, 
                    // but since we are executing IN the page, we can try to draw to canvas to get base64
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width || img.naturalWidth;
                        canvas.height = img.height || img.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        pageImages.push({
                            url: canvas.toDataURL('image/jpeg', 0.95),
                            width: canvas.width,
                            height: canvas.height,
                            type: 'img'
                        });
                    } catch (e) {
                        // CORS taint, fallback to getting bounding box and taking screenshots
                    }
                }
            }

            return pageImages;
        });

        if (extractedPages.length === 0) {
            // Fallback: the site might render HTML elements. Let's just generate a PDF from the whole scrollable area via screenshotting.
            // Since we don't know the exact structure, we will capture full page screenshot or specific container screenshot
            // Or we just return an error and ask user to use another script
            return res.status(404).json({ success: false, error: 'No PDF canvas or page images found on the current screen. Ensure you are on the lesson page.' });
        }

        // Return the extracted base64 images so the frontend can build the PDF
        res.json({ success: true, method: 'canvas', pages: extractedPages });

    } catch (error) {
        console.error('Error capturing PDF:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
