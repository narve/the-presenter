// noinspection JSFileReferences

import {addLinkToHead} from "./util.js";

export async function initializeShower(config) {

    const konsole = config.console
    konsole.log('Loading Shower presentation framework...')

    document.body.classList.add('shower');
    document.body.classList.add('list');

    document.querySelectorAll('section')
        .forEach((section) => {
            section.classList.add('slide');
        })

    addLinkToHead('https://shower.github.io/shower/shower/themes/ribbon/styles/styles.css')
    // addLinkToHead('https://shwr.me/shower/themes/ribbon//styles/styles.css')


    await import('https://cdnjs.cloudflare.com/ajax/libs/shower-core/2.1.0/shower.min.js')
    // await import('https://shower.github.io/shower/shower/shower.js')
}