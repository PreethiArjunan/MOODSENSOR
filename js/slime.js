let dragging = false;
let startY = 0;
let stretch = 0;
let velocity = 0;
let face = document.getElementById("slimeFace");
let slimeEl = document.getElementById("slime");

const squish = new Audio("../assets/sfx/slime.mp3");

function updateSlime() {
  slimeEl.style.transform =
    `scale(${1 + stretch / 120}) translateY(${stretch/2}px)`;

  slimeBar.style.width = stretch + "%";
  slimePercent.textContent = Math.floor(stretch) + "%";

  // Face change
  if (stretch > 85) face.textContent = "😵‍💫✨";
  else if (stretch > 55) face.textContent = "🥹💖";
  else if (stretch > 20) face.textContent = "😊";
  else face.textContent = "🥺";
}

function elasticStep() {
  if (!dragging) {
    velocity -= stretch * 0.1; // pull back force
    stretch += velocity;
    velocity *= 0.85; // damping

    if (stretch < 0) stretch = 0;
    if (Math.abs(velocity) < 0.1 && stretch < 1)
      stretch = 0;
  }

  updateSlime();
  requestAnimationFrame(elasticStep);
}
elasticStep();

slimeEl.onmousedown = e => {
  dragging = true;
  startY = e.clientY;
  squish.currentTime = 0;
  squish.play();
};

document.onmouseup = () => {
  if (stretch > 80) {
    reward("+8 XP");
    face.textContent = "✨😮‍💨";
  }
  dragging = false;
};

document.onmousemove = e => {
  if (!dragging) return;

  let dy = e.clientY - startY;
  stretch = Math.max(0, Math.min(100, dy / 2));
  updateSlime();
};