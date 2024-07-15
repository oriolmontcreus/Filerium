import { browseIcon, pasteIcon } from "./visuals/icons";
import { buttonStyle, buttonHoverStyle, overlayStyle, contentStyle, imagePreviewStyle, DEFAULT_ACTION_COLOR } from "./visuals/styles";

declare global {
    interface Window {
        fileInputInterceptorActive?: boolean;
    }
}

console.log("inject.js loaded");

const getUserColor = (): Promise<string> => {
    return new Promise((resolve) => {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: "GET_USER_COLOR" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error retrieving user color:", chrome.runtime.lastError);
                    resolve(DEFAULT_ACTION_COLOR); // fallback color
                } else {
                    resolve(response.userColor as string);
                }
            });
        } else {
            console.error("chrome.runtime.sendMessage is not available");
            resolve(DEFAULT_ACTION_COLOR); // fallback color
        }
    });
};

const getClipboardContents = async (): Promise<{ success: boolean; clipboardData?: { fileDataUrl: string; mimeType: string }; message?: string }> => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            if (item.types.includes('image/png')) {
                const blob = await item.getType('image/png');
                const reader = new FileReader();
                return new Promise((resolve) => {
                    reader.onloadend = () => {
                        resolve({
                            success: true,
                            clipboardData: {
                                fileDataUrl: reader.result as string,
                                mimeType: 'image/png'
                            }
                        });
                    };
                    reader.readAsDataURL(blob);
                });
            }
        }
        return { success: true, message: "No image found in clipboard" };
    } catch (error: any) {
        console.error("Error reading clipboard:", error);
        return { success: false, message: error.message };
    }
};

const initFileInputInterceptor = async () => {
    "use strict";

    if (window.fileInputInterceptorActive) {
        console.log("File input interceptor already active");
        return;
    }
    window.fileInputInterceptorActive = true;

    console.log("Initializing file input interceptor");

    let clipboardData: { fileDataUrl: string; mimeType: string } | null = null;

    const userColor = await getUserColor();

    const createButtonWithSVG = (svg: string, onClick: () => void, color: string): HTMLButtonElement => {
        const button = document.createElement("button");
        button.style.cssText = buttonStyle(color);
        button.innerHTML = svg;
        button.onclick = onClick;
        button.onmouseover = () => (button.style.cssText += buttonHoverStyle);
        button.onmouseout = () => (button.style.cssText = buttonStyle(color));
        return button;
    };

    const createOverlay = async (fileInput: HTMLInputElement, color: string) => {
        const clipboardResponse = await getClipboardContents();
        if (!clipboardResponse.success || !clipboardResponse.clipboardData) {
            console.log("No valid image found in clipboard, proceeding with default file input action.");
            window.fileInputInterceptorActive = false;
            fileInput.click();
            window.fileInputInterceptorActive = true;
            return;
        }

        console.log("Creating overlay for file input:", fileInput);

        const overlay = document.createElement("div");
        overlay.style.cssText = overlayStyle;

        const content = document.createElement("div");
        content.style.cssText = contentStyle;
        content.onclick = (e) => e.stopPropagation(); // Prevent clicks on the content from closing the overlay

        const closeOverlay = () => overlay.remove();

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
        }, color);

        const pasteButton = createButtonWithSVG(pasteIcon, async () => {
            console.log("Paste Image button clicked");
            if (clipboardData) {
                const blob = dataURItoBlob(clipboardData.fileDataUrl);
                const file = new File([blob], "pasted_image.png", { type: clipboardData.mimeType });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            }
            closeOverlay();
        }, color);
        pasteButton.style.display = "inline-block";

        const imagePreview = document.createElement("img");
        imagePreview.style.cssText = imagePreviewStyle;
        imagePreview.style.display = "block";
        imagePreview.src = clipboardResponse.clipboardData.fileDataUrl;

        content.appendChild(browseButton);
        content.appendChild(pasteButton);
        content.appendChild(imagePreview);
        overlay.appendChild(content);

        document.body.appendChild(overlay);

        console.log("Overlay added to the document");

        clipboardData = clipboardResponse.clipboardData;
    };

    const dataURItoBlob = (dataURI: string) => {
        const byteString = atob(dataURI.split(",")[1]);
        const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    document.addEventListener(
        "click",
        (e) => {
            if (!window.fileInputInterceptorActive) return; // Bypass the interceptor if it's disabled

            const target = e.target as HTMLElement;
            if (target instanceof HTMLInputElement && target.type === "file") {
                console.log("File input click intercepted:", target);
                e.preventDefault();
                e.stopPropagation();
                createOverlay(target, userColor);
            }
        },
        true
    );

    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CLIPBOARD_CONTENTS_RESPONSE") {
            console.log("Received clipboard contents:", event.data.clipboardData);
            clipboardData = event.data.clipboardData;
            const overlay = document.querySelector('div[style*="position: fixed"]') as HTMLDivElement;
            if (overlay) {
                const pasteButton = overlay.querySelector("button:nth-child(2)") as HTMLButtonElement;
                const imagePreview = overlay.querySelector("img") as HTMLImageElement;
                if (clipboardData?.mimeType.startsWith("image/")) {
                    pasteButton.style.display = "inline-block";
                    imagePreview.src = clipboardData.fileDataUrl;
                    imagePreview.style.display = "block";
                }
            }
        }
    });

    console.log("File input interceptor initialized");
};

initFileInputInterceptor().catch(console.error);

export {};