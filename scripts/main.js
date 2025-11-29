import {Console, initializeKonsoleElement} from './console.js';
import {initializeReveal} from "./reveal-narve.js";
import {initializeImpress} from "./impress-narve.js";
import {addLinkToHead} from "./util.js";


const konsole = new Console()
window.konsole = konsole

window.onload = async function () {
    await main()
}


async function main() {

    // Get configuration from URL parameters or defaults:
    const config = getConfig()

    // Show the console, unless disabled:
    if (!config.noConsole) {
        initializeKonsoleElement(konsole)
    }

    konsole.log("Welcome, meatbags! The Presenter is running!")
    konsole.log("Configuration: " + JSON.stringify(config, null, '  '))

    // Load the content into this document, if a URL is provided:
    if (config.url) {
        try {
            await loadContent(config)
        } catch (error) {
            console.error(error)
            konsole.error("Error fetching presentation content: " + error)
            return
        }
    } else {
        konsole.log("No presentation URL provided - assuming content is already in document.")
        throw new Error('No presentation URL provided - this mode is not implemented yet.')
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

function getConfig() {

    const rootQuerySelectors = [
        '#impress',
        '.reveal > .slides',
        '.presentation',
        'article',
        'main',
        'body'
    ]

    const searchParams = new URLSearchParams(window.location.search)
    // const config = {
    //     url: 'https://tangen-2it-utvikling.netlify.app/content/html-001',
    //     mode: 'reveal',
    // }

    return {
        noConsole: searchParams.get('noConsole') === 'true',
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
            || /(?:\r?\n\s*){3,}/,
        // || /^---$`/,
    }
}

async function fetchPresentationContent(config) {

    const proxyUrl = 'https://corsproxy.io/?'

    konsole.log("Fetching the presentation from " + config.url);
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

    const responseType = response.headers.get('content-type') || 'unknown'
    const responseText = await response.text()
    konsole.debug("Fetched content from URL: " + config.url)
    konsole.debug("   Content type: " + responseType)
    konsole.debug("   Content length: " + responseText.length + " characters")
    return {
        responseText,
        responseType,
    }
}

async function loadContent(config) {

    const {responseText, responseType} = await fetchPresentationContent(config)

    const isHtml = responseType.startsWith('text/html')
    const isMarkdown = responseType.startsWith('text/markdown') || responseType.startsWith('application/markdown')

    let presentationElement;
    if (isHtml) {

        // Parse the content into a DOM document
        const domParser = new DOMParser()
        let contentDom = domParser.parseFromString(responseText, 'text/html')
        konsole.debug("Parsed fetched content into DOM document.")
        const title =
            contentDom.querySelector('head title')?.textContent ||
            config.url.split('/').pop()
        konsole.log('Presentation title: ' + title)
        document.title = '[The Presenter]' + title

        presentationElement = contentDom

        // presentationElement = document.createElement('article');
        // const slides = contentDom.querySelectorAll(config.slideSelector)
        // konsole.log(`HTML content detected - found ${slides.length} slides using selector '${config.slideSelector}'`)
        // slides.forEach(elem => {
        //     const section = document.createElement('section');
        //     section.appendChild(elem);
        //     presentationElement.appendChild(section);
        // })

    } else if (isMarkdown) {

        konsole.log("Markdown content detected - converting to HTML")

        // Split on three consecutive whitespace-only lines
        const separatorPattern = new RegExp(config.markdownSlideSeparator, 'm');
        const slides = responseText.split(separatorPattern);
        konsole.debug(`Split markdown into ${slides.length} slides using separator ${config.markdownSlideSeparator}`)

        presentationElement = document.createElement('article');
        const {marked} = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js');

        // Convert each slide to a section and append it:
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


    convertRelativeUrlsToAbsolute(presentationElement, config.url)

    konsole.log("Inserting presentation into current document")
    Array.from(presentationElement.children).forEach(child => {
        document.body.appendChild(document.importNode(child, true))
    })
}

/// Fix relative URLs for images, styles, scripts, etc.
function convertRelativeUrlsToAbsolute(doc, url) {
    // for all images, fix the src attribute:
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        const originalSrc = img.getAttribute('src');
        const resolvedSrc = new URL(originalSrc, url).href;
        img.setAttribute('src', resolvedSrc);
        konsole.debug(`Fixed image src: ${originalSrc} -> ${resolvedSrc}`);
    });
    if (images.length > 0)
        konsole.log(`Fixed ${images.length} image urls`)

}
