console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received message:", request);

    if (request.action === "getClipboardContents") {
        console.log("Attempting to read from clipboard");
        navigator.clipboard.read().then(async (clipboardItems) => {
            for (const item of clipboardItems) {
                if (item.types.includes('image/png')) {
                    const blob = await item.getType('image/png');
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        sendResponse({
                            success: true,
                            clipboardData: {
                                fileDataUrl: reader.result as string,
                                mimeType: 'image/png'
                            }
                        });
                    };
                    reader.readAsDataURL(blob);
                    return true;
                }
            }
            sendResponse({ success: false, error: "No image found in clipboard" });
        }).catch((error) => {
            console.error("Error reading clipboard:", error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
});