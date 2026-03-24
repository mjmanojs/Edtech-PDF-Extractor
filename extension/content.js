(async function extractPDF() {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    try {
        // Scroll through the document to lazy load everything
        const scrollContainers = Array.from(document.querySelectorAll('div')).filter(el =>
            el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY !== 'hidden' && getComputedStyle(el).overflowY !== 'visible'
        );
        const containersToScroll = [...scrollContainers, window];

        for (const container of containersToScroll) {
            if (container === window) {
                let prevHeight = -1;
                while (document.documentElement.scrollHeight > document.documentElement.scrollTop + window.innerHeight) {
                    window.scrollBy(0, window.innerHeight / 2);
                    await delay(300); // Wait for lazy load
                    if (prevHeight === document.documentElement.scrollTop) break;
                    prevHeight = document.documentElement.scrollTop;
                }
            } else {
                let prevTop = -1;
                while (container.scrollHeight > container.scrollTop + container.clientHeight) {
                    container.scrollBy(0, container.clientHeight / 2);
                    await delay(300);
                    if (prevTop === container.scrollTop) break;
                    prevTop = container.scrollTop;
                }
            }
        }

        // Scroll back to top just in case
        window.scrollTo(0, 0);
        await delay(500); // give it a moment to stabilize

        let pageImages = [];

        // Strategy 1: Look for canvases (common in pdf.js viewers)
        const canvases = document.querySelectorAll('canvas');
        if (canvases.length > 0) {
            const validCanvases = Array.from(canvases).filter(c => c.width > 200 && c.height > 200);
            for (const canvas of validCanvases) {
                pageImages.push({
                    url: canvas.toDataURL('image/jpeg', 0.95),
                    width: canvas.width,
                    height: canvas.height
                });
            }
        }

        // Strategy 2: If no canvases, look for images that might be the pages
        if (pageImages.length === 0) {
            const images = document.querySelectorAll('img');
            const validImages = Array.from(images).filter(img => img.width > 200 && img.height > 200 && img.src && !img.src.includes('logo') && !img.src.includes('icon'));
            for (const img of validImages) {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width || img.naturalWidth;
                    canvas.height = img.height || img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    pageImages.push({
                        url: canvas.toDataURL('image/jpeg', 0.95),
                        width: canvas.width,
                        height: canvas.height
                    });
                } catch (e) {
                    // CORS issues, ignore silently.
                }
            }
        }

        if (pageImages.length === 0) {
            return { success: false, error: 'No PDF pages (canvases or large images) found. Make sure the lesson is fully loaded.' };
        }

        // Make sure jsPDF is available - injected by popup.js
        if (!window.jspdf || !window.jspdf.jsPDF) {
            return { success: false, error: 'PDF Library (jsPDF) failed to load on the page.' };
        }

        const { jsPDF } = window.jspdf;

        // Create new PDF document
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        for (let i = 0; i < pageImages.length; i++) {
            const page = pageImages[i];
            if (i > 0) {
                pdf.addPage();
            }

            const imgData = page.url;

            // Calculate aspect ratio to fit A4 size
            const a4Width = pdf.internal.pageSize.getWidth();
            const a4Height = pdf.internal.pageSize.getHeight();

            const ratio = Math.min(a4Width / page.width, a4Height / page.height);
            const width = page.width * ratio;
            const height = page.height * ratio;

            // Center on page
            const x = (a4Width - width) / 2;
            const y = (a4Height - height) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, width, height);
        }

        // Generate filename based on document title
        let safeTitle = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        if (!safeTitle) safeTitle = 'extracted_lesson';
        const filename = safeTitle + '.pdf';

        // Trigger download
        pdf.save(filename);

        return { success: true, message: `Generated PDF with ${pageImages.length} pages!` };

    } catch (err) {
        return { success: false, error: err.message };
    }
})();
