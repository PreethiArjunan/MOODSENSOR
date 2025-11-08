import { musicLibrary } from "./music-data.js";

let audio = new Audio();
let currentMood = "happy";
let index = 0;

export function loadTrack(mood, i = 0) {
  currentMood = mood;
  index = i;

  const track = musicLibrary[mood][i];

  audio.src = track.file;
  audio.load();

  // pass metadata
  audio._title = track.title;
  audio._cover = track.cover;
  audio._mood = mood;
}

export function playTrack() {
  audio.play();
}

export function pauseTrack() {
  audio.pause();
}

export function nextTrack() {
  index = (index + 1) % musicLibrary[currentMood].length;
  loadTrack(currentMood, index);
  playTrack();
}

export function prevTrack() {
  index = (index - 1 + musicLibrary[currentMood].length) % musicLibrary[currentMood].length;
  loadTrack(currentMood, index);
  playTrack();
}

export function getAudio() {
  return audio;
}