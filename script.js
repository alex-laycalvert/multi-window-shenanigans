import { v4 as uuid } from "https://jspm.dev/uuid";

/** Time for between polling in milliseconds */
const FRAME_RATE = 50;
/** Namespace URI for SVGs */
const SVG_NS = "http://www.w3.org/2000/svg";

// Setup some basic data for this current window
const session = initiateSession();

// Keeping track of which window is which
document.title = session.id;

// Setting up the SVG space
/** @type SVGElement */
const root = document.querySelector("#root");
root.setAttribute("width", screen.width);
root.setAttribute("height", screen.height);
root.setAttribute("viewBox", `0 0 ${screen.width} ${screen.height}`);
root.style.position = "absolute";

const interval = setInterval(() => {
    // Making sure we don't go somewhere weird, might be unnecessary
    window.scroll(0, 0);
    // Update necessary data
    updateSession(session);
    root.style.left = -session.x + "px";
    root.style.top = -session.y + "px";
    const sessions = getSessions();
    /** @type Node[] */
    const nodes = [];
    // Create the displayed circles/connection lines.
    for (let i = 0; i < sessions.length; i++) {
        const start = document.createElementNS(SVG_NS, "circle");
        start.setAttribute("cx", sessions[i].x + sessions[i].w / 2);
        start.setAttribute("cy", sessions[i].y + sessions[i].h / 2);
        start.setAttribute("r", 10);
        nodes.push(start);
        for (let j = 0; j < sessions.length; j++) {
            if (j == i) {
                continue;
            }
            const end = document.createElementNS(SVG_NS, "circle");
            end.setAttribute("cx", sessions[j].x + sessions[j].w / 2);
            end.setAttribute("cy", sessions[j].y + sessions[j].h / 2);
            end.setAttribute("r", 10);
            nodes.push(end);
            const line = document.createElementNS(SVG_NS, "line");
            line.setAttribute("x1", start.getAttribute("cx"));
            line.setAttribute("y1", start.getAttribute("cy"));
            line.setAttribute("x2", end.getAttribute("cx"));
            line.setAttribute("y2", end.getAttribute("cy"));
            line.setAttribute("stroke", "black");
            nodes.push(line);
        }
    }
    // Display all the things
    root.replaceChildren(...nodes);
}, FRAME_RATE);

// Making sure to cleanup after we leave the webpage
window.addEventListener("beforeunload", () => {
    clearInterval(interval);
    endSession(session.id);
});

/**
 * @typedef Session
 * @prop {string} id
 * @prop {number} x
 * @prop {number} y
 * @prop {number} w
 * @prop {number} h
 */

/**
 * Takes in a `Session` object that only needs to contain an `id` and
 * sets the needed properties for the current window `Session` and saves
 * to `localStorage`.
 * @param {Session} session
 */
function updateSession(session) {
    session.x = window.screenX;
    session.y = window.screenY;
    session.w = window.innerWidth;
    session.h = window.innerHeight;
    localStorage.setItem(session.id, JSON.stringify(session));
}

/**
 * Starts a new session with a UUID.
 *
 * @returns {Session}
 */
function initiateSession() {
    /** @type string */
    const sessionId = uuid();
    const sessions = getSessionIds();
    sessions.push(sessionId);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    const session = { id: sessionId };
    updateSession(session);
    return session;
}

/**
 * Ends the given session.
 *
 * @param {string} id
 */
function endSession(id) {
    const sessions = getSessionIds();
    localStorage.setItem(
        "sessions",
        JSON.stringify(sessions.filter((s) => s !== id)),
    );
    localStorage.removeItem(id);
}

/**
 * Returns the current session IDs.
 *
 * @returns {string[]}
 */
function getSessionIds() {
    /** @type string[] */
    let sessions = JSON.parse(localStorage.getItem("sessions") ?? "[]");
    if (!Array.isArray(sessions)) {
        sessions = [];
    }
    return sessions;
}

/**
 * Returns the current sessions and their associated window data.
 *
 * @returns {Session[]}
 */
function getSessions() {
    const ids = getSessionIds();
    return ids.map((s) => JSON.parse(localStorage.getItem(s)));
}
