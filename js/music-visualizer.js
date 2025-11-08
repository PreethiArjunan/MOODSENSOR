import { audio } from "./music-engine.js";

const canvas = document.getElementById("musicCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 200;

// Setup analyzer
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 128;

let source;
function connectAudio() {
  if (source) source.disconnect();
  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
}

export function startVisualizer() {
  connectAudio();

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function animate() {
    requestAnimationFrame(animate);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = 6;
    const gap = 4;
    let x = (canvas.width - dataArray.length * (barWidth + gap)) / 2;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] * 1.1;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#ff73fa");
      gradient.addColorStop(1, "#6e4afd");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "#ff87ff";
      ctx.shadowBlur = 18;

      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + gap;
    }
  }

  animate();
}

document.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
});