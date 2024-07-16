const DEFAULT_ACTION_COLOR = '#008CBA';
const DEFAULT_PRIMARY_COLOR = '#252525';
const DEFAULT_SECONDARY_COLOR = '#333';

console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received message:", request);

    if (request.type === "GET_USER_COLORS") {
        chrome.storage.sync.get(['primaryColor', 'secondaryColor', 'actionColor'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving user colors:", chrome.runtime.lastError);
                sendResponse({ 
                    primaryColor: DEFAULT_PRIMARY_COLOR, 
                    secondaryColor: DEFAULT_SECONDARY_COLOR, 
                    actionColor: DEFAULT_ACTION_COLOR
                });
            } else {
                sendResponse({ 
                    primaryColor: result.primaryColor || DEFAULT_PRIMARY_COLOR, 
                    secondaryColor: result.secondaryColor || DEFAULT_SECONDARY_COLOR, 
                    actionColor: result.actionColor || DEFAULT_ACTION_COLOR
                });
            }
        });
        return true;
    }
});