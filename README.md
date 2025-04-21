# Notesify

![Notesify](public/demo.jpg?raw=true)

<div align="center">
Notesify is a cross-platform, feature-rich, AI-powered notes taking app. An open source alternative to NotebookLM.
</div>

## Getting Started

[Try Notesify online here](https://notesify.ai). Note: this is a demo app and the data is discarded when the app is closed.

Desktop/mobile apps will be available when the app is more stable.

## Features

- 🔒 All data is stored locally (notes, pdfs, API keys, etc)
- 🚀 Custom AI model endpoints
- 💬 Chat with PDF sources
- 📝 Feature-rich notes editor
- 🎙️ Audio recording and AI transcription
- 🌐 Cross-platform (Windows, macOS, Linux, Android, iOS)
- ⭐ Open source!

## Functions

- [x] Import and view sources
  - [x] PDF/PPTX/DOCX
  - [ ] Webpage
  - [ ] Video/Audio
- [x] AI features
  - [x] Chat with sources
  - [x] Generate notes with images
  - [x] Edit notes with AI
  - [ ] Video/audio transcription
  - [ ] Podcast generation
  - [ ] Immersive translation
- [x] Custom AI models
  - [x] Chat model (with image support)
  - [x] PDF parsing model
  - [ ] TTS/STT model
  - [ ] Text embedding model
  - [ ] Vector database
- [x] PDF reader
  - [x] Annotate with pen and highlighter (with stylus support)
- [x] Notes editor
- [x] Audio recorder
  - [x] Record and replay audio
  - [ ] Transcribe audio
- [ ] Library
  - [ ] Folders
  - [ ] Tagging

## Development

```bash
pnpm install

# Web
pnpm dev

# Desktop app
pnpm tauri dev

# Mobile app
pnpm tauri android dev
pnpm tauri ios dev
```

```bash
# For converting PPTX/DOCX to PDF using Gotenberg
cd server
docker compose up -d
```

```bash
# Update migration file after modifying schema
pnpm db:generate
```

## Tech Stack

- Web framework: [Vite](https://vitejs.dev), [React](https://react.dev)
- Desktop/mobile framework: [Tauri](https://tauri.app)
- Routing: [TanStack Router](https://tanstack.com/router)
- UI: [Shadcn UI](https://ui.shadcn.com), [Origin UI](https://originui.com), [Tailwind CSS](https://tailwindcss.com)
- State management: [Jotai](https://jotai.org)
- PDF viewer: [PDF.js](https://mozilla.github.io/pdf.js/)
- Notes editor: [Plate](https://platejs.org/)
- AI: [AI SDK](https://sdk.vercel.ai/)
- Database: [Drizzle ORM](https://orm.drizzle.team/), [SQL.js](https://sql.js.org)
