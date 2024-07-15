(()=>{"use strict";const e=e=>`\n    background-color: ${e};\n    border: none;\n    border-radius: 12px;\n    color: white;\n    padding: 10px 20px;\n    text-align: center;\n    text-decoration: none;\n    display: inline-block;\n    font-size: 16px;\n    margin: 4px 2px;\n    cursor: pointer;\n    transition: all 0.3s ease;\n`,n="#5688C7";var t=function(e,n,t,o){return new(t||(t=Promise))((function(i,r){function l(e){try{a(o.next(e))}catch(e){r(e)}}function c(e){try{a(o.throw(e))}catch(e){r(e)}}function a(e){var n;e.done?i(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(l,c)}a((o=o.apply(e,n||[])).next())}))};console.log("inject.js loaded"),t(void 0,void 0,void 0,(function*(){if(window.fileInputInterceptorActive)return void console.log("File input interceptor already active");window.fileInputInterceptorActive=!0,console.log("Initializing file input interceptor");let o=null;const i=yield new Promise((e=>{chrome&&chrome.runtime&&chrome.runtime.sendMessage?chrome.runtime.sendMessage({type:"GET_USER_COLOR"},(t=>{chrome.runtime.lastError?(console.error("Error retrieving user color:",chrome.runtime.lastError),e(n)):e(t.userColor)})):(console.error("chrome.runtime.sendMessage is not available"),e(n))})),r=(n,t,o)=>{const i=document.createElement("button");return i.style.cssText=e(o),i.innerHTML=n,i.onclick=t,i.onmouseover=()=>i.style.cssText+="\n    filter: brightness(0.8);\n    transform: scale(1.05);\n",i.onmouseout=()=>i.style.cssText=e(o),i},l=e=>{const n=atob(e.split(",")[1]),t=e.split(",")[0].split(":")[1].split(";")[0],o=new ArrayBuffer(n.length),i=new Uint8Array(o);for(let e=0;e<n.length;e++)i[e]=n.charCodeAt(e);return new Blob([o],{type:t})};document.addEventListener("click",(e=>{if(!window.fileInputInterceptorActive)return;const n=e.target;var c,a;n instanceof HTMLInputElement&&"file"===n.type&&(console.log("File input click intercepted:",n),e.preventDefault(),e.stopPropagation(),c=n,a=i,t(void 0,void 0,void 0,(function*(){const e=yield t(void 0,void 0,void 0,(function*(){try{const e=yield navigator.clipboard.read();for(const n of e)if(n.types.includes("image/png")){const e=yield n.getType("image/png"),t=new FileReader;return new Promise((n=>{t.onloadend=()=>{n({success:!0,clipboardData:{fileDataUrl:t.result,mimeType:"image/png"}})},t.readAsDataURL(e)}))}return{success:!0,message:"No image found in clipboard"}}catch(e){return console.error("Error reading clipboard:",e),{success:!1,message:e.message}}}));if(!e.success||!e.clipboardData)return console.log("No valid image found in clipboard, proceeding with default file input action."),window.fileInputInterceptorActive=!1,c.click(),void(window.fileInputInterceptorActive=!0);console.log("Creating overlay for file input:",c);const n=document.createElement("div");n.style.cssText="\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(0, 0, 0, 0.5);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    z-index: 9999;\n    user-select: none;\n";const i=document.createElement("div");i.style.cssText="\n    background: #252525;\n    padding: 20px;\n    border-radius: 12px;\n    border: 3px solid #333;\n    text-align: center;\n",i.onclick=e=>e.stopPropagation();const s=()=>n.remove();n.onclick=s;const d=r('\n<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">\n    <circle cx="17" cy="17" r="3"/>\n    <path d="M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1"/>\n    <path d="m21 21-1.5-1.5"/>\n</svg>\n',(()=>{console.log("Browse Files button clicked"),s();try{window.fileInputInterceptorActive=!1,c.click()}finally{window.fileInputInterceptorActive=!0}}),a),p=r('\n<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">\n    <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z"/>\n    <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10"/>\n    <path d="m17 10 4 4-4 4"/>\n</svg>\n',(()=>t(void 0,void 0,void 0,(function*(){if(console.log("Paste Image button clicked"),o){const e=l(o.fileDataUrl),n=new File([e],"pasted_image.png",{type:o.mimeType}),t=new DataTransfer;t.items.add(n),c.files=t.files,c.dispatchEvent(new Event("change",{bubbles:!0}))}s()}))),a);p.style.display="inline-block";const u=document.createElement("img");u.style.cssText="\n    max-width: 240px;\n    max-height: 240px;\n    margin-top: 10px;\n    display: none;\n    border: 3px solid #333;\n    border-radius: 14px;\n",u.style.display="block",u.src=e.clipboardData.fileDataUrl,i.appendChild(d),i.appendChild(p),i.appendChild(u),n.appendChild(i),document.body.appendChild(n),console.log("Overlay added to the document"),o=e.clipboardData})))}),!0),window.addEventListener("message",(e=>{if(e.data&&"CLIPBOARD_CONTENTS_RESPONSE"===e.data.type){console.log("Received clipboard contents:",e.data.clipboardData),o=e.data.clipboardData;const n=document.querySelector('div[style*="position: fixed"]');if(n){const e=n.querySelector("button:nth-child(2)"),t=n.querySelector("img");(null==o?void 0:o.mimeType.startsWith("image/"))&&(e.style.display="inline-block",t.src=o.fileDataUrl,t.style.display="block")}}})),console.log("File input interceptor initialized")})).catch(console.error)})();