import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR, DEFAULT_ACTION_COLOR } from './visuals/constants';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

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