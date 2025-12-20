// noinspection JSUrlImportUsage

import {addLinkToHead} from "./main.js";

export async function initializeImpress(config) {
    const konsole = config.console
    konsole.log('Loading Impress presentation framework...')

    // Let's locate the root element for impress.js:
    await import('https://cdn.jsdelivr.net/gh/impress/impress.js@2.0.0/js/impress.js')

    const root = document.getElementById('impress')
        || document.querySelector('body > .reveal > .slides')
        || document.querySelector('body main article')
        || document.querySelector('body main')
        || document.body

    // We need the root to have some id, at least, for impress to work:
    let rootId = root.id
    if (!rootId) {
        rootId = 'impress'
        root.id = rootId
    }

    // Also, we have some recommended styles, so let's make sure they are applied,
    // by giving the root element a hard-coded class:
    root.classList.add('impress-narve')

    // If we are in impress-mode, we can remove the 'reveal' class from the root,
    // if it is there, to avoid style issues:
    root.classList.remove('reveal')

    // That does not work yet, so we'll remove the default presentation css
    // and add a custom one:
    document.querySelectorAll('link[rel="stylesheet"][href*="presentation.css"]')
        .forEach(el => el.remove())

    // Add some custom css for impress-narve:
    addLinkToHead('/the-presenter/styles/impress-narve.css')

    // Apply the default options to the root element,
    // if they are not already set. Mostly for
    // documentation/reminder/experimentation purposes, as impress
    // uses these defaults anyway.
    const defaultRootOptions = {
        "data-transition-duration": 1000,
        "data-max-scale": 10,
        "data-perspective": 1000,
        "data-width": 1920,
        "data-height": 1080
    }
    for (const [key, value] of Object.entries(defaultRootOptions)) {
        if (!root.hasAttribute(key)) {
            root.setAttribute(key, value)
        }
    }

    // Then we extract the sections to be used as steps:
    const sections = [...document.querySelectorAll(`#${rootId}>section`)]


    // Let's create a position-array for all sections,
    // then shuffle it, and assign the positions to the sections
    const positions = createPositionArray(sections)

    if (config?.shuffle) {
        shuffle(positions)
    }


    // Then we apply the positions to the sections:
    applyPositions(sections, positions, config)

    // Finally we launch impress.js:
    console.log('Impress root element: ', root, ' id=' + rootId)
    const impressAPI = impress(rootId);
    impressAPI.init()
}


function createPositionArray(sections) {
    const positions = []
    const squareRoot = Math.ceil(Math.sqrt(sections.length));

    for (let i = 0; i < sections.length; i++) {
        const x = (i % squareRoot)
        const y = Math.floor(i / squareRoot)
        const z = i % squareRoot
        positions.push([x, y, z])
    }
    return positions
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function applyPositions(sections, positions, config) {
    for (const section of sections) {
        const i = sections.indexOf(section);
        const [dataX, dataY, dataZ] = positions[i];
        section.classList.add('step')
        if (!section.hasAttribute('data-x'))
            section.setAttribute('data-x', dataX * 1900);
        if (!section.hasAttribute('data-y'))
            section.setAttribute('data-y', dataY * 1060);
        if (!section.hasAttribute('data-z'))
            section.setAttribute('data-z', dataZ * 100);

        if (config?.rotate) {
            if (i % 2 === 1) {
                section.setAttribute('data-rotate-z', "45");
                // section.setAttribute('data-rotate', "45");
                section.setAttribute('data-rotate-y', "45");
                section.setAttribute('data-rotate-x', "30");
            }
            if (i % 3 === 2) {
                section.setAttribute('data-scale', "3");
            }
        }
    }
}

