console.log("Clipboard helper script loaded");

async function handleImageClipboardItem(clipboardItem: ClipboardItem, type: string) {
    const blob = await clipboardItem.getType(type);
    console.log('Blob retrieved:', blob);
    const reader = new FileReader();
    reader.onloadend = () => {
        console.log('Blob converted to Data URL:', reader.result);
        let mimeType = type;
        if (type === 'application/octet-stream' && blob.type === 'image/webp') {
            mimeType = 'image/webp';
        }
        sendMessageToBackground({
            fileDataUrl: reader.result as string,
            mimeType: mimeType
        });
    };
    reader.onerror = (error) => {
        console.error('Error reading blob:', error);
        chrome.runtime.sendMessage({ closeTab: true });
    };
    reader.readAsDataURL(blob);
}

async function handleTextClipboardItem(clipboardItem: ClipboardItem) {
    const text = await clipboardItem.getType('text/plain');
    console.log('Text retrieved:', text);
    const blob = new Blob([text], { type: 'text/plain' });
    const reader = new FileReader();
    reader.onloadend = () => {
        console.log('Text converted to Data URL:', reader.result);
        sendMessageToBackground({
            fileDataUrl: reader.result as string,
            mimeType: 'text/plain'
        });
    };
    reader.onerror = (error) => {
        console.error('Error reading text:', error);
        chrome.runtime.sendMessage({ closeTab: true });
    };
    reader.readAsDataURL(blob);
}

function sendMessageToBackground(message: { fileDataUrl: string, mimeType: string }) {
    chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
            console.error(`Error in sending message: ${chrome.runtime.lastError.message}`);
        } else {
            console.log('Message sent to background script, response:', response);
            chrome.runtime.sendMessage({ closeTab: true });
        }
    });
}

function handleClipboardError(error: unknown) {
    console.error('Error accessing clipboard:', error);
    if (error instanceof Error && error.message.includes("Document is not focused")) {
        chrome.runtime.sendMessage({ closeTab: true });
    } else {
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'An error occurred while accessing the clipboard.';
        errorMessage.style.cssText = `
            color: #F44336; font-weight: 500; text-align: center; margin-top: 20px;
            font-size: 18px;
        `;
        document.body.appendChild(errorMessage);
    }
}