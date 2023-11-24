"use strict";

import { v4 as uuid } from "https://jspm.dev/uuid";

/** @type string */
const id = uuid();
document.title = id;

/**
 * The currently kept map of every open page and its location/size
 * @type Map<string, Position>
 */
const nodes = new Map();

/** How we notify other pages of _our_ location and size */
const bc = new BroadcastChannel("multi_window_shenanigans");
bc.onmessage = (e) => {
    /** @type Payload */
    const payload = e.data;
    switch (payload.type) {
        case "POSITION":
            // Update the position of this page
            nodes.set(payload.data.id, payload.data);
            break;
        case "LEAVE":
            // Remove from the list since they have left the site
            nodes.delete(payload.data.id);
            break;
    }
};

let isLocked = false;

/** Time for between polling in milliseconds */
const RATE = 50;
/** Namespace URI for SVGs */
const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS = ["red", "green", "yellow", "blue", "black", "magenta", "cyan"];
/** Color for the svg stuff */
const color = COLORS[Math.floor(Math.random() * COLORS.length)];
/** Thickness of circles/lines */
const THICKNESS = 8;
/** When the circle resets to the center */

/** Setting up the elements */
const video = document.querySelector("video");
const svg = document.querySelector("svg");
/** @type HTMLButtonElement */
const resetButton = document.querySelector("#reset");
if (!video) {
    throw new Error("`video` element must be present in page");
}
if (!video) {
    throw new Error("`svg` element must be present in page");
}
video.setAttribute("width", screen.width);
video.setAttribute("height", screen.height);
if (window.location.pathname.includes("xray")) {
    video.style.setProperty("filter", "invert(100%)");
    video.style.setProperty("-webkit-filter", "invert(100%)");
}
svg.setAttribute("width", screen.width);
svg.setAttribute("height", screen.height);
svg.setAttribute("viewBox", `0 0 ${screen.width} ${screen.height}`);

async function main() {
    /** Setting up video */
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        video.srcObject = stream;
        video.play();
    } catch (e) {
        console.warn("Video not allowed");
    }

    const pos = {
        id,
        sx: window.screenX,
        sy: window.screenY,
        w: window.innerWidth,
        h: window.innerHeight,
        x: window.screenX + window.innerWidth / 2,
        y: window.screenY + window.innerHeight / 2,
        c: color,
    };

    const interval = setInterval(() => {
        // Update our position and notify everyone else
        pos.sx = window.screenX;
        pos.sy = window.screenY;
        pos.w = window.innerWidth;
        pos.h = window.innerHeight;
        nodes.set(pos.id, pos);
        bc.postMessage({
            type: "POSITION",
            data: pos,
        });
        // Making sure the video container is in the right spot
        window.scroll(0, 0);
        video.style.left = -pos.sx + "px";
        video.style.top = -pos.sy + "px";
        svg.style.left = -pos.sx + "px";
        svg.style.top = -pos.sy + "px";

        const svgNodes = [];
        for (let node of nodes.values()) {
            for (let otherNode of nodes.values()) {
                if (node.id === otherNode.id) {
                    continue;
                }
                // Draw a line between the center of every open page to all
                // other open pages.
                const line = document.createElementNS(SVG_NS, "line");
                line.setAttribute("x1", otherNode.x);
                line.setAttribute("y1", otherNode.y);
                line.setAttribute("x2", node.x);
                line.setAttribute("y2", node.y);
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", THICKNESS);
                line.setAttribute("id", `${otherNode.id}---${node.id}`);
                svgNodes.push(line);
            }
            // Draw a circle for every open page in the center of that window
            const circle = document.createElementNS(SVG_NS, "circle");
            circle.setAttribute("id", node.id);
            circle.setAttribute("cx", node.x);
            circle.setAttribute("cy", node.y);
            circle.setAttribute("r", THICKNESS / 2);
            circle.setAttribute("fill", node.c);
            svgNodes.push(circle);
        }
        // Render everything
        svg.replaceChildren(...svgNodes);
    }, RATE);

    window.addEventListener("mousemove", (e) => {
        if (isLocked) {
            return;
        }
        pos.x = window.screenX + e.clientX;
        pos.y = window.screenY + e.clientY;
    });

    window.addEventListener("mousedown", () => {
        isLocked = !isLocked;
    });

    resetButton?.addEventListener("click", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        isLocked = true;
        pos.x = window.screenX + window.innerWidth / 2;
        pos.y = window.screenY + window.innerHeight / 2;
    });

    // Cleanup
    window.addEventListener("beforeunload", () => {
        clearInterval(interval);
        bc.postMessage({
            type: "LEAVE",
            data: { id },
        });
        bc.close();
    });
}

main();
