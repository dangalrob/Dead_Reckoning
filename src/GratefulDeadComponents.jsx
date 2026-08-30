import React from 'react';

// --- Dancing Bear SVG ---
export function DancingBear({ color = "#d90429", className = "bear-svg" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="50" cy="35" r="15" fill={color} stroke="#000" strokeWidth="2.5" />
      {/* Ears */}
      <circle cx="38" cy="24" r="7" fill={color} stroke="#000" strokeWidth="2" />
      <circle cx="38" cy="24" r="3.5" fill="#ffa6c9" />
      <circle cx="62" cy="24" r="7" fill={color} stroke="#000" strokeWidth="2" />
      <circle cx="62" cy="24" r="3.5" fill="#ffa6c9" />
      {/* Face details */}
      <circle cx="45" cy="33" r="2" fill="#000" />
      <circle cx="55" cy="33" r="2" fill="#000" />
      <ellipse cx="50" cy="39" rx="5" ry="3" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="50" cy="37" r="1.5" fill="#000" />
      {/* Collar */}
      <path d="M 36 46 L 41 53 L 45 46 L 50 53 L 55 46 L 59 53 L 64 46 Z" fill="#ff9e00" stroke="#000" strokeWidth="1" />
      {/* Body */}
      <path d="M 40 48 Q 50 44 60 48 L 58 68 Q 50 72 42 68 Z" fill={color} stroke="#000" strokeWidth="2.5" />
      {/* Arms (Dancing Pose) */}
      <path d="M 38 48 Q 22 42 26 30 Q 32 30 38 44" fill={color} stroke="#000" strokeWidth="2.5" />
      <path d="M 62 48 Q 78 44 74 32 Q 68 32 62 44" fill={color} stroke="#000" strokeWidth="2.5" />
      {/* Legs (Dancing Pose) */}
      <path d="M 42 68 Q 30 76 34 88 Q 42 88 45 70" fill={color} stroke="#000" strokeWidth="2.5" />
      <path d="M 58 68 Q 70 76 66 88 Q 58 88 55 70" fill={color} stroke="#000" strokeWidth="2.5" />
    </svg>
  );
}

// --- Stealie Skull Emblem (High-Fidelity Classic Skull & Bolt Logo) ---
export function StealieEmblem({ className = "stealie-svg" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer thin black ring around the entire head circle */}
      <circle cx="50" cy="42" r="33.5" fill="none" stroke="#000" strokeWidth="1.5" />
      
      {/* Circular head background */}
      <circle cx="50" cy="42" r="32.5" fill="#fff" />
      
      {/* Red left side, Blue right side of the circle */}
      <clipPath id="stealieCircleClip">
        <circle cx="50" cy="42" r="32.5" />
      </clipPath>
      
      <g clipPath="url(#stealieCircleClip)">
        {/* Red background on left */}
        <rect x="0" y="0" width="50" height="85" fill="#d90429" />
        {/* Blue background on right */}
        <rect x="50" y="0" width="50" height="85" fill="#003566" />
        
        {/* White 13-point lightning bolt running diagonally */}
        <path d="M 51.5 9 L 61 22 L 52.5 23 L 59.5 32 L 51 33.5 L 57.5 42 L 48.5 43.5 L 55 52 L 46.5 53.5 L 52.5 62 L 44 63.5 L 50.5 73.5 L 38 73.5 L 45 84 L 38.5 84 L 31.5 72 L 39 72 L 30.5 61 L 37.5 61 L 29 50 L 36 50 L 27.5 39 L 34.5 39 L 26 28 L 33 28 L 24.5 17 L 31 17 Z" 
              fill="#fff" stroke="#000" strokeWidth="1.25" strokeLinejoin="miter" />
      </g>
      
      {/* White skull face base outline that merges into the circle */}
      <path d="M 17.5 42 
               C 17.5 54, 20 62, 28 66
               C 32 68, 35 73, 35 76
               L 35 78
               C 35 83, 39 88, 43 90
               L 57 90
               C 61 88, 65 83, 65 78
               L 65 76
               C 65 73, 68 68, 72 66
               C 80 62, 82.5 54, 82.5 42 Z" 
            fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      
      {/* Temples lines wrapping the side of the head skull */}
      <path d="M 17.5 42 C 22 45, 25 50, 25 56 C 25 61, 22 66, 28 66" fill="none" stroke="#000" strokeWidth="1.5" />
      <path d="M 82.5 42 C 78 45, 75 50, 75 56 C 75 61, 78 66, 72 66" fill="none" stroke="#000" strokeWidth="1.5" />

      {/* Hollow black eye sockets (classic ovals) */}
      <ellipse cx="36" cy="56" rx="7.5" ry="9.5" fill="#000" transform="rotate(-10 36 56)" />
      <ellipse cx="64" cy="56" rx="7.5" ry="9.5" fill="#000" transform="rotate(10 64 56)" />
      
      {/* Nasal cavity (classic inverted heart) */}
      <path d="M 50 63 C 48.5 67, 45 70, 48.5 73 Q 50 71 51.5 73 C 55 70, 51.5 67, 50 63 Z" fill="#000" stroke="#000" strokeWidth="0.5" />
      
      {/* Teeth & mouth area */}
      <rect x="42.5" y="77.5" width="15" height="6.5" fill="#fff" stroke="#000" strokeWidth="1.25" rx="1" />
      <line x1="45.5" y1="77.5" x2="45.5" y2="84" stroke="#000" strokeWidth="1.25" />
      <line x1="48.5" y1="77.5" x2="48.5" y2="84" stroke="#000" strokeWidth="1.25" />
      <line x1="51.5" y1="77.5" x2="51.5" y2="84" stroke="#000" strokeWidth="1.25" />
      <line x1="54.5" y1="77.5" x2="54.5" y2="84" stroke="#000" strokeWidth="1.25" />
      <line x1="42.5" y1="80.75" x2="57.5" y2="80.75" stroke="#000" strokeWidth="1" />
    </svg>
  );
}

// --- Terrapin Turtle SVG ---
export function TerrapinTurtle({ className = "turtle-svg" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="rgba(22, 20, 38, 0.9)" stroke="#00f0ff" strokeWidth="2.5" />
      <g stroke="#38b000" strokeWidth="2" fill="none">
        {/* Shell */}
        <ellipse cx="50" cy="55" rx="22" ry="26" fill="#1b4332" stroke="#38b000" strokeWidth="3" />
        {/* Shell segments */}
        <path d="M 50 29 L 50 81 M 28 55 L 72 55 M 34 38 L 66 72 M 34 72 L 66 38" stroke="#38b000" strokeWidth="1.5" />
        {/* Feet */}
        <ellipse cx="32" cy="74" rx="8" ry="5" fill="#38b000" />
        <ellipse cx="68" cy="74" rx="8" ry="5" fill="#38b000" />
        <ellipse cx="28" cy="38" rx="8" ry="6" fill="#38b000" />
        <ellipse cx="72" cy="38" rx="8" ry="6" fill="#38b000" />
        {/* Tail */}
        <path d="M 50 81 L 50 88" stroke="#38b000" strokeWidth="3" />
        {/* Head */}
        <circle cx="50" cy="24" r="10" fill="#38b000" />
        <circle cx="46" cy="22" r="1" fill="#fff" />
        <circle cx="54" cy="22" r="1" fill="#fff" />
      </g>
    </svg>
  );
}

// --- Cosmic Charlie Sun SVG ---
export function CosmicCharlieSun({ className = "sun-svg" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="rgba(22, 20, 38, 0.9)" stroke="#ff9e00" strokeWidth="2.5" />
      {/* Smiling sun face */}
      <circle cx="50" cy="50" r="24" fill="#ff9e00" stroke="#000" strokeWidth="1.5" />
      {/* Sun rays */}
      <g stroke="#ff9e00" strokeWidth="2" strokeLinecap="round">
        <path d="M 50 8 L 50 20 M 50 80 L 50 92 M 8 50 L 20 50 M 80 50 L 92 50" />
        <path d="M 21 21 L 30 30 M 70 70 L 79 79 M 21 79 L 30 70 M 79 21 L 70 30" />
        <path d="M 33 13 L 38 22 M 67 13 L 62 22 M 33 87 L 38 78 M 67 87 L 62 78" />
        <path d="M 13 33 L 22 38 M 87 33 L 78 38 M 13 67 L 22 62 M 87 67 L 78 62" />
      </g>
      {/* Glasses */}
      <rect x="36" y="42" width="11" height="9" rx="3" fill="#000" />
      <rect x="53" y="42" width="11" height="9" rx="3" fill="#000" />
      <line x1="47" y1="46" x2="53" y2="46" stroke="#000" strokeWidth="2.5" />
      {/* Smile */}
      <path d="M 42 56 Q 50 63 58 56" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// --- Skeleton with Rose Crown SVG ---
export function SkeletonBust({ className = "skeleton-svg" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Ribs / Bust outline */}
      <path d="M 30 85 L 70 85 L 64 68 L 50 62 L 36 68 Z" fill="none" stroke="#fff" strokeWidth="3" />
      {/* Spine */}
      <line x1="50" y1="52" x2="50" y2="85" stroke="#fff" strokeWidth="6" />
      {/* Rib lines */}
      <path d="M 35 68 Q 50 58 65 68 M 32 75 Q 50 65 68 75 M 30 82 Q 50 72 70 82" fill="none" stroke="#fff" strokeWidth="3" />
      {/* Neck */}
      <line x1="50" y1="44" x2="50" y2="55" stroke="#fff" strokeWidth="4.5" />
      {/* Skull */}
      <circle cx="50" cy="32" r="13" fill="#fff" stroke="#000" strokeWidth="1" />
      <path d="M 42 36 L 40 46 C 40 49, 60 49, 60 46 L 58 36 Z" fill="#fff" />
      {/* Eye sockets & nose */}
      <circle cx="45" cy="32" r="3" fill="#000" />
      <circle cx="55" cy="32" r="3" fill="#000" />
      <path d="M 50 35 L 48 39 L 52 39 Z" fill="#000" />
      {/* Teeth details */}
      <path d="M 44 42 L 44 46 M 48 42 L 48 46 M 52 42 L 52 46 M 56 42 L 56 46" stroke="#000" strokeWidth="1.5" />
      {/* Rose Crown */}
      <g fill="#d90429">
        <circle cx="38" cy="22" r="4.5" />
        <circle cx="44" cy="20" r="5" />
        <circle cx="50" cy="19" r="5.5" />
        <circle cx="56" cy="20" r="5" />
        <circle cx="62" cy="22" r="4.5" />
      </g>
      <g fill="#2d6a4f">
        <path d="M 33 24 L 36 21 L 34 26 M 67 24 L 64 21 L 66 26" />
      </g>
    </svg>
  );
}

// --- Rose Vines Left Side Border ---
export function VineBorderLeft({ className = "vine-svg" }) {
  return (
    <svg viewBox="0 0 40 400" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Vine stem */}
      <path d="M 20 0 Q 30 50 15 100 Q 5 150 25 200 Q 35 250 15 300 Q 5 350 20 400" fill="none" stroke="#2d6a4f" strokeWidth="3" />
      {/* Leaves */}
      <path d="M 20 40 Q 30 35 28 45 Z" fill="#2d6a4f" />
      <path d="M 17 80 Q 5 85 8 75 Z" fill="#2d6a4f" />
      <path d="M 22 140 Q 35 145 32 135 Z" fill="#2d6a4f" />
      <path d="M 12 230 Q 0 225 3 235 Z" fill="#2d6a4f" />
      <path d="M 25 280 Q 35 275 33 285 Z" fill="#2d6a4f" />
      <path d="M 15 340 Q 3 345 5 335 Z" fill="#2d6a4f" />
      {/* Red Roses */}
      <circle cx="20" cy="60" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
      <circle cx="10" cy="160" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
      <circle cx="28" cy="250" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
      <circle cx="12" cy="360" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
    </svg>
  );
}

// --- Rose Vines Right Side Border ---
export function VineBorderRight({ className = "vine-svg" }) {
  return (
    <svg viewBox="0 0 40 400" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Vine stem */}
      <path d="M 20 0 Q 10 50 25 100 Q 35 150 15 200 Q 5 250 25 300 Q 35 350 20 400" fill="none" stroke="#2d6a4f" strokeWidth="3" />
      {/* Leaves */}
      <path d="M 20 40 Q 10 35 12 45 Z" fill="#2d6a4f" />
      <path d="M 23 80 Q 35 85 32 75 Z" fill="#2d6a4f" />
      <path d="M 18 140 Q 5 145 8 135 Z" fill="#2d6a4f" />
      <path d="M 28 230 Q 40 225 37 235 Z" fill="#2d6a4f" />
      <path d="M 15 280 Q 5 275 7 285 Z" fill="#2d6a4f" />
      <path d="M 25 340 Q 37 345 35 335 Z" fill="#2d6a4f" />
      {/* Red Roses */}
      <circle cx="20" cy="60" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
      <circle cx="30" cy="160" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
      <circle cx="12" cy="250" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
      <circle cx="28" cy="360" r="6" fill="#d90429" stroke="#900" strokeWidth="1" />
    </svg>
  );
}
