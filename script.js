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

/** Time for between polling in milliseconds */
const RATE = 50;
/** Namespace URI for SVGs */
const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS = ["red", "green", "yellow", "blue", "black", "magenta", "cyan"];
/** Color for the svg stuff */
const color = COLORS[Math.floor(Math.random() * COLORS.length)];
/** Thickness of circles/lines */
const THICKNESS = 8;

/** Setting up the elements */
const video = document.querySelector("video");
const svg = document.querySelector("svg");
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
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });
    video.srcObject = stream;
    video.play();

    const interval = setInterval(() => {
        // Update our position and notify everyone else
        const pos = {
            id,
            x: window.screenX,
            y: window.screenY,
            w: window.innerWidth,
            h: window.innerHeight,
            c: color,
        };
        nodes.set(pos.id, pos);
        bc.postMessage({
            type: "POSITION",
            data: pos,
        });
        // Making sure the video container is in the right spot
        window.scroll(0, 0);
        video.style.left = -pos.x + "px";
        video.style.top = -pos.y + "px";
        svg.style.left = -pos.x + "px";
        svg.style.top = -pos.y + "px";

        const svgNodes = [];
        for (let node of nodes.values()) {
            for (let otherNode of nodes.values()) {
                if (node.id === otherNode.id) {
                    continue;
                }
                // Draw a line between the center of every open page to all
                // other open pages.
                const line = document.createElementNS(SVG_NS, "line");
                line.setAttribute("x1", otherNode.x + otherNode.w / 2);
                line.setAttribute("y1", otherNode.y + otherNode.h / 2);
                line.setAttribute("x2", node.x + node.w / 2);
                line.setAttribute("y2", node.y + node.h / 2);
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", THICKNESS);
                line.setAttribute("id", `${otherNode.id}---${node.id}`);
                svgNodes.push(line);
            }
            // Draw a circle for every open page in the center of that window
            const circle = document.createElementNS(SVG_NS, "circle");
            circle.setAttribute("id", node.id);
            circle.setAttribute("cx", node.x + node.w / 2);
            circle.setAttribute("cy", node.y + node.h / 2);
            circle.setAttribute("r", THICKNESS / 2);
            circle.setAttribute("fill", node.c);
            svgNodes.push(circle);
        }
        // Render everything
        svg.replaceChildren(...svgNodes);
    }, RATE);

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
