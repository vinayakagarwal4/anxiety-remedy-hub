// Anxiety Remedy Hub interactions

function setYear() {
  var el = document.getElementById('year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

function validateEmail(email) {
  // Simple, pragmatic email check
  var re = /.+@.+\..+/;
  return re.test(String(email).toLowerCase());
}

function handleContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var note = form.querySelector('.form-note');
  function setNote(text, isError) {
    if (note) {
      note.textContent = text || '';
      note.style.color = isError ? '#e53e3e' : '';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('name');
    var email = document.getElementById('email');
    var phone = document.getElementById('phone');
    var message = document.getElementById('message');
    var consent = document.getElementById('consent');

    // Reset validity UI
    [name, email, phone, message].forEach(function (field) {
      if (field) field.setAttribute('aria-invalid', 'false');
    });

    // Basic validation
    var errors = [];
    if (!name.value.trim()) {
      name.setAttribute('aria-invalid', 'true');
      errors.push('Please enter your name.');
    }
    if (!validateEmail(email.value)) {
      email.setAttribute('aria-invalid', 'true');
      errors.push('Please enter a valid email.');
    }
    if (!message.value.trim()) {
      message.setAttribute('aria-invalid', 'true');
      errors.push('Please enter a message.');
    }
    if (!consent.checked) {
      errors.push('Please consent to be contacted.');
    }

    if (errors.length) {
      setNote(errors.join(' '), true);
      return;
    }

    // Construct a mailto link
    var to = 'sagarwalfms@gmail.com';
    var subject = 'New Inquiry from ' + name.value.trim();
    var bodyLines = [
      'Name: ' + name.value.trim(),
      'Email: ' + email.value.trim(),
      phone.value.trim() ? 'Phone: ' + phone.value.trim() : null,
      '',
      'Message:',
      message.value.trim()
    ].filter(Boolean);

    var mailto = 'mailto:' + encodeURIComponent(to) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(bodyLines.join('\n'));

    setNote('Opening your email app… If it does not open, click "Email directly".', false);

    // Trigger the email client
    window.location.href = mailto;

    // Give a small delay and then reset to keep the form tidy
    setTimeout(function () {
      form.reset();
    }, 600);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setYear();
  handleContactForm();
  setupImageFallback();
  setupScrollReveal();
  setupBreathingGame();
  setupVisitCounter();
});

function setupImageFallback() {
  var img = document.querySelector('.founder-photo');
  var fallback = document.querySelector('.founder-card[data-fallback]');
  if (!img || !fallback) return;
  function showFallback() {
    fallback.style.display = 'grid';
    img.style.display = 'none';
  }
  // If image fails to load, show the fallback card
  img.addEventListener('error', showFallback, { once: true });
  // If image not present or source missing
  if (!img.getAttribute('src')) showFallback();
}

function setupScrollReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  els.forEach(function (el) { io.observe(el); });
}

function setupBreathingGame() {
  var startBtn = document.getElementById('start-breathing');
  var resetBtn = document.getElementById('reset-breathing');
  var pauseBtn = document.getElementById('pause-breathing');
  var bubble = document.querySelector('.breathing-bubble');
  var progress = document.querySelector('.breathing-progress');
  var label = document.getElementById('breathing-label');
  var techniqueSelect = document.getElementById('technique');
  var status = document.getElementById('breathing-status');
  var cycleCount = document.getElementById('cycle-count');
  var durationRange = document.getElementById('duration');
  var durationDisplay = document.getElementById('duration-display');
  var soundToggle = document.getElementById('sound-toggle');

  if (!startBtn || !resetBtn || !bubble || !label) return;

  var timer = null;
  var rafId = null;
  var running = false;
  var cycles = 0;
  var sessionEndTime = 0;

  function setStatus(text) { if (status) status.textContent = text; }
  function setLabel(text) { if (label) label.textContent = text; }
  function setSize(scale) {
    bubble.style.transform = 'scale(' + scale + ')';
    bubble.style.transition = 'transform 1200ms cubic-bezier(.2,.8,.2,1)';
  }
  function setCycleCount(n) { if (cycleCount) cycleCount.textContent = String(n); }
  function setProgress(p) { if (progress) progress.style.setProperty('--progress', Math.max(0, Math.min(100, p)) + '%'); }
  function now() { return (typeof performance !== 'undefined' ? performance.now() : Date.now()); }

  // Audio cues
  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }
  function beep(freq) {
    if (!soundToggle || !soundToggle.checked) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq || 660;
    g.gain.value = 0.08;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.12);
  }

  var patterns = {
    box: [
      { phase: 'Inhale', seconds: 4, scale: 1.15 },
      { phase: 'Hold', seconds: 4, scale: 1.15 },
      { phase: 'Exhale', seconds: 4, scale: 0.9 },
      { phase: 'Hold', seconds: 4, scale: 0.9 }
    ],
    fourSevenEight: [
      { phase: 'Inhale', seconds: 4, scale: 1.15 },
      { phase: 'Hold', seconds: 7, scale: 1.15 },
      { phase: 'Exhale', seconds: 8, scale: 0.85 }
    ]
  };

  function runCycle(patternKey) {
    var pattern = patterns[patternKey] || patterns.box;
    var index = 0;
    var segmentStart = 0;
    var segmentMs = 0;
    function animate() {
      if (!running) return;
      var elapsed = now() - segmentStart;
      var p = Math.min(1, segmentMs ? (elapsed / segmentMs) : 0);
      setProgress(p * 100);
      rafId = requestAnimationFrame(animate);
    }
    function step() {
      if (!running) return;
      var seg = pattern[index];
      setLabel(seg.phase);
      setStatus(seg.seconds + 's…');
      setSize(seg.scale);
      // Audio cue per phase
      if (seg.phase === 'Inhale') beep(660);
      else if (seg.phase === 'Hold') beep(520);
      else if (seg.phase === 'Exhale') beep(420);

      segmentStart = now();
      segmentMs = seg.seconds * 1000;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);

      var remainingSession = sessionEndTime - Date.now();
      var runFor = Math.min(seg.seconds * 1000, Math.max(0, remainingSession));
      if (runFor <= 0) {
        complete();
        return;
      }
      timer = setTimeout(function () {
        index = (index + 1) % pattern.length;
        if (index === 0) {
          cycles += 1;
          setCycleCount(cycles);
        }
        // If session ended, stop
        if (Date.now() >= sessionEndTime) {
          complete();
        } else {
          step();
        }
      }, runFor);
    }
    step();
  }

  function start() {
    if (running) return;
    running = true;
    cycles = 0;
    setCycleCount(cycles);
    setStatus('Starting…');
    var minutes = durationRange ? parseInt(durationRange.value, 10) || 3 : 3;
    sessionEndTime = Date.now() + (minutes * 60 * 1000);
    runCycle(techniqueSelect ? techniqueSelect.value : 'box');
    if (pauseBtn) pauseBtn.textContent = 'Pause';
  }
  function reset() {
    running = false;
    if (timer) clearTimeout(timer);
    if (rafId) cancelAnimationFrame(rafId);
    setLabel('Ready');
    setStatus('');
    setSize(1);
    setProgress(0);
    if (pauseBtn) pauseBtn.textContent = 'Pause';
  }
  function complete() {
    running = false;
    if (timer) clearTimeout(timer);
    if (rafId) cancelAnimationFrame(rafId);
    setLabel('Done');
    setStatus('Session complete');
    setSize(1);
    setProgress(100);
    beep(760);
  }

  startBtn.addEventListener('click', start);
  resetBtn.addEventListener('click', reset);
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      if (running) {
        running = false;
        if (timer) clearTimeout(timer);
        if (rafId) cancelAnimationFrame(rafId);
        setStatus('Paused');
        if (pauseBtn) pauseBtn.textContent = 'Resume';
      } else {
        start();
      }
    });
  }

  // Duration display update
  if (durationRange && durationDisplay) {
    var updateDuration = function () {
      var minutes = parseInt(durationRange.value, 10) || 3;
      durationDisplay.textContent = minutes + ' min';
    };
    durationRange.addEventListener('input', updateDuration);
    updateDuration();
  }

  // Spacebar to pause/resume or start
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space') return;
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return;
    e.preventDefault();
    if (running) {
      if (pauseBtn) pauseBtn.click();
    } else {
      start();
    }
  });
}


function setupVisitCounter() {
  try {
    var el = document.getElementById('visit-counter');
    if (!el) return;
    var KEY = 'arh-visit-date';
    var today = new Date().toISOString().slice(0, 10);
    function setCount(n) { el.textContent = 'Visitors: ' + n; }
    fetch('/api/visits').then(function (r) { return r.json(); }).then(function (d) {
      setCount((d && d.count) || 0);
    }).catch(function () { /* ignore */ });
    var last = null;
    try { last = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
    if (last !== today) {
      fetch('/api/visits', { method: 'POST' })
        .then(function (r) { return r.json(); })
        .then(function (d) { setCount((d && d.count) || 0); try { localStorage.setItem(KEY, today); } catch (e) {} })
        .catch(function () { /* ignore */ });
    }
  } catch (e) { /* ignore */ }
}


