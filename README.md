# Multi Window Shenanigans

Check out the demo [here](https://multi-window.alexlc.org).

Decided to take on the latest tech Twitter trend at the time of making this which
is having multiple browser windows "interact" with each other.

If you open up multiple web browser windows to this web page, you'll see that each window will have a circle in the center of the window and lines connecting it to every other open window. Moving the windows around works as well!

## Running Locally

Clone this repository:

```bash
git clone https://github.com/alex-laycalvert/multi-window-shenanigans
cd ./multi-window-shenanigans
```

Start a local web server, I used Python because it was easy:

```bash
python -m http.server
```

Open your web browser and navigate to `localhost:8000` or whatever URL/port your web server is running on. Try opening up more than one and moving them around.

## How this works

Each open page will send a message via the [Broadcast API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) to every other open page
of it's current screen size and position. When a message is received, the pages will update their local map of the current instances and locations, and then
we iterate through them all and draw the circles and lines where the need to be.
