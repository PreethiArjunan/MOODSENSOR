// visualizer.js
// Exposes Visualizer class that takes an <audio> element and a <canvas> and draws bars + waveform

(function(global){
  function Visualizer(audioEl, canvasEl){
    this.audio = audioEl;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
    this.timeArray = null;
    this.raf = null;
  }

  Visualizer.prototype.init = function(){
    if(this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.audioCtx.createMediaElementSource(this.audio);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.timeArray = new Uint8Array(this.analyser.fftSize);

    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.resize();
    window.addEventListener('resize', ()=> this.resize());
    this.draw();
  };

  Visualizer.prototype.resize = function(){
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  };

  Visualizer.prototype.draw = function(){
    const self = this;
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    function loop(){
      self.raf = requestAnimationFrame(loop);
      self.analyser.getByteFrequencyData(self.dataArray);
      self.analyser.getByteTimeDomainData(self.timeArray);

      // clear
      ctx.clearRect(0,0,w,h);

      // background soft gradient
      const g = ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'rgba(255,255,255,0.02)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

      // bars (frequency)
      const barCount = 48;
      const step = Math.floor(self.dataArray.length / barCount);
      const barW = (w / barCount) * 0.7;
      let x = (w - (barCount*(barW+4)))/2;
      for(let i=0;i<barCount;i++){
        let sum = 0;
        for(let j=0;j<step;j++) sum += self.dataArray[i*step + j];
        const v = sum/step;
        const bh = (v/255) * (h*0.6);
        // gradient fill
        const grad = ctx.createLinearGradient(0,h-bh,0,h);
        grad.addColorStop(0,'#ff66c7');
        grad.addColorStop(1,'#7b5cff');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, h - bh, barW, bh, 6);
        ctx.fill();
        x += barW + 6;
      }

      // waveform overlay (smooth)
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      const slice = self.timeArray.length / w;
      for(let i=0;i<w;i++){
        const v = self.timeArray[Math.floor(i*slice)] / 128.0;
        const y = (v * h)/2;
        if(i===0) ctx.moveTo(i,y);
        else ctx.lineTo(i,y);
      }
      ctx.stroke();
    }
    loop();
  };

  // helper for rounded rect
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y, x+w, y+h, r);
    this.arcTo(x+w, y+h, x, y+h, r);
    this.arcTo(x, y+h, x, y, r);
    this.arcTo(x, y, x+w, y, r);
    this.closePath();
    return this;
  };

  global.Visualizer = Visualizer;
})(window);