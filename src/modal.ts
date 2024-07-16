document.addEventListener('DOMContentLoaded', function () {
    const primaryColorPicker = document.getElementById('pc') as HTMLInputElement | null;
    const secondaryColorPicker = document.getElementById('sc') as HTMLInputElement | null;
    const actionColorPicker = document.getElementById('ac') as HTMLInputElement | null;
    const saveColorButton = document.getElementById('saveSettings') as HTMLButtonElement | null;
    const resetColorButton = document.getElementById('resetSettings') as HTMLButtonElement | null;
    
    const DEFAULT_PRIMARY_COLOR = '#252525';
    const DEFAULT_SECONDARY_COLOR = '#333333';
    const DEFAULT_ACTION_COLOR = '#008CBA';

    if (!primaryColorPicker || !secondaryColorPicker || !actionColorPicker || !saveColorButton || !resetColorButton) {
        console.error('One or more color pickers or the save/reset button not found');
        return;
    }

    // Load saved colors on page load
    chrome.storage.sync.get(['primaryColor', 'secondaryColor', 'actionColor'], function (result) {
        const primaryColor = result.primaryColor as string;
        const secondaryColor = result.secondaryColor as string;
        const actionColor = result.actionColor as string;
        
        if (primaryColor) primaryColorPicker.value = primaryColor;
        if (secondaryColor) secondaryColorPicker.value = secondaryColor;
        if (actionColor) actionColorPicker.value = actionColor;
    });

    // Save colors on button click
    saveColorButton.addEventListener('click', function () {
        const primaryColor = primaryColorPicker.value;
        const secondaryColor = secondaryColorPicker.value;
        const actionColor = actionColorPicker.value;
        
        chrome.storage.sync.set({ 
            primaryColor: primaryColor, 
            secondaryColor: secondaryColor,
            actionColor: actionColor 
        });
    });

    // Reset colors to default on reset button click
    resetColorButton.addEventListener('click', function () {
        primaryColorPicker.value = DEFAULT_PRIMARY_COLOR;
        secondaryColorPicker.value = DEFAULT_SECONDARY_COLOR;
        actionColorPicker.value = DEFAULT_ACTION_COLOR;
        
        chrome.storage.sync.set({ 
            primaryColor: DEFAULT_PRIMARY_COLOR, 
            secondaryColor: DEFAULT_SECONDARY_COLOR,
            actionColor: DEFAULT_ACTION_COLOR 
        });
    });
});