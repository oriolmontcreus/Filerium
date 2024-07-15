import { browseIcon, pasteIcon } from "./visuals/icons";
import { buttonStyle, buttonHoverStyle, overlayStyle, contentStyle, imagePreviewStyle, DEFAULT_ACTION_COLOR, textPreviewStyle, filePreviewStyle } from "./visuals/styles";

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

const getClipboardContents = async (): Promise<{ success: boolean; clipboardData?: { fileDataUrl: string; mimeType: string; displayData?: string }; message?: string }> => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        console.log("clipboardItems:", clipboardItems);
        for (const item of clipboardItems) {
            for (const type of item.types) {
                const blob = await item.getType(type);
                const reader = new FileReader();
                return new Promise((resolve) => {
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        let displayData = result;
                        let mimeType = type;

                        if (type.startsWith('image/')) {
                            // Handle base64 images and other image formats
                            resolve({
                                success: true,
                                clipboardData: {
                                    fileDataUrl: result,
                                    mimeType: type,
                                    displayData: result
                                }
                            });
                        } else if (type === 'image/svg+xml' || (type === 'text/plain' && result.startsWith('<svg'))) {
                            // Handle raw SVG images that might be detected as text/plain
                            mimeType = 'image/svg+xml';
                            resolve({
                                success: true,
                                clipboardData: {
                                    fileDataUrl: `data:image/svg+xml;base64,${btoa(result)}`,
                                    mimeType: mimeType,
                                    displayData: result
                                }
                            });
                        } else if (type.startsWith('text/')) {
                            // Handle text and HTML data
                            resolve({
                                success: true,
                                clipboardData: {
                                    fileDataUrl: result,
                                    mimeType: type,
                                    displayData: result
                                }
                            });
                        } else {
                            resolve({
                                success: true,
                                clipboardData: {
                                    fileDataUrl: result,
                                    mimeType: type,
                                    displayData: "Unsupported data type"
                                }
                            });
                        }
                    };

                    if (type.startsWith("image/")) {
                        reader.readAsDataURL(blob);
                    } else {
                        reader.readAsText(blob);
                    }
                });
            }
        }
        return { success: true, message: "No supported data found in clipboard" };
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

    let clipboardData: { fileDataUrl: string; mimeType: string; displayData?: string } | null = null;

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
            console.log("No valid data found in clipboard, proceeding with default file input action.");
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
            console.log("Paste Data button clicked");
            if (clipboardData) {
                let blob: Blob;
                let fileName = `pasted_file.${getExtensionFromMimeType(clipboardData.mimeType)}`;
                if (clipboardData.mimeType === 'image/svg+xml') {
                    blob = new Blob([clipboardData.displayData!], { type: clipboardData.mimeType });
                    fileName = "pasted_file.svg"; // Force SVG file extension
                } else if (clipboardData.mimeType.startsWith("text/")) {
                    blob = new Blob([clipboardData.displayData!], { type: clipboardData.mimeType });
                } else {
                    blob = dataURItoBlob(clipboardData.fileDataUrl);
                }
                const file = new File([blob], fileName, { type: clipboardData.mimeType });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            }
            closeOverlay();
        }, color);
        pasteButton.style.display = "inline-block";

        const previewContainer = document.createElement("div");
        previewContainer.style.cssText = filePreviewStyle;

        if (clipboardResponse.clipboardData.mimeType.startsWith("image/") || clipboardResponse.clipboardData.fileDataUrl.startsWith('data:image/')) {
            console.log("Displaying image preview");
            const imagePreview = document.createElement("img");
            imagePreview.style.cssText = imagePreviewStyle;
            imagePreview.style.display = "block";
            imagePreview.src = clipboardResponse.clipboardData.fileDataUrl;
            previewContainer.appendChild(imagePreview);
        } else if (clipboardResponse.clipboardData.mimeType === 'image/svg+xml' || clipboardResponse.clipboardData.displayData!.startsWith('<svg')) {
            console.log("Displaying SVG preview");
            const svgPreview = document.createElement("div");
            svgPreview.innerHTML = clipboardResponse.clipboardData.displayData!;
            svgPreview.style.cssText = imagePreviewStyle;
            svgPreview.style.display = "block";
            previewContainer.appendChild(svgPreview);
        } else if (clipboardResponse.clipboardData.mimeType.startsWith("text/")) {
            console.log("Displaying text preview");
            const textPreview = document.createElement("pre");
            textPreview.textContent = clipboardResponse.clipboardData.displayData!;
            textPreview.style.cssText = textPreviewStyle;
            previewContainer.appendChild(textPreview);
        } else {
            console.log("Unsupported data type preview");
            const unsupportedPreview = document.createElement("div");
            unsupportedPreview.textContent = "Unsupported data type for preview";
            previewContainer.appendChild(unsupportedPreview);
        }

        content.appendChild(browseButton);
        content.appendChild(pasteButton);
        content.appendChild(previewContainer);
        overlay.appendChild(content);

        document.body.appendChild(overlay);

        console.log("Overlay added to the document");

        clipboardData = clipboardResponse.clipboardData;
    };

    const dataURItoBlob = (dataURI: string): Blob => {
        const byteString = atob(dataURI.split(",")[1]);
        const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const getExtensionFromMimeType = (mimeType: string): string => {
        switch (mimeType) {
            case "image/png":
                return "png";
            case "image/jpeg":
                return "jpg";
            case "image/gif":
                return "gif";
            case "text/plain":
                return "txt";
            case "text/html":
                return "html";
            case "text/csv":
                return "csv";
            case "application/json":
                return "json";
            case "image/svg+xml":
                return "svg";
            default:
                return "bin";
        }
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
                const previewContainer = overlay.querySelector("div:nth-child(3)") as HTMLDivElement;
                if (clipboardData?.mimeType.startsWith("image/") || clipboardData?.fileDataUrl.startsWith('data:image/')) {
                    pasteButton.style.display = "inline-block";
                    const imagePreview = document.createElement("img");
                    imagePreview.src = clipboardData.fileDataUrl;
                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(imagePreview);
                } else if (clipboardData?.mimeType === 'image/svg+xml' || clipboardData?.displayData!.startsWith('<svg')) {
                    pasteButton.style.display = "inline-block";
                    const svgPreview = document.createElement("div");
                    svgPreview.innerHTML = clipboardData.displayData!;
                    svgPreview.style.cssText = imagePreviewStyle;
                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(svgPreview);
                } else if (clipboardData?.mimeType.startsWith("text/")) {
                    pasteButton.style.display = "inline-block";
                    const textPreview = document.createElement("pre");
                    textPreview.style.cssText = textPreviewStyle;
                    textPreview.textContent = clipboardData.displayData!;
                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(textPreview);
                } else {
                    previewContainer.innerHTML = "Unsupported data type";
                }
            }
        }
    });

    console.log("File input interceptor initialized");
};

initFileInputInterceptor().catch(console.error);

export {};