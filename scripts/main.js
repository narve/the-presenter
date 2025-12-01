// noinspection JSFileReferences

import {Konsole, initializeKonsoleElement} from './konsole.js';

import {initializeReveal} from "./launcher-reveal.js";
import {initializeImpress} from "./launcher-impress.js";
import {initializeShower} from "./launcher-shower.js";


const konsole = new Konsole()
window.konsole = konsole


/**
 * @typedef {Object} Config
 * @property {boolean} noConsole - Whether to hide the console output
 * @property {string} url - URL of the presentation content to load
 * @property {string} mode - Presentation framework to use ('reveal', 'impress', or 'shower')
 * @property {boolean} shuffle - Whether to shuffle slides
 * @property {boolean} rotate - Whether to rotate slides
 * @property {string} rootSelector - CSS selector for the presentation root element
 * @property {string} slideSelector - CSS selector for identifying slides
 * @property {Konsole} console - Console instance for logging
 * @property {string} markdownSlideSeparator - Pattern to split markdown into slides
 * @property {string} allowCorsProxy - Whether to allow CORS proxying (not totally safe)
 * @property {string} corsProxyUrl
 */


/**
 * Main function to present the loaded content as a presentation.
 * @returns {Promise<void>}
 */
export async function present() {

    try {

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
            const article = await loadContent(config)
            if (document.querySelector('body>main')) {
                konsole.log("Inserting presentation into existing <main> element")
                document.querySelector('body>main').appendChild(article)
            } else {
                // Create a main element to hold the presentation:
                konsole.log("Creating <main> element to hold presentation")
                const main = document.createElement('main')
                main.appendChild(article)
                document.body.appendChild(main)
            }
        } else {
            konsole.log("No presentation URL provided - assuming content is already in document.")
            await normalizeCurrentDocument(config)
        }

        konsole.log(`Preparing to initialize presentation framework '${config.mode}'`)
        if (config.mode === 'impress') {
            await initializeImpress(config)
        } else if (config.mode === 'shower') {
            await initializeShower(config)
        } else {
            addLinkToHead('/the-presenter/styles/custom-reveal.css')
            konsole.debug("Added reveal.css stylesheet to document")
            await initializeReveal(config)
            konsole.log("Reveal initialized")
        }
        markAsReady()
        konsole.log('All done! Enjoy the presentation!')
        konsole.done()
    } catch (error) {
        console.error(error)
        konsole.error("Error BSOD Guru mediation: " + error)
    }
}

export function markAsReady() {
    if (document.body.classList.contains('hide-until-ready')) {
        konsole.log("Removing 'hide-until-ready' class from body")
        document.body.classList.remove('hide-until-ready')
    }
}

async function normalizeCurrentDocument(config) {
    konsole.warn('NB: Normalization not implemented yet for local content.')
}

/**
 * @returns {Config}
 */
function getConfig() {
    // const config = {
    //     url: 'https://tangen-2it-utvikling.netlify.app/content/html-001',
    //     mode: 'reveal',
    // }

    const rootQuerySelectors = [
        '#impress',
        '.reveal > .slides',
        '.presentation',
        'article',
        'main',
        'body'
    ]

    console.log(window.presenterConfig)

    const searchParams = new URLSearchParams(window.location.search)
    return {
        noConsole:
            window.presenterConfig !== undefined
                ? !!window.presenterConfig.noConsole
                : searchParams.get('noConsole') === 'true',
        url: searchParams.get('url'),
        mode: searchParams.get('mode') || 'reveal',
        shuffle: searchParams.get('shuffle') === 'true',
        rotate: searchParams.get('rotate') === 'true',
        rootSelector: searchParams.get('rootSelector')
            ? searchParams.get('rootSelector')
            : rootQuerySelectors.join(", "),
        slideSelector: searchParams.get('slideSelector') || 'section:not(:has(section))',
        console: konsole,
        // three consecutive white-space-only newlines
        markdownSlideSeparator: searchParams.get('markdownSlideSeparator')
            || "(?:\\r?\\n\\s*){3,}",
        // Alternative patterns:

        // || /(?:\r?\n\s*){3,}/,
        // || /^---$`/,
        allowCorsProxy: searchParams.get('allowCorsProxy') === 'true',
    }
}

async function fetchPresentationContent(config) {

    konsole.log("Fetching the presentation from " + config.url);
    let url = config.url

    // If the url is non-absolute, make it absolute based on current location
    if (!config.url.match(/^http(s)?:\/\//)) {
        const baseUrl = window.location.origin + window.location.pathname
        url = new URL(config.url, baseUrl).href
        konsole.debug("Converted non-absolute URL to absolute: " + config.url + " -> " + url)
    }


    konsole.debug("Actual url: " + url);
    let response;
    try {
        response = await fetch(url)
    } catch (error) {
        // CORS error or network error
        if (error instanceof TypeError) {
            konsole.error("CORS or network error when fetching URL directly: " + error.message)
            // If the URL is localhost, do not try to use a proxy.
            const isLocalhost = url.match(/http(s)?:\/\/localhost/)
            // Otherwise, use CORS proxy to avoid browser CORS errors
            if (!isLocalhost && config.allowCorsProxy) {
                // This one is often blocked...
                // const proxyUrl = 'https://corsproxy.io/?'
                const proxyUrl = config.corsProxyUrl || 'https://api.cors.lol?url='

                konsole.error("Retrying once, using CORS proxy...")
                url = proxyUrl + encodeURIComponent(url)
                response = await fetch(url, {
                    mode: 'cors',
                })
            } else {
                konsole.error("Perhaps try allowing CORS? (allowCorsProxy=true)")
                // No use continuing, response is undefined
                throw new Error('Aborting. ')
            }
        }
    }
    if (!response.ok)
        throw new Error(`Unable to load presentation content! Status: ${response.status}, url: ${url}`)

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

/**
 * Loads presentation content from a remote URL and inserts it into the current document.
 * Supports both HTML and Markdown content types.
 *
 * @param {Object} config - Configuration object containing presentation settings
 * @param {string} config.url - URL of the presentation content to load
 * @param {string} config.slideSelector - CSS selector for identifying slides in HTML content
 * @param {RegExp|string} config.markdownSlideSeparator - Pattern to split markdown into slides
 * @returns {Promise<HTMLElement>} - An article element containing the loaded presentation slides
 * @throws {Error} If content type is unsupported or if fetching fails
 */
async function loadContent(config) {

    const {responseText, responseType} = await fetchPresentationContent(config)

    const isHtml = responseType.startsWith('text/html')
    const isMarkdown = responseType.startsWith('text/markdown') || responseType.startsWith('application/markdown')

    let title = 'Presentation!'
    // let presentationElement;
    let slides;
    if (isHtml) {

        // Parse the content into a DOM document
        const domParser = new DOMParser()
        let contentDom = domParser.parseFromString(responseText, 'text/html')
        konsole.debug("Parsed fetched content into DOM document.")
        title =
            contentDom.querySelector('head title')?.textContent
            || config.url.split('/').pop()
        slides = contentDom.querySelectorAll(config.slideSelector)
        konsole.log(`Fetched HTML presentation: "${title}", ${slides.length} slides. `)
    } else if (isMarkdown) {

        konsole.log("Markdown content detected - converting to HTML")

        title = config.url.split('/').pop()

        // Split on three consecutive whitespace-only lines
        const separatorPattern = new RegExp(config.markdownSlideSeparator, 'm');
        const slidesMarkdown = responseText.split(separatorPattern);
        konsole.debug(`Split markdown into ${slidesMarkdown.length} slides using separator ${config.markdownSlideSeparator}`)

        // presentationElement = document.createElement('article');
        const {marked} = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js');

        slides = []
        // Convert each slide to a section and append it:
        for (let slide of slidesMarkdown) {
            const htmlContent = marked.parse(slide)
            const section = document.createElement('section')
            section.innerHTML = htmlContent
            // presentationElement.appendChild(section)
            slides.push(section)
        }

        konsole.debug("Converted markdown to HTML.")
    } else {
        throw new Error(`Unsupported content type: ${responseType}`)
    }

    document.title = '[The Presenter]' + title

    const article = document.createElement('article');
    article.classList.add('presentation')
    slides.forEach(elem => article.appendChild(elem))

    convertRelativeUrlsToAbsolute(article, config.url)

    konsole.log("Inserting presentation into current document")
    return article
}


export function addLinkToHead(href, rel = 'stylesheet', konsole = window.konsole) {
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    document.head.appendChild(link)
    konsole.debug('Added link to head: ' + link.innerHTML)
}

/// Fix relative URLs for images, styles, scripts, etc.
export function convertRelativeUrlsToAbsolute(doc, originalDocumentUrl, konsole = window.konsole) {
    // for all images, fix the src attribute:
    const images = doc.querySelectorAll('img')
    images.forEach(img => {
        const originalSrc = img.getAttribute('src')
        const resolvedSrc = new URL(originalSrc, originalDocumentUrl).href
        img.setAttribute('src', resolvedSrc)
        konsole.debug(`Fixed image src: ${originalSrc} -> ${resolvedSrc}`)
    });
    if (images.length > 0)
        konsole.log(`Fixed ${images.length} image urls`)
}
