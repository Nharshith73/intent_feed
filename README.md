# intent_feed
intent_feed is a browser extension that transforms your content feed based on user intent—prioritizing meaningful, goal-oriented content while filtering out
# YT Focus Filter

A Chrome extension that filters YouTube videos by keyword so you only see what you actually came for.

![popup preview](https://i.imgur.com/placeholder.png)

---

## Features

- **Three modes** — Study, Deep Focus, and Off. Each mode has a built-in block list tuned for that context.
- **Block keywords** — hide videos whose titles contain specific words.
- **Allow keywords** — override the block list. A video matching an allow keyword is always shown, even if it also matches a blocked keyword.
- **Channel blocking** — block entire channels by name so they never appear in your feed or sidebar.
- **Sidebar filtering** — works on watch-page recommendations too, not just the homepage feed.
- **Persistent settings** — saved to `chrome.storage.sync`, so your config follows you across devices.

---

## Installation

Chrome Web Store listing coming soon. To load it manually:

1. Clone or download this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the `intent_feed` folder
5. Navigate to YouTube — filtering starts immediately

---

## How it works

`content.js` runs on every YouTube page. It scans video cards using a set of DOM selectors that cover the homepage feed, search results, and the watch-page sidebar (`ytd-rich-item-renderer`, `ytd-video-renderer`, `ytd-compact-video-renderer`, `yt-lockup-view-model`).

A `MutationObserver` (debounced at 150ms) watches for new cards injected as you scroll. A `yt-navigate-finish` listener re-triggers filtering on every SPA navigation so sidebar recommendations are always caught when you click into a video.

The allow list is evaluated before the block list — if a title matches both, it stays visible.

---

## Modes

| Mode | Blocks |
|------|--------|
| Study | prank, vlog, shorts, reaction, gaming, meme, troll |
| Deep Focus | music, song, movie, trailer, gaming, shorts, prank, vlog |
| Off | nothing |

Custom keywords added via the popup stack on top of the active mode's list.

---

## Project structure

```
intent_feed/
├── manifest.json      # Extension config (Manifest V3)
├── content.js         # Filtering logic injected into YouTube
├── popup.html         # Extension popup UI
├── popup.js           # Popup state management + chrome.storage
└── icons/             # Extension icons (16, 48, 128px)
```

---

## Contributing

Issues and PRs are welcome. A few ideas if you want to help:

- Badge counter showing videos hidden in the current session
- Export / import keyword lists as JSON
- Per-site mode presets (e.g. auto-enable Deep Focus on weekdays)

---

## License

MIT
