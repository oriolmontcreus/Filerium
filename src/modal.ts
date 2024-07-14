document.addEventListener('DOMContentLoaded', function () {
    const colorPicker = document.getElementById('colorPicker') as HTMLInputElement | null;
    const saveColorButton = document.getElementById('saveColor') as HTMLButtonElement | null;

    if (!colorPicker || !saveColorButton) {
        console.error('Color picker or save button not found');
        return;
    }

    // Load the saved color on page load
    chrome.storage.sync.get(['userColor'], function (result) {
        const userColor = result.userColor as string;
        if (userColor) {
            colorPicker.value = userColor;
            applyColor(userColor);
        }
    });

    // Save color on button click
    saveColorButton.addEventListener('click', function () {
        const selectedColor = colorPicker.value;
        chrome.storage.sync.set({ userColor: selectedColor }, function () {
            applyColor(selectedColor);
        });
    });

    // Apply the color to elements
    function applyColor(color: string) {
        document.body.style.backgroundColor = color;
        // Modify other UI elements as needed
    }
});