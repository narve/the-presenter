export class Console {
    #messages = [];
    #timeout;
    #element;

    log(message) {
        this.#messages.push({type: 'info', message})
    }

    error(message) {
        this.#messages.push({type: 'error', message})
    }

    mount(element) {
        this.#element = element;
        this.#timeout = setInterval(() => this.tick(), 200)
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