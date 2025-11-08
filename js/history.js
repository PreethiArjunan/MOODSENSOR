/* history.js - Luxury Romance history page
   Expects: Chart.js + html2pdf bundle loaded in page
   Stores/reads from localStorage key "moodLogs" (array of {mood, note, ts, cover?})
   Supports ?demo=1 query for sample data
*/

const moods = [
  { id: 'happy', emoji: '😊', color: '#b7ffb1' },
  { id: 'sad', emoji: '😢', color: '#a8d4ff' },
  { id: 'chill', emoji: '😌', color: '#bff7ea' },
  { id: 'angry', emoji: '😡', color: '#ffb7b7' },
  { id: 'energetic', emoji: '🤩', color: '#ffd89b' },
  { id: 'love', emoji: '😍', color: '#f7c6d6' },
  { id: 'meh', emoji: '😐', color: '#cfcfcf' }
];

function qsel(id){ return document.getElementById(id); }

let barChart, donutChart;
const storageKey = 'moodLogs';

function readLogs(){
  const raw = localStorage.getItem(storageKey);
  try{
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    console.warn('bad logs', e);
    return [];
  }
}

function saveLogs(arr){
  localStorage.setItem(storageKey, JSON.stringify(arr));
}

function generateDemo(){
  // sample last-7 days palette (for preview)
  const sample = [
    { mood: 'happy', note:'Sun stroll', ts: Date.now()-6*86400000 },
    { mood: 'chill', note:'Coffee & book', ts: Date.now()-5*86400000 },
    { mood: 'happy', note:'Phone call', ts: Date.now()-4*86400000 },
    { mood: 'sad', note:'Tough meeting', ts: Date.now()-3*86400000 },
    { mood: 'energetic', note:'Gym spark', ts: Date.now()-2*86400000 },
    { mood: 'angry', note:'Traffic rage', ts: Date.now()-86400000 },
    { mood: 'love', note:'Lovely evening', ts: Date.now() }
  ];
  saveLogs(sample);
  return sample;
}

function mapCounts(logs){
  const counts = {};
  moods.forEach(m=>counts[m.id]=0);
  logs.forEach(l=>{
    if(counts[l.mood] !== undefined) counts[l.mood] += 1;
  });
  return counts;
}

function friendlyDate(ts){
  const d = new Date(ts);
  return d.toLocaleString();
}

/* Build charts */
function buildCharts(logs){
  const counts = mapCounts(logs);
  const labels = moods.map(m=>m.id);
  const values = moods.map(m=>counts[m.id] || 0);
  const colors = moods.map(m=>m.color);

  // BAR (vertical)
  const barCtx = qsel('barChart').getContext('2d');
  if(barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Mood frequency',
        data: values,
        backgroundColor: colors,
        borderRadius:8,
        barPercentage:0.6
      }]
    },
    options:{
      animation:{duration:900},
      plugins:{
        legend:{display:false},
        tooltip:{enabled:true}
      },
      scales:{
        y:{beginAtZero:true, ticks:{color:'#bdbdbf'}},
        x:{ticks:{color:'#bdbdbf'}}
      }
    }
  });

  // DONUT
  const donutCtx = qsel('donutChart').getContext('2d');
  if(donutChart) donutChart.destroy();
  donutChart = new Chart(donutCtx, {
    type: 'doughnut',
    data:{
      labels,
      datasets:[{
        data: values,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options:{
      cutout: '60%',
      animation:{duration:900},
      plugins:{
        legend:{display:false}
      }
    }
  });

  // legends
  const legendLeft = qsel('legendLeft'); legendLeft.innerHTML = '';
  const legendRight = qsel('legendRight'); legendRight.innerHTML = '';
  moods.forEach(m=>{
    const node = document.createElement('div');
    node.style.display='flex'; node.style.alignItems='center'; node.style.gap='8px';
    node.innerHTML = `<span class="dot" style="background:${m.color}"></span><small style="color:#d6d6da">${m.id}</small>`;
    legendLeft.appendChild(node.cloneNode(true));
    legendRight.appendChild(node.cloneNode(true));
  });
}

/* Render emoji timeline */
function renderTimeline(logs){
  const wrap = qsel('emojiTimeline'); wrap.innerHTML = '';
  // Use last 14 logs or all
  const view = logs.slice(-14);
  view.forEach((l, idx)=>{
    const moodDef = moods.find(m=>m.id===l.mood) || moods[0];
    const pill = document.createElement('div');
    pill.className = 'emoji-pill';
    pill.dataset.index = logs.indexOf(l); // store global index
    pill.innerHTML = `<div class="emoji">${moodDef.emoji}</div>`;
    pill.addEventListener('click',()=> {
      document.querySelectorAll('.emoji-pill').forEach(n=>n.classList.remove('selected'));
      pill.classList.add('selected');
      highlightMood(moodDef.id);
    });
    // tiny entrance animation
    pill.style.opacity = 0; pill.style.transform = 'translateY(6px)';
    wrap.appendChild(pill);
    setTimeout(()=>{ pill.style.transition='all .28s ease'; pill.style.opacity=1; pill.style.transform='translateY(0)'; }, 40 + idx*50);
  });
}

/* Recent logs list */
function renderRecent(logs){
  const list = qsel('recentList'); list.innerHTML = '';
  const rev = logs.slice().reverse();
  rev.forEach(l=>{
    const m = moods.find(x=>x.id===l.mood) || moods[0];
    const item = document.createElement('div'); item.className='recent-item';
    item.innerHTML = `<div class="left"><div class="emoji">${m.emoji}</div><div><strong style="display:block">${m.id}</strong><small class="muted">${l.note||''}</small></div></div><div class="muted">${friendlyDate(l.ts)}</div>`;
    list.appendChild(item);
  });
}

/* Highlight mood on charts */
function highlightMood(id){
  // set border styles on bar dataset to highlight which dataset index
  if(!barChart) return;
  const idx = moods.findIndex(m=>m.id===id);
  if(idx === -1) return;
  barChart.setDatasetVisibility(0, true);
  // create highlight array
  const bg = moods.map((m,i)=> i===idx ? '#fff1f6' : m.color );
  barChart.data.datasets[0].backgroundColor = bg;
  barChart.update();
}

/* Export PDF */
function exportPDF(){
  const page = document.querySelector('.page');
  const userName = localStorage.getItem('profileName') || 'You';
  const opt = {
    margin:       [0.5,0.4,0.5,0.4],
    filename:     `${userName}_mood_report.pdf`,
    image:        { type: 'jpeg', quality: 0.95 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  // small visual cue
  qsel('exportBtn').textContent = 'Generating...';
  setTimeout(()=>{
    html2pdf().set(opt).from(page).save().finally(()=> qsel('exportBtn').textContent = '📄 Export PDF');
  }, 120);
}

/* UI wiring for range */
function setupRangeButtons(){
  const week = qsel('weekBtn'), month = qsel('monthBtn'), all = qsel('allBtn');
  [week,month,all].forEach(b=>b.addEventListener('click',()=> {
    [week,month,all].forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    // for now we simply re-render with same data; future: filter by date
    loadAndRender();
  }));
}

function setProfileName(){
  const name = localStorage.getItem('profileName') || localStorage.getItem('userEmail') || 'Guest';
  qsel('profileName').textContent = name;
}

/* load + render main */
function loadAndRender(){
  let logs = readLogs();
  const params = new URLSearchParams(location.search);
  if(params.get('demo') === '1' && logs.length === 0){
    logs = generateDemo();
  }
  // sort by timestamp
  logs = logs.sort((a,b)=>a.ts - b.ts);
  if(!logs || logs.length === 0){
    // show no-data UX
    qsel('barChart').style.display = 'none';
    qsel('donutChart').style.display = 'none';
    qsel('emojiTimeline').innerHTML = '';
    qsel('recentList').innerHTML = `<div style="text-align:center;padding:36px;color:var(--muted)">No mood logs yet 🌙<br/>Start tracking your feelings to reveal your emotional universe ✨</div>`;
    return;
  }
  qsel('barChart').style.display = '';
  qsel('donutChart').style.display = '';
  buildCharts(logs);
  renderTimeline(logs);
  renderRecent(logs);
}

/* small helper to wire save from mood-test page (if you want to test) */
function addTestSave(){
  // for dev only - add random log
  window._addRandom = ()=>{
    const pick = moods[Math.floor(Math.random()*moods.length)];
    const logs = readLogs();
    logs.push({ mood: pick.id, note: 'quick test', ts: Date.now() });
    saveLogs(logs);
    loadAndRender();
  };
}

/* bootstrap */
window.addEventListener('DOMContentLoaded', ()=>{
  setProfileName();
  setupRangeButtons();
  qsel('exportBtn').addEventListener('click', exportPDF);

  // attach quick test key: press "T" to add demo mood (dev)
  document.addEventListener('keydown', (e)=> { if(e.key === 'T') window._addRandom && window._addRandom(); });

  loadAndRender();
  addTestSave();
});
