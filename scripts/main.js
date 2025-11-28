import {Console} from './console.js';

console.log('loading');


window.onload = function () {
    console.log('loading');
    const consoleInstance = new Console();
    consoleInstance.mount(document.getElementById(('main-console')));

    consoleInstance.log("Hello, ThePresenter is running!");
};
