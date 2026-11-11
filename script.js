(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = $('#hero-video');
  const heroToggle = $('#hero-toggle');
  let heroRequested = !reducedMotion.matches;
  let heroVisible = true;
  let resumePair = false;

  function loadHero() { if (!hero.getAttribute('src')) hero.src = hero.dataset.src; }
  function updateHeroButton() {
    heroToggle.innerHTML = hero.paused ? '<span aria-hidden="true">▷</span><span class="motion-label">Play motion</span>' : '<span aria-hidden="true">Ⅱ</span><span class="motion-label">Pause motion</span>';
    heroToggle.setAttribute('aria-label', hero.paused ? 'Play background video' : 'Pause background video');
  }
  function manageHero() {
    if (heroRequested && heroVisible && !document.hidden) { loadHero(); hero.play().catch(updateHeroButton); }
    else hero.pause();
  }
  hero.addEventListener('play', updateHeroButton);
  hero.addEventListener('pause', updateHeroButton);
  heroToggle.addEventListener('click', () => { heroRequested = hero.paused; manageHero(); });
  reducedMotion.addEventListener('change', () => { heroRequested = !reducedMotion.matches; manageHero(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; manageHero(); }, { threshold: 0.05 }).observe($('#top'));
  } else manageHero();

  const menu = $('.menu-toggle');
  const navigation = $('#navigation');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open); });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });

  const cases = {
    tank: { prefix: 'tank', duration: 14, kind: 'NATIVE EFFECT INTERVENTION', label: 'Effect', caption: 'Shoot the tank → fire and smoke. Compare generated continuations with the native effect enabled and disabled.', accessible: 'tank fire effect' },
    vehicle: { prefix: 'vehicle', duration: 22, kind: 'CUSTOM RULE', label: 'Rule', caption: 'Enter the vehicle → emit smoke. The custom rule requests a smoke visual effect; it does not imply vehicle damage.', accessible: 'vehicle-entry smoke rule' }
  };
  const off = $('#video-off');
  const on = $('#video-on');
  const playButton = $('#pair-play');
  const seek = $('#pair-seek');
  const panel = $('#case-panel');
  let activeCase = cases.tank;
  let operation = 0;
  let playing = false;
  let requestedTime = 0;
  const format = (time) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
  function renderTime() { const t = off.currentTime || 0; seek.value = t; seek.setAttribute('aria-valuetext', `${t.toFixed(1)} of ${activeCase.duration} seconds`); $('#pair-time').textContent = `${format(t)} / ${format(activeCase.duration)}`; }
  function pausePair() { operation++; playing = false; off.pause(); on.pause(); playButton.innerHTML = '<span aria-hidden="true">▷</span> Play both'; }
  async function playPair() {
    const myOperation = ++operation;
    playing = true;
    playButton.innerHTML = '<span aria-hidden="true">Ⅱ</span> Pause both';
    $('#pair-message').textContent = '';
    try {
      await Promise.all([off.play(), on.play()]);
      if (myOperation !== operation) return;
      if (Math.abs(on.currentTime - off.currentTime) > 0.15) on.currentTime = off.currentTime;
    } catch (error) {
      if (myOperation !== operation) return;
      pausePair();
      if (error.name !== 'AbortError') $('#pair-message').textContent = 'Playback could not start. Please try again, or use the individual video links below.';
    }
  }
  playButton.addEventListener('click', () => { if (playing) pausePair(); else { if (off.ended || off.currentTime >= activeCase.duration - .15) { off.currentTime = 0; on.currentTime = 0; } playPair(); } });
  $('#pair-reset').addEventListener('click', () => { pausePair(); requestedTime = 0; off.currentTime = 0; on.currentTime = 0; renderTime(); });
  seek.addEventListener('input', () => { requestedTime = Number(seek.value); [off, on].forEach((v) => { if (v.readyState >= 1) v.currentTime = requestedTime; else v.load(); }); $('#pair-time').textContent = `${format(requestedTime)} / ${format(activeCase.duration)}`; seek.setAttribute('aria-valuetext', `${requestedTime.toFixed(1)} of ${activeCase.duration} seconds`); });
  [off, on].forEach((v) => {
    v.addEventListener('loadedmetadata', () => { if (requestedTime > 0) v.currentTime = Math.min(requestedTime, v.duration - .05); });
    v.addEventListener('error', () => { pausePair(); $('#pair-message').textContent = 'This video could not load. Try the individual video links below.'; });
    v.addEventListener('ended', pausePair);
  });
  off.addEventListener('timeupdate', () => { renderTime(); if (playing && on.readyState >= 2 && Math.abs(on.currentTime - off.currentTime) > .25) on.currentTime = off.currentTime; });
  const tabs = [...document.querySelectorAll('.case-tab')];
  function selectCase(tab) {
    pausePair();
    activeCase = cases[tab.dataset.case];
    requestedTime = 0;
    tabs.forEach((item) => { const selected = item === tab; item.classList.toggle('active', selected); item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tab.id);
    $('#case-kind').textContent = activeCase.kind;
    $('#case-duration').textContent = `${activeCase.duration} seconds`;
    $('#case-caption').textContent = activeCase.caption;
    $('#pair-message').textContent = '';
    [['off', off, 'disabled'], ['on', on, 'enabled']].forEach(([state, video, word]) => {
      const src = `assets/videos/${activeCase.prefix}-${state}.mp4`;
      video.poster = `assets/images/${activeCase.prefix}-${state}.webp`;
      video.src = src;
      video.setAttribute('aria-label', `Generated video with ${activeCase.accessible} ${word}`);
      video.load();
      $(`#${state}-label`).textContent = `${activeCase.label} ${word}`;
      $(`#${state}-link`).href = src;
    });
    seek.max = activeCase.duration;
    renderTime();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCase(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectCase(tabs[next]); tabs[next].focus(); }
    });
  });

  const walkthrough = $('#walkthrough-video');
  document.querySelectorAll('[data-time]').forEach((button) => button.addEventListener('click', () => {
    const jump = () => { walkthrough.currentTime = Number(button.dataset.time); walkthrough.play().catch(() => {}); };
    if (walkthrough.readyState >= 1) jump(); else { walkthrough.addEventListener('loadedmetadata', jump, { once: true }); walkthrough.load(); }
  }));
  walkthrough.addEventListener('timeupdate', () => {
    const buttons = [...document.querySelectorAll('[data-time]')];
    buttons.forEach((button, i) => button.classList.toggle('active', walkthrough.currentTime >= Number(button.dataset.time) && (!buttons[i + 1] || walkthrough.currentTime < Number(buttons[i + 1].dataset.time))));
  });
  document.addEventListener('visibilitychange', () => { manageHero(); if (document.hidden) { resumePair = playing; pausePair(); walkthrough.pause(); } else if (resumePair) { resumePair = false; playPair(); } });

  const dialog = $('#image-dialog');
  document.querySelectorAll('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
    $('#dialog-image').src = button.dataset.lightbox;
    $('#dialog-image').alt = button.querySelector('img').alt;
    $('#dialog-caption').textContent = button.dataset.caption;
    $('#dialog-download').href = button.dataset.lightbox;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });

  $('#copy-citation').addEventListener('click', async () => {
    const button = $('#copy-citation');
    const text = $('#bibtex').textContent.trim();
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const range = document.createRange(); range.selectNodeContents($('#bibtex'));
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
        selection.removeAllRanges();
      }
      button.textContent = 'Copied ✓'; $('#copy-message').textContent = 'BibTeX copied to clipboard.';
    } catch { button.textContent = 'Select text to copy'; $('#copy-message').textContent = 'Please select and copy the citation text.'; }
    setTimeout(() => { button.innerHTML = 'Copy BibTeX <span aria-hidden="true">⧉</span>'; }, 3000);
  });
})();
