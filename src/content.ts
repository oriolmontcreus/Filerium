(function() {
    'use strict';

    function injectScript() {
        const script = document.createElement('script');
        try {
            script.src = chrome.runtime.getURL('dist/inject.js');
        } catch (error) {
            console.log("Extension context is invalid. Please refresh the page.");
        }
        (document.head || document.documentElement).appendChild(script);
    }

    function injectScriptIntoIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe, index) => {
            try {
                if (!iframe.id) {
                    iframe.id = `injected-frame-${index}`;
                }
                const iframeWindow = iframe.contentWindow;
                if (iframeWindow) {
                    const iframeDocument = iframe.contentDocument || iframeWindow.document;
                    if (iframeDocument) {
                        const script = iframeDocument.createElement('script');
                        try {
                            script.src = chrome.runtime.getURL('dist/inject.js');
                        } catch (error) {
                            console.log("Extension context is invalid. Please refresh the page.");
                        }
                        iframeDocument.head.appendChild(script);
                    }
                }
            } catch (e) {
                // Silently fail for cross-origin iframes
                console.log(`Failed to inject script into iframe ${iframe.id}: ${e}`);
            }
        });
    }

    function setupIframeObserver() {
        if (document.body) {
            injectScriptIntoIframes();
            const iframeObserver = new MutationObserver(() => {
                injectScriptIntoIframes();
            });
            iframeObserver.observe(document.body, { childList: true, subtree: true });
        } else {
            setTimeout(setupIframeObserver, 100);
        }
    }

    injectScript();
    setupIframeObserver();

    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'REQUEST_CLIPBOARD_HELPER') {
            chrome.runtime.sendMessage({ action: "openClipboardHelper", frameId: event.data.frameId });
        }
    }, false);

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.fileDataUrl && request.mimeType) {
            const message = {
                type: 'CLIPBOARD_DATA',
                clipboardData: {
                    fileDataUrl: request.fileDataUrl,
                    mimeType: request.mimeType
                }
            };
            
            if (request.frameId === 'top') {
                window.postMessage(message, '*');
            } else {
                const targetFrame = document.getElementById(request.frameId) as HTMLIFrameElement | null;
                if (targetFrame && targetFrame.contentWindow) {
                    targetFrame.contentWindow.postMessage(message, '*');
                } else {
                    console.error(`Frame with id ${request.frameId} not found or doesn't have a content window`);
                }
            }
            sendResponse({ success: true });
        }
        return true;
    });
})();