# COMP 4513 Assignment 2 — Music Browser SPA

A React single-page application for browsing a music collection. Browse artists, genres, and songs; view audio-profile radar charts; and manage personal playlists backed by Supabase.

## Live Demo

Deployed on Netlify — see submission for URL.

## Getting Started

```bash
npm install
npm run dev

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 + Vite |
| Routing | React Router DOM v7 |
| UI components | shadcn/ui |
| Styling | Tailwind CSS v4 |
| Charts | Recharts (RadarChart) |
| Music data API | Node.js / Express + SQLite (Assignment 1) |
| Auth + Playlists | Supabase |
| Hosting (React) | Netlify |
| Hosting (API) | Render |

## Features

- Browse all artists, genres, and songs with full detail views
- Additive AND filtering: title search, year, artist, genre multi-select
- Removable filter chips + Clear All
- Sort by title, year, or artist name
- Audio-profile radar chart (danceability, energy, valence, acousticness, liveness, speechiness)
- Related songs algorithm (top-3 analytic similarity scoring)
- Supabase authentication (register + login)
- Personal playlists: create, delete (with confirm), add/remove songs — all persisted in Supabase

## Third-Party Libraries

| Library | Purpose | URL |
|---------|---------|-----|
| Recharts | Radar chart for audio analytics on Single Song view | https://recharts.org |
| Sonner | Toast notifications for playlist add/remove feedback | https://sonner.emilkowal.ski |
| shadcn/ui | UI components — Table, Badge, Button, Input | https://ui.shadcn.com |

## Author

Joseph D — [github.com/JD-D3V](https://github.com/JD-D3V)

Source: [github.com/JD-D3V/COMP4513Assign2](https://github.com/JD-D3V/COMP4513Assign2)
