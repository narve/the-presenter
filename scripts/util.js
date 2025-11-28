export function addLinkToHead(href, rel = 'stylesheet') {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
}