// Extend the Window interface
interface Window {
    fileriuMInterceptorInitialized?: boolean;
}

console.log("Inject script executing");

(function() {
    'use strict';

    console.log("Initializing file input interceptor");

    if (window.fileriuMInterceptorInitialized) {
        console.log("File input interceptor already initialized");
        return;
    }

    // Main initialization function
    function initializeInterceptor() {
        let isBrowseButtonClicked = false;
        let dragEnterCounter = 0;
        
        // Explicitly type clipboardData
        interface ClipboardData {
            fileDataUrl: string;
            mimeType: string;
        }
        let clipboardData: ClipboardData | null = null;
        
        let lastShowOverlayTime = 0;
        const DEBOUNCE_DELAY = 200;
        const originalStyles: { [key: string]: string } = {};

    function createOverlay(): HTMLDivElement {
        console.log("Creating overlay");
        const overlay = document.createElement('div');
        overlay.id = 'custom-file-upload-overlay';
        overlay.style.cssText = `
            position: fixed; left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(15, 17, 17, 0.7); display: flex;
            justify-content: center; align-items: center; z-index: 10000;
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        `;
        return overlay;
    }

    function removeOverlay(overlay: HTMLElement): void {
        console.log("Removing overlay");
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    function applyButtonStyles(button: HTMLElement): void {
        button.style.cssText = `
            padding: 16px 32px; margin: 0 10px; border: none; border-radius: 50px;
            cursor: pointer; background: red; color: #e8e6e3; font-weight: 500;
            transition: all 0.3s ease; font-size: 16px; text-transform: uppercase;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px, rgba(0, 0, 0, 0.08) 0px 1px 3px;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 7px 14px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
        });

        button.addEventListener('click', () => {
            button.style.transform = 'translateY(1px)';
            button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
        });
    }

    function createImagePreviewElement() {
        console.log("Creating image preview element");
        const imagePreview = document.createElement('img');
        imagePreview.style.cssText = `
            max-width: 100%; max-height: 400px; height: auto; border-radius: 10px;
            object-fit: contain; margin-bottom: 30px; display: block; margin: 0 auto;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 15px 30px;
        `;
        return imagePreview;
    }

    function createTextLabelElement(text: string): HTMLDivElement {
        const label = document.createElement('div');
        label.textContent = text;
        label.style.cssText = `
            color: #c8c3bc; text-align: center; margin-bottom: 20px;
            text-transform: uppercase; letter-spacing: 1px;
        `;
        return label;
    }
    
    function applyDragOverStyles(element: HTMLElement): void {
        originalStyles.border = element.style.border;
        originalStyles.backgroundColor = element.style.backgroundColor;
    
        element.style.border = '3px dashed #2196F3';
        element.style.backgroundColor = 'green';
        element.style.transition = 'all 0.3s ease';
    }
    
    function removeDragOverStyles(element: HTMLElement): void {
        element.style.border = originalStyles.border;
        element.style.backgroundColor = originalStyles.backgroundColor;
    }
    
    function generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    async function dataURLtoBlob(dataurl: string): Promise<Blob> {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const res = await fetch(dataurl);
        return await res.blob();
    }
    
    async function showCustomFileUploadOverlay(fileInput: HTMLInputElement): Promise<void> {
        console.log("Showing custom file upload overlay");
        const currentTime = Date.now();
        if (currentTime - lastShowOverlayTime < DEBOUNCE_DELAY) {
            console.log("Debouncing overlay creation");
            return;
        }
        lastShowOverlayTime = currentTime;
    
        let existingOverlay = document.getElementById('custom-file-upload-overlay');
        if (existingOverlay) {
            console.log("Removing existing overlay");
            removeOverlay(existingOverlay);
        }
    
        existingOverlay = createOverlay();
        document.body.appendChild(existingOverlay);
    
        const container = document.createElement('div');
        container.className = 'overlay-container';
        container.style.cssText = `
            padding: 40px; background-color: #0f1111; border-radius: 12px; text-align: center;
            position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;
        `;
        
        const backgroundEffect = document.createElement('div');
        backgroundEffect.style.cssText = `
            position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(45deg, #0a6ab6, #145ea8);
            transform: rotate(-45deg); opacity: 0.1; z-index: -1;
        `;
        container.appendChild(backgroundEffect);
    
        const imagePreview = createImagePreviewElement();
        imagePreview.className = 'image-preview';
        const imageLabel = createTextLabelElement("Image Preview");
        imageLabel.className = 'image-label';
        imageLabel.style.color = '#c8c3bc';
        imagePreview.style.display = 'none';
        imageLabel.style.display = 'none';
    
        container.append(imageLabel, imagePreview);
    
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex; justify-content: center; align-items: center; margin-top: 30px;
            flex-wrap: wrap; gap: 10px;
        `;
    
        const pasteButton = document.createElement('button');
        pasteButton.textContent = 'Paste File';
        pasteButton.className = 'paste-button';
        applyButtonStyles(pasteButton);
        pasteButton.onclick = async () => {
            console.log("Paste button clicked");
            if (clipboardData) {
                await pasteFileIntoInput(fileInput, clipboardData);
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                removeOverlay(existingOverlay);
            }
        };
        pasteButton.style.display = 'none';
    
        const browseButton = document.createElement('button');
        browseButton.textContent = 'Browse Files';
        browseButton.className = 'browse-button';
        browseButton.dataset.browseFiles = 'true';
        applyButtonStyles(browseButton);
        browseButton.onclick = (e) => {
            console.log("Browse button clicked");
            e.preventDefault();
            e.stopPropagation();
            isBrowseButtonClicked = true;
            removeOverlay(existingOverlay);
            setTimeout(() => {
                fileInput.click();
                setTimeout(() => {
                    isBrowseButtonClicked = false;
                }, 100);
            }, 0);
        };
    
        buttonContainer.appendChild(pasteButton);
        buttonContainer.appendChild(browseButton);
    
        container.appendChild(buttonContainer);
        existingOverlay.appendChild(container);
    
        console.log("Requesting clipboard helper");
        window.top?.postMessage({ type: 'REQUEST_CLIPBOARD_HELPER', frameId: window.frameElement ? window.frameElement.id : 'top' }, '*');
    
        setupDragAndDropEvents(container, fileInput);
    
        // Ensure the overlay is in the DOM before updating
        setTimeout(() => {
            updateOverlayWithClipboardData();
        }, 0);
    
        existingOverlay.onclick = (event: MouseEvent) => {
            if (event.target === existingOverlay) {
                removeOverlay(existingOverlay);
            }
        };
        
        const escapeHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                removeOverlay(existingOverlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
    }

    function updateOverlayWithClipboardData(): void {
        console.log("Updating overlay with clipboard data:", clipboardData);
        const overlay = document.getElementById('custom-file-upload-overlay');
        if (!overlay) {
            console.log("Overlay not found");
            return;
        }
    
        const pasteButton = overlay.querySelector('.paste-button') as HTMLButtonElement;
        const imagePreview = overlay.querySelector('.image-preview') as HTMLImageElement;
        const imageLabel = overlay.querySelector('.image-label') as HTMLDivElement;
    
        console.log("Overlay elements:", { pasteButton, imagePreview, imageLabel });
    
        if (pasteButton && imagePreview && imageLabel) {
            if (clipboardData && (clipboardData.mimeType.startsWith('image/') || clipboardData.mimeType === 'text/plain')) {
                pasteButton.style.display = 'inline-block';
                console.log("Paste button displayed");
            } else {
                pasteButton.style.display = 'none';
                console.log("Paste button hidden");
            }
    
            if (clipboardData && clipboardData.mimeType.startsWith('image/')) {
                imagePreview.src = clipboardData.fileDataUrl;
                imagePreview.style.display = 'block';
                imagePreview.style.maxWidth = '200px';
                imagePreview.style.maxHeight = '200px';
                imagePreview.style.objectFit = 'contain';
                imagePreview.style.margin = '10px auto';
                imageLabel.style.display = 'block';
                console.log("Image preview displayed");
            } else {
                imagePreview.style.display = 'none';
                imageLabel.style.display = 'none';
                console.log("Image preview hidden");
            }
        } else {
            console.log("Some overlay elements not found");
        }
    }
        
    function handleFileInputInteraction(event: Event): void {
        console.log("File input interaction detected");
        const fileInput = (event.target as HTMLElement).closest('input[type="file"]');
        if (fileInput && !isBrowseButtonClicked) {
            event.preventDefault();
            event.stopPropagation();
            showCustomFileUploadOverlay(fileInput as HTMLInputElement);
        }
    }
        
    function setupDragAndDropEvents(container: HTMLElement, fileInput: HTMLInputElement): void {
        console.log("Setting up drag and drop events");
        const handleDragEvents = (event: DragEvent, handler: (event: DragEvent, container: HTMLElement) => void) => {
            event.stopPropagation();
            event.preventDefault();
            handler(event, container);
        };
    
        const handleDrop = async (event: DragEvent) => {
            console.log("File dropped");
            event.stopPropagation();
            event.preventDefault();
            dragEnterCounter = 0;
            removeDragOverStyles(container);
            const files = event.dataTransfer?.files;
        
            if (files && files.length > 0) {
                fileInput.files = files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                const overlay = document.getElementById('custom-file-upload-overlay');
                if (overlay) {
                    removeOverlay(overlay);
                }
            }
        };
    
        container.addEventListener('dragover', (event: DragEvent) => handleDragEvents(event, handleDragOver));
        container.addEventListener('dragenter', (event: DragEvent) => handleDragEvents(event, handleDragEnter));
        container.addEventListener('dragleave', (event: DragEvent) => handleDragEvents(event, handleDragLeave));
        container.addEventListener('drop', (event: DragEvent) => handleDrop(event));
    }

    function handleDragEnter(_event: DragEvent, container: HTMLElement): void {
        dragEnterCounter++;
        if (dragEnterCounter === 1) {
            applyDragOverStyles(container);
        }
    }
    
    function handleDragLeave(_event: DragEvent, container: HTMLElement): void {
        dragEnterCounter--;
        if (dragEnterCounter === 0) {
            removeDragOverStyles(container);
        }
    }
    
    function handleDragOver(event: DragEvent): void {
        event.dataTransfer!.dropEffect = 'copy';
    }
        
        async function pasteFileIntoInput(fileInput: HTMLInputElement, data: { fileDataUrl: string; mimeType: string }): Promise<void> {
            try {
                const blob = await dataURLtoBlob(data.fileDataUrl);
                let fileExtension: string;
                if (data.mimeType === 'image/webp') {
                    fileExtension = 'webp';
                } else if (data.mimeType === 'text/plain') {
                    fileExtension = 'txt';
                } else {
                    fileExtension = data.mimeType.split('/')[1] || 'bin';
                }
                const fileName = `pasted-file-${generateRandomString(6)}.${fileExtension}`;
                const file = new File([blob], fileName, { type: data.mimeType });
        
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
        
                fileInput.files = dataTransfer.files;
        
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                fileInput.dispatchEvent(new Event('input', { bubbles: true }));
        
                const overlay = document.getElementById('custom-file-upload-overlay');
                if (overlay) {
                    removeOverlay(overlay);
                }
            } catch (error) {
                console.error("Error pasting file into input:", error);
            }
        }
        
        function setupFileInputListeners(root: Document = document): void {
            root.addEventListener('click', handleFileInputInteraction, true);
        }
        
        setupFileInputListeners();
        
        window.addEventListener('message', function(event: MessageEvent) {
            console.log("Inject script received message:", event.data);
            if (event.data && event.data.type === 'CLIPBOARD_DATA') {
                clipboardData = event.data.clipboardData;
                console.log("Clipboard data updated:", clipboardData);
                updateOverlayWithClipboardData();
            }
        });
        
        const originalShowPicker = HTMLInputElement.prototype.showPicker as () => void;
        HTMLInputElement.prototype.showPicker = function(this: HTMLInputElement) {
            if (this.type === 'file') {
                showCustomFileUploadOverlay(this);
            } else {
                return originalShowPicker.apply(this);
            }
        };
        
        document.addEventListener('click', function(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (target instanceof HTMLInputElement && target.type === 'file' && !isBrowseButtonClicked) {
                event.preventDefault();
                event.stopPropagation();
                showCustomFileUploadOverlay(target);
            }
        }, true);
        
        console.log('Consistent overlay file input interceptor is active!');
    }

    // Run the initialization
    if (!window.fileriuMInterceptorInitialized) {
        initializeInterceptor();
        window.fileriuMInterceptorInitialized = true;
    }
})();