# ReEQ Audio Toolkit

<p align="center">
  <img src="public/icons/icon256.png" alt="ReEQ Logo" width="140" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.3-61dafb?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-5.0-000000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Manifest_V3-4285f4?style=for-the-badge&logo=googlechrome&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/addavriance/ReEQ?style=flat-square" />
  <img src="https://img.shields.io/github/issues/addavriance/ReEQ?style=flat-square" />
  <img src="https://img.shields.io/github/stars/addavriance/ReEQ?style=flat-square" />
</p>

Modern browser extension for real-time audio equalization and bass boost.  
Built with React, TypeScript, and the Web Audio API.

---

<img width="682" height="577" alt="image" src="https://github.com/user-attachments/assets/d3614a1d-7f21-4d92-b6b4-7f0e40f9b558" />


## Features

- **10-band parametric equalizer** with adjustable frequency, gain, and Q-factor  
- **Real-time frequency spectrum visualizer** for visual feedback  
- **Master volume control** with gain limiting  
- **Preset management** with import/export functionality  
- **Multi-tab support** for processing audio across multiple browser tabs  
- **Low latency processing** using OffscreenDocument API  

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Zustand  
- **Build:** Vite, CRXJS  
- **Audio:** Web Audio API (BiquadFilter, AnalyserNode)  
- **Extension:** Chrome Manifest V3  

---

## Installation

1. Download or clone this repository  
2. Run `npm install && npm run build`  
3. Open Chrome and navigate to `chrome://extensions`  
4. Enable "Developer mode"  
5. Click "Load unpacked" and select the `dist` folder  

---

## Usage

1. Click the ReEQ extension icon and then click **EQ This Tab** to enable audio processing on the current tab  
2. Adjust EQ filters by dragging dots (hold **Shift** to modify Q-factor)  
3. Use the volume slider to control master gain  
4. Save your settings as presets for quick access  
5. Switch between EQ, Guide, and Active Tabs views  

---

## Project Structure

```

src/
├── background/        # Service worker and background logic
├── offscreen/         # Audio processing engine
├── popup/             # React UI components
│   ├── components/    # UI components (EQ, controls, tabs)
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Helper functions and constants
├── store/             # Zustand state management
└── types/             # TypeScript type definitions

````

---

## For Development

```bash
# Clone repository
git clone https://github.com/addavriance/ReEQ.git
cd ReEQ

# Install dependencies
npm install

# Build extension
npm run build
````

---

## Acknowledgments

This project was inspired by the original Ears Audio Toolkit.
The codebase has been completely rewritten using modern technologies and Manifest V3 compliance.
