import { browseIcon, pasteIcon } from './visuals/icons';
import { buttonStyle, buttonHoverStyle, overlayStyle, contentStyle, imagePreviewStyle } from './visuals/styles';

declare global {
    interface Window {
        fileInputInterceptorActive?: boolean;
    }
}

console.log("Inject script executing");

(function () {
    'use strict';

    if (window.fileInputInterceptorActive) {
        console.log("File input interceptor already active");
        return;
    }
    window.fileInputInterceptorActive = true;

    console.log("Initializing file input interceptor");

    let clipboardData: { fileDataUrl: string; mimeType: string } | null = null;

    function createOverlay(fileInput: HTMLInputElement) {
        console.log("Creating overlay for file input:", fileInput);

        function createButtonWithSVG(svg: string, onClick: () => void): HTMLButtonElement {
            const button = document.createElement('button');
            button.style.cssText = buttonStyle;
            button.innerHTML = svg;
            button.onclick = onClick;
            button.onmouseover = () => button.style.cssText += buttonHoverStyle;
            button.onmouseout = () => button.style.cssText = buttonStyle;
            return button;
        }

        const overlay = document.createElement('div');
        overlay.style.cssText = overlayStyle;

        const content = document.createElement('div');
        content.style.cssText = contentStyle;
        content.onclick = (e) => e.stopPropagation(); // Prevent clicks on the content from closing the overlay

        function closeOverlay() {
            overlay.remove();
        }

        overlay.onclick = closeOverlay;

        const browseButton = createButtonWithSVG(browseIcon, () => {
            console.log("Browse Files button clicked");
            closeOverlay();
            try {
                window.fileInputInterceptorActive = false;
                fileInput.click();
            } finally {
                window.fileInputInterceptorActive = true;
            }
        });

        const pasteButton = createButtonWithSVG(pasteIcon, () => {
            console.log("Paste Image button clicked");
            if (clipboardData) {
                const blob = dataURItoBlob(clipboardData.fileDataUrl);
                const file = new File([blob], "pasted_image.png", { type: clipboardData.mimeType });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            closeOverlay();
        });
        pasteButton.style.display = 'none';

        const imagePreview = document.createElement('img');
        imagePreview.style.cssText = imagePreviewStyle;

        content.appendChild(browseButton);
        content.appendChild(pasteButton);
        content.appendChild(imagePreview);
        overlay.appendChild(content);

        document.body.appendChild(overlay);

        console.log("Overlay added to the document");

        window.postMessage({ type: "GET_CLIPBOARD_CONTENTS" }, "*");

        return overlay;
    }

    function dataURItoBlob(dataURI: string) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    document.addEventListener('click', function (e) {
        if (!window.fileInputInterceptorActive) {
            // Bypass the interceptor if it's disabled
            return;
        }

        const target = e.target as HTMLElement;
        console.log("Click detected on:", target);
        if (target instanceof HTMLInputElement && target.type === 'file') {
            console.log("File input click intercepted:", target);
            e.preventDefault();
            e.stopPropagation();
            createOverlay(target);
        } else {
            console.log("Click detected but not on file input:", target);
        }
    }, true);

    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'CLIPBOARD_CONTENTS_RESPONSE') {
            console.log("Received clipboard contents:", event.data.clipboardData);
            clipboardData = event.data.clipboardData;
            const overlay = document.querySelector('div[style*="position: fixed"]') as HTMLDivElement;
            if (overlay) {
                const pasteButton = overlay.querySelector('button:nth-child(2)') as HTMLButtonElement;
                const imagePreview = overlay.querySelector('img') as HTMLImageElement;
                if (clipboardData && clipboardData.mimeType.startsWith('image/')) {
                    pasteButton.style.display = 'inline-block';
                    imagePreview.src = clipboardData.fileDataUrl;
                    imagePreview.style.display = 'block';
                }
            }
        }
    });

    console.log("File input interceptor initialized");
})();
export {};