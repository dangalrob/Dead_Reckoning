import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  const [totalTimeLimit, setTotalTimeLimit] = useState(15);
  
  const [guessResult, setGuessResult] = useState(null);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [lastSpeedBonus, setLastSpeedBonus] = useState(0);
  const [leaderboard, setLeaderboard] = useState({ decade: [], song: [] });
  const [activeLeaderboardType, setActiveLeaderboardType] = useState('decade');
  const [playerInitials, setPlayerInitials] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Fetch leaderboard statistics
  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/game/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Leaderboard loading error:", err);
    }
  };

  // Default time limit (15 seconds)
  const getDifficultyTime = () => {
    return 15;
  };

  // Load a brand new question (pre-load & pre-seek audio for instant lag-free play)
  const loadQuestion = async (type = gameType) => {
    setLoading(true);
    setGuessResult(null);
    setIsPlaying(false);
    setHasPlayedOnce(false);
    setLastSpeedBonus(0);
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
        
        // Speed bonus calculation (medium multiplier scaling)
        const speedBonusMultiplier = 4;
        const speedBonus = guessVal === 'timeout' ? 0 : timeLeft * speedBonusMultiplier;
        
        const earned = (basePoints + streakBonus + speedBonus);

        setLastPointsEarned(earned);
        setLastSpeedBonus(speedBonus);
        setScore(prev => prev + earned);
        setStreak(prev => prev + 1);
        setCorrectCount(prev => prev + 1);
      } else {
        setStreak(0);
        setLives(prev => prev - 1);
        setLastPointsEarned(0);
        setLastSpeedBonus(0);
      }

      setScreen('reveal');
    } catch (err) {
      alert("Error submitting guess. Please try again.");
      console.error(err);
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

  // Submit high score initials
  const submitHighScore = async (e) => {
    e.preventDefault();
    if (playerInitials.length !== 3) return;

    try {
      await axios.post('/api/game/leaderboard', {
        name: playerInitials,
        score,
        difficulty: getDifficultyRating(score),
        gameType
      });
      setScoreSaved(true);
      fetchLeaderboard();
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
        src={question ? `/api/game/stream/${question.gameId}` : undefined}
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
          {/* Dynamic title scroll text */}
          <div className="menu-scroll-title">
            <div>LIVE GRATEFUL DEAD</div>
            <div>AUDITORY CHALLENGE</div>
          </div>

          {/* Buttons with dynamic text overlays */}
          <button 
            className="hotspot-decade" 
            disabled
          >
            Name The Decade
            <span style={{ display: 'block', fontSize: '0.42rem', textTransform: 'uppercase', marginTop: '2px', opacity: 0.75, letterSpacing: '0.5px' }}>Coming Soon</span>
          </button>
          
          <button 
            className="hotspot-song" 
            onClick={() => {
              setGameType('song');
              setScore(0);
              setStreak(0);
              setLives(3);
              setCorrectCount(0);
              setTotalCount(0);
              loadQuestion('song');
            }}
          >
            Name The Song
          </button>
          
          <button 
            className="hotspot-leaderboard" 
            onClick={() => {
              setScreen('leaderboard');
            }}
          >
            View Leaderboard
          </button>
          
          <button 
            className="hotspot-rules" 
            onClick={() => {
              alert("Grateful Dead Tour Rules:\n\n1. Play a clip (15s limit).\n2. Guess the decade or the song correctly.\n3. Make quick guesses to gain speed bonuses!\n4. Run out of time or guess wrong and you lose 1 of your 3 lives.\n5. Score enough to rise through ranks: Jerry's Kids -> Estimated Prophet -> Taper!");
            }}
          >
            Tour Rules & Ranks
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

          {/* Track name / Identifier Label (Decade mode only) */}
          {gameType === 'decade' && (
            <div className="hud-title-container">
              <span className="stat-label" style={{ color: '#eeddbb', fontSize: '0.55rem', marginBottom: '1px' }}>NOW IDENTIFYING TRACK:</span>
              <span className="hud-track-name">
                "{question.trackName.toUpperCase()}"
              </span>
            </div>
          )}

          {/* PLAY CLIP Circular Stamp Overlay Button */}
          <button 
            className={`hotspot-play-clip ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
          >
            <div className={`play-icon-overlay ${!hasPlayedOnce ? 'pulsate' : ''}`}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </div>
          </button>

          {/* Prompt to Tap Play if not played yet */}
          {!hasPlayedOnce && (
            <div className="play-prompt" style={{ top: gameType === 'song' ? '54.5%' : '47.5%' }}>
              ⚡ TAP STEALIE TO UNLOCK CHOICES ⚡
            </div>
          )}

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
                  {choice}
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

      {/* Screen 3: Guess Reveal / Game Over Screen */}
      {screen === 'reveal' && guessResult && (
        <div className={`game-card bg-reveal ${!guessResult.correct ? 'wrong' : ''}`}>
          {lives > 0 ? (
            // --- Normal Round Reveal ---
            <>
              {/* Correct Banner Overlay (Scroll) */}
              <div className="reveal-banner-container">
                {guessResult.correct && (
                  <span className="reveal-banner-success">RIGHT ON!</span>
                )}
              </div>

              {/* Single Central Parchment Content Card */}
              <div className="reveal-cardboard-details reveal-did-you-know">
                {gameType === 'song' ? (
                  // --- Name the Song: Simple descriptive sentence as requested ---
                  <div className="reveal-song-sentence">
                    "{guessResult.correctSong}" was played on {(() => {
                      if (!guessResult.showDetails || !guessResult.showDetails.date) return 'an unknown date';
                      const parts = guessResult.showDetails.date.split('-');
                      if (parts.length !== 3) return guessResult.showDetails.date;
                      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                      return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    })()} in the {guessResult.showDetails ? guessResult.showDetails.venue : 'unknown venue'} in {guessResult.showDetails ? guessResult.showDetails.location : 'unknown location'}.
                  </div>
                ) : (
                  // --- Name the Decade: Split track and live details layout ---
                  <>
                    {/* 1. Track Played Info */}
                    <div className="reveal-card-track-info">
                      "{guessResult.correctSong || question.trackName}"
                      <div style={{ marginTop: '2px' }}>WAS PLAYED IN THE <span className="reveal-decade-badge">{getFullDecade(guessResult.correctDecade)}</span></div>
                    </div>

                    <div className="reveal-divider"></div>

                    {/* 2. Show Recording Details (When & Where) */}
                    {guessResult.showDetails && (
                      <div className="reveal-card-show-details">
                        <div className="show-date">
                          {(() => {
                            if (!guessResult.showDetails.date) return 'Unknown Date';
                            const parts = guessResult.showDetails.date.split('-');
                            if (parts.length !== 3) return guessResult.showDetails.date;
                            const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                            return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                          })()}
                        </div>
                        <div>{guessResult.showDetails.venue}</div>
                        <div>{guessResult.showDetails.location}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Hotspot Button (NEXT ROUND) */}
              <button className="hotspot-reveal-action" onClick={() => loadQuestion(gameType)}>
                Next Round
              </button>
            </>
          ) : (
            // --- Game Over Screen (Strikes Out) ---
            <>
              {/* Game Over Banner Overlay (Scroll) */}
              <div className="reveal-banner-container"></div>

              {/* Single Central Parchment Content Card (Game Over Mode) */}
              <div className="reveal-cardboard-details reveal-did-you-know" style={{ justifyContent: 'center' }}>
                <div className="reveal-card-track-info" style={{ marginBottom: '8px' }}>
                  {gameType === 'song' ? `CORRECT SONG:` : `CORRECT DECADE:`}
                  <div style={{ color: 'var(--crimson)', marginTop: '2px' }}>
                    {gameType === 'song' ? `"${guessResult.correctSong.toUpperCase()}"` : getFullDecade(guessResult.correctDecade)}
                  </div>
                </div>

                <div className="reveal-divider"></div>

                {!scoreSaved && score > 0 ? (
                  // Initials submission form positioned inside did-you-know placard
                  <form onSubmit={submitHighScore} className="gameover-form-overlay">
                    <span className="reveal-detail-label" style={{ marginBottom: '3px' }}>ENTER INITIALS:</span>
                    <input 
                      type="text" 
                      maxLength="3"
                      className="gameover-initials-input"
                      placeholder="DAN"
                      value={playerInitials}
                      onChange={e => setPlayerInitials(e.target.value.toUpperCase())}
                      required
                      autoFocus
                    />
                    <button type="submit" className="gameover-enter-btn">ENTER ⚡</button>
                  </form>
                ) : (
                  <div className="reveal-card-show-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <span className="reveal-detail-label">FINAL SCORE</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--crimson)', fontFamily: 'Georgia, serif', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>{score}</span>
                    <span className="reveal-detail-label" style={{ marginTop: '2px' }}>RANK: {getScoreTier(score)}</span>
                  </div>
                )}
              </div>

              {/* Action Hotspot Button (MAIN MENU) */}
              <button className="hotspot-reveal-action" onClick={returnToMainMenu}>
                Main Menu
              </button>
            </>
          )}
        </div>
      )}

      {/* Screen 4: Leaderboard placard */}
      {screen === 'leaderboard' && (
        <div className="game-card bg-leaderboard">
          {/* Game Title placard Overlay (toggles every 3s) */}
          <div className="overlay-game-title">
            {activeLeaderboardType === 'decade' ? "NAME THE DECADE" : "NAME THE SONG"}
          </div>

          {/* Dynamic Scoreboard Table Overlay */}
          <div className="leaderboard-table-overlay">
            <div className="overlay-header">
              <span className="overlay-rank-col">RANK</span>
              <span className="overlay-name-col">NAME</span>
              <span className="overlay-score-col">SCORE</span>
            </div>
            
            {leaderboard[activeLeaderboardType] && leaderboard[activeLeaderboardType].length > 0 ? (
              leaderboard[activeLeaderboardType].slice(0, 10).map((item, idx) => {
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
