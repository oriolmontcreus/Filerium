import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR, DEFAULT_ACTION_COLOR } from './visuals/constants';

document.addEventListener('DOMContentLoaded', function () {
    const primaryColorPicker = document.getElementById('pc') as HTMLInputElement | null;
    const secondaryColorPicker = document.getElementById('sc') as HTMLInputElement | null;
    const actionColorPicker = document.getElementById('ac') as HTMLInputElement | null;
    const saveColorButton = document.getElementById('saveSettings') as HTMLButtonElement | null;
    const resetColorButton = document.getElementById('resetSettings') as HTMLButtonElement | null;
    const extensionToggle = document.getElementById('extensionToggle') as HTMLInputElement | null;
    const switchLabel = document.getElementById('switchLabel') as HTMLSpanElement | null;

    if (!primaryColorPicker || !secondaryColorPicker || !actionColorPicker || !saveColorButton || !resetColorButton || !extensionToggle || !switchLabel) {
        console.error('One or more elements not found');
        return;
    }

    function updateSwitchLabel(enabled: boolean) {
        if (switchLabel) {
            switchLabel.textContent = enabled ? "Extension enabled" : "Extension disabled";
        }
    }

    // Load saved settings on page load
    chrome.storage.sync.get(['primaryColor', 'secondaryColor', 'actionColor', 'extensionEnabled'], function (result) {
        const primaryColor = result.primaryColor as string;
        const secondaryColor = result.secondaryColor as string;
        const actionColor = result.actionColor as string;
        const extensionEnabled = result.extensionEnabled !== false;
        
        if (primaryColor) primaryColorPicker.value = primaryColor;
        if (secondaryColor) secondaryColorPicker.value = secondaryColor;
        if (actionColor) actionColorPicker.value = actionColor;
        extensionToggle.checked = extensionEnabled;
        updateSwitchLabel(extensionEnabled);
    });

    saveColorButton.addEventListener('click', function () {
        const primaryColor = primaryColorPicker.value;
        const secondaryColor = secondaryColorPicker.value;
        const actionColor = actionColorPicker.value;
        const extensionEnabled = extensionToggle.checked;
        
        chrome.storage.sync.set({ 
            primaryColor: primaryColor, 
            secondaryColor: secondaryColor,
            actionColor: actionColor,
            extensionEnabled: extensionEnabled
        });
        updateSwitchLabel(extensionEnabled);
    });

    resetColorButton.addEventListener('click', function () {
        primaryColorPicker.value = DEFAULT_PRIMARY_COLOR;
        secondaryColorPicker.value = DEFAULT_SECONDARY_COLOR;
        actionColorPicker.value = DEFAULT_ACTION_COLOR;
        extensionToggle.checked = true;
        
        chrome.storage.sync.set({ 
            primaryColor: DEFAULT_PRIMARY_COLOR, 
            secondaryColor: DEFAULT_SECONDARY_COLOR,
            actionColor: DEFAULT_ACTION_COLOR,
            extensionEnabled: true
        });
        updateSwitchLabel(true);
    });

    extensionToggle.addEventListener('change', function () {
        const extensionEnabled = extensionToggle.checked;
        chrome.storage.sync.set({ extensionEnabled: extensionEnabled });
        updateSwitchLabel(extensionEnabled);
    });
});