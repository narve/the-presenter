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
}

document.body.appendChild(button)

console.log('Present button added to document body.');

markAsReady();
