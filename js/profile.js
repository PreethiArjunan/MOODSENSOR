// profile.js — stores profileName, avatar (dataURL), streak, XP, badges into localStorage

const KEY_NAME = 'profileName';
const KEY_AVATAR = 'profileAvatar';
const KEY_BIO = 'profileBio';
const KEY_XP = 'moodXP';
const KEY_STREAK = 'moodStreak';
const KEY_GAMES = 'gamesPlayed';
const KEY_BADGES = 'badges';

const avatarImg = document.getElementById('avatarImg');
const displayName = document.getElementById('displayName');
const saveNameBtn = document.getElementById('saveName');
const uploadBtn = document.getElementById('uploadAvatar');
const avatarFile = document.getElementById('avatarFile');
const bioInput = document.getElementById('bio');
const saveBio = document.getElementById('saveBio');
const resetBtn = document.getElementById('resetProfile');
const xpNum = document.getElementById('xpNum');
const streakNum = document.getElementById('streakNum');
const gamesPlayed = document.getElementById('gamesPlayed');
const badgesWrap = document.getElementById('badges');
const exportProfile = document.getElementById('exportProfile');
const glitter = document.getElementById('glitter');

function loadProfile(){
  const name = localStorage.getItem(KEY_NAME) || '♡ USER A ♡';
  displayName.value = name;
  document.getElementById('profileName') && (document.getElementById('profileName').textContent = name);

  const avatar = localStorage.getItem(KEY_AVATAR);
  if(avatar) avatarImg.src = avatar;
  else avatarImg.src = pixelBunnySVG(); // default

  bioInput.value = localStorage.getItem(KEY_BIO) || '';

  xpNum.textContent = localStorage.getItem(KEY_XP) || 0;
  streakNum.textContent = localStorage.getItem(KEY_STREAK) || 0;
  gamesPlayed.textContent = localStorage.getItem(KEY_GAMES) || 0;
  renderBadges();
  spawnGlitter(); // start glitter background
}

function pixelBunnySVG(){
  // tiny pixel-art style bunny placeholder as data URL (simple SVG)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'>
  <rect width='100%' height='100%' fill='#fff1f6' rx='20'/>
  <g transform='translate(40,20) scale(1.2)'>
    <rect x='20' y='20' width='40' height='40' fill='#ffd6ea' />
    <rect x='60' y='20' width='40' height='60' fill='#fff' />
  </g>
  <text x='20' y='200' font-size='18' fill='#b86d9b'>♡ USER A ♡</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

saveNameBtn.addEventListener('click', ()=>{
  const v = displayName.value.trim() || '♡ USER A ♡';
  localStorage.setItem(KEY_NAME, v);
  document.getElementById('profileName') && (document.getElementById('profileName').textContent = v);
  alert('Profile name saved 💖');
});

uploadBtn.addEventListener('click', ()=> avatarFile.click());
avatarFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const data = reader.result;
    avatarImg.src = data;
    localStorage.setItem(KEY_AVATAR, data);
    alert('Avatar saved ✨');
  };
  reader.readAsDataURL(f);
});

saveBio.addEventListener('click', ()=>{
  localStorage.setItem(KEY_BIO, bioInput.value || '');
  alert('Bio saved 💌');
});

resetBtn.addEventListener('click', ()=>{
  if(!confirm('Reset profile?')) return;
  localStorage.removeItem(KEY_NAME);
  localStorage.removeItem(KEY_AVATAR);
  localStorage.removeItem(KEY_BIO);
  localStorage.removeItem(KEY_XP);
  localStorage.removeItem(KEY_STREAK);
  localStorage.removeItem(KEY_GAMES);
  localStorage.removeItem(KEY_BADGES);
  loadProfile();
  alert('Profile reset');
});

function renderBadges(){
  const raw = localStorage.getItem(KEY_BADGES);
  const arr = raw ? JSON.parse(raw) : [];
  badgesWrap.innerHTML = '';
  if(arr.length===0){
    badgesWrap.innerHTML = `<div class="muted">No badges yet — play games to earn 🌸</div>`;
    return;
  }
  arr.forEach(b=>{
    const node = document.createElement('div');
    node.className = 'badge';
    node.textContent = b;
    badgesWrap.appendChild(node);
  });
}

exportProfile.addEventListener('click', ()=>{
  // simple export of profile card as PNG using html2canvas if available
  import('https://html2canvas.hertzen.com/dist/html2canvas.min.js').then(() => {
    html2canvas(document.querySelector('.card')).then(canvas => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = (localStorage.getItem(KEY_NAME)||'profile') + '_card.png';
      a.click();
    });
  }).catch(()=> alert('Share not available'));
});

/* glitter spawner */
function spawnGlitter(){
  const wrap = glitter;
  wrap.innerHTML = '';
  for(let i=0;i<26;i++){
    const el = document.createElement('i');
    el.style.left = (Math.random()*100)+'%';
    el.style.top = (Math.random()*100)+'%';
    el.style.opacity = (0.5 + Math.random()*0.6);
    el.style.transform = `translateY(${20+Math.random()*40}px)`;
    el.style.animationDuration = (4 + Math.random()*6) + 's';
    wrap.appendChild(el);
  }
}

/* small XP / streak updater used by games */
window._addXP = function(xp){
  const cur = parseInt(localStorage.getItem(KEY_XP)||'0',10);
  localStorage.setItem(KEY_XP, cur + xp);
  xpNum.textContent = cur + xp;
  // add badge for milestones
  const badges = JSON.parse(localStorage.getItem(KEY_BADGES)||'[]');
  if(cur + xp >= 50 && !badges.includes('Blossom 50 XP')) {
    badges.push('Blossom 50 XP');
    localStorage.setItem(KEY_BADGES, JSON.stringify(badges));
    renderBadges();
    alert('Badge earned: Blossom 50 XP 🌸');
  }
};

window._incGamesPlayed = function(){
  const cur = parseInt(localStorage.getItem(KEY_GAMES)||'0',10);
  localStorage.setItem(KEY_GAMES, cur + 1);
  gamesPlayed.textContent = cur + 1;
};

loadProfile();