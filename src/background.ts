console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received message:", request);

    if (request.type === "GET_USER_COLOR") {
        chrome.storage.sync.get(['userColor'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving user color:", chrome.runtime.lastError);
                sendResponse({ userColor: DEFAULT_ACTION_COLOR }); // Use fallback color if there’s an error
            } else {
                sendResponse({ userColor: result.userColor || DEFAULT_ACTION_COLOR });
            }
        });
        return true; // Indicates we're using async response
    }
});

const DEFAULT_ACTION_COLOR = '#008CBA'; // Define the default action color used as fallback