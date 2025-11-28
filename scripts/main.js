import {Console} from './console.js';
import {initializeReveal} from "./reveal.js";

console.log('loading');


window.onload = async function () {

    const config = {
        url: 'https://tangen-2it-utvikling.netlify.app/content/database-02',
        mode: 'reveal',
    }

    console.log('loading')
    const consoleInstance = new Console()
    const consoleElement = document.getElementById('main-console')
    consoleInstance.mount(consoleElement)

    consoleInstance.log("Welcome, meatbags! ThePresenter is running!")
    consoleInstance.log("Incoming parameters: \n" + JSON.stringify(config, null, '  '))

    if (config.url) {
        // Use CORS proxy to avoid browser CORS errors
        const proxyUrl = 'https://corsproxy.io/?'
        const proxiedUrl = proxyUrl + encodeURIComponent(config.url)
        consoleInstance.log("Using CORS proxy for fetch: " + proxiedUrl);
        try {
            const response = await fetch(proxiedUrl)
            const responseText = await response.text()
            const responseType = response.headers.get('content-type') || 'unknown'
            consoleInstance.log("Fetched content from URL: " + config.url)
            consoleInstance.log("   Content type: " + responseType)
            consoleInstance.log("   Content length: " + responseText.length + " characters")
            consoleInstance.error("NOW WHAT??")
            const domParser = new DOMParser()
            const doc = domParser.parseFromString(responseText, 'text/html')
            consoleInstance.log("Parsed fetched content into DOM document.")
            // we will duplicate all document.body children into current document body
            Array.from(doc.body.children).forEach(child => {
                document.body.appendChild(document.importNode(child, true))
            });
            consoleInstance.log("Appended fetched content to current document body.")

            initializeReveal()

            // Add a style-element, pointing to reveal.css, after the fetch:
            const linkElement = document.createElement('link')
            linkElement.rel = 'stylesheet'
            linkElement.href = 'https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.css'
            document.head.appendChild(linkElement)
            consoleInstance.log("Added reveal.css stylesheet to document.")

            setTimeout(() => consoleElement.style.opacity = "0.1", 1000);

        } catch (error) {
            consoleInstance.error("Fetch error: " + error);
        }
    }
};
