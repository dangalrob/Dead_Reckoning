import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getDeviceId, pingUserActivity } from './utils/device.js';
import { 
  DancingBear, 
  StealieEmblem, 
  TerrapinTurtle, 
  CosmicCharlieSun, 
  SkeletonBust, 
  VineBorderLeft, 
  VineBorderRight 
} from './GratefulDeadComponents.jsx';
const getFullDecade = (dec) => {
  if (dec === '60s') return '1960s';
  if (dec === '70s') return '1970s';
  if (dec === '80s') return '1980s';
  if (dec === '90s') return '1990s';
  return dec;
};

const getTriviaFact = (trackName, decade) => {
  const name = (trackName || '').toLowerCase();
  
  // Specific Song Facts
  if (name.includes('dark star')) {
    return "Dark Star is famous for being a vehicle for deep live improvisation, sometimes stretching over 30 minutes during shows in the late 1960s.";
  }
  if (name.includes('drum') || name.includes('space')) {
    return "Drums and Space became a staple segment of Grateful Dead concerts in the late 1970s, letting the drummers explore complex tribal polyrhythms.";
  }
  if (name.includes('scarlet') || name.includes('fire')) {
    return "The transition between 'Scarlet Begonias' and 'Fire on the Mountain' became one of the band's most celebrated and beloved live jams.";
  }
  if (name.includes('uncle john')) {
    return "'Uncle John's Band' was featured on the 1970 album 'Workingman's Dead' and became one of the few Grateful Dead singles to enter the Hot 100.";
  }
  if (name.includes('sugar magnolia')) {
    return "'Sugar Magnolia', written by Bob Weir and Robert Hunter, was inspired by Weir's girlfriend Frankie Hart and is one of their most-played songs.";
  }
  if (name.includes('truckin')) {
    return "'Truckin' was written about the band's drug bust in New Orleans in 1970. In 1997, it was declared a national treasure by the Library of Congress.";
  }
  if (name.includes('casey jones')) {
    return "'Casey Jones' warns of the dangers of cocaine and train driving. Its chorus references the real-life railroad engineer who died in a 1900 crash.";
  }
  if (name.includes('friend of the devil')) {
    return "Jerry Garcia wrote the music for 'Friend of the Devil' in one night, and John Dawson of the New Riders of the Purple Sage helped write the bridge.";
  }
  if (name.includes('touch of grey')) {
    return "'Touch of Grey' became the band's only Top 40 single in 1987, reaching #9 on the Billboard charts and creating a new wave of fans ('Touchheads').";
  }
  if (name.includes('ripple')) {
    return "Robert Hunter wrote the lyrics to 'Ripple' in London in 1970 over a bottle of wine, writing 'Brokedown Palace' on the very same afternoon.";
  }
  if (name.includes('box of rain')) {
    return "'Box of Rain' was composed by bassist Phil Lesh for his dying father, with Robert Hunter writing lyrics designed specifically for Phil to sing.";
  }
  if (name.includes('shakedown street')) {
    return "'Shakedown Street' was produced by Little Feat's Lowell George, who pushed the band towards a funky, disco-influenced danceable groove.";
  }
  if (name.includes('playing in the band')) {
    return "'Playing in the Band' is one of the band's most performed songs, frequently serving as a vehicle for extended, experimental jazz-fusion jams.";
  }
  if (name.includes('morning dew')) {
    return "'Morning Dew' was written by Canadian singer Bonnie Dobson. Jerry Garcia first heard Fred Neil's cover of it and adopted it as a show-stopping closer.";
  }
  if (name.includes('estimated prophet')) {
    return "'Estimated Prophet', written by Bob Weir in a complex 7/4 time signature, was inspired by Weir's observations of eccentric California personalities.";
  }
  if (name.includes('st. stephen')) {
    return "'St. Stephen' was a late-60s concert favorite but was rarely played after 1971 because Jerry Garcia found its tight structure restrictive.";
  }
  if (name.includes('china cat') || name.includes('rider')) {
    return "The transition between 'China Cat Sunflower' and 'I Know You Rider' was first played in 1969 and remained a staple of Grateful Dead shows.";
  }
  if (name.includes('bird song')) {
    return "Jerry Garcia wrote 'Bird Song' as a tribute to singer Janis Joplin, a close friend of the band who passed away from an overdose in October 1970.";
  }
  if (name.includes('terrapin')) {
    return "'Terrapin Station' is a massive multi-part suite. Jerry Garcia claimed he wrote the melody during a sudden lightning storm in San Francisco.";
  }
  if (name.includes('althea')) {
    return "'Althea' was Jerry Garcia's favorite song to play in the 1980s, featuring complex conversational lyrics written by Robert Hunter.";
  }

  // Decade Specific Fallbacks
  if (decade === '60s') {
    return "The Grateful Dead arose from the San Francisco Bay Area scene in 1965, frequently playing Ken Kesey's legendary Acid Tests.";
  }
  if (decade === '70s') {
    return "In 1974, the band debuted the 'Wall of Sound', a massive custom PA system designed by Owsley Stanley that used over 600 speakers.";
  }
  if (decade === '80s') {
    return "During the 1980s, the Grateful Dead toured extensively in large stadiums, building a massive community of touring fans known as Deadheads.";
  }
  if (decade === '90s') {
    return "The Grateful Dead was inducted into the Rock and Roll Hall of Fame in 1994, with Jerry Garcia famously sending a cardboard cutout of himself.";
  }
  
  // General Facts Database
  const generalFacts = [
    "The band was originally called 'The Warlocks' but changed their name in late 1965 after discovering another group used the name.",
    "Bassist Phil Lesh was classically trained and brought avant-garde classical and jazz influences to the band's freeform improvisations.",
    "Lyricist Robert Hunter never performed on stage with the Grateful Dead, preferring to write the poetry in solitude.",
    "The band's iconic Steal Your Face logo was designed by Owsley Stanley and Bob Thomas to easily identify equipment boxes on tour.",
    "Jerry Garcia's famous guitars were custom built by Doug Irwin, including Wolf, Tiger, and Rosebud, each featuring detailed wood inlay work.",
    "The Grateful Dead officially encouraged fans to record their live shows, dedicating a special 'Tapers Section' behind the soundboard.",
    "Mickey Hart became interested in ethnomusicology, publishing books on the history of drums and working to preserve global drumming traditions.",
    "Keyboardist Ron 'Pigpen' McKernan was the heart of the early Dead, bringing a raw blues-belting style and playing harmonica.",
    "Jerry Garcia lost the middle finger of his right hand in a wood-chopping accident at age four, but went on to become a legendary guitarist.",
    "The band played at the historic Woodstock festival in 1969, but their set was plagued by rain, technical issues, and electric shocks.",
    "In 1978, the Grateful Dead played three historic concerts at the Great Pyramid of Giza in Egypt, recording their sets under the stars.",
    "The band played over 2,300 concerts between 1965 and 1995, with a repertoire of more than 500 different songs.",
    "Robert Hunter wrote the lyrics to 'Dark Star' before ever seeing the Grateful Dead perform live, starting a 30-year songwriting partnership.",
    "The name 'Grateful Dead' was chosen by opening a dictionary at random; it refers to a folklore motif of a deceased person thanking a traveler."
  ];
  
  // Determine which general fact to display based on title length
  const hash = (trackName || '').length % generalFacts.length;
  return generalFacts[hash];
};

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login', 'game', 'reveal', 'leaderboard'
  const [gameType, setGameType] = useState('decade'); // 'decade' or 'song'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [difficulty, setDifficulty] = useState('medium'); // Default to medium (15 seconds)
  
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeLimit, setTotalTimeLimit] = useState(10);
  
  const [guessResult, setGuessResult] = useState(null);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [lastSpeedBonus, setLastSpeedBonus] = useState(0);
  const [lastStreakBonus, setLastStreakBonus] = useState(0);
  const [leaderboard, setLeaderboard] = useState({ decade: [], song: [] });
  const [activeLeaderboardType, setActiveLeaderboardType] = useState('decade');
  const [playerInitials, setPlayerInitials] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Device audit report modal states
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditReport, setAuditReport] = useState([]);
  const [auditFilter, setAuditFilter] = useState('all'); // 'all', 'noname', 'multiname'
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Concert Tour Session states
  const [sessionId, setSessionId] = useState(null);
  const [sessionMode, setSessionMode] = useState('daily');
  const [yearChoices, setYearChoices] = useState([]);
  const [yearGuessResult, setYearGuessResult] = useState(null);
  const [postShowData, setPostShowData] = useState(null);

  // Share Results modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Ping device user activity and fetch initial leaderboard on startup
  useEffect(() => {
    pingUserActivity();
    fetchLeaderboard();
  }, []);

  const generateShareText = () => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const rankTier = getScoreTier(score);
    const scoreGrid = Array.from({ length: 10 }).map((_, i) => (i < correctCount ? '🟩' : '🟥')).join('');
    
    return `⚡ Dead Reckoning Tour Concert ⚡\n${todayStr}\nScore: ${score.toLocaleString()} PTS 🎸\nCorrect: ${correctCount} out of 10\nRank: ${rankTier}\n\n${scoreGrid}\n\nPlay Dead Reckoning: https://dead-reckoning-sc5l.onrender.com/`;
  };

  const copyShareText = () => {
    const text = generateShareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (err) {
      alert("Please copy text manually.");
    }
    document.body.removeChild(textArea);
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent('https://dead-reckoning-sc5l.onrender.com/');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const startConcertSession = async (mode = 'daily') => {
    setLoading(true);
    setGameType('song');
    setScore(0);
    setStreak(0);
    setLives(3);
    setCorrectCount(0);
    setTotalCount(0);
    setScoreSaved(false);
    setYearGuessResult(null);
    setPostShowData(null);
    setSessionMode(mode);

    try {
      const res = await axios.post('/api/game/start-session', { mode, gameType: 'song' });
      setSessionId(res.data.sessionId);
      setYearChoices(res.data.yearChoices || []);
      await loadSessionTrack(res.data.sessionId, 0);
    } catch (err) {
      console.error("Error starting concert session:", err);
      alert("Could not initialize concert session. Please try again.");
      setLoading(false);
    }
  };

  const loadSessionTrack = async (sId = sessionId, trackIdx = totalCount) => {
    setLoading(true);
    setGameType('song');
    setGuessResult(null);
    setIsPlaying(false);
    setHasPlayedOnce(false);
    setTimeLeft(10);
    setTotalTimeLimit(10);
    clearInterval(timerIntervalRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const res = await axios.get(`/api/game/session-track?sessionId=${sId}&trackIndex=${trackIdx}`);
      const trackData = res.data;
      setQuestion({
        trackName: trackData.correctSong,
        choices: trackData.choices,
        audioUrl: trackData.audioUrl,
        startOffset: trackData.startOffset
      });

      if (audioRef.current) {
        audioRef.current.src = trackData.audioUrl;
        audioRef.current.currentTime = trackData.startOffset;
      }
      setScreen('game');
    } catch (err) {
      console.error("Error loading session track:", err);
      alert("Failed to load track from Relisten.");
    } finally {
      setLoading(false);
    }
  };

  const submitYearGuess = async (year) => {
    try {
      const res = await axios.post('/api/game/guess-year', {
        sessionId,
        yearGuess: year
      });
      setYearGuessResult(res.data);
      if (res.data.correct) {
        setScore(prev => prev + 500);
      }
    } catch (err) {
      console.error("Year guess error:", err);
    }
  };

  const loadPostShowReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/game/post-show-report?sessionId=${sessionId}`);
      setPostShowData(res.data);
      setScreen('post_show');
    } catch (err) {
      console.error("Post show report error:", err);
      setScreen('gameover');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaderboard statistics
  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/game/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Leaderboard loading error:", err);
    }
  };

  // Default time limit (10 seconds)
  const getDifficultyTime = () => {
    return 10;
  };

  // Load a brand new question (pre-load & pre-seek audio for instant lag-free play)
  const loadQuestion = async (type = gameType) => {
    setLoading(true);
    setGuessResult(null);
    setIsPlaying(false);
    setHasPlayedOnce(false);
    setLastSpeedBonus(0);
    setLastStreakBonus(0);
    setLastPointsEarned(0);
    
    const limit = getDifficultyTime();
    setTotalTimeLimit(limit);
    setTimeLeft(limit);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const endpoint = type === 'song' ? '/api/game/song-question' : '/api/game/question';
      const res = await axios.get(endpoint);
      const q = res.data;
      setQuestion(q);
      setScreen('game');
    } catch (err) {
      alert("Relisten connection failed. Retrying in a few seconds...");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle loading and seeking when question changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    if (question) {
      audioRef.current.load();
    }
  }, [question]);

  const handleLoadedMetadata = () => {
    if (audioRef.current && question) {
      try {
        audioRef.current.currentTime = question.startOffset;
      } catch (err) {
        console.warn("Pre-seek failed during loadedmetadata:", err);
      }
    }
  };

  // Start the countdown timer ONLY when the audio starts audibly playing
  const startTimerCountdown = () => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          submitGuess('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Play/Pause toggler
  const togglePlay = () => {
    if (!question || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearInterval(timerIntervalRef.current);
    } else {
      setIsPlaying(true);
      setHasPlayedOnce(true);
      try {
        if (audioRef.current.currentTime < question.startOffset) {
          audioRef.current.currentTime = question.startOffset;
        }
      } catch (err) {}
      
      audioRef.current.play().catch(err => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
    }
  };

  // Listen to audio time updates to cut off at the limit
  const handleTimeUpdate = () => {
    if (!audioRef.current || !question) return;
    const playLimit = question.startOffset + totalTimeLimit;
    if (audioRef.current.currentTime >= playLimit) {
      audioRef.current.pause();
      setIsPlaying(false);
      setTimeLeft(0);
      clearInterval(timerIntervalRef.current);
      submitGuess('timeout');
    }
  };

  // Stop timer and audio on component unmount
  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Submit decade or song guess
  const submitGuess = async (guessVal) => {
    clearInterval(timerIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Handle Concert Tour session tracks
    if (sessionId && question && question.trackName) {
      const isCorrect = guessVal !== 'timeout' && (guessVal.trim().toLowerCase() === question.trackName.trim().toLowerCase());
      const result = {
        correct: isCorrect,
        correctSong: question.trackName,
        correctDecade: '70s'
      };

      setGuessResult(result);
      setTotalCount(prev => prev + 1);

      if (isCorrect) {
        const basePoints = 100;
        const streakBonus = Math.min(streak * 20, 100);
        const speedBonusMultiplier = 4;
        const speedBonus = guessVal === 'timeout' ? 0 : timeLeft * speedBonusMultiplier;
        const earned = basePoints + streakBonus + speedBonus;

        setLastPointsEarned(earned);
        setLastSpeedBonus(speedBonus);
        setLastStreakBonus(streakBonus);
        setScore(prev => prev + earned);
        setStreak(prev => prev + 1);
        setCorrectCount(prev => prev + 1);
      } else {
        setStreak(0);
        setLives(prev => prev - 1);
        const penalty = 50;
        setScore(prev => Math.max(0, prev - penalty));
        setLastPointsEarned(-penalty);
        setLastSpeedBonus(0);
      }

      setScreen('reveal');
      return;
    }

    // Fallback for legacy standalone questions
    if (question && question.gameId) {
      try {
        const res = await axios.post('/api/game/guess', {
          gameId: question.gameId,
          guess: guessVal
        });

        const result = res.data;
        setGuessResult(result);
        setTotalCount(prev => prev + 1);

        if (result.correct) {
          const basePoints = 100;
          const streakBonus = Math.min(streak * 20, 100);
          const speedBonusMultiplier = 4;
          const speedBonus = guessVal === 'timeout' ? 0 : timeLeft * speedBonusMultiplier;
          const earned = basePoints + streakBonus + speedBonus;

          setLastPointsEarned(earned);
          setLastSpeedBonus(speedBonus);
          setLastStreakBonus(streakBonus);
          setScore(prev => prev + earned);
          setStreak(prev => prev + 1);
          setCorrectCount(prev => prev + 1);
        } else {
          setStreak(0);
          setLives(prev => prev - 1);
          const penalty = 50;
          setScore(prev => Math.max(0, prev - penalty));
          setLastPointsEarned(-penalty);
          setLastSpeedBonus(0);
        }

        setScreen('reveal');
      } catch (err) {
        alert("Error submitting guess. Please try again.");
        console.error(err);
      }
    }
  };

  // Score rank tier classifier
  const getScoreTier = (scoreVal) => {
    if (scoreVal >= 1500) return "Taper";
    if (scoreVal >= 500) return "Estimated Prophet";
    return "Jerry's Kids";
  };

  // Convert score to rating value for database alignment
  const getDifficultyRating = (scoreVal) => {
    if (scoreVal >= 1500) return "expert"; // TAP
    if (scoreVal >= 500) return "medium"; // EST
    return "easy"; // JKD
  };

  // Clear leaderboard reset action
  const clearLeaderboards = async () => {
    setMenuOpen(false);
    if (!window.confirm("Are you sure you want to completely clear the leaderboards? This cannot be undone.")) return;
    try {
      const res = await axios.post('/api/leaderboard/clear');
      setLeaderboard(res.data);
      alert("Leaderboards successfully cleared!");
    } catch (err) {
      console.error(err);
      alert("Failed to clear leaderboards.");
    }
  };

  // Submit high score initials
  const submitHighScore = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!playerInitials.trim() || playerInitials.length > 10) return;

    try {
      const deviceId = getDeviceId();
      await axios.post('/api/game/leaderboard', {
        name: playerInitials.trim(),
        score,
        difficulty: getDifficultyRating(score),
        gameType,
        deviceId
      });
      setScoreSaved(true);
      fetchLeaderboard();
      setActiveLeaderboardType(gameType);
      setScreen('leaderboard');
    } catch (err) {
      console.error(err);
      alert("Could not submit high score.");
    }
  };

  // Stop audio and return to Main Menu
  const returnToMainMenu = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    clearInterval(timerIntervalRef.current);
    setScreen('login');
  };

  // Restart the current game session
  const restartGame = () => {
    if (confirm("Are you sure you want to restart? This will reset your score and lives.")) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      clearInterval(timerIntervalRef.current);
      setScore(0);
      setStreak(0);
      setLives(3);
      setCorrectCount(0);
      setTotalCount(0);
      loadQuestion(gameType);
    }
  };

  // Setup Keyboard Y/N Listeners when on Leaderboard Screen
  useEffect(() => {
    if (screen !== 'leaderboard') return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'y') {
        setScore(0);
        setStreak(0);
        setLives(3);
        setCorrectCount(0);
        setTotalCount(0);
        setScoreSaved(false);
        setPlayerInitials('');
        loadQuestion(gameType);
      } else if (key === 'n') {
        setScreen('login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen, gameType]);

  // Setup Leaderboard 3-second alternation effect
  useEffect(() => {
    if (screen !== 'leaderboard') return;
    
    fetchLeaderboard();

    const interval = setInterval(() => {
      setActiveLeaderboardType(prev => prev === 'decade' ? 'song' : 'decade');
    }, 3000);

    return () => clearInterval(interval);
  }, [screen]);

  // Helper to format level display code on the leaderboard
  const getLeaderboardLevelCode = (diff) => {
    if (diff === 'easy') return 'JKD';
    if (diff === 'expert') return 'TAP';
    return 'EST';
  };

  return (
    <div className="app-container">
      {/* Hidden audio player */}
      <audio 
        ref={audioRef} 
        src={question ? (question.audioUrl || `/api/game/stream/${question.gameId}`) : undefined}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onPlaying={startTimerCountdown}
        onPause={() => clearInterval(timerIntervalRef.current)}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ display: 'none' }}
      />

      {/* Screen 1: Main Menu */}
      {screen === 'login' && (
        <div className="game-card bg-menu">
          {/* Hamburger Menu Container */}
          <div className="menu-hamburger-container">
            <button className="menu-hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            {menuOpen && (
              <div className="menu-hamburger-dropdown">
                <button className="menu-dropdown-item" onClick={clearLeaderboards}>
                  Clear Leaderboard ⚡
                </button>
              </div>
            )}
          </div>

          {/* Dynamic title scroll text */}
          <div className="menu-scroll-title">
            <div>LIVE GRATEFUL DEAD</div>
            <div>AUDITORY CHALLENGE</div>
          </div>

          {/* Buttons with dynamic text overlays */}
          <button 
            className="hotspot-decade" 
            onClick={() => startConcertSession('daily')}
          >
            🌟 DAILY SHOW CHALLENGE
          </button>
          
          <button 
            className="hotspot-song" 
            onClick={() => startConcertSession('archive')}
          >
            🎸 ARCHIVE RANDOM SHOW
          </button>
          
          <button 
            className="hotspot-leaderboard" 
            onClick={() => {
              setScreen('leaderboard');
            }}
          >
            VIEW LEADERBOARD
          </button>
          
          <button 
            className="hotspot-rules" 
            onClick={() => {
              setScreen('rules');
            }}
          >
            📜 RULES & RANKS
          </button>
        </div>
      )}

      {/* Screen 2: Game Board */}
      {screen === 'game' && question && (
        <div className={`game-card ${gameType === 'song' ? 'bg-game-song' : 'bg-game'}`}>
          {/* LIVES Bears Indicator Overlay */}
          <div className="hud-lives">
            <img src="/bear_blue.png" alt="Blue Bear" style={{ transition: 'all 0.3s', opacity: lives >= 1 ? 1 : 0.1, filter: lives >= 1 ? 'none' : 'grayscale(100%) brightness(50%)' }} />
            <img src="/bear_green.png" alt="Green Bear" style={{ transition: 'all 0.3s', opacity: lives >= 2 ? 1 : 0.1, filter: lives >= 2 ? 'none' : 'grayscale(100%) brightness(50%)' }} />
            <img src="/bear_yellow.png" alt="Yellow Bear" style={{ transition: 'all 0.3s', opacity: lives >= 3 ? 1 : 0.1, filter: lives >= 3 ? 'none' : 'grayscale(100%) brightness(50%)' }} />
          </div>

          {/* STREAK and SCORE Counter Overlays */}
          <div className="hud-streak">{streak}</div>
          <div className="hud-score">{score}</div>

          {/* Track name / Identifier Label */}
          <div className="hud-title-container">
            <span className="hud-song-counter">{totalCount + 1} out of 10</span>
          </div>

          {/* Smaller Vector-Styled Retro Cassette Tape Play Button */}
          <div 
            className={`vector-cassette-tape ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            title="Tap to Play/Pause Audio"
          >
            {/* Corner Screws */}
            <div className="v-screw top-left">⊕</div>
            <div className="v-screw top-right">⊕</div>

            {/* Top Red Stripe Label */}
            <div className="v-cassette-label">
              <div className="v-red-stripe"></div>
              <div className="v-label-content">
                <span className="v-badge-a">A</span>
                <span className="v-label-title">
                  {isPlaying ? "▶ PLAYING CLIP..." : "⚡ GRATEFUL DEAD LIVE TAPE"}
                </span>
                <span className="v-label-boxes">☐ IN ☐ OUT</span>
              </div>
            </div>

            {/* Center Ribbed Texture Frame & Window */}
            <div className="v-window-outer">
              <div className="v-ribbed-left"></div>

              {/* Clear Window with Tape Spools & Red Teeth Hubs */}
              <div className="v-glass-window">
                <div className={`v-tape-spool left ${isPlaying ? 'spinning' : ''}`}>
                  <div className="v-white-hub">
                    <div className="v-red-tooth t1"></div>
                    <div className="v-red-tooth t2"></div>
                    <div className="v-red-tooth t3"></div>
                  </div>
                </div>

                <div className="v-tape-bridge"></div>

                <div className={`v-tape-spool right ${isPlaying ? 'spinning' : ''}`}>
                  <div className="v-white-hub">
                    <div className="v-red-tooth t1"></div>
                    <div className="v-red-tooth t2"></div>
                    <div className="v-red-tooth t3"></div>
                  </div>
                </div>
              </div>

              <div className="v-ribbed-right"></div>
            </div>

            {/* Bottom Label Strip & Red A 60 Badge */}
            <div className="v-bottom-strip">
              <span className="v-bias-text">Normal Bias 120μs EQ</span>
              <span className="v-badge-60">A | 60</span>
            </div>

            {/* Bottom Trapezoid Housing */}
            <div className="v-trapezoid">
              <div className="v-hole"></div>
              <div className="v-hole"></div>
              <div className="v-hole"></div>
              <div className="v-hole"></div>
            </div>

            {/* Bottom Screws */}
            <div className="v-screw bottom-left">⊕</div>
            <div className="v-screw bottom-right">⊕</div>
          </div>

          {/* TIMER HUD Overlay */}
          <div className="hud-timer-value">{timeLeft}</div>

          {/* Guessing inputs */}
          {gameType === 'song' ? (
            // --- Name the Song: Styled choice grid container covering static decade boxes ---
            <div className="song-choice-container">
              {question.choices.map((choice, idx) => (
                <button 
                  key={idx}
                  className="song-choice-btn" 
                  onClick={() => submitGuess(choice)}
                  disabled={!hasPlayedOnce}
                >
                  {hasPlayedOnce ? choice : '...'}
                </button>
              ))}
            </div>
          ) : (
            // --- Name the Decade: Transparent hotspots mapping to printed decade buttons ---
            <div className="game-decade-grid">
              <button className="hotspot-game-btn hotspot-btn-60s" onClick={() => submitGuess('60s')} disabled={!hasPlayedOnce}></button>
              <button className="hotspot-game-btn" onClick={() => submitGuess('77s')} style={{ display: 'none' }}></button> {/* compatibility fallback */}
              <button className="hotspot-game-btn hotspot-btn-70s" onClick={() => submitGuess('70s')} disabled={!hasPlayedOnce}></button>
              <button className="hotspot-game-btn hotspot-btn-80s" onClick={() => submitGuess('80s')} disabled={!hasPlayedOnce}></button>
              <button className="hotspot-game-btn hotspot-btn-90s" onClick={() => submitGuess('90s')} disabled={!hasPlayedOnce}></button>
            </div>
          )}

          {/* Navigation Placards Hotspots */}
          <button className="hotspot-bottom-right" onClick={returnToMainMenu}>Main Menu</button>
        </div>
      )}

      {/* Screen 3: Guess Reveal Screen */}
      {screen === 'reveal' && guessResult && (
        <div className={`game-card bg-reveal ${!guessResult.correct ? 'wrong' : ''}`}>
          {/* Correct Banner Overlay (Scroll) */}
          <div className="reveal-banner-container">
            {guessResult.correct && (
              <span className="reveal-banner-success">RIGHT ON!</span>
            )}
          </div>

          {/* Single Central Parchment Content Card */}
          <div className="reveal-cardboard-details reveal-did-you-know">
            {/* Song title banner */}
            <div className="reveal-song-sentence" style={{ fontSize: '1.05rem', textAlign: 'center', margin: '0.4rem 0' }}>
              <strong>"{guessResult.correctSong}"</strong>
            </div>

            <div className="reveal-divider"></div>

            {/* Detailed Points Gained/Lost Feedback */}
            <div className="reveal-points-feedback">
              {guessResult.correct ? (
                <span className="points-positive">
                  +100 PTS BASE {lastStreakBonus > 0 && `+${lastStreakBonus} STREAK`} {lastSpeedBonus > 0 && `+${lastSpeedBonus} SPEED`}
                </span>
              ) : (
                <span className="points-negative">
                  -50 PTS PENALTY
                </span>
              )}
            </div>
          </div>

          {/* Action Hotspot Button (NEXT ROUND or GRAND FINALE) */}
          {lives === 0 ? (
            <button className="hotspot-reveal-action" onClick={() => setScreen('gameover')}>
              See Results
            </button>
          ) : totalCount >= 10 ? (
            <button className="hotspot-reveal-action" onClick={() => setScreen('year_bonus')}>
              Grand Finale ⚡
            </button>
          ) : (
            <button className="hotspot-reveal-action" onClick={() => loadSessionTrack(sessionId, totalCount)}>
              Next Round
            </button>
          )}
        </div>
      )}

      {/* Screen: Grand Finale Year Bonus Round */}
      {screen === 'year_bonus' && (
        <div className="game-card bg-reveal">
          <div className="bonus-round-card">
            <div style={{ fontFamily: 'Sancreek, serif', fontSize: '0.92rem', color: '#ffd54f', textShadow: '1px 1px 3px #000', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
              ⚡ BONUS ROUND ⚡
            </div>
            
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 'bold', fontSize: '0.58rem', color: '#eeddbb', marginBottom: '0.5rem' }}>
              SCORE: <span style={{ color: '#ffd54f' }}>{score} PTS</span> • <span style={{ color: '#a5d6a7' }}>{correctCount} OF 10 CORRECT</span>
            </div>

            {/* REVEAL CONCERT VENUE & LOCATION HERE */}
            <div style={{ background: 'rgba(11, 2, 6, 0.75)', border: '1px solid #c29b53', borderRadius: '6px', padding: '0.4rem 0.5rem', marginBottom: '0.6rem', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '0.74rem', color: '#ffd54f' }}>
                {yearGuessResult && yearGuessResult.show ? yearGuessResult.show.venue : (question && question.showDetails ? question.showDetails.venue : 'HISTORIC GRATEFUL DEAD CONCERT')}
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.56rem', color: '#eeddbb', marginTop: '1px' }}>
                {yearGuessResult && yearGuessResult.show ? `${yearGuessResult.show.city}, ${yearGuessResult.show.state}` : (question && question.showDetails ? question.showDetails.location : '')}
              </div>
            </div>

            {!yearGuessResult ? (
              <div style={{ width: '100%' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 'bold', fontSize: '0.60rem', color: '#eeddbb', marginBottom: '0.45rem' }}>
                  GUESS THE YEAR OF THIS SHOW FOR +500 PTS:
                </div>
                <div className="year-choices-grid">
                  {yearChoices.map((year, idx) => (
                    <button 
                      key={idx} 
                      className="year-choice-btn"
                      onClick={() => submitYearGuess(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="year-result-container" style={{ width: '100%' }}>
                {yearGuessResult.correct ? (
                  <div className="year-result-correct">
                    ⚡ RIGHT ON! +500 BONUS POINTS! ⚡
                  </div>
                ) : (
                  <div className="year-result-wrong">
                    CONCERT WAS PLAYED IN {yearGuessResult.correctYear}
                  </div>
                )}

                {/* Leaderboard Name Entry */}
                {!scoreSaved && score > 0 ? (
                  <div style={{ marginTop: '0.5rem', background: 'rgba(11, 2, 6, 0.85)', padding: '0.45rem', borderRadius: '6px', border: '1px solid #c29b53', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.54rem', color: '#eeddbb', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                      ENTER YOUR NAME FOR LEADERBOARD:
                    </div>
                    <input 
                      type="text" 
                      maxLength="10"
                      className="gameover-name-input"
                      style={{ fontSize: '0.75rem', padding: '0.25rem', textAlign: 'center', width: '85%' }}
                      placeholder="YOUR NAME"
                      value={playerInitials}
                      onChange={e => setPlayerInitials(e.target.value.toUpperCase())}
                    />
                    <button 
                      className="year-choice-btn" 
                      style={{ marginTop: '0.4rem', padding: '0.3rem 0.6rem', fontSize: '0.65rem', width: '85%' }} 
                      onClick={submitHighScore}
                    >
                      SUBMIT SCORE
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#a5d6a7', fontSize: '0.58rem', marginTop: '0.4rem', fontWeight: 'bold' }}>
                    {scoreSaved ? "✓ SCORE SAVED TO LEADERBOARD!" : ""}
                  </div>
                )}

                <div style={{ marginTop: '0.4rem', width: '100%' }}>
                  <button className="share-score-trigger-btn" onClick={() => setShowShareModal(true)}>
                    📤 SHARE RESULTS
                  </button>
                </div>
              </div>
            )}
          </div>

          {yearGuessResult && (
            <button className="hotspot-reveal-action" onClick={loadPostShowReport}>
              Post-Show Report 📜
            </button>
          )}
        </div>
      )}

      {/* Screen: Post-Show Concert Report Card & Historical Trivia */}
      {screen === 'post_show' && (
        <div className="game-card bg-rules">
          <div className="rules-content-card" style={{ top: '24%', height: '62%' }}>
            <div className="rules-title" style={{ fontSize: '0.85rem' }}>POST-SHOW CONCERT REPORT</div>
            
            {postShowData && postShowData.show && (
              <>
                <div style={{ background: 'rgba(11, 2, 6, 0.7)', border: '1px solid #c29b53', borderRadius: '6px', padding: '0.4rem', marginBottom: '0.6rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '0.82rem', color: '#ffd54f' }}>
                    {postShowData.show.venue}
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.64rem', color: '#eeddbb' }}>
                    {postShowData.show.city}, {postShowData.show.state} • {postShowData.show.date}
                  </div>
                  <div style={{ fontSize: '0.54rem', color: '#eeddbb', opacity: 0.8, marginTop: '2px' }}>
                    {postShowData.show.tour}
                  </div>
                </div>

                <div className="ranks-title" style={{ marginTop: '0.4rem' }}>HISTORICAL CONCERT TRIVIA</div>
                <div className="rules-section" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {postShowData.trivia && postShowData.trivia.length > 0 ? (
                    postShowData.trivia.map((fact, idx) => (
                      <div key={idx} className="rules-item" style={{ fontSize: '0.56rem', padding: '0.2rem 0' }}>
                        ⚡ {fact}
                      </div>
                    ))
                  ) : (
                    <div className="rules-item" style={{ fontSize: '0.56rem' }}>
                      ⚡ Recorded live during the Grateful Dead's peak touring era.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.4rem', textAlign: 'center' }}>
                  <button className="share-score-trigger-btn" onClick={() => setShowShareModal(true)}>
                    📤 SHARE RESULTS
                  </button>
                </div>
              </>
            )}
          </div>

          <button className="hotspot-rules-back" onClick={() => setScreen('gameover')}>
            See Final Results
          </button>
        </div>
      )}

      {/* Screen: Tour Rules */}
      {screen === 'rules' && (
        <div className="game-card bg-rules">
          <div className="rules-content-card">
            <div className="rules-title">TOUR RULES</div>
            <div className="rules-section">
              <div className="rules-item">1. TEN SONGS FROM A RANDOM CONCERT ARE PLAYED ONE AT A TIME.</div>
              <div className="rules-item">2. CHOOSE THE CORRECT SONG NAME FROM THE 4 OPTIONS.</div>
              <div className="rules-item">3. WRONG GUESSES OR TIMEOUTS DEDUCT 50 PTS & 1 STRIKE. 3 STRIKES ENDS THE GAME.</div>
              <div className="rules-item">4. GUESS QUICKLY TO EARN UP TO +40 SPEED BONUS POINTS.</div>
              <div className="rules-item">5. COMPLETE 10 SONGS TO UNLOCK THE BONUS ROUND & GUESS THE YEAR (+500 PTS)!</div>
            </div>
            
            <div className="ranks-title">TOUR RANKS</div>
            <div className="ranks-section">
              <div className="ranks-item">⭐ TAPER (1500+ PTS)</div>
              <div className="ranks-item">⭐ ESTIMATED PROPHET (500-1499 PTS)</div>
              <div className="ranks-item">⭐ JERRY'S KIDS (0-499 PTS)</div>
            </div>
          </div>
          <button className="hotspot-rules-back" onClick={returnToMainMenu}></button>
        </div>
      )}

      {/* Screen: Game Over / Tour Complete */}
      {screen === 'gameover' && (
        <div className="game-card bg-gameover">
          <div className="gameover-dark-card">
            <div className="gameover-status-title">
              {lives === 0 ? "BETTER LUCK NEXT TIME" : "TOUR COMPLETE"}
            </div>
            
            <div className="gameover-results-breakdown">
              {lives === 0 && guessResult && (
                <div className="gameover-reveal-correct">
                  <div className="gameover-reveal-label">CORRECT SONG:</div>
                  <div className="gameover-reveal-val">"{guessResult.correctSong.toUpperCase()}"</div>
                </div>
              )}
              
              <div className="gameover-stat-row">
                <span className="gameover-stat-label">FINAL SCORE:</span>
                <span className="gameover-stat-val">{score}</span>
              </div>
              <div className="gameover-stat-row">
                <span className="gameover-stat-label">TOUR RANK:</span>
                <span className="gameover-stat-val-rank">{getScoreTier(score)}</span>
              </div>
              <div className="gameover-stat-row" style={{ borderBottom: 'none' }}>
                <span className="gameover-stat-label">SONGS PLAYED:</span>
                <span className="gameover-stat-val">{totalCount} OF 10</span>
              </div>
            </div>

            {!scoreSaved && score > 0 ? (
              <div className="gameover-name-entry">
                <div className="gameover-entry-label">ENTER NAME FOR LEADERBOARD:</div>
                <input 
                  type="text" 
                  maxLength="10"
                  className="gameover-name-input"
                  placeholder="YOUR NAME"
                  value={playerInitials}
                  onChange={e => setPlayerInitials(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>
            ) : (
              <div className="gameover-saved-msg">
                {scoreSaved ? "✓ SCORE SAVED TO LEADERBOARD!" : "SCORE IS ZERO - PLAY AGAIN!"}
              </div>
            )}

            <div style={{ marginTop: '0.4rem', width: '100%', textAlign: 'center' }}>
              <button className="share-score-trigger-btn" onClick={() => setShowShareModal(true)}>
                📤 SHARE RESULTS
              </button>
            </div>
          </div>

          {/* Action buttons mapping to bottom red and blue boxes */}
          {!scoreSaved && score > 0 ? (
            <button className="hotspot-gameover-submit" onClick={submitHighScore}>
              SUBMIT SCORE
            </button>
          ) : null}
          <button className="hotspot-gameover-menu" onClick={returnToMainMenu}>
            MAIN MENU
          </button>
        </div>
      )}

      {/* Screen 4: Leaderboard placard */}
      {screen === 'leaderboard' && (
        <div className="game-card bg-leaderboard">
          {/* Game Title placard Overlay */}
          <div className="overlay-game-title">
            CONCERT LEADERBOARD
          </div>

          {/* Dynamic Scoreboard Table Overlay */}
          <div className="leaderboard-table-overlay">
            <div className="overlay-header">
              <span className="overlay-rank-col">RANK</span>
              <span className="overlay-name-col">NAME</span>
              <span className="overlay-score-col">SCORE</span>
            </div>
            
            {(leaderboard.song || leaderboard.decade || []).length > 0 ? (
              (leaderboard.song || leaderboard.decade || []).slice(0, 10).map((item, idx) => {
                return (
                  <div key={idx} className="overlay-row">
                    <span className="overlay-rank-col">{idx + 1}</span>
                    <span className="overlay-name-col">{item.name.toUpperCase()}</span>
                    <span className="overlay-score-col">{item.score.toLocaleString()}</span>
                  </div>
                );
              })
            ) : (
              <div className="no-tours-msg">
                NO REGISTERED TOURS
              </div>
            )}
          </div>

          {/* Interactive Play Again placard Hotspot */}
          <button className="hotspot-leaderboard-back" onClick={returnToMainMenu}></button>

          {/* Secret Admin Device Audit Report Hotspot (Lower Right Hand Corner) */}
          <button 
            className="hotspot-leaderboard-audit" 
            onClick={async () => {
              setLoadingAudit(true);
              setAuditModalOpen(true);
              try {
                const res = await axios.get('/api/admin/device-report');
                setAuditReport(res.data);
              } catch (err) {
                console.error("Audit report error:", err);
              } finally {
                setLoadingAudit(false);
              }
            }}
            title="Open Device Audit Report"
          ></button>
        </div>
      )}

      {/* Secret Admin Device Audit Report Modal */}
      {auditModalOpen && (
        <div className="audit-modal-overlay">
          <div className="audit-modal-card">
            <div className="audit-modal-header">
              <div className="audit-modal-title">⚡ DEVICE AUDIT REPORT ⚡</div>
              <button className="audit-modal-close" onClick={() => setAuditModalOpen(false)}>✕</button>
            </div>

            <div className="audit-filter-bar">
              <button 
                className={`audit-filter-btn ${auditFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAuditFilter('all')}
              >
                ALL ({auditReport.length})
              </button>
              <button 
                className={`audit-filter-btn warning ${auditFilter === 'noname' ? 'active' : ''}`}
                onClick={() => setAuditFilter('noname')}
              >
                ⚠️ NO NAME ({auditReport.filter(r => r.hasNoNameOnLeaderboard).length})
              </button>
              <button 
                className={`audit-filter-btn multi ${auditFilter === 'multiname' ? 'active' : ''}`}
                onClick={() => setAuditFilter('multiname')}
              >
                ⚡ MULTI NAMES ({auditReport.filter(r => r.usedMultipleNames).length})
              </button>
            </div>

            <div className="audit-report-body">
              {loadingAudit ? (
                <div className="audit-loading">GENERATING AUDIT REPORT...</div>
              ) : auditReport.length === 0 ? (
                <div className="audit-loading">NO DEVICE ACTIVITY RECORDED YET</div>
              ) : (
                auditReport
                  .filter(item => {
                    if (auditFilter === 'noname') return item.hasNoNameOnLeaderboard;
                    if (auditFilter === 'multiname') return item.usedMultipleNames;
                    return true;
                  })
                  .map((item, idx) => (
                    <div key={idx} className="audit-item-card">
                      <div className="audit-item-row top">
                        <span className="audit-device-id">🆔 {item.deviceId ? `${item.deviceId.substring(0, 16)}...` : 'UNKNOWN DEVICE'}</span>
                        <span className="audit-last-seen">{item.lastSeen ? new Date(item.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'UNKNOWN'}</span>
                      </div>

                      <div className="audit-item-row">
                        <span className="audit-label">SAVED NAME:</span>
                        <span className="audit-val highlight">{item.latestName}</span>
                      </div>

                      <div className="audit-item-row">
                        <span className="audit-label">NAMES USED ({item.namesUsed ? item.namesUsed.length : 0}):</span>
                        <span className="audit-val">{item.namesUsed && item.namesUsed.length > 0 ? item.namesUsed.join(', ') : 'NONE'}</span>
                      </div>

                      <div className="audit-item-row stats">
                        <span>GAMES STARTED: <strong>{item.gamesStarted}</strong></span>
                        <span>SUBMITTED: <strong>{item.scoresSubmitted}</strong></span>
                        <span>BEST: <strong>{item.highestScore}</strong></span>
                      </div>

                      <div className="audit-badges">
                        {item.hasNoNameOnLeaderboard && (
                          <span className="badge warning">⚠️ STARTED APP - NO LEADERBOARD ENTRY</span>
                        )}
                        {item.usedMultipleNames && (
                          <span className="badge multi">⚡ USED {item.namesUsed.length} DIFFERENT NAMES</span>
                        )}
                        {item.deviceMeta && item.deviceMeta.os && (
                          <span className="badge meta">📱 {item.deviceMeta.os} ({item.deviceMeta.screenWidth || 0}x{item.deviceMeta.screenHeight || 0})</span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Results Modal */}
      {showShareModal && (
        <div className="share-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-card" onClick={e => e.stopPropagation()}>
            <button className="share-modal-close" onClick={() => setShowShareModal(false)}>×</button>
            <div className="share-modal-title">Share Your Results</div>
            
            <div className="share-text-box">
              <div className="share-header-title">⚡ Dead Reckoning Tour Concert</div>
              <div className="share-date">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div className="share-stat-line">Score: <strong>{score.toLocaleString()} PTS 🎸</strong></div>
              <div className="share-stat-line">Correct: <strong>{correctCount} out of 10</strong></div>
              <div className="share-stat-line">Rank: <strong>{getScoreTier(score)}</strong></div>
              <div className="share-emoji-grid">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className="share-emoji-box">{i < correctCount ? '🟩' : '🟥'}</span>
                ))}
              </div>
              <div className="share-url">Play Dead Reckoning at<br/><code>https://dead-reckoning-sc5l.onrender.com/</code></div>
            </div>

            <div className="share-buttons-row">
              <button className="share-btn share-btn-copy" onClick={copyShareText}>
                📋 {copiedShare ? "Copied!" : "Copy Text"}
              </button>
              <button className="share-btn share-btn-twitter" onClick={shareToTwitter}>
                🐦 Twitter
              </button>
              <button className="share-btn share-btn-facebook" onClick={shareToFacebook}>
                📘 Facebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Loading indicator */}
      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(26, 6, 13, 0.95)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="loader"></div>
          <div className="loading-text flash-text">TUNING STATION TRANSCEIVER...</div>
          <div style={{ color: 'var(--burgundy)', marginTop: '0.5rem', fontSize: '0.8rem', letterSpacing: '1px' }}>
            RETRIEVING TAPES FROM RELISTEN
          </div>
        </div>
      )}
    </div>
  );
}
