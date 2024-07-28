import { browseIcon, pasteIcon } from "./visuals/icons";
import { DEFAULT_ACTION_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from "./visuals/constants";
import {
    buttonStyle, buttonHoverStyle, overlayStyle, contentStyle,
    imagePreviewStyle,
    filePreviewStyle,
    filenameInputStyle
} from "./visuals/styles";

declare global {
    interface Window {
        fileInputInterceptorActive?: boolean;
    }
}

const log = console.log.bind(console);
const error = console.error.bind(console);

const isExtensionEnabled = (): Promise<boolean> => new Promise((resolve) => {
    if (!chrome?.storage?.sync?.get) {
        console.error("chrome.storage.sync.get is not available");
        return resolve(true); // Default to enabled if we can't check
    }
    chrome.storage.sync.get(['extensionEnabled'], (result) => {
        resolve(result.extensionEnabled !== false); // Default to true if not set
    });
});

const getUserColors = (): Promise<{ primaryColor: string, secondaryColor: string, actionColor: string }> => new Promise((resolve) => {
    if (!chrome?.runtime?.sendMessage) {
        error("chrome.runtime.sendMessage is not available");
        return resolve({
            primaryColor: DEFAULT_PRIMARY_COLOR,
            secondaryColor: DEFAULT_ACTION_COLOR,
            actionColor: DEFAULT_SECONDARY_COLOR
        });
    }
    chrome.runtime.sendMessage({ type: "GET_USER_COLORS" }, (response) => {
        if (chrome.runtime.lastError) {
            error("Error retrieving user colors:", chrome.runtime.lastError);
            return resolve({
                primaryColor: DEFAULT_PRIMARY_COLOR,
                secondaryColor: DEFAULT_SECONDARY_COLOR,
                actionColor: DEFAULT_ACTION_COLOR
            });
        }
        resolve({
            primaryColor: response.primaryColor as string,
            secondaryColor: response.secondaryColor as string,
            actionColor: response.actionColor as string
        });
    });
});

const getClipboardContents = async () => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            for (const type of item.types) {
                const blob = await item.getType(type);
                const reader = new FileReader();

                const readBlob = () => new Promise<string>(resolve => {
                    reader.onloadend = () => resolve(reader.result as string);
                    type.startsWith("image/") ? reader.readAsDataURL(blob) : reader.readAsText(blob);
                });

                const result = await readBlob();

                let clipboardData;

                if (type === 'text/html' && /<img\s+[^>]*src=/.test(result)) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = result;

                    const imgTag = tempDiv.querySelector('img') as HTMLImageElement;
                    const imageUrl = imgTag ? imgTag.src : '';
                    if (imageUrl) {
                        clipboardData = {
                            fileDataUrl: imageUrl,
                            mimeType: 'image/html-contained',
                            displayData: result
                        };
                    }
                } else {
                    clipboardData = {
                        fileDataUrl: type.startsWith('image/svg+xml') || (type === 'text/plain' && result.startsWith('<svg'))
                            ? `data:image/svg+xml;base64,${btoa(result)}`
                            : result,
                        mimeType: type.startsWith('image/svg+xml') || (type === 'text/plain' && result.startsWith('<svg'))
                            ? 'image/svg+xml'
                            : type,
                        displayData: result
                    };
                }

                return { success: true, clipboardData };
            }
        }
        return { success: true, message: "No supported data found in clipboard" };
    } catch (error: any) {
        error("Error reading clipboard:", error);
        return { success: false, message: error.message };
    }
};

const createPreviewElement = (tag: "img" | "div" | "pre", content: string) => {
    const el = document.createElement(tag);
    el.style.cssText = imagePreviewStyle;
    if (tag === "img") {
        (el as HTMLImageElement).src = content;
        el.style.maxWidth = '100%';
        el.style.height = 'auto';
    } else {
        if (tag === "pre")
            el.style.margin = "0";
        el.innerHTML = content;
    }
    return el;
};

const initFileInputInterceptor = async () => {
    const enabled = await isExtensionEnabled();
    if (!enabled) {
        console.log("Filerium extension is disabled");
        return;
    }

    if (window.fileInputInterceptorActive)
        return log("File input interceptor already active");

    window.fileInputInterceptorActive = true;

    const { primaryColor, secondaryColor, actionColor } = await getUserColors();
    let clipboardData: any = null;

    const createButtonWithSVG = (svg: string, onClick: () => void, color: string) => {
        const button = document.createElement("button");
        button.style.cssText = buttonStyle(color);
        button.innerHTML = svg;
        button.onclick = onClick;
        button.onmouseover = () => button.style.cssText += buttonHoverStyle;
        button.onmouseout = () => button.style.cssText = buttonStyle(color);
        return button;
    };

    const createOverlay = async (fileInput: HTMLInputElement, pColor: string, sColor: string, aColor: string) => {
        const { success, clipboardData: retrievedData, message } = await getClipboardContents();
        if (!success || !retrievedData) {
            window.fileInputInterceptorActive = false;
            fileInput.click();
            window.fileInputInterceptorActive = true;
            return;
        }

        clipboardData = retrievedData;

        const overlay = document.createElement("div");
        overlay.style.cssText = overlayStyle + `
            opacity: 0;
            transition: opacity 0.15s ease-in-out;
        `;

        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
        });

        const content = document.createElement("div");
        content.style.cssText = contentStyle(pColor);
        content.onclick = (e) => e.stopPropagation();
        overlay.onclick = () => {
            overlay.style.opacity = "0";
            overlay.addEventListener("transitionend", () => overlay.remove());
        };

        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "8px";

        const actionsContainer = document.createElement("div");
        actionsContainer.style.display = "flex";
        actionsContainer.style.justifyContent = "space-between";
        actionsContainer.style.flexWrap = "wrap";
        actionsContainer.style.alignItems = "center";
        actionsContainer.style.gap = "8px";

        const handleBrowseClick = () => {
            window.fileInputInterceptorActive = false;
            fileInput.click();
            window.fileInputInterceptorActive = true;

            fileInput.addEventListener("change", () => {
                overlay.style.opacity = "0";
                overlay.addEventListener("transitionend", () => overlay.remove());
            }, { once: true });
        };

        const handlePasteClick = () => {
            let mimeType = clipboardData.mimeType;
            if (clipboardData.fileDataUrl.startsWith('data:image/')) {
                mimeType = clipboardData.fileDataUrl.match(/data:([^;,]+)/)?.[1] || mimeType;
            }

            const blob = mimeType === 'image/svg+xml' ?
                new Blob([clipboardData.displayData!], { type: mimeType }) :
                mimeType.startsWith("text/") ?
                    new Blob([clipboardData.displayData!], { type: mimeType }) :
                    dataURItoBlob(clipboardData.fileDataUrl);

            const defaultFilename = `pasted_file.${getExtensionFromMimeType(mimeType)}`;
            const filename = filenameInput.value.trim() ? `${filenameInput.value.trim()}.${getExtensionFromMimeType(mimeType)}` : defaultFilename;

            const file = new File([blob], filename, { type: mimeType });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));

            overlay.style.opacity = "0";
            overlay.addEventListener("transitionend", () => overlay.remove());
        };

        const browseButton = createButtonWithSVG(browseIcon, handleBrowseClick, aColor);
        const pasteButton = createButtonWithSVG(pasteIcon, handlePasteClick, aColor);

        const { mimeType, displayData, fileDataUrl } = clipboardData;
        const justifyContent = mimeType.startsWith("text/") ? "flex-start" : "center";

        const previewContainer = document.createElement("div");
        previewContainer.style.cssText = filePreviewStyle(sColor, justifyContent);

        let previewElement;
        if (mimeType.startsWith("image/") || mimeType === 'image/html-contained' || fileDataUrl.startsWith('data:image/'))
            previewElement = createPreviewElement("img", fileDataUrl);
        else if (mimeType === 'image/svg+xml')
            previewElement = createPreviewElement("div", displayData);
        else if (mimeType.startsWith("text/"))
            previewElement = createPreviewElement("pre", displayData);
        else {
            previewElement = document.createElement("div");
            previewElement.innerText = "Unsupported data type for preview";
        }

        const filenameInput = document.createElement("input");
        filenameInput.type = "text";
        filenameInput.style.cssText = filenameInputStyle(sColor, pColor);
        filenameInput.placeholder = "Enter filename (optional)";
        filenameInput.onclick = (e) => e.stopPropagation();

        buttonContainer.append(browseButton, pasteButton);
        actionsContainer.append(buttonContainer, filenameInput);

        previewContainer.appendChild(previewElement);
        content.append(actionsContainer, previewContainer);

        overlay.appendChild(content);
        document.body.appendChild(overlay);
    };

    const dataURItoBlob = (dataURI: string): Blob => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const getExtensionFromMimeType = (mimeType: string): string => ({
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/gif": "gif",
        "text/plain": "txt",
        "text/html": "html",
        "text/csv": "csv",
        "application/json": "json",
        "image/svg+xml": "svg"
    }[mimeType] || "bin");

    document.addEventListener("click", (e) => {
        if (!window.fileInputInterceptorActive) return;
    
        const target = e.target as HTMLElement;
        if (target instanceof HTMLInputElement && target.type === "file") {
            e.preventDefault();
            e.stopPropagation();
    
            isExtensionEnabled().then(enabled => {
                if (enabled) {
                    createOverlay(target, primaryColor, secondaryColor, actionColor);
                } else {
                    target.click();
                }
            });
        }
    }, true);

    window.addEventListener("message", (event) => {
        if (event.data?.type !== "CLIPBOARD_CONTENTS_RESPONSE") return;

        clipboardData = event.data.clipboardData;

        const overlay = document.querySelector('div[style*="position: fixed"]') as HTMLDivElement;
        if (!overlay) return;

        const pasteButton = overlay.querySelector("button:nth-child(2)") as HTMLButtonElement;
        const previewContainer = overlay.querySelector("div:nth-child(2) > div:nth-child(2)") as HTMLDivElement;

        pasteButton.style.display = "inline-block";

        const mimeType = clipboardData.mimeType;
        const displayData = clipboardData.displayData!;
        const fileDataUrl = clipboardData.fileDataUrl;

        let previewElement;
        if (mimeType.startsWith("image/") || fileDataUrl.startsWith('data:image/'))
            previewElement = createPreviewElement("img", fileDataUrl);
        else if (mimeType === 'image/svg+xml')
            previewElement = createPreviewElement("div", displayData);
        else if (mimeType.startsWith("text/"))
            previewElement = createPreviewElement("pre", displayData);
        else {
            previewElement = document.createElement("div");
            previewElement.innerText = "Unsupported data type for preview";
        }

        previewContainer.innerHTML = '';
        previewContainer.appendChild(previewElement);
    });
};

initFileInputInterceptor().catch(console.error);

export { };