# 🔮 ChronoKuji — Multiverse Spacetime AI Omikuji & Codex PWA

<div align="center">

**[ 🇰🇷 한국어 ](README.md) • [ 🇺🇸 English ](README.en.md) • [ 🇯🇵 日本語 ](README.ja.md)**

---

![ChronoKuji Banner](frontend/public/assets/worlds/spot_11_harrypotter.jpg)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat-square&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=flat-square&logo=React&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat-square&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Gemini 2.5](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4.svg?style=flat-square&logo=Google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**"Spacetime Warp Across 12 Multiverse Worlds, 7 Authentic Fortune Ranks, and Deep LLM Fate Interpretation"**

[Key Features](#-key-features) • [12 Multiverse Worlds](#-12-multiverse-worlds) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [Disclaimer](#-disclaimer)

</div>

---

## 📖 Overview

**ChronoKuji** is a next-generation Progressive Web Application (PWA) that blends traditional Japanese Shinto shrine fortune slips (**Omikuji**) with **12 subculture multiverse worlds**, **Google Gemini LLM deep fortune counseling**, and nostalgic **Chrono Trigger-style spacetime soundscapes**.

Travelers embark on a 60-second spacetime warp to iconic fictional universes (TalesWeaver, Spirited Away, Cyberpunk, Harry Potter, Interstellar, and more) to shake authentic fortune boxes, reveal 7 traditional luck tiers with 5 sub-fortunes (Wishes, Romance, Wealth, Career, Travel, and Awaiting), and collect dimensional Lucky Items.

---

## ✨ Key Features

### 1. 🥠 Authentic 7 Omikuji Ranks & 5 Sub-Fortunes (84 Master DB Entries)
- **7 Traditional Luck Tiers**: `[ Dai-Kichi (Great Luck) | Chu-Kichi (Middle) | Sho-Kichi (Small) | Kichi (Luck) | Sue-Kichi (Future Luck) | Kyo (Bad Luck) | Dai-Kyo (Terrible Luck) ]`
- **Minimalist 5 Sub-Fortunes**: Wishes (願事), Romance (戀愛), Wealth (金運), Career (事業), Travel (旅行), and Awaiting News (待人).
- **Ritual Interactions**: Poetic verses (詩), Lucky directions & numbers, and knotting slips (結び) or wallet storage.

### 2. 🌌 Open Cinematic 2-Column Desktop UI & 🖼️ Zen Mode
- **Vivid Canvas**: High-resolution original background art is rendered clearly across the entire browser viewport with subtle cinematic dark vignetting.
- **Ultra-Clear Floating Glass**: 30% opacity glassmorphism (`backdrop-blur-2xl`) allows background landscapes to shine through seamlessly.
- **🖼️ Zen Mode (Cinema View)**: Hide all UI panels with a single click to enjoy 8K artwork and background music in pure tranquility.

### 3. 🌀 Reversal Rift Glitch for Bad Luck (凶)
- When a traveler draws 'Bad Luck' (凶), scrolling down triggers a **full-screen purple dimensional glitch animation** declaring *"Perhaps in an alternate reality, this fortune is the greatest blessing"*, summoning a savior Lucky Item from another dimension.

### 4. 🎼 3-Tier Hybrid Smart Soundscape (`AudioEngine`)
- **Seamless 3-Stage Routing**:
  - Sanctuary Lobby: `Chrono Trigger — Wind Scene (600 A.D.)`
  - Spacetime Warp: `Chrono Trigger — Corridors of Time (12000 B.C.)`
  - Fate Archive: `MapleStory — Dimensional Rift`
  - Arrived Spots: Iconic world themes (`Hedwig's Theme`, `Second Run`, `Interstellar Theme`, etc.)
- **YouTube Background Streaming**: Transparent 0px IFrame player streams verified YouTube audio in real-time when local MP3s are absent (Zero copyright risk, zero repo weight).
- **Web Audio Synth Fallback**: 0-byte procedural pink noise ambiance generator ensures sound even when offline.

### 5. 🏛️ Dimensional Rift Sanctuary & Fate Archive
- Collectibles and Fate History are exclusively accessible from the central hub—**The Dimensional Rift Sanctuary**.
- Travelers can return to the Sanctuary anytime via the warp dropdown to view their chronological fortune archive and unlocked Codex items.

### 6. 📱 Mobile PWA Ready
- Custom golden cookie app icon with install prompt banner (+1 bonus token upon install).
- 20-hour token cooldown timer and daily attendance streak badges.

---

## 🗺️ 12 Multiverse Worlds

| # | World & Location | Theme & Mood | Gacha Box | Lucky Item | BGM Track |
|---|---|---|---|---|---|
| 🌿 **1** | **Kraiden Plain (TalesWeaver)** | Free Breeze & Meadows | Rune-Carved Wooden Box | Wind Feather | `TalesWeaver - Second Run` |
| ⚡ **2** | **Driftveil Bridge (Pokémon)** | Neon Drawbridge & Electricity | High-Tech Capsule Cylinder | Poké Ball | `Pokémon B&W - Driftveil City` |
| 🏮 **3** | **Aburaya Bathhouse (Spirited Away)** | Red Lacquered Mysticism | Red Herbal Bath Box | Herbal Bath Tag | `Spirited Away - The Sixth Station` |
| 💾 **4** | **Night City (Cyberpunk 2077)** | Glitch Skyline & Neon | Data Core Cylinder | Neural Accelerator | `Edgerunners - Stay at Your House` |
| 🍺 **5** | **Moe's Tavern (The Simpsons)** | Classic Animation Pub | Oak Duff Beer Barrel | Duff Beer | `The Simpsons - Main Theme` |
| ⭐ **6** | **Kasukabe Playground (Shin-chan)** | Sunset Nostalgia | Pink Hexagonal Box | Chocobi Snack | `Crayon Shin-chan - Nostalgia Piano` |
| ✨ **7** | **Äußerst Exam Grounds (Frieren)** | Magic Runes & Starlight | Silver Astrological Cylinder | Ancient Grimoire | `Frieren - Time Flows Ever Onward` |
| 🍁 **8** | **Lith Harbor (MapleStory)** | Adventurer's First Harbor | Compass Adventure Chest | Red Potion | `MapleStory - Lith Harbor` |
| 👑 **9** | **Corona Kingdom (Tangled)** | Lantern Festival & Gold | Golden Sun Lantern Box | Magic Frying Pan | `Tangled - I See the Light` *(Dai-Kichi: Kingdom Dance)* |
| ❄️ **10** | **Howling Abyss (League of Legends)** | Glacial Battleground | Permafrost Ice Urn | Poro Snax | `League of Legends - Freljord` |
| 🕯️ **11** | **Hogwarts Great Hall (Harry Potter)** | Floating Candles & Magic | Sorting Hat Box | Golden Snitch | `Harry Potter - Hedwig's Theme` |
| ⏳ **12** | **⭐ [Hidden] 5D Tesseract (Interstellar)** | 5-Dimensional Spacetime | 5D Hypercube Gravity Box | Quantum Gravity Watch | `Hans Zimmer - Interstellar Theme` *(Unlocked upon 11 Codex)* |

---

## 🏗️ System Architecture

```
[ Frontend (React 19 + Vite 8 + Tailwind CSS) ]
   │
   ├── MapSelector & Hero Panorama Stage (Open 2-Column Responsive UI)
   ├── FortuneShakeModal (4-Tap / Device Haptic Gyroscope Shake)
   ├── OmikujiView (7 Luck Ranks + 5 Sub-Fortunes + Reversal Glitch)
   ├── HistoryModal (Chronological Fate & AI Counseling Archive)
   ├── CodexModal (11-Dimension Collectible Item Codex)
   └── AudioEngine (Singleton BGM Router + YouTube IFrame + Web Audio Synth)
   │
   ▼ HTTP / JSON
[ Backend (FastAPI + SQLAlchemy + SQLite) ]
   │
   ├── /api/v1/movement (60s Timelock & Lazy-Evaluated Arrival Validation)
   ├── /api/v1/omikuji (84 Pre-cached Master DB Entries & History Storage)
   ├── /api/v1/interpret (Google Gemini 2.5 Flash Persona Counseling)
   └── /api/v1/users (Frictionless UUID Guest Auth & 20h Token Cooldown)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`

### 2. Clone & Setup
```bash
git clone https://github.com/fairyofdata/ChronoKuji.git
cd ChronoKuji

# Create .env and set your Google Gemini API Key
echo GEMINI_API_KEY=your_gemini_api_key_here > .env
```

### 3. Run with One Click (`start.bat`)
On Windows, double-click **`start.bat`** to start backend, build frontend, and launch the browser automatically.

```bash
# Manual Start:
# Backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python seed_data.py
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🎵 Custom BGM Guide (Bring Your Own Assets)

For copyright compliance, proprietary `.mp3` files are excluded from this repository. The app automatically uses **real-time YouTube background streaming** or procedural **Web Audio Synth** by default.

If you own personal audio tracks, place them in:
- `frontend/public/assets/audio/bgm/chrono_wind_scene.mp3`
- `frontend/public/assets/audio/bgm/chrono_corridors_of_time.mp3`
- `frontend/public/assets/audio/bgm/spot_1_kraiden.mp3` ~ `spot_12_tesseract.mp3`

---

## ⚖️ Disclaimer

- This project is a **non-profit, fan-made open-source toy project**.
- All trademarks, logos, characters, and fictional world IPs belong to their respective original copyright holders.
- Background and item illustrations in this repository are non-commercial digital artworks generated via Google AI.
