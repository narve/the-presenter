export class Console {
    #messages = [];
    #timeout;
    #element;

    log(message) {
        this.#messages.push({type: 'log', message});
    }

    mount(element) {
        this.#element = element;
        this.#timeout = setInterval(() => this.tick(), 1000 / 60);
    }

    tick() {
        while (this.#messages.length > 0) {
            const {type, message} = this.#messages.shift();
            console.log('[console]', message);
            const messageElement = document.createElement('output');
            messageElement.classList.add(type);
            messageElement.textContent = message;
            this.#element.appendChild(messageElement);
            this.#element.scrollTop = this.#element.scrollHeight;
        }
    }

}