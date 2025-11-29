import {addLinkToHead} from "./util.js";

export function initializeKonsoleElement(konsole = window.konsole) {
    addLinkToHead('styles/konsole.css')
    const konsoleElement = document.createElement('output')
    konsoleElement.classList.add('konsole')
    document.body.appendChild(konsoleElement)
    konsole.mount(konsoleElement)
}

export class Console {
    #messages = [];
    #interval;
    #element;
    #indicator;
    #isClosing = false;

    debug(args) {
        // this.#messages.push({type: 'debug', message: args})
        console.debug(args)
    }

    log(message) {
        this.#messages.push({type: 'info', message})
    }

    error(message) {
        this.#messages.push({type: 'error', message})
    }

    mount(element) {
        this.#element = element
        this.#interval = setInterval(() => this.tick(), 1)
        this.#indicator = document.createElement('output')
        this.#indicator.classList.add('loading-indicator')
        this.#indicator.textContent = '...'
        this.#element.appendChild(this.#indicator)
    }

    unmount() {
        // clearInterval(this.#interval)
        this.#element.remove()
    }

    done() {
        this.#isClosing = true
    }


    #currentLineElement
    #line = []
    #counter = 0

    // This method is called every 10ms
    tick() {
        this.#counter++
        const wordFactor = this.#isClosing || this.#line.length > 5 ? 5 : 10
        const lineFactor = this.#isClosing || this.#messages.length > 3 ? 10 : 25
        if (this.#counter % wordFactor === 0 && this.#line.length > 0) {
            const nextWord = this.#line.shift()
            this.#currentLineElement.textContent += ' ' + nextWord
            return
        }
        if (this.#counter % lineFactor === 0 && this.#line.length === 0 && this.#messages.length > 0) {
            const {type, message} = this.#messages.shift()
            console.log(`[${type}]`, message)

            this.#currentLineElement = document.createElement('output')
            this.#currentLineElement.classList.add(type)

            this.#line = message.split(" ")

            // this.#currentLineElement.textContent = message
            this.#element.appendChild(this.#currentLineElement)

            // Add blinking indicator if more messages are pending
            this.#element.appendChild(this.#indicator)
            this.#element.scrollTop = this.#indicator.scrollHeight

            if (this.#messages.length > 0) {
                // we don't want to wait for too long, so we call tick again soon
                // clearTimeout(this.#interval)
                // setTimeout(() => this.tick(), 250)
            } else if (this.#isClosing) {
                this.#indicator.remove()
                this.#element.classList.add('fade-out')
                // This duration should be at least as long the CSS animation duration:
                setTimeout(() => this.unmount(), 5000)
            }
        }
    }
}