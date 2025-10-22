// Matrix-style code rain and UI behaviors + synthesized ambient sound
(() => {
  // Canvas matrix
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const COL_W = 14;
  let cols = Math.floor(w / COL_W) + 1;
  let ypos = Array(cols).fill(0);

  // Glyph sets (customizable)
  const glyphSets = {
    katakana: 'アァカサタナハマヤャラワンクスツヌフムユョロ0123456789',
    ascii: '!@#$%^&*(){}[]<>/?\\|~+=-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    runes: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᛁᛃᛈᛇᛈᛉ0123456789'
  };
  let glyphSetName = 'katakana';
  let letters = glyphSets[glyphSetName];

  function draw() {
    // fade background
    ctx.fillStyle = 'rgba(13,2,8,0.15)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#00ff41';
    ctx.font = '14px "JetBrains Mono", monospace';
    for (let i = 0; i < ypos.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      const x = i * COL_W;
      ctx.fillText(text, x, ypos[i] * 14);
      if (ypos[i] * 14 > h && Math.random() > 0.975) ypos[i] = 0;
      ypos[i]++;
    }
  }
  let anim;
  function loop() { draw(); anim = requestAnimationFrame(loop); }
  loop();

  addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    cols = Math.floor(w / COL_W) + 1;
    ypos = Array(cols).fill(0);
  });

  // Typewriter effect for .typewriter elements
  document.querySelectorAll('.typewriter').forEach(el => {
    const text = el.dataset.text || el.textContent;
    el.textContent = '';
    let i = 0;
    function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, 28);
      }
    }
    step();
  });

  // Number counters on finance page
  function animateNumbers() {
    document.querySelectorAll('.numbers [data-target]').forEach(el => {
      const target = +el.getAttribute('data-target');
      const duration = 1600;
      const startTime = performance.now();
      function tick(now) {
        const elapsed = now - startTime;
        const pct = Math.min(elapsed / duration, 1);
        const current = Math.floor(pct * target);
        el.textContent = '$' + current.toLocaleString();
        if (pct < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if (location.pathname.includes('finance.html')) {
    setTimeout(animateNumbers, 600);
  }

  // Audio: synthesized ambient hum + glitch percussive elements
  let audioCtx, master, glitchGain;
  let playing = true;
  function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    master = audioCtx.createGain();
    master.gain.value = 0.12;
    master.connect(audioCtx.destination);

    // Hum: two detuned sawtooth oscillators lowpass
    const o1 = audioCtx.createOscillator();
    o1.type = 'sawtooth';
    o1.frequency.value = 50;
    const o2 = audioCtx.createOscillator();
    o2.type = 'sawtooth';
    o2.frequency.value = 50.6;
    const mix = audioCtx.createGain(); mix.gain.value = 0.6;
    o1.connect(mix); o2.connect(mix);

    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
    mix.connect(lp);

    // slow pulsing LFO to filter cutoff
    const lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.05;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    lp.connect(master);

    o1.start(); o2.start(); lfo.start();

    // occasional glitch percussive element
    glitchGain = audioCtx.createGain(); glitchGain.gain.value = 0;
    const bi = audioCtx.createBiquadFilter(); bi.type='bandpass'; bi.frequency.value = 1200;
    const noise = audioCtx.createBufferSource();
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 1, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*0.5;
    noise.buffer = buffer; noise.loop = true; noise.connect(bi); bi.connect(glitchGain); glitchGain.connect(master);
    noise.start(0);

    // occasionally trigger quick glitch bumps
    setInterval(()=>{
      glitchGain.gain.cancelScheduledValues(audioCtx.currentTime);
      glitchGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
      glitchGain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 0.01);
      glitchGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    }, 4200 + Math.random()*6000);

    // store nodes to stop later if needed
  }

  // Sound toggle button
  const toggle = document.getElementById('sound-toggle');
  if (toggle) {
    toggle.addEventListener('click', async () => {
      if (!audioCtx) initAudio();
      if (audioCtx.state === 'suspended') { await audioCtx.resume(); playing = true; toggle.textContent = 'Sound: ON'; return; }
      if (playing) {
        master.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.6);
        playing = false; toggle.textContent = 'Sound: OFF';
      } else {
        master.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.6);
        playing = true; toggle.textContent = 'Sound: ON';
      }
    });
  }

  // Autoplay attempt on first click
  document.addEventListener('click', function one() {
    if (!audioCtx) initAudio();
    document.removeEventListener('click', one);
  });

  // small UX: stop canvas on hidden to save CPU
  document.addEventListener('visibilitychange', ()=>{ if (document.hidden) cancelAnimationFrame(anim); else loop(); });

  // Theme selector: switch CSS variable themes quickly
  const themeSelect = document.getElementById('theme-select');
  const glyphSelect = document.getElementById('glyph-select');

  function applyTheme(name) {
    document.documentElement.classList.remove('theme-matrix','theme-cyber','theme-violet');
    if (name === 'matrix') document.documentElement.classList.add('theme-matrix');
    if (name === 'cyber') document.documentElement.classList.add('theme-cyber');
    if (name === 'violet') document.documentElement.classList.add('theme-violet');
  }
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
    // set initial
    applyTheme(themeSelect.value || 'matrix');
  }

  if (glyphSelect) {
    glyphSelect.addEventListener('change', (e) => {
      glyphSetName = e.target.value;
      letters = glyphSets[glyphSetName] || glyphSets.katakana;
    });
    // set initial
    letters = glyphSets[glyphSelect.value || 'katakana'];
  }

  // Enable theme + glyph state if coming back to pages (basic)
  window.addEventListener('load', ()=>{
    if (themeSelect) applyTheme(themeSelect.value || 'matrix');
    if (glyphSelect) { glyphSetName = glyphSelect.value || 'katakana'; letters = glyphSets[glyphSetName]; }
  });

})();
