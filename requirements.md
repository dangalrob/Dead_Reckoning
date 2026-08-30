# Dead Reckoning: High-Level Requirements Document

**Dead Reckoning** is a web-based music guessing game dedicated to the live concert archive of the **Grateful Dead**. Players test their ears by listening to live clips and identifying which decade (60s, 70s, 80s, or 90s) the recording took place.

---

## 1. Core Gameplay & Feature List

### A. User Profile & Custom Avatars
* On first launch, the user creates a profile by entering a **Username** and selecting a retro icon avatar:
  * **Dancing Bear** (custom colored theme)
  * **Steal Your Face ("Steelie")**
  * **Cosmic Charlie** (stylized smiling sun)
* Scores and statistics are saved to keep track of player performance.

### B. Difficulty Levels (Expertise Mode)
Before starting a round, players select their expertise level, which determines the length of the audio clip and point multipliers:
* **Taper (Expert)**: 5 seconds of audio (3x points)
* **Deadhead (Medium)**: 15 seconds of audio (2x points)
* **Casual (Easy)**: 30+ seconds of audio (1x points)

### C. Live Track Filters (Keeping it Musical)
To ensure the game is musical and enjoyable, the backend automatically filters out non-song segments by checking track names for keywords:
* Excludes: `Drums`, `Space`, `Tuning`, `Stage Banter`, `Feedback`, `Crowd`, `Intro`, `Intermission`, `Break`.

### D. Decade Guessing Game Loop
1. The game backend queries the **Relisten API** to randomly select a Grateful Dead show between **1965 and 1995**.
2. It picks a random valid song track from the setlist and retrieves the raw MP3 audio stream (hosted on Archive.org).
3. The player listens to the song segment while a **retro cassette tape animation** spins on screen.
4. The player guesses the decade: **1960s**, **1970s**, **1980s**, or **1990s**.

### E. Rich Concert Disclosures
After the user guesses, the game reveals the correct answer and discloses rich concert details from the archive metadata:
* **Concert Date & Year**
* **Venue & Location** (e.g., Barton Hall, Cornell University, Ithaca, NY)
* **Taping Source Details** (e.g., Soundboard recording by Betty Cantor-Jackson, or Audience tape details)

### F. Retro Arcade Leaderboard
* At the end of the game, players see a high score scoreboard styled like a **1980s arcade game screen** (glowing neon, flashing text, and 3-letter initials like "JGB" or "GDH").
* The leaderboard is stored on the local backend server so multiple players on the same machine can compete.

### G. Anti-Cheat Security (Audio Proxy)
* Grateful Dead Archive URLs contain the show date in the filename (e.g., `gd77-02-17d1t01.mp3` for a 1977 show). 
* To prevent players from cheating by inspecting the audio source URL in the DOM or network tab, the backend server **proxies the audio stream** through an endpoint like `/api/stream/:track_uuid`. 
* This hides the show date completely and secures the integrity of the guessing game.

---

## 2. Technical Stack & Architecture

### A. Frontend (React / Vite)
* **User Interface**: A premium "psychedelic dark mode" interface using glassmorphism cards and smooth transitions.
* **Visuals**: A cassette tape visualizer that turns its reels when audio is active.
* **Decade Controls**: Large neon arcade buttons for inputs.

### B. Backend (Node.js / Express)
* **Relisten API Client**: Connects to `api.relisten.net` to query artists, years, shows, and tracks.
* **Audio Stream Proxy**: Fetches the track's MP3 stream from Archive.org in the background and pipes it directly to the browser under an anonymous URL structure.
* **High Score Storage**: Simple local JSON database (`leaderboard.json`) to persist scores.
