# Multi Window Shenanigans

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
