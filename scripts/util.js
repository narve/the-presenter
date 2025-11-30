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
