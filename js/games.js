/* XP System */
function addXP(n){
  let xp = +(localStorage.getItem("moodXP")||0);
  xp += n;
  localStorage.setItem("moodXP", xp);
  logReward(`+${n} XP`);
}
function logReward(txt){
  const box = document.getElementById("rewards");
  const d = document.createElement("div");
  d.textContent = txt;
  box.prepend(d);
  setTimeout(()=>d.remove(),4000);
}

/* 1️⃣ Tap Stress Ball */
(() => {
  const bubble = document.getElementById("tapBubble");
  const start = document.getElementById("tapStart");
  const scoreEl = document.getElementById("tapScore");
  let score = 0, run = false, timer;

  start.onclick = () => {
    run = true; score = 0; scoreEl.textContent = 0;
    bubble.textContent = "😣";
    timer = setTimeout(()=>{
      run = false;
      bubble.textContent = "😊";
      addXP(score*2);
    },4000);
  };

  bubble.onclick = () => {
    if(!run) return;
    score++; scoreEl.textContent = score;
    bubble.style.transform="scale(0.85)";
    setTimeout(()=>bubble.style.transform="scale(1)",120);
  };
})();

/* 2️⃣ Memory Flip */
(() => {
  const stage = document.getElementById("memoryStage");
  const btn = document.getElementById("memStart");
  const info = document.getElementById("memInfo");
  const icons = ['🌸','💖','🐰','🎵','✨','🍓','🍰','⭐'];
  let opened = [], matches = 0;

  function newGame(){
    stage.innerHTML="";
    matches=0; info.textContent="0 Matches";
    let set = icons.slice(0,6);
    let deck = set.concat(set).sort(()=>Math.random()-0.5);

    deck.forEach((ico)=>{
      const c = document.createElement("button");
      c.className="mem-card";
      c.textContent="❓";
      c.dataset.ico = ico;
      c.onclick = () => flip(c);
      stage.appendChild(c);
    });
  }

  function flip(el){
    if(el.classList.contains("done") || opened.includes(el)) return;
    el.textContent = el.dataset.ico;
    opened.push(el);
    if(opened.length===2){
      if(opened[0].dataset.ico===opened[1].dataset.ico){
        opened.forEach(x=>{ x.classList.add("done"); x.disabled=true; });
        matches++; info.textContent = matches + " Matches";
        if(matches===6) addXP(20);
      } else {
        setTimeout(()=>opened.forEach(x=>x.textContent="❓"),600);
      }
      opened=[];
    }
  }

  btn.onclick = newGame;
  newGame();
})();

/* 3️⃣ Zen Bubble Garden */
let zenTimer;
let zenScore = 0;
const zenStage = document.getElementById("zenStage");

function spawnZen(){
  const b = document.createElement("div");
  b.className="zen-bubble";
  b.textContent="✨";
  b.style.left=Math.random()*(zenStage.clientWidth-60)+"px";
  b.style.bottom="-60px";
  zenStage.appendChild(b);

  let y = -60;
  let rise = setInterval(()=>{
    y += 1.2;
    b.style.bottom = y+"px";
    if(y > zenStage.clientHeight){
      clearInterval(rise);
      b.remove();
    }
  },16);

  b.onclick = () => {
    zenScore++;
    document.getElementById("zenScore").textContent = zenScore;
    b.classList.add("popAnime");
    setTimeout(()=>{clearInterval(rise);b.remove();},250);
  };
}

document.getElementById("zenStart").onclick = () => {
  zenScore=0; document.getElementById("zenScore").textContent=0;
  zenTimer=setInterval(spawnZen,1100);
};
document.getElementById("zenStop").onclick = () => clearInterval(zenTimer);

/* 4️⃣ Kawaii Slime Stretch — now with sound + wiggle anime */
(() => {
  const slime = document.getElementById("slime");
  const face = document.getElementById("slimeFace");
  const scoreEl = document.getElementById("slimeScore");

  let score = 0;

  const squishSound = new Audio("../assets/sounds/slime-pop1.mp3");
  const squishSound2 = new Audio("../assets/sounds/slime-pop2.mp3");
  const wiggleSound = new Audio("../assets/sounds/slime-wiggle.mp3");
  const sparkleSound = new Audio("../assets/sounds/sparkle-chime.mp3");

  function playRandomPop(){
    if(Math.random() > 0.5) squishSound.play();
    else squishSound2.play();
  }

  function playWiggle(){
    wiggleSound.currentTime = 0;
    wiggleSound.play();
  }

  function sparklePing(){
    sparkleSound.currentTime=0;
    sparkleSound.play();
  }

  slime.onmousedown = slime.ontouchstart = () => stretch();
  slime.onmouseup = slime.ontouchend = () => reset();

  function stretch(){
    score++;
    scoreEl.textContent = score;

    playRandomPop();
    if(score % 6 === 0) sparklePing();

    slime.style.transform = "scale(1.45,0.78) rotate(-2deg)";
    face.textContent = "(๑>ᴗ<๑)";

    // wiggle micro-animation
    slime.animate(
      [
        { transform: "scale(1.45,0.78) rotate(-2deg)" },
        { transform: "scale(1.5,0.75) rotate(2deg)" },
        { transform: "scale(1.45,0.78) rotate(-2deg)" }
      ],
      { duration: 180, easing: "ease-in-out" }
    );

    // sparkles
    const s = document.createElement("div");
    s.className = "sparkle";
    s.textContent = ["✨","💖","🌸"][Math.floor(Math.random()*3)];
    s.style.top = Math.random()*90+"px";
    s.style.left = Math.random()*140+"px";
    slime.appendChild(s);
    setTimeout(()=>s.remove(),600);

    if(score % 10 === 0) addXP(2);
  }

  function reset(){
    playWiggle();
    slime.style.transform = "scale(1) rotate(0deg)";
    face.textContent = "(◕‿◕✿)";

    // bounce anim
    slime.animate(
      [
        { transform: "scale(1.1,0.9)" },
        { transform: "scale(0.95,1.08)" },
        { transform: "scale(1)" }
      ],
      { duration: 300, easing: "ease-out" }
    );
  }
})();