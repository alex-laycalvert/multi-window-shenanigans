"use strict";
import { v4 as uuid } from "https://jspm.dev/uuid";

/** @type string */
const id = uuid();
document.title = id;
const pos = currentPosition();

const nodes = new Map([[id, pos]]);

const bc = new BroadcastChannel("multi_window_shenanigans");
bc.postMessage({
    type: "POSITION",
    data: pos,
});
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
            nodes.set(payload.data.id, payload.data);
            break;
        case "LEAVE":
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
    const pos = currentPosition();
    nodes.set(pos.id, pos);
    bc.postMessage({
        type: "POSITION",
        data: pos,
    });
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
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("id", node.id);
        circle.setAttribute("cx", node.x + node.w / 2);
        circle.setAttribute("cy", node.y + node.h / 2);
        circle.setAttribute("r", 10);
        svgNodes.push(circle);
    }
    root.replaceChildren(...svgNodes);
}, FRAME_RATE);

window.addEventListener("beforeunload", () => {
    clearInterval(interval);
    bc.postMessage({
        type: "LEAVE",
        data: pos,
    });
    bc.close();
});

function currentPosition() {
    return {
        id,
        x: window.screenX,
        y: window.screenY,
        w: window.innerWidth,
        h: window.innerHeight,
    };
}
