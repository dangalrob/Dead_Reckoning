const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

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

// Initialize leaderboard file if it doesn't exist
if (!fs.existsSync(path.dirname(LEADERBOARD_FILE))) {
  fs.mkdirSync(path.dirname(LEADERBOARD_FILE), { recursive: true });
}
if (!fs.existsSync(LEADERBOARD_FILE)) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify({
    decade: [
      { name: "JGB", score: 850, difficulty: "medium", date: "2026-08-28" },
      { name: "GDH", score: 720, difficulty: "expert", date: "2026-08-28" },
      { name: "CHR", score: 540, difficulty: "easy", date: "2026-08-28" }
    ],
    song: [
      { name: "JGB", score: 620, difficulty: "medium", date: "2026-08-28" },
      { name: "GDH", score: 500, difficulty: "expert", date: "2026-08-28" }
    ]
  }, null, 2));
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
    console.error("Error creating song question:", err.message);
    res.status(500).json({ error: "Failed to load audio song question from Relisten API." });
  }
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

// Endpoint: Fetch high score leaderboard
app.get('/api/game/leaderboard', (req, res) => {
  try {
    const scores = loadLeaderboardData();
    // Sort both arrays descending
    scores.decade.sort((a, b) => b.score - a.score);
    scores.song.sort((a, b) => b.score - a.score);
    res.json({
      decade: scores.decade.slice(0, 10),
      song: scores.song.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard." });
  }
});

// Endpoint: Clear leaderboard data
app.post('/api/leaderboard/clear', (req, res) => {
  try {
    const emptyScores = { decade: [], song: [] };
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(emptyScores, null, 2), 'utf8');
    res.json(emptyScores);
  } catch (err) {
    res.status(500).json({ error: "Failed to reset leaderboard." });
  }
});

// Endpoint: Submit high score
app.post('/api/game/leaderboard', (req, res) => {
  const { name, score, difficulty, gameType } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: "Invalid score submission data." });
  }

  // Fallback to decade game if not specified
  const mode = gameType === 'song' ? 'song' : 'decade';

  try {
    const scores = loadLeaderboardData();
    
    // Add new score to the correct game type list
    scores[mode].push({
      name: name.substring(0, 10).toUpperCase(), // Supported up to 10 characters
      score,
      difficulty: difficulty || 'medium',
      date: new Date().toISOString().split('T')[0]
    });

    // Sort and limit lists
    scores[mode].sort((a, b) => b.score - a.score);
    scores[mode] = scores[mode].slice(0, 100);

    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(scores, null, 2), 'utf8');
    res.json({
      decade: scores.decade.slice(0, 10),
      song: scores.song.slice(0, 10)
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to save high score." });
  }
});

// Catch-all route to serve the React index.html in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dead Reckoning server running on http://localhost:${PORT}`);
});
