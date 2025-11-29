import {Console} from './console.js';
import {initializeReveal} from "./reveal-narve.js";
import {initializeImpress} from "./impress-narve.js";
import {addLinkToHead} from "./util.js";
// import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

export const rootQuerySelectors = [
    '#impress',
    '.reveal > .slides',
    '.presentation',
    'article',
    'main',
    'body'
]


const konsole = new Console()

async function main() {

    const konsoleElement = document.querySelector('#main-console, output')
    konsole.mount(konsoleElement)

    konsole.log("Welcome, meatbags! The Presenter is running!")

    const config = getConfig()
    konsole.log("Incoming parameters: \n" + JSON.stringify(config, null, '  '))

    if (config.url) {
        try {
            await loadContent(config)
        } catch (error) {
            console.error(error)
            konsole.error("Error fetching presentation content: " + error)
            return
        }
    }

    konsole.log(`Preparing to initialize presentation framework '${config.mode}'`)
    try {
        if (config.mode === 'impress') {
            initializeImpress(config)
        } else {

            // Add a style-element, pointing to reveal.css, after the fetch:
            addLinkToHead('styles/custom-reveal.css')
            konsole.log("Added reveal.css stylesheet to document")
            initializeReveal(config)
            konsole.log("Reveal initialized")

        }
    } catch (error) {
        console.error(error)
        konsole.error("Error initializing presentation: " + error)
        return
    }
    konsole.log('All done! Enjoy the presentation!')
    konsole.done()
}

window.onload = async function () {
    await main()
}

function getConfig() {
    const searchParams = new URLSearchParams(window.location.search)
    // const config = {
    //     url: 'https://tangen-2it-utvikling.netlify.app/content/html-001',
    //     mode: 'reveal',
    // }

    return {
        url: searchParams.get('url'),
        mode: searchParams.get('mode') || 'reveal',
        shuffle: searchParams.get('shuffle') === 'true',
        rotate: searchParams.get('rotate') === 'true',
        rootSelector: searchParams.get('rootSelector')
            ? searchParams.get('rootSelector')
            : rootQuerySelectors.join(", "),
        slideSelector: searchParams.get('slideSelector') || 'section',
        console: konsole,
        // three consecutive white-space-only newlines
        markdownSlideSeparator: searchParams.get('markdownSlideSeparator')
            // || /(?:\r?\n\s*){3,}/,
            || /^---$`/,
    }
}

async function loadContent(config) {

    // Part 1: Fetch the content!
    konsole.log("Fetching the presentation from " + config.url);

    const proxyUrl = 'https://corsproxy.io/?'

    let url = config.url

    // If the url is non-absolute, make it absolute based on current location
    if (!config.url.match(/^http(s)?:\/\//)) {
        const baseUrl = window.location.origin + window.location.pathname
        url = new URL(config.url, baseUrl).href
        konsole.debug("Converted non-absolute URL to absolute: " + config.url + " -> " + url)
    }

    // If the URL is localhost, do not use the proxy
    // Otherwise, use CORS proxy to avoid browser CORS errors
    url = url.match(/http(s)?:\/\/localhost/)
        ? url
        : proxyUrl + encodeURIComponent(url)
    konsole.debug("Actual url: " + url);
    const response = await fetch(url)
    if (!response.ok)
        throw new Error(`Unable to load presentation content! Status: ${response.status}`)

    const responseText = await response.text()
    const responseType = response.headers.get('content-type') || 'unknown'
    konsole.debug("Fetched content from URL: " + config.url)
    konsole.debug("   Content type: " + responseType)
    konsole.debug("   Content length: " + responseText.length + " characters")

    const isHtml = responseType.startsWith('text/html')
    const isMarkdown = responseType.startsWith('text/markdown') || responseType.startsWith('application/markdown')

    let presentationElement;
    if (isHtml) {

        // Part 2: Parse the content into a DOM document
        const domParser = new DOMParser()
        presentationElement = domParser.parseFromString(responseText, 'text/html')
        konsole.debug("Parsed fetched content into DOM document.")
        const title =
            presentationElement.querySelector('head title')?.textContent ||
            response.url.split('/').pop()
        konsole.log('Presentation title: ' + title)
        document.title = '[The Presenter]' + title
    } else if (isMarkdown) {

        konsole.log("Markdown content detected - converting to HTML")

        // Split on three consecutive whitespace-only lines
        const separatorPattern = new RegExp(config.markdownSlideSeparator, 'm');
        const slides = responseText.split(separatorPattern);
        konsole.debug(`Split markdown into ${slides.length} slides using separator ${config.markdownSlideSeparator}`)

        // Dynamic import - only loads when markdown is detected
        const {marked} = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js');

        presentationElement = document.createElement('article');

        // Convert markdown to HTML using marked.js
        for (let slide of slides) {
            const htmlContent = marked.parse(slide)
            const section = document.createElement('section')
            section.innerHTML = htmlContent
            presentationElement.appendChild(section)
        }

        konsole.debug("Converted markdown to HTML.")
    } else {
        throw new Error(`Unsupported content type: ${responseType}`)
    }


    // Part 3: Fix relative URLs for images, styles, scripts, etc.
    convertRelativeUrlsToAbsolute(presentationElement, config.url, konsole)

    konsole.log("Inserting presentation into current document")
    Array.from(presentationElement.children).forEach(child => {
        document.body.appendChild(document.importNode(child, true))
    })
}

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
