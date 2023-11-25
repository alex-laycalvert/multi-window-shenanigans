"use strict";

import { v4 as uuid } from "https://jspm.dev/uuid";

const id = uuid();

const position = {
    id,
    sx: window.screenX,
    sy: window.screenY,
    w: window.innerWidth,
    h: window.innerHeight,
    x: window.screenX + window.innerWidth / 2,
    y: window.screenY + window.innerHeight / 2,
};

const svg = document.querySelector("svg");

if (!svg) {
    throw new Error("No svg");
}

svg.setAttribute("width", screen.width);
svg.setAttribute("height", screen.height);
svg.setAttribute("viewBox", `0 0 ${screen.width} ${screen.height}`);

/** @type SVGCircleElement */
const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("cx", position.x);
circle.setAttribute("cy", position.y);
circle.setAttribute("r", 10);
circle.setAttribute("fill", "black");
svg.appendChild(circle);

let isLocked = false;

setInterval(() => {
    position.sx = window.screenX;
    position.sy = window.screenY;
    position.w = window.innerWidth;
    position.h = window.innerHeight;

    window.scroll(0, 0);
    svg.style.setProperty("left", `-${position.sx}px`);
    svg.style.setProperty("top", `-${position.sy}px`);

    circle.setAttribute("cx", position.x);
    circle.setAttribute("cy", position.y);
}, 10);

window.addEventListener("mousemove", (e) => {
    if (isLocked) {
        return;
    }
    position.x = window.screenX + e.clientX;
    position.y = window.screenY + e.clientY;
});

window.addEventListener("click", (e) => {
    position.x = window.screenX + e.clientX;
    position.y = window.screenY + e.clientY;

    isLocked = !isLocked;
    if (isLocked) {
        circle.setAttribute("fill", "red");
    } else {
        circle.setAttribute("fill", "black");
    }
});
