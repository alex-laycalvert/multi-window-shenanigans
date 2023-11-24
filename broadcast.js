const bc = new BroadcastChannel("multi_window_shenanigans");

/** Time for between polling in milliseconds */
const FRAME_RATE = 50;

const pos = currentPosition();
const interval = setInterval(() => {
    const newPos = currentPosition();
    if (
        pos.x !== newPos.x ||
        pos.y !== newPos.y ||
        pos.w !== newPos.w ||
        pos.h !== newPos.h
    ) {
    }
    bc.postMessage({});
}, 100);

window.addEventListener("beforeunload", () => {
    clearInterval(interval);
    bc.close();
});

function currentPosition() {
    return {
        x: window.screenX,
        y: window.screenY,
        w: window.innerWidth,
        h: window.innerHeight,
    };
}
