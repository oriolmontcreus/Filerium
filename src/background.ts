/// <reference types="chrome"/>

console.log("Background script loaded");

let originTabId: number | null = null;
let originFrameId: number | null = null;

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log("Background script received a message:", request);

    if (request.action === "openClipboardHelper") {
        console.log("Received request to open clipboard helper");
        originTabId = sender.tab?.id ?? null;
        originFrameId = request.frameId;
        chrome.windows.create({
            url: chrome.runtime.getURL('src/clipboard-helpers/clipboard-helper.html'),
            type: 'popup',
            width: 400,
            height: 300
        }, (window) => {
            if (chrome.runtime.lastError) {
                console.error("Error creating clipboard helper window:", chrome.runtime.lastError.message);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else if (window) {
                console.log("Clipboard helper window created with id:", window.id);
                sendResponse({ success: true });
            } else {
                console.error("Window created, but window object is undefined");
                sendResponse({ success: false, error: "Window object is undefined" });
            }
        });
        return true;
    } else if (request.fileDataUrl) {
        if (originTabId !== null) {
            chrome.tabs.sendMessage(originTabId, {
                fileDataUrl: request.fileDataUrl,
                mimeType: request.mimeType,
                frameId: originFrameId
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(`Error in sending message to content script: ${chrome.runtime.lastError.message}`);
                } else {
                    console.log('Content script response:', response);
                }
                closeClipboardHelper();
            });
        }
        return true;
    } else if (request.closeTab) {
        closeClipboardHelper();
        return true;
    } else if (request.action === 'saveSitePreference') {
        const { site, enabled } = request;
        chrome.storage.sync.get({ sitePreferences: {} }, (data) => {
            const sitePreferences = data.sitePreferences as Record<string, boolean>;
            sitePreferences[site] = enabled;
            chrome.storage.sync.set({ sitePreferences }, () => {
                sendResponse({ success: true });
            });
        });
        return true;
    } else if (request.action === 'getSitePreference') {
        const { site } = request;
        chrome.storage.sync.get({ sitePreferences: {} }, (data) => {
            const sitePreferences = data.sitePreferences as Record<string, boolean>;
            sendResponse({ enabled: sitePreferences[site] });
        });
        return true;
    }
});

function closeClipboardHelper() {
    chrome.tabs.query({ url: chrome.runtime.getURL('src/clipboard-helpers/clipboard-helper.html') }, (tabs) => {
        if (tabs.length > 0 && tabs[0].id) {
            chrome.tabs.remove(tabs[0].id, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to close the helper tab:", chrome.runtime.lastError.message);
                }
            });
        }
        if (originTabId !== null) {
            chrome.tabs.update(originTabId, { active: true }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to activate the origin tab:", chrome.runtime.lastError.message);
                }
            });
        }
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['dist/inject.js']
        }).then(() => {
            console.log("Inject script injected into tab", tabId);
        }).catch((err) => {
            console.error("Error injecting script:", err);
        });
    }
});