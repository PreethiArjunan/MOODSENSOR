// ✅ If mood came freshly from home page
let moodFromHome = localStorage.getItem("selectedMood");
if (moodFromHome) {
    localStorage.setItem("currentMood", moodFromHome);
    localStorage.removeItem("selectedMood");
}

import { loadTrack, playTrack, pauseTrack, nextTrack, prevTrack, getAudio } from "./music-engine.js";

const moods = ["happy", "sad", "chill", "angry", "love"];
let audio = getAudio();

const coverImg = document.getElementById("coverImg");
const songTitle = document.getElementById("songTitle");
const playBtn = document.getElementById("playBtn");
const vinyl = document.querySelector(".vinyl");

function updateUI() {
  coverImg.src = audio._cover;
  songTitle.textContent = audio._title;

  coverImg.onerror = () => {
    coverImg.src = audio._cover.replace(".jpg", ".jpeg");
  };
}

window.selectMood = (m) => {
  loadTrack(m, 0);
  playTrack();
  vinyl.classList.add("spin");
  playBtn.textContent = "⏸";
  updateUI();
};

window.togglePlay = () => {
  if (audio.paused) {
    playTrack();
    vinyl.classList.add("spin");
    playBtn.textContent = "⏸";
  } else {
    pauseTrack();
    vinyl.classList.remove("spin");
    playBtn.textContent = "▶️";
  }
};

window.nextTrack = () => {
  nextTrack();
  updateUI();
};

window.prevTrack = () => {
  prevTrack();
  updateUI();
};

// ✅ Get mood sent from home page OR last mood OR default happy
const mood = localStorage.getItem("currentMood") || "happy";

// ✅ Load mood songs
selectMood(mood);