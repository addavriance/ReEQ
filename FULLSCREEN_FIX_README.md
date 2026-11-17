# ReEQ fullscreen workaround

This source revision adds a workaround for Chromium browsers where `chrome.tabCapture`
causes a page's Fullscreen API request to fill only the browser content area while
the tabs and address bar remain visible.

## What changed

- Added `src/background/services/fullscreenWorkaround.ts`.
- The service worker listens to `chrome.tabCapture.onStatusChanged`.
- When the captured tab reports `fullscreen: true`, ReEQ changes the browser window
  to its native `fullscreen` state.
- On exit from page fullscreen, capture stop/error, or tab close, ReEQ restores the
  window's previous `normal` or `maximized` state.
- Restore information is kept in `chrome.storage.session` so it survives service
  worker suspension. No content scripts are injected and no site/player DOM is changed.
- `manifest.json` permissions are unchanged.

## Build and install

1. Install Node.js 18 or newer.
2. In this folder run `npm install`.
3. Run `npm run build`.
4. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
5. Select the generated `dist` folder. If ReEQ is already installed, disable or remove
   the old copy first so that only one ReEQ instance is active.

## Important test

This is a targeted workaround for the tab-capture/fullscreen interaction. Test it in
the same Chromium-based browser where the issue occurs:

1. Open YouTube and start a video.
2. Enable ReEQ for that tab (the button should read `Stop EQing This Tab`).
3. Click the player's fullscreen button.
4. Confirm that browser tabs/address bar disappear.
5. Exit fullscreen and confirm the browser returns to its prior normal/maximized state.
6. Repeat with ReEQ disabled to confirm the browser's native behavior is unchanged.

The original project dependencies were not installed in this environment, so this
source archive has not been built into a ready-to-load `dist` package here.
