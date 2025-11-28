import {Console} from './console.js';
import {initializeReveal} from "./reveal.js";
import {initializeImpress} from "./impress-narve.js";
import {addLinkToHead} from "./util.js";

window.onload = async function () {

    // const config = {
    //     url: 'https://tangen-2it-utvikling.netlify.app/content/html-001',
    //     mode: 'reveal',
    // }

    const searchParams = new URLSearchParams(window.location.search)
    const config = {
        url: searchParams.get('url'),
        mode: searchParams.get('mode') || 'reveal',
        shuffle: searchParams.get('shuffle') === 'true',
        rotate: searchParams.get('rotate') === 'true',
    }


    const consoleInstance = new Console()
    const consoleElement = document.getElementById('main-console')
    consoleInstance.mount(consoleElement)

    consoleInstance.log("Welcome, meatbags! ThePresenter is running!")
    consoleInstance.log("Incoming parameters: \n" + JSON.stringify(config, null, '  '))

    if (config.url) {

        try {
            // Part 1: Fetch the content!

            // Use CORS proxy to avoid browser CORS errors
            const proxyUrl = 'https://corsproxy.io/?'
            const proxiedUrl = proxyUrl + encodeURIComponent(config.url)
            consoleInstance.log("Fetching the presentation from " + config.url);
            consoleInstance.debug("Using CORS proxy: " + proxiedUrl);
            const response = await fetch(proxiedUrl)
            const responseText = await response.text()
            const responseType = response.headers.get('content-type') || 'unknown'
            consoleInstance.debug("Fetched content from URL: " + config.url)
            consoleInstance.debug("   Content type: " + responseType)
            consoleInstance.debug("   Content length: " + responseText.length + " characters")

            // Part 2: Parse the content into a DOM document
            const domParser = new DOMParser()
            const doc = domParser.parseFromString(responseText, 'text/html')
            consoleInstance.debug("Parsed fetched content into DOM document.")
            const title =
                doc.querySelector('head title')?.textContent ||
                response.url.split('/').pop()
            consoleInstance.log('Presentation title: ' + title)

            // Part 3: Fix relative URLs for images, styles, scripts, etc.
            convertRelativeUrlsToAbsolute(doc, config.url, consoleInstance)

            consoleInstance.log("Inserting presentation into current document")
            Array.from(doc.body.children).forEach(child => {
                document.body.appendChild(document.importNode(child, true))
            });

            consoleInstance.log(`Preparing to initialize presentation framework '${config.mode}'`)
            if (config.mode === 'impress') {
                initializeImpress(config)
            } else {

                // Add a style-element, pointing to reveal.css, after the fetch:
                addLinkToHead('styles/custom-reveal.css')
                consoleInstance.log("Added reveal.css stylesheet to document.")
                initializeReveal(console)
                consoleInstance.log("Reveal initialized")

            }

            document.title = '[ThePresenter]' + title

            consoleInstance.log('All done! Enjoy the presentation!')
            // consoleElement.classList.add('fade-out')

        } catch (error) {
            consoleInstance.error("Fetch error: " + error);
        }
    }
};

function convertRelativeUrlsToAbsolute(doc, url, consoleInstance) {
    // for all images, fix the src attribute:
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        const originalSrc = img.getAttribute('src');
        const resolvedSrc = new URL(originalSrc, url).href;
        img.setAttribute('src', resolvedSrc);
        consoleInstance.debug(`Fixed image src: ${originalSrc} -> ${resolvedSrc}`);
    });
    if (images.length > 0)
        consoleInstance.log(`Fixed ${images.length} image urls`)

}
