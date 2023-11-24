"use strict";
import { v4 as uuid } from "https://jspm.dev/uuid";

/** @type string */
const id = uuid();
document.title = id;

/** The currently kept map of every open page and its location/size */
const nodes = new Map();

/** How we notify other pages of _our_ location and size */
const bc = new BroadcastChannel("multi_window_shenanigans");
bc.onmessage = (e) => {
    /**
     * @typedef Payload
     * @prop {'POSITION'|'LEAVE'} type
     * @prop {typeof pos} data
     */
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

/** Namespace URI for SVGs */
const SVG_NS = "http://www.w3.org/2000/svg";
/** Time for between polling in milliseconds */
const FRAME_RATE = 50;

// Setting up the SVG space
/** @type SVGElement */
const root = document.querySelector("#root");
if (!root) {
    throw new Error(
        "Please make sure an `svg` tag with ID `root` is present on the page",
    );
}
root.setAttribute("width", screen.width);
root.setAttribute("height", screen.height);
root.setAttribute("viewBox", `0 0 ${screen.width} ${screen.height}`);
root.style.position = "absolute";

const interval = setInterval(() => {
    // Update _our_ position and notify everyone else
    const pos = {
        id,
        x: window.screenX,
        y: window.screenY,
        w: window.innerWidth,
        h: window.innerHeight,
    };
    nodes.set(pos.id, pos);
    bc.postMessage({
        type: "POSITION",
        data: pos,
    });

    // Making sure the SVG root container is in the right spot
    window.scroll(0, 0);
    root.style.left = -pos.x + "px";
    root.style.top = -pos.y + "px";

    const svgNodes = [];
    /** @type typeof pos | undefined */
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
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", 10);
            line.setAttribute("id", `${otherNode.id}---${node.id}`);
            svgNodes.push(line);
        }
        // Draw a circle for every open page in the center of that window
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("id", node.id);
        circle.setAttribute("cx", node.x + node.w / 2);
        circle.setAttribute("cy", node.y + node.h / 2);
        circle.setAttribute("r", 10);
        svgNodes.push(circle);
    }
    // Render everything
    root.replaceChildren(...svgNodes);
}, FRAME_RATE);

// Cleanup
window.addEventListener("beforeunload", () => {
    clearInterval(interval);
    bc.postMessage({
        type: "LEAVE",
        data: { id },
    });
    bc.close();
});
