// noinspection JSFileReferences

export async function initializeReveal(config) {

    const konsole = config.console
    konsole.log('Loading Reveal presentation framework...')

    const {default: Reveal} = await import("https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/reveal.esm.js")
    const {default: RevealHighlight} = await import("https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/plugin/highlight/highlight.esm.js")
    const RevealMermaidModule = await import("https://cdn.jsdelivr.net/npm/reveal.js-mermaid-plugin/plugin/mermaid/mermaid.esm.js")
    const {default: RevealMath} = await import("https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/plugin/math/math.esm.js")
    const RevealMarkdownModule = await import("https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/plugin/markdown/markdown.esm.js")
    // import plantumlEncoder from 'https://cdn.jsdelivr.net/npm/plantuml-encoder@1.4.0/+esm'

    const RevealMermaid = RevealMermaidModule.default()
    const RevealMarkdown = RevealMarkdownModule.default()

    konsole.debug('RevealHighlight: ', RevealHighlight)
    konsole.debug('Mermaid: ', RevealMermaidModule)
    konsole.debug('RootSelector: ' + config.rootSelector)


    const root = document.querySelector(config.rootSelector)

    konsole.debug('Reveal root element: ' + root.tagName + "." + root.className)

    // Fix document structure if needed:
    if (!document.querySelector('.reveal')) {
        konsole.debug('Wrapping slides in .reveal > .slides')

        const slideSelector = 'section'
        const slides = [...root.querySelectorAll(slideSelector)]
        konsole.log(`Reveal: Found ${slides.length} slides using selector '${slideSelector}'`)

        const slideHolder = document.createElement('div');
        slideHolder.classList.add('slides');
        slides.forEach(elem => {
            const section = document.createElement('section');
            section.appendChild(elem);
            slideHolder.appendChild(section);
        })

        const reveal = document.createElement('div');
        reveal.classList.add('reveal');
        reveal.appendChild(slideHolder);
        document.body.appendChild(reveal);
    }

    document.querySelectorAll("pre code:not(.data-no-trim)")
        .forEach((block) => {
            block.setAttribute('data-trim', "true")
        })


    // Add copy button to code-blocks:
    const copyButtonLabel = "📋";
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
            a.rel = 'nnoopener';
            a.innerText = a.href;
        })

    Reveal.initialize(
        {
            plugins: [
                RevealHighlight,
                RevealMermaid,
                RevealMarkdown,
                RevealMath.KaTeX,
                // PlantUml,
                // { src: '//cdn.jsdelivr.net/npm/reveal-plantuml' },
            ],
            hash: true,
            slideNumber: 'c/t',
        }
    )
}