# AI Overview Blocker

A free browser extension that **hides Google's AI-generated answers** so you just see normal search results.

It removes:

- **AI Overviews**: the AI summary box at the top of results
- **"People also ask"** answers (these are AI-written too)
- **AI sections inside "Things to know"**
- **The "AI Mode" tab**

It works on every Google country site (google.com, google.co.uk, google.de, and so on). There is nothing to set up, and it collects no data.

---

## How to install (about 2 minutes)

### Google Chrome, Edge, Brave

1. At the top of this page, click the green **Code** button, then **Download ZIP**.
2. Find the downloaded file and **unzip it** (right-click, then *Extract All*). Keep the folder somewhere permanent, such as Documents.
3. In your browser, type `chrome://extensions` in the address bar and press Enter. On Edge use `edge://extensions`.
4. Turn on **Developer mode** (a switch in the top-right corner).
5. Click **Load unpacked** and choose the unzipped folder. It's the one containing a file called `manifest.json`.

### Firefox

Firefox only keeps manually added extensions until you close it, so this is a temporary install.

1. Download and unzip the project as above.
2. Type `about:debugging#/runtime/this-firefox` in the address bar.
3. Click **Load Temporary Add-on** and pick the `manifest.json` file inside the folder.

---

## How to use it

You don't have to do anything. Search on Google as normal and the AI boxes are gone.

To turn it off, go to your browser's extensions page and switch it off.

## Troubleshooting

- **AI box still showing?** Refresh the page. If it's still there, Google may have changed its layout. Please [open an issue](../../issues) and say what you searched for.
- **Don't move or delete the folder** after installing in Chrome, or the extension will stop working.

## Contributing

Bug reports and fixes are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

Based on [Google AI Overviews Blocker](https://github.com/zbarnz/Google_AI_Overviews_Blocker) by zbarnz.
