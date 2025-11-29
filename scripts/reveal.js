import Reveal from "https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/reveal.esm.js"
import RevealHighlight from "https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/plugin/highlight/highlight.esm.js"
import * as RevealMermaidModule
    from "https://cdn.jsdelivr.net/npm/reveal.js-mermaid-plugin/plugin/mermaid/mermaid.esm.js"

import plantumlEncoder from 'https://cdn.jsdelivr.net/npm/plantuml-encoder@1.4.0/+esm'

export function initializeReveal(config) {
    const konsole = config.console
    konsole.log('RevealHighlight: ', RevealHighlight)
    konsole.log('Mermaid: ', RevealMermaidModule)
    konsole.log('RootSelector: ' + config.rootSelector)

    const RevealMermaid = RevealMermaidModule.default()

    const root = document.querySelector(config.rootSelector)

    konsole.debug('Reveal root element: ' + root.tagName + "." + root.className)

    // Fix document structure if needed:
    if (!document.querySelector('.reveal')) {
        konsole.log('Wrapping slides in .reveal > .slides')

        const slides = [...root.querySelectorAll(config.slideSelector)]
        konsole.debug(`Reveal: Found ${slides.length} slides using selector '${config.slideSelector}'`)

        const slideDiv = document.createElement('div');
        slideDiv.classList.add('slides');
        slides.forEach(elem => slideDiv.appendChild(elem))

        const reveal = document.createElement('div');
        reveal.classList.add('reveal');
        reveal.appendChild(slideDiv);
        document.body.appendChild(reveal);
    }

    // PlantUml:
    document.querySelectorAll('.reveal code.language-plantuml').forEach(function (block) {
        let img = document.createElement("img");
        img.setAttribute("src", '//www.plantuml.com/plantuml/svg/' + plantumlEncoder.encode(block.innerText));
        img.classList.add('plantuml');
        const scale = block.getAttribute('data-scale');
        if (scale) {
            img.style.scale = scale;
        }
        const pre = block.parentElement;
        pre.parentNode.replaceChild(img, pre);
    });

    // document.cookie = "showtasks=true"

    // Remove tasks:
    // const shouldShowTasks = document.cookie.indexOf('showtasks') >= 0 || document.location.search.includes('show-tasks')
    // const shouldShowTasks = localStorage.getItem('showtasks') === 'true'
    // if (!shouldShowTasks) {
    //     konsole.log('Removing task sections')
    //     for (const e of document.querySelectorAll(".task")) {
    //         e.remove();
    //     }
    // } else {
    //     konsole.log('Keeping task sections')
    // }

    document.querySelectorAll("pre code:not(.data-no-trim)")
        .forEach((block) => {
            block.setAttribute('data-trim', true)
        })
    //
    // // If on local-host, on first page, add a button to toggle task-showing:
    //
    // if (document.location.hostname === 'localhost') {
    //     const button = document.createElement('button');
    //     button.classList.add('toggle-tasks');
    //     button.innerText = shouldShowTasks ? 'Skjul oppgaver' : 'Vis oppgaver';
    //     button.onclick = () => {
    //         konsole.log('Toggling tasks', 'old=', shouldShowTasks);
    //         localStorage.setItem('showtasks', shouldShowTasks ? 'false' : 'true');
    //         document.cookie = shouldShowTasks
    //             ? 'showtasks=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    //             : 'showtasks=true; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=*';
    //         document.location.reload();
    //     }
    //     const firstSection = document.querySelector('section');
    //     firstSection.appendChild(button);
    // }


    // Add copy button to code-blocks:
    const copyButtonLabel = "Kopier";

    // use a class selector if available
    let blocks = document.querySelectorAll("pre:not(.mermaid):not(.no-copy)");

    blocks.forEach((block) => {
        // only add button if browser supports Clipboard API
        if (navigator.clipboard) {
            const button = document.createElement("button");

            button.innerText = copyButtonLabel;
            block.appendChild(button);

            button.addEventListener("click", async () => {
                await copyCode(block, button);
            });
        }
    });

    async function copyCode(block, button) {
        const code = block.querySelector("code");
        let text = code.innerText;

        // Strip \\n from all places in the text:
        text = text.replace(/\\ *[\n\r] */g, ' ')

        await navigator.clipboard.writeText(text);

        // visual feedback that task is completed
        button.innerText = "Code Copied";

        setTimeout(() => {
            button.innerText = copyButtonLabel;
        }, 700);
    }

    // Tweak local-host-links: Set target to _blank, add rel="noopener" and
    // set text to the same as href:

    ;[...document.querySelectorAll('a')]
        .filter(a => a.href.includes('http://localhost'))
        .forEach(a => {
            // return
            a.target = '_blank';
            a.rel = 'noopener';
            a.innerText = a.href;
        })

    Reveal.initialize(
        {
            plugins: [
                RevealHighlight,
                RevealMermaid,
                // PlantUml,
                // { src: '//cdn.jsdelivr.net/npm/reveal-plantuml' },
            ],
            hash: true,
            slideNumber: 'c/t',
        }
    )
}