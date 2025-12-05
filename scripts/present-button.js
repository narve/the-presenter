import {markAsReady, present} from "./main.js";

const button = document.createElement("button");
button.classList.add('present-button');
button.title = "Start presentation mode";
button.innerHTML = "▶";
button.style = `position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background-color: #007bff;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-size: 24px;
    cursor: pointer;
    z-index: 1000;`;

button.onclick = async function () {
    await present()
    button.remove()
    // await document.body.requestFullscreen()
}

document.body.appendChild(button)

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        document.body.setAttribute('data-fullscreen', true)
    } else {
        document.body.removeAttribute('data-fullscreen');
    }
});

// const style = document.createElement('style');
// style.textContent = `
// :root[data-fullscreen] .present-button {
//   display: none;
// }
// `;
// document.body.appendChild(style);


console.log('Present button added to document body.');

markAsReady();
