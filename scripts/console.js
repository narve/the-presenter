export class Console {
    #messages = [];
    #interval;
    #element;

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
        this.#element = element;
        this.#interval = setInterval(() => this.tick(), 200)
    }

    unmount() {
        clearInterval(this.#interval)
    }

    tick() {
        if (this.#messages.length > 0) {
            const {type, message} = this.#messages.shift()
            console.log(`[${type}]`, message)
            const messageElement = document.createElement('output')
            messageElement.classList.add(type)
            messageElement.textContent = message
            this.#element.appendChild(messageElement)
            this.#element.scrollTop = this.#element.scrollHeight
            if (this.#messages.length > 0) {
                setTimeout(() => this.tick(), 50)
            }
        }
    }

}