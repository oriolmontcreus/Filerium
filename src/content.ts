console.log("Content script loaded");

function injectScript() {
    if (!document.querySelector('script[data-injected="true"]')) {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('dist/inject.js');
        script.setAttribute('data-injected', 'true');
        console.log("Injecting script");
        (document.head || document.documentElement).appendChild(script);
    } else {
        console.log("Inject script already present");
    }
}

injectScript();

async function readClipboard() {
    console.log("Attempting to read clipboard contents");
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            if (item.types.includes('image/png')) {
                const blob = await item.getType('image/png');
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log("Clipboard data read successfully");
                    window.postMessage({
                        type: "CLIPBOARD_CONTENTS_RESPONSE",
                        clipboardData: {
                            fileDataUrl: reader.result as string,
                            mimeType: 'image/png'
                        }
                    }, "*");
                };
                reader.readAsDataURL(blob);
                return;
            }
        }
        console.log("No image found in clipboard");
        window.postMessage({
            type: "CLIPBOARD_CONTENTS_RESPONSE",
            clipboardData: null
        }, "*");
    } catch (error) {
        console.error("Error reading clipboard:", error);
        window.postMessage({
            type: "CLIPBOARD_CONTENTS_RESPONSE",
            clipboardData: null
        }, "*");
    }
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_CLIPBOARD_CONTENTS') {
        readClipboard();
    }
}, false);