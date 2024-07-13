document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        const infoTextElement = document.querySelector('.info-text');
        if (infoTextElement instanceof HTMLElement) {
            infoTextElement.style.display = 'block';
        } else {
            console.error("Could not find .info-text element or it's not an HTMLElement");
        }
    }, 1000);
});