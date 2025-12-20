import {markAsReady, present} from "./main.js";

console.log('Presentation mode - conditional activation script loaded.');

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Document loaded - checking for presentation activation parameter.');
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('present')) {
        console.log(`Presentation Activated via URL parameter 'present'.`);
        await present()
    } else {
        console.log(`Presentation enabled but not activated - add '?present' to the URL to start presenting.`);
        markAsReady();
    }
})