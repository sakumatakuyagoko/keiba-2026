# SAPPORO KEIBA 2026 - Realtime Tracker

## Overview
A Next.js application for tracking horse racing investment results among friends.
Currently running in **Mock Mode** (Data resets on reload).

## How to Run

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Open your browser at:
    `http://localhost:3000`

## Features (Mock Mode)
- **Leaderboard**: Automatically calculates ranking by **Return Rate (%)**.
- **Investment King**: Tracks the highest investor with a Star badge.
- **Add Result**: Click the "+" FAB to simulate adding a new result.
- **Ranking System**:
    - 1st-3rd place highlighting.
    - Positive profit = Gold Text.
    - Negative profit = White/Gray Text.

## Next Steps for Production
- Connect to **Supabase** for persistent data and realtime updates across devices.
