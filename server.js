const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Setup Postgres connection pool if DATABASE_URL is available
let dbPool = null;
if (process.env.DATABASE_URL) {
  try {
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    console.log("DIAGNOSTICS - Initializing PostgreSQL connection pool...");

    // Auto-create database tables
    const initDb = async () => {
      const client = await dbPool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            device_id VARCHAR(128) PRIMARY KEY,
            latest_name VARCHAR(64),
            games_started INT DEFAULT 1,
            device_meta JSONB,
            first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS leaderboard (
            id SERIAL PRIMARY KEY,
            device_id VARCHAR(128),
            name VARCHAR(64) NOT NULL,
            score INT NOT NULL,
            difficulty VARCHAR(32) DEFAULT 'medium',
            game_type VARCHAR(32) DEFAULT 'song',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("DIAGNOSTICS - PostgreSQL tables verified/created successfully!");
      } finally {
        client.release();
      }
    };
    initDb().catch(err => console.error("PostgreSQL Init Error:", err));
  } catch (err) {
    console.error("Failed to configure PostgreSQL pool:", err);
  }
} else {
  console.log("DIAGNOSTICS - No DATABASE_URL found. Running with local storage fallback.");
}

// Serve static files from React build directory in production
app.use(express.static(path.join(__dirname, 'dist')));

// DIAGNOSTICS: Check if dist folder exists at startup
try {
  const distPath = path.join(__dirname, 'dist');
  console.log("DIAGNOSTICS - Checking dist folder at:", distPath);
  if (fs.existsSync(distPath)) {
    console.log("DIAGNOSTICS - dist folder exists!");
    console.log("DIAGNOSTICS - Files in dist:", fs.readdirSync(distPath));
  } else {
    console.log("DIAGNOSTICS - dist folder DOES NOT EXIST!");
    console.log("DIAGNOSTICS - Files in root directory:", fs.readdirSync(__dirname));
  }
} catch (err) {
  console.error("DIAGNOSTICS - Failed to run directories diagnostics:", err);
}

// Simple in-memory database to store active game answers securely
const activeGames = {};

// Path to leaderboard storage
const LEADERBOARD_FILE = path.join(__dirname, 'data', 'leaderboard.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Initialize leaderboard file if it doesn't exist (starts completely empty)
if (!fs.existsSync(path.dirname(LEADERBOARD_FILE))) {
  fs.mkdirSync(path.dirname(LEADERBOARD_FILE), { recursive: true });
}
if (!fs.existsSync(LEADERBOARD_FILE)) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify({
    decade: [],
    song: []
  }, null, 2));
}

function loadUsersData() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (err) {}
  return {};
}

function saveUserData(deviceId, deviceMeta = null, latestName = null) {
  try {
    const users = loadUsersData();
    const existing = users[deviceId] || {
      deviceId,
      latestName: 'NO NAME ADDED',
      namesUsed: [],
      gamesStarted: 0,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      deviceMeta: deviceMeta || {}
    };

    existing.gamesStarted += 1;
    existing.lastSeen = new Date().toISOString();
    if (deviceMeta) existing.deviceMeta = deviceMeta;
    if (latestName) {
      existing.latestName = latestName;
      if (!existing.namesUsed.includes(latestName)) {
        existing.namesUsed.push(latestName);
      }
    }
    users[deviceId] = existing;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving local user data:", err);
  }
}

// Helper: Send email notification whenever someone submits a score to the leaderboard
async function sendLeaderboardEmailNotification({ name, score, difficulty, gameType, deviceId }) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
  if (!notificationEmail) {
    console.log("DIAGNOSTICS - No NOTIFICATION_EMAIL set in env. Email dispatch skipped.");
    return;
  }

  let transporter = null;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  if (!transporter) {
    console.log("DIAGNOSTICS - NOTIFICATION_EMAIL set, but SMTP credentials (SMTP_HOST/SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_APP_PASSWORD) missing in env.");
    return;
  }

  const subject = `⚡ Dead Reckoning High Score: ${name} scored ${score.toLocaleString()} PTS! 🎸`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #1a060d; color: #eeddbb; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ffd54f; border-bottom: 2px solid #eeddbb; padding-bottom: 10px; margin-top: 0;">
        ⚡ NEW DEAD RECKONING HIGH SCORE SUBMITTED! ⚡
      </h2>
      <p style="font-size: 15px; color: #ffffff;">Someone just submitted a new score to the Dead Reckoning Leaderboard!</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #ffffff;">
        <tr style="background-color: rgba(238, 221, 187, 0.1);">
          <td style="padding: 10px; font-weight: bold; width: 35%;">Player Name:</td>
          <td style="padding: 10px; font-weight: bold; color: #ffd54f; font-size: 18px;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Score:</td>
          <td style="padding: 10px; color: #64dfdf; font-weight: bold; font-size: 18px;">${score.toLocaleString()} PTS</td>
        </tr>
        <tr style="background-color: rgba(238, 221, 187, 0.1);">
          <td style="padding: 10px; font-weight: bold;">Difficulty Rating:</td>
          <td style="padding: 10px;">${difficulty || 'medium'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Device ID:</td>
          <td style="padding: 10px; font-family: monospace; font-size: 12px; color: #b8c1ec;">${deviceId || 'Unknown'}</td>
        </tr>
        <tr style="background-color: rgba(238, 221, 187, 0.1);">
          <td style="padding: 10px; font-weight: bold;">Timestamp:</td>
          <td style="padding: 10px;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EDT</td>
        </tr>
      </table>

      <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(238, 221, 187, 0.2); text-align: center;">
        <a href="https://dead-reckoning-sc5l.onrender.com/" style="color: #ffd54f; font-size: 14px; text-decoration: none; font-weight: bold;">⚡ Play Dead Reckoning / View Leaderboard</a>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Dead Reckoning Game" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'notifications@deadreckoning.com'}>`,
      to: notificationEmail,
      subject,
      html: htmlContent
    });
    console.log("DIAGNOSTICS - Leaderboard notification email sent! MessageId:", info.messageId);
  } catch (err) {
    console.error("DIAGNOSTICS - Failed to send leaderboard email notification:", err.message);
  }
}

// Helper: check if a track is a musical song (filtering out tuning, drums, space, markers, announcements)
function isValidSong(title) {
  if (!title) return false;
  const trimmedTitle = title.trim();
  const lowercaseTitle = trimmedTitle.toLowerCase();
  
  const filterKeywords = [
    'drums', 'space', 'tuning', 'banter', 'feedback', 
    'crowd', 'intro', 'intermission', 'break', 'applause', 
    'stage speech', 'test', 'marker', 'track', 'gd19', 
    'gd6', 'gd7', 'gd8', 'gd9', 'disc', 'set ', 'untitled', 
    'flac', 'wav', 'mp3', 'shn',
    'announcement', 'announcements', 'introduce', 'introduction',
    'speech', 'chat', 'talk', 'stage announcement'
  ];
  
  if (filterKeywords.some(keyword => lowercaseTitle.includes(keyword))) {
    return false;
  }
  
  // Exclude strings that are just numeric counters (e.g. "01", "12") or empty
  if (/^\d+$/.test(trimmedTitle) || trimmedTitle === '') {
    return false;
  }
  
  return true;
}

// Helper: clean song titles by eliminating transition arrows (->, >) and dashes (-)
function cleanSongName(title) {
  if (!title) return '';
  let cleaned = title;
  
  // Replace transition arrows and dashes with spaces
  cleaned = cleaned.replace(/->/g, ' ');
  cleaned = cleaned.replace(/>/g, ' ');
  cleaned = cleaned.replace(/-/g, ' ');
  
  // Replace multiple sequential spaces with a single space, and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

// Endpoint: Generate a new game question
app.get('/api/game/question', async (req, res) => {
  try {
    // 1. Get all Grateful Dead years from Relisten API
    const yearsRes = await axios.get('https://api.relisten.net/api/v2/artists/grateful-dead/years');
    const years = yearsRes.data;
    
    // Filter for years in 60s, 70s, 80s, 90s (1965 - 1995)
    const validYears = years.filter(y => {
      const yearInt = parseInt(y.year, 10);
      return yearInt >= 1965 && yearInt <= 1995;
    });

    if (validYears.length === 0) {
      return res.status(500).json({ error: "No valid years found in archive." });
    }

    // Try to find a valid show and song (retry loop up to 5 times)
    let selectedTrack = null;
    let selectedShow = null;
    let correctDecade = '';
    let correctYear = '';

    for (let attempt = 0; attempt < 5; attempt++) {
      // Pick a random year
      const randomYearObj = validYears[Math.floor(Math.random() * validYears.length)];
      correctYear = randomYearObj.year;
      
      const yearInt = parseInt(correctYear, 10);
      if (yearInt >= 1960 && yearInt <= 1969) correctDecade = '60s';
      else if (yearInt >= 1970 && yearInt <= 1979) correctDecade = '70s';
      else if (yearInt >= 1980 && yearInt <= 1989) correctDecade = '80s';
      else if (yearInt >= 1990 && yearInt <= 1999) correctDecade = '90s';

      // Get shows for this year
      const showsRes = await axios.get(`https://api.relisten.net/api/v2/artists/grateful-dead/years/${correctYear}`);
      const shows = showsRes.data.shows;
      if (!shows || shows.length === 0) continue;

      // Pick a random show
      const randomShow = shows[Math.floor(Math.random() * shows.length)];
      
      // Fetch details of the show (tracks)
      const showDetailsRes = await axios.get(`https://api.relisten.net/api/v2/artists/grateful-dead/shows/${randomShow.display_date}`);
      const sources = showDetailsRes.data.sources;
      if (!sources || sources.length === 0) continue;

      // Use the first source (usually the best soundboard/audience recording available)
      const source = sources[0];
      if (!source.sets || source.sets.length === 0) continue;

      // Flatten tracks across sets and filter for valid songs
      const allTracks = source.sets.flatMap(set => set.tracks || []);
      const validTracks = allTracks.filter(track => isValidSong(track.title) && track.mp3_url);

      if (validTracks.length === 0) continue;

      // Pick a random track
      selectedTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
      selectedShow = {
        date: randomShow.display_date,
        venue: randomShow.venue ? randomShow.venue.name : 'Unknown Venue',
        location: randomShow.venue ? randomShow.venue.location : 'Unknown Location',
        taper: source.taper || 'Anonymous',
        source_info: source.source || 'Audience/Soundboard Archive tape'
      };
      break;
    }

    if (!selectedTrack) {
      return res.status(503).json({ error: "Failed to locate a musical song segment. Please try again." });
    }

    // Calculate start offset (seek 30% to 55% of the song duration, ensuring at least 40s remain if the song is long enough)
    const trackDuration = selectedTrack.duration || 300;
    let startOffset = 0;
    if (trackDuration > 60) {
      const minStart = Math.floor(trackDuration * 0.3);
      const maxStart = Math.min(Math.floor(trackDuration * 0.55), trackDuration - 40);
      startOffset = minStart < maxStart ? Math.floor(minStart + Math.random() * (maxStart - minStart)) : minStart;
    }

    // Generate a unique Game ID to store the answer on the server side
    const gameId = 'game_' + Math.random().toString(36).substring(2, 15);
    const cleanedTitle = cleanSongName(selectedTrack.title);
    activeGames[gameId] = {
      correctDecade,
      correctYear,
      trackName: cleanedTitle,
      mp3_url: selectedTrack.mp3_url,
      showDetails: selectedShow,
      startOffset
    };

    // Return only secure question metadata to client (no direct MP3 links or dates!)
    res.json({
      gameId,
      trackName: cleanedTitle,
      duration: selectedTrack.duration,
      startOffset
    });

  } catch (err) {
    console.error("Error creating question:", err.message);
    res.status(500).json({ error: "Failed to load audio question from Relisten API." });
  }
});

const CLASSIC_GD_SONGS = [
  "Dark Star", "Uncle John's Band", "Sugar Magnolia", "Truckin'", "Casey Jones", 
  "Friend of the Devil", "Fire on the Mountain", "Scarlet Begonias", "Touch of Grey", 
  "Ripple", "Box of Rain", "Shakedown Street", "Playing in the Band", "Morning Dew", 
  "Saint of Circumstance", "Jack Straw", "Estimated Prophet", "Franklin's Tower", 
  "Help on the Way", "St. Stephen", "China Cat Sunflower", "I Know You Rider", 
  "Bird Song", "Cassidy", "Eyes of the World", "Sugaree", "Bertha", "Terrapin Station", 
  "Tennessee Jed", "Goin' Down the Road Feeling Bad", "One More Saturday Night", 
  "Not Fade Away", "Wharf Rat", "Stella Blue", "U.S. Blues", "Loose Lucy", 
  "Ship of Fools", "Mexicali Blues", "Ramble On Rose", "Promised Land", 
  "Beat It On Down the Line", "El Paso", "Deal", "Loser", "Black Peter", 
  "Cumberland Blues", "Dire Wolf", "High Time", "New Speedway Boogie", 
  "Cosmic Charlie", "Alligator", "Caution", "The Other One", "He's Gone", 
  "Jack-A-Roe", "Peggy-O", "Althea", "Alabama Getaway", "Brown-Eyed Women"
];

// Endpoint: Generate a new song question (guess the song name)
app.get('/api/game/song-question', async (req, res) => {
  try {
    const yearsRes = await axios.get('https://api.relisten.net/api/v2/artists/grateful-dead/years');
    const years = yearsRes.data;
    const validYears = years.filter(y => {
      const yearInt = parseInt(y.year, 10);
      return yearInt >= 1965 && yearInt <= 1995;
    });

    let selectedTrack = null;
    let selectedShow = null;
    let correctDecade = '';
    let correctYear = '';
    let validTracks = [];

    for (let attempt = 0; attempt < 5; attempt++) {
      const randomYearObj = validYears[Math.floor(Math.random() * validYears.length)];
      correctYear = randomYearObj.year;
      const yearInt = parseInt(correctYear, 10);
      if (yearInt >= 1960 && yearInt <= 1969) correctDecade = '60s';
      else if (yearInt >= 1970 && yearInt <= 1979) correctDecade = '70s';
      else if (yearInt >= 1980 && yearInt <= 1989) correctDecade = '80s';
      else if (yearInt >= 1990 && yearInt <= 1999) correctDecade = '90s';

      const showsRes = await axios.get(`https://api.relisten.net/api/v2/artists/grateful-dead/years/${correctYear}`);
      const shows = showsRes.data.shows;
      if (!shows || shows.length === 0) continue;

      const randomShow = shows[Math.floor(Math.random() * shows.length)];
      const showDetailsRes = await axios.get(`https://api.relisten.net/api/v2/artists/grateful-dead/shows/${randomShow.display_date}`);
      const sources = showDetailsRes.data.sources;
      if (!sources || sources.length === 0) continue;

      const source = sources[0];
      if (!source.sets || source.sets.length === 0) continue;

      const allTracks = source.sets.flatMap(set => set.tracks || []);
      validTracks = allTracks.filter(track => isValidSong(track.title) && track.mp3_url);

      if (validTracks.length === 0) continue;

      selectedTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
      selectedShow = {
        date: randomShow.display_date,
        venue: randomShow.venue ? randomShow.venue.name : 'Unknown Venue',
        location: randomShow.venue ? randomShow.venue.location : 'Unknown Location',
        taper: source.taper || 'Anonymous',
        source_info: source.source || 'Audience/Soundboard Archive tape'
      };
      break;
    }

    if (!selectedTrack) {
      return res.status(503).json({ error: "Failed to locate a musical song segment. Please try again." });
    }

    const trackDuration = selectedTrack.duration || 300;
    let startOffset = 0;
    if (trackDuration > 60) {
      const minStart = Math.floor(trackDuration * 0.3);
      const maxStart = Math.min(Math.floor(trackDuration * 0.55), trackDuration - 40);
      startOffset = minStart < maxStart ? Math.floor(minStart + Math.random() * (maxStart - minStart)) : minStart;
    }

    // Pick 3 distractors from the show tracks, or from the classic songs
    const distractors = [];
    const otherTracks = validTracks.filter(t => t.title.toLowerCase() !== selectedTrack.title.toLowerCase());
    const uniqueTitles = [...new Set(otherTracks.map(t => t.title))];

    while (distractors.length < 3 && uniqueTitles.length > 0) {
      const idx = Math.floor(Math.random() * uniqueTitles.length);
      distractors.push(uniqueTitles.splice(idx, 1)[0]);
    }

    while (distractors.length < 3) {
      const randomSong = CLASSIC_GD_SONGS[Math.floor(Math.random() * CLASSIC_GD_SONGS.length)];
      if (randomSong.toLowerCase() !== selectedTrack.title.toLowerCase() && !distractors.some(d => d.toLowerCase() === randomSong.toLowerCase())) {
        distractors.push(randomSong);
      }
    }

    // Clean correct song and distractors
    const correctSongClean = cleanSongName(selectedTrack.title);
    const cleanedDistractors = distractors.map(d => cleanSongName(d));

    // Combine and shuffle choices, filtering duplicates if cleaning collapsed titles
    const uniqueChoices = [...new Set([correctSongClean, ...cleanedDistractors])];
    
    // If we have fewer than 4 choices due to deduplication, fetch more classic songs
    while (uniqueChoices.length < 4) {
      const randomSong = cleanSongName(CLASSIC_GD_SONGS[Math.floor(Math.random() * CLASSIC_GD_SONGS.length)]);
      if (!uniqueChoices.some(c => c.toLowerCase() === randomSong.toLowerCase())) {
        uniqueChoices.push(randomSong);
      }
    }

    const choices = uniqueChoices.slice(0, 4);
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    const gameId = 'game_' + Math.random().toString(36).substring(2, 15);
    activeGames[gameId] = {
      correctDecade,
      correctYear,
      correctSong: correctSongClean,
      mp3_url: selectedTrack.mp3_url,
      showDetails: selectedShow,
      startOffset
    };

    res.json({
      gameId,
      choices,
      duration: selectedTrack.duration,
      startOffset
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate song question." });
  }
});

// Path to shows & historical trivia database
const SHOWS_FILE = path.join(__dirname, 'data', 'shows.json');

function loadShowsData() {
  try {
    const data = fs.readFileSync(SHOWS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading shows.json:", err);
    return [];
  }
}

// Helper: Get today's daily show (or hash pick from shows.json)
function getDailyShow() {
  const shows = loadShowsData();
  if (!shows || shows.length === 0) return null;

  const now = new Date();
  const monthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Find a show whose date matches today's month & day
  const match = shows.find(s => s.date.endsWith(monthDay));
  if (match) return match;

  // Fallback: Use day of year index
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return shows[dayOfYear % shows.length];
}

// Endpoint: Start a Concert Tour Game Session (10 clips from 1 show)
app.post('/api/game/start-session', async (req, res) => {
  const { mode = 'daily', deviceId, deviceMeta } = req.body;
  const shows = loadShowsData();

  if (deviceId) {
    saveUserData(deviceId, deviceMeta);
    if (dbPool) {
      try {
        const client = await dbPool.connect();
        try {
          await client.query(`
            INSERT INTO users (device_id, games_started, device_meta, first_seen, last_seen)
            VALUES ($1, 1, $2::jsonb, NOW(), NOW())
            ON CONFLICT (device_id) DO UPDATE
            SET games_started = users.games_started + 1,
                device_meta = COALESCE($2::jsonb, users.device_meta),
                last_seen = NOW();
          `, [deviceId, JSON.stringify(deviceMeta || {})]);
        } finally {
          client.release();
        }
      } catch (e) {
        console.warn("User session logging error:", e.message);
      }
    }
  }

  let selectedShow = null;
  if (mode === 'daily') {
    selectedShow = getDailyShow();
  } else {
    selectedShow = shows[Math.floor(Math.random() * shows.length)];
  }

  if (!selectedShow) {
    return res.status(500).json({ error: "Failed to select concert show." });
  }

  try {
    let validTracks = [];
    try {
      const showDetailsRes = await axios.get(`https://api.relisten.net/api/v2/artists/grateful-dead/shows/${selectedShow.date}`);
      const sources = showDetailsRes.data ? showDetailsRes.data.sources : [];
      if (sources && sources.length > 0) {
        // Iterate through sources to find the best soundboard/audience recording with valid tracks
        for (const s of sources) {
          const allTracks = (s.sets || []).flatMap(set => set.tracks || []);
          const candidates = allTracks.filter(track => isValidSong(track.title) && track.mp3_url && track.mp3_url.startsWith('http'));
          if (candidates.length >= 5) {
            validTracks = candidates;
            break;
          }
        }
        // Fallback to first source if loop didn't find >= 5
        if (validTracks.length === 0 && sources[0].sets) {
          const allTracks = sources[0].sets.flatMap(set => set.tracks || []);
          validTracks = allTracks.filter(track => isValidSong(track.title) && track.mp3_url);
        }
      }
    } catch (e) {
      console.warn("Relisten fetch error for show, using fallback:", e.message);
    }

    if (validTracks.length < 5) {
      const fallbackSongs = [
        "Touch of Grey", "Sugar Magnolia", "Truckin'", "Uncle John's Band", 
        "Casey Jones", "Friend of the Devil", "Ripple", "Box of Rain", 
        "Scarlet Begonias", "Fire on the Mountain", "Eyes of the World", "Dark Star"
      ];
      validTracks = fallbackSongs.slice(0, 10).map((name, i) => ({
        title: name,
        mp3_url: 'https://ia800408.us.archive.org/29/items/gd77-05-08.sbd.hicks.4982.sbeok.shnf/gd77-05-08d1t01.mp3',
        duration: 300
      }));
    }

    const sessionTracks = validTracks.slice(0, 10).map(t => {
      const cleanTitle = t.title.replace(/->/g, '').replace(/ live/gi, '').trim();
      const distractors = CLASSIC_GD_SONGS
        .filter(s => s.toLowerCase() !== cleanTitle.toLowerCase())
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const choices = [cleanTitle, ...distractors].sort(() => 0.5 - Math.random());

      return {
        trackName: cleanTitle,
        mp3_url: t.mp3_url,
        duration: t.duration || 300,
        choices
      };
    });

    const actualYear = selectedShow.year;
    const yearDistractors = [actualYear - 5, actualYear - 2, actualYear + 3, actualYear + 7, actualYear - 3, actualYear + 4]
      .filter(y => y >= 1965 && y <= 1995 && y !== actualYear)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const yearChoices = [actualYear, ...yearDistractors].sort((a, b) => a - b);

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    activeGames[sessionId] = {
      sessionId,
      mode,
      show: selectedShow,
      tracks: sessionTracks,
      yearChoices,
      currentTrackIndex: 0,
      score: 0,
      lives: 3,
      correctCount: 0,
      totalCount: 0,
      yearGuessed: false,
      yearCorrect: false
    };

    res.json({
      sessionId,
      totalTracks: sessionTracks.length,
      mode,
      yearChoices,
      showTitle: mode === 'daily' ? `TODAY'S TOUR CONCERT` : `ARCHIVE TOUR CONCERT`
    });
  } catch (err) {
    console.error("Session start error:", err);
    res.status(500).json({ error: "Failed to initialize concert session." });
  }
});

// Endpoint: Fetch next session track (without revealing show date/year!)
app.get('/api/game/session-track', (req, res) => {
  const { sessionId, trackIndex } = req.query;
  const game = activeGames[sessionId];

  if (!game) {
    return res.status(404).json({ error: "Session not found or expired." });
  }

  const idx = parseInt(trackIndex || '0', 10);
  if (idx < 0 || idx >= game.tracks.length) {
    return res.status(400).json({ error: "Track index out of bounds." });
  }

  const track = game.tracks[idx];
  const startOffset = Math.floor(Math.random() * Math.max(1, (track.duration || 300) - 25));

  res.json({
    sessionId,
    trackIndex: idx,
    totalTracks: game.tracks.length,
    audioUrl: track.mp3_url,
    startOffset,
    choices: track.choices,
    correctSong: track.trackName
  });
});

// Endpoint: Evaluate Year Bonus Guess (+500 BONUS PTS)
app.post('/api/game/guess-year', (req, res) => {
  const { sessionId, yearGuess } = req.body;
  const game = activeGames[sessionId];

  if (!game) {
    return res.status(404).json({ error: "Session not found or expired." });
  }

  const actualYear = game.show.year;
  const isCorrect = parseInt(yearGuess, 10) === parseInt(actualYear, 10);
  const bonusPoints = isCorrect ? 500 : 0;

  game.yearGuessed = true;
  game.yearCorrect = isCorrect;
  if (isCorrect) game.score += bonusPoints;

  res.json({
    correct: isCorrect,
    correctYear: actualYear,
    bonusPoints,
    show: game.show
  });
});

// Endpoint: Fetch Post-Show Concert Report Card & Historical Trivia
app.get('/api/game/post-show-report', (req, res) => {
  const { sessionId } = req.query;
  const game = activeGames[sessionId];

  if (!game) {
    return res.status(404).json({ error: "Session not found." });
  }

  res.json({
    show: game.show,
    mode: game.mode,
    score: game.score,
    correctCount: game.correctCount,
    yearCorrect: game.yearCorrect,
    trivia: game.show.trivia || []
  });
});

// Endpoint: Stream the audio anonymously via server proxy (anti-cheat)
app.get('/api/game/stream/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = activeGames[gameId];

  if (!game || !game.mp3_url) {
    return res.status(404).json({ error: "Audio stream expired or invalid." });
  }

  res.redirect(302, game.mp3_url);
});

// Endpoint: Submit guess and check results
app.post('/api/game/guess', (req, res) => {
  const { gameId, guess } = req.body;
  const game = activeGames[gameId];

  if (!game) {
    return res.status(404).json({ error: "This game session has expired." });
  }

  let isCorrect = false;
  if (game.correctSong) {
    isCorrect = game.correctSong.toLowerCase() === guess.toLowerCase();
  } else {
    isCorrect = game.correctDecade === guess;
  }
  
  res.json({
    correct: isCorrect,
    correctDecade: game.correctDecade,
    correctYear: game.correctYear,
    correctSong: game.correctSong,
    showDetails: game.showDetails
  });

  delete activeGames[gameId];
});

// Helper: load leaderboard with migration fallback for old array layout
function loadLeaderboardData() {
  try {
    const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return { decade: parsed, song: [] };
    }
    return {
      decade: parsed.decade || [],
      song: parsed.song || []
    };
  } catch (err) {
    return { decade: [], song: [] };
  }
}

// Endpoint: Track user device activity and session start
app.post('/api/user/activity', async (req, res) => {
  const { deviceId, deviceMeta } = req.body;
  if (!deviceId) return res.status(400).json({ error: "deviceId is required" });

  saveUserData(deviceId, deviceMeta);
  try {
    if (dbPool) {
      const client = await dbPool.connect();
      try {
        await client.query(`
          INSERT INTO users (device_id, games_started, device_meta, first_seen, last_seen)
          VALUES ($1, 1, $2::jsonb, NOW(), NOW())
          ON CONFLICT (device_id) DO UPDATE
          SET games_started = users.games_started + 1,
              device_meta = COALESCE($2::jsonb, users.device_meta),
              last_seen = NOW();
        `, [deviceId, JSON.stringify(deviceMeta || {})]);
      } finally {
        client.release();
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error logging user activity:", err);
    res.json({ success: false });
  }
});

// Endpoint: Fetch high score leaderboard
app.get('/api/game/leaderboard', async (req, res) => {
  try {
    if (dbPool) {
      const allQuery = await dbPool.query(
        `SELECT name, score, difficulty, created_at::text as date FROM leaderboard ORDER BY score DESC LIMIT 10;`
      );
      return res.json({
        decade: allQuery.rows,
        song: allQuery.rows
      });
    }

    const scores = loadLeaderboardData();
    const combined = [...(scores.song || []), ...(scores.decade || [])].sort((a, b) => b.score - a.score);
    const topScores = combined.slice(0, 10);
    res.json({
      decade: topScores,
      song: topScores
    });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to load leaderboard." });
  }
});

// Endpoint: Clear leaderboard data
app.post('/api/leaderboard/clear', async (req, res) => {
  try {
    if (dbPool) {
      const client = await dbPool.connect();
      try {
        await client.query(`TRUNCATE TABLE leaderboard RESTART IDENTITY;`);
      } finally {
        client.release();
      }
    }
    const emptyScores = { decade: [], song: [] };
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(emptyScores, null, 2), 'utf8');
    res.json(emptyScores);
  } catch (err) {
    console.error("Clear leaderboard error:", err);
    res.status(500).json({ error: "Failed to reset leaderboard." });
  }
});

// Endpoint: Submit high score
app.post('/api/game/leaderboard', async (req, res) => {
  const { name, score, difficulty, gameType, deviceId } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: "Invalid score submission data." });
  }

  const mode = gameType === 'song' ? 'song' : 'decade';
  const sanitizedName = name.substring(0, 10).toUpperCase();

  try {
    if (dbPool) {
      const client = await dbPool.connect();
      try {
        await client.query(
          `INSERT INTO leaderboard (device_id, name, score, difficulty, game_type) VALUES ($1, $2, $3, $4, $5);`,
          [deviceId || null, sanitizedName, score, difficulty || 'medium', mode]
        );

        if (deviceId) {
          await client.query(
            `INSERT INTO users (device_id, latest_name, games_started, first_seen, last_seen)
             VALUES ($1, $2, 1, NOW(), NOW())
             ON CONFLICT (device_id) DO UPDATE
             SET latest_name = $2, last_seen = NOW();`,
            [deviceId, sanitizedName]
          );
        }
      } finally {
        client.release();
      }
    }

    // Always record locally as double backup
    const scores = loadLeaderboardData();
    scores[mode].push({
      name: sanitizedName,
      score,
      difficulty: difficulty || 'medium',
      deviceId: deviceId || null,
      date: new Date().toISOString().split('T')[0]
    });
    scores[mode].sort((a, b) => b.score - a.score);
    scores[mode] = scores[mode].slice(0, 100);
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(scores, null, 2), 'utf8');

    // Trigger asynchronous email notification (non-blocking)
    sendLeaderboardEmailNotification({
      name: sanitizedName,
      score,
      difficulty: difficulty || 'medium',
      gameType: mode,
      deviceId
    }).catch(e => console.error("Email dispatch async error:", e.message));

    if (dbPool) {
      const allQuery = await dbPool.query(
        `SELECT name, score, difficulty, created_at::text as date FROM leaderboard ORDER BY score DESC LIMIT 10;`
      );
      return res.json({
        decade: allQuery.rows,
        song: allQuery.rows
      });
    }

    res.json({
      decade: scores.decade.slice(0, 10),
      song: scores.song.slice(0, 10)
    });
  } catch (err) {
    console.error("Score submission error:", err);
    res.status(500).json({ error: "Failed to save high score." });
  }
});

// Endpoint: Secret Admin Device Audit Report
app.get('/api/admin/device-report', async (req, res) => {
  try {
    if (dbPool) {
      const queryText = `
        SELECT 
          COALESCE(u.device_id, l.device_id) AS device_id,
          COALESCE(u.latest_name, MAX(l.name), 'NO NAME ADDED') AS latest_name,
          COALESCE(u.games_started, 1) AS games_started,
          u.device_meta,
          COALESCE(u.first_seen, MIN(l.created_at), NOW()) AS first_seen,
          COALESCE(u.last_seen, MAX(l.created_at), NOW()) AS last_seen,
          ARRAY_AGG(DISTINCT l.name) FILTER (WHERE l.name IS NOT NULL) AS names_used,
          COUNT(l.id) AS scores_submitted,
          COALESCE(MAX(l.score), 0) AS highest_score
        FROM users u
        FULL OUTER JOIN leaderboard l ON u.device_id = l.device_id
        WHERE COALESCE(u.device_id, l.device_id) IS NOT NULL
        GROUP BY COALESCE(u.device_id, l.device_id), u.latest_name, u.games_started, u.device_meta, u.first_seen, u.last_seen
        ORDER BY last_seen DESC;
      `;
      const result = await dbPool.query(queryText);
      const report = result.rows.map(row => {
        const namesUsed = (row.names_used || []).filter(Boolean);
        const scoresSubmitted = parseInt(row.scores_submitted || 0, 10);
        return {
          deviceId: row.device_id,
          latestName: row.latest_name || 'NO NAME ADDED',
          namesUsed,
          gamesStarted: row.games_started || 1,
          scoresSubmitted,
          highestScore: row.highest_score || 0,
          hasNoNameOnLeaderboard: scoresSubmitted === 0,
          usedMultipleNames: namesUsed.length > 1,
          firstSeen: row.first_seen,
          lastSeen: row.last_seen,
          deviceMeta: typeof row.device_meta === 'string' ? JSON.parse(row.device_meta) : (row.device_meta || {})
        };
      });
      return res.json(report);
    }

    // Fallback JSON audit report if Postgres is not configured
    const usersMap = loadUsersData();
    const scores = loadLeaderboardData();
    const allEntries = [...scores.decade, ...scores.song];
    const reportMap = { ...usersMap };

    allEntries.forEach(entry => {
      const id = entry.deviceId || 'local_demo_device';
      if (!reportMap[id]) {
        reportMap[id] = {
          deviceId: id,
          latestName: entry.name,
          namesUsed: [],
          gamesStarted: 1,
          scoresSubmitted: 0,
          highestScore: 0,
          hasNoNameOnLeaderboard: false,
          usedMultipleNames: false,
          lastSeen: entry.date,
          deviceMeta: { os: 'Web Browser' }
        };
      }
      if (!reportMap[id].namesUsed.includes(entry.name)) {
        reportMap[id].namesUsed.push(entry.name);
      }
      reportMap[id].scoresSubmitted += 1;
      if (entry.score > reportMap[id].highestScore) reportMap[id].highestScore = entry.score;
      reportMap[id].usedMultipleNames = reportMap[id].namesUsed.length > 1;
    });

    const reportList = Object.values(reportMap).map(item => ({
      ...item,
      hasNoNameOnLeaderboard: item.scoresSubmitted === 0,
      usedMultipleNames: (item.namesUsed || []).length > 1
    }));

    res.json(reportList);
  } catch (err) {
    console.error("Device audit report error:", err);
    res.status(500).json({ error: "Failed to generate audit report." });
  }
});

// Catch-all route to serve the React index.html in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dead Reckoning server running on http://localhost:${PORT}`);
});
