document.getElementById('extractBtn').addEventListener('click', async () => {
    const btn = document.getElementById('extractBtn');
    const status = document.getElementById('status');

    btn.disabled = true;
    btn.textContent = "Extracting... Please wait";
    status.textContent = "Injecting script... (Do not close this popup. If the document is large, this may take a minute.)";
    status.className = 'info';
    status.style.display = 'block';

    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url.startsWith("http")) {
            throw new Error("Please navigate to an EdTech lesson webpage to use this tool.");
        }

        // Inject jspdf library first
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['jspdf.umd.min.js']
        });

        // Execute the main extraction script
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        const result = injectionResults[0].result;

        if (result && result.success) {
            status.textContent = "Success! " + result.message;
            status.className = 'success';
            btn.textContent = "Done";
        } else if (result && result.error) {
            throw new Error(result.error);
        } else {
            throw new Error("Unknown error occurred during extraction.");
        }

    } catch (error) {
        status.textContent = error.message;
        status.className = '';
        btn.disabled = false;
        btn.textContent = "Extract & Download";
    }
});
