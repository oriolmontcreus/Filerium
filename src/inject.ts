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
    
        const buttonStyle = `
            background: #5688C7;
            color: white;
            padding: 10px 20px;
            border: 2px solid #333;
            border-radius: 12px;
            display: inline-block;
            transition: background-color 0.3s ease, transform 0.3s ease;
            cursor: pointer;
            margin: 4px 2px;
        `;
    
        const buttonHoverStyle = `
            background: #416ba5;
            transform: scale(1.05);
        `;
    
        const browseIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-search" style="vertical-align: middle;">
                <circle cx="17" cy="17" r="3"/>
                <path d="M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1"/>
                <path d="m21 21-1.5-1.5"/>
            </svg>
        `;
    
        const pasteIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-paste" style="vertical-align: middle;">
                <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z"/>
                <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10"/>
                <path d="m17 10 4 4-4 4"/>
            </svg>
        `;
    
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
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            user-select: none;
        `;
    
        const content = document.createElement('div');
        content.style.cssText = `
            background: #252525;
            padding: 20px;
            border-radius: 12px;
            border: 3px solid #333;
            text-align: center;
        `;
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
        imagePreview.style.cssText = `
            max-width: 240px;
            max-height: 240px;
            margin-top: 10px;
            display: none;
            border: 3px solid #333;
            border-radius: 14px;
        `;
    
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