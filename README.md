# ALTO — Crystalbound Battlegrounds ✨🧊

ALTO is a custom-built 3D-enhanced tactical card battler made with React, TypeScript, Vite, Zustand, and React Three Fiber. It blends a traditional lane-based card game structure with modern presentation using 3D card meshes and a stylized fantasy theme.

## Features

### Core Gameplay ⚔️
- Turn-based system
- Lane-based board with three combat lanes
- Mana system (“Alt Shards”), max 10
- Player hand with card draw
- Playing unit cards onto the board
- ATK / HP stats and future combat logic
- End Turn button and turn progression

### Visual & UI Systems 🎨
- 3D card meshes with custom fantasy card frames
- Static board background art rendered in 2D
- 3D hand of cards positioned using React Three Fiber
- Lane highlighting
- Future additions: card animations, battle effects, hover highlights

### Engine / Architecture 🛠️
- Zustand game store for synchronous game state
- Pure game logic in src/core (rules, turn system, card definitions)
- Presentation layer in src/ui (3D, layout, hand, scene)
- Clean separation between state, rules, and rendering

## Tech Stack 🧰

- React 18
- TypeScript
- Vite
- Zustand
- React Three Fiber
- Three.js
- @react-three/drei
- ESLint / Prettier

## Getting Started 🚀

Install dependencies:
npm install

yaml
Copy code

Run development server:
npm run dev

rust
Copy code

Build for production:
npm run build

nginx
Copy code

The dev server runs at http://localhost:5173

## Project Structure 🗂️

src/
core/ Game rules, card types, deck logic, turn system
state/ Zustand store and selectors
ui/ React and 3D scene components
assets/ Card art, board art, icons, textures

markdown
Copy code

## Roadmap 🧭

- Card abilities
- Hover and selection animations
- Drag-to-play system
- Combat resolution effects
- Deck builder
- AI opponent prototype
- Multiplayer support (future)

## License

All custom artwork is copyright by Joshua Welch.   
Code is MIT licensed unless modified.
