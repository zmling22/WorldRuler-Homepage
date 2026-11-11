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

  const examples = window.WORLD_RULER_SHOWCASE;
  const cases = Object.fromEntries(examples.map((example) => [example.id, example]));
  const tabList = $('.case-tabs');
  tabList.replaceChildren(...examples.map((example, index) => {
    const tab = document.createElement('button');
    tab.type = 'button'; tab.className = 'case-tab'; tab.id = `tab-${example.id}`;
    tab.dataset.case = example.id; tab.dataset.category = example.category;
    tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', 'case-panel');
    tab.setAttribute('aria-selected', String(index === 0)); tab.tabIndex = index === 0 ? 0 : -1;
    tab.classList.toggle('active', index === 0);
    const number = document.createElement('span'); number.className = 'case-number';
    number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span'); title.textContent = example.title;
    tab.append(number, title);
    return tab;
  }));
  document.querySelectorAll('[data-count]').forEach((label) => {
    const count = label.dataset.count === 'all' ? examples.length : examples.filter((example) => example.category === label.dataset.count).length;
    label.textContent = count;
    label.closest('button').hidden = count === 0;
  });
  $('#sample-count').textContent = `${examples.length} selected examples`;
  const off = $('#video-off');
  const on = $('#video-on');
  const playButton = $('#pair-play');
  const seek = $('#pair-seek');
  const panel = $('#case-panel');
  let activeCase = examples[0];
  let operation = 0;
  let playing = false;
  let requestedTime = 0;
  const isSingle = () => activeCase.mode === 'single';
  const activeVideos = () => isSingle() ? [on] : [off, on];
  const primaryVideo = () => isSingle() ? on : off;
  const format = (time) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
  function renderPlayButton() { playButton.innerHTML = `<span aria-hidden="true">${playing ? 'Ⅱ' : '▷'}</span> ${playing ? 'Pause' : 'Play'} ${isSingle() ? 'video' : 'both'}`; }
  function renderTime() { const t = primaryVideo().currentTime || 0; seek.value = t; seek.setAttribute('aria-valuetext', `${t.toFixed(1)} of ${activeCase.duration} seconds`); $('#pair-time').textContent = `${format(t)} / ${format(activeCase.duration)}`; }
  function pausePair() { operation++; playing = false; off.pause(); on.pause(); renderPlayButton(); }
  async function playPair() {
    const myOperation = ++operation;
    playing = true;
    renderPlayButton();
    $('#pair-message').textContent = '';
    try {
      await Promise.all(activeVideos().map((video) => video.play()));
      if (myOperation !== operation) return;
      if (!isSingle() && Math.abs(on.currentTime - off.currentTime) > 0.15) on.currentTime = off.currentTime;
    } catch (error) {
      if (myOperation !== operation) return;
      pausePair();
      if (error.name !== 'AbortError') $('#pair-message').textContent = 'Playback could not start. Please try again, or use the individual video links below.';
    }
  }
  playButton.addEventListener('click', () => { if (playing) pausePair(); else { if (primaryVideo().ended || primaryVideo().currentTime >= activeCase.duration - .15) activeVideos().forEach((v) => { v.currentTime = 0; }); playPair(); } });
  $('#pair-reset').addEventListener('click', () => { pausePair(); requestedTime = 0; activeVideos().forEach((v) => { v.currentTime = 0; }); renderTime(); });
  seek.addEventListener('input', () => { requestedTime = Number(seek.value); activeVideos().forEach((v) => { if (v.readyState >= 1) v.currentTime = requestedTime; else v.load(); }); $('#pair-time').textContent = `${format(requestedTime)} / ${format(activeCase.duration)}`; seek.setAttribute('aria-valuetext', `${requestedTime.toFixed(1)} of ${activeCase.duration} seconds`); });
  [off, on].forEach((v) => {
    v.addEventListener('loadedmetadata', () => { if (requestedTime > 0) v.currentTime = Math.min(requestedTime, v.duration - .05); });
    v.addEventListener('error', () => { pausePair(); $('#pair-message').textContent = 'This video could not load. Try the individual video links below.'; });
    v.addEventListener('ended', pausePair);
    v.addEventListener('timeupdate', () => {
      if (v !== primaryVideo()) return;
      renderTime();
      if (!isSingle() && playing && on.readyState >= 2 && Math.abs(on.currentTime - off.currentTime) > .25) on.currentTime = off.currentTime;
    });
  });
  const tabs = [...document.querySelectorAll('.case-tab')];
  function selectCase(tab) {
    pausePair();
    activeCase = cases[tab.dataset.case];
    requestedTime = 0;
    renderPlayButton();
    $('.comparison-videos').classList.toggle('single-video', isSingle());
    off.closest('figure').hidden = isSingle();
    $('#off-link').hidden = isSingle();
    $('#pair-reset').setAttribute('aria-label', isSingle() ? 'Restart video' : 'Restart both comparison videos');
    $('.showcase-note').textContent = isSingle()
      ? 'Rule-enabled generated video from the training-free implementation. This is a single demonstration, not a paired comparison or a trained attribute-writer result.'
      : 'Both panels show generated video from the training-free implementation. These examples are not results of the trained attribute writer.';
    tabs.forEach((item) => { const selected = item === tab; item.classList.toggle('active', selected); item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tab.id);
    $('#case-title').textContent = activeCase.heading;
    $('#case-kind').textContent = activeCase.kind;
    $('#case-duration').textContent = `${activeCase.duration} seconds`;
    $('#case-caption').textContent = activeCase.caption;
    $('#pair-message').textContent = '';
    [['off', off, 'disabled'], ['on', on, 'enabled']].forEach(([state, video, word]) => {
      if (isSingle() && state === 'off') { video.removeAttribute('src'); video.load(); return; }
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
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectCase(tab));
    tab.addEventListener('keydown', (event) => {
      const visible = tabs.filter((item) => !item.hidden);
      const index = visible.indexOf(tab);
      let next;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % visible.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index + visible.length - 1) % visible.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = visible.length - 1;
      if (next !== undefined) { event.preventDefault(); selectCase(visible[next]); visible[next].focus(); }
    });
  });
  const filters = [...document.querySelectorAll('[data-filter]')];
  filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((item) => { const selected = item === filter; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
    tabs.forEach((tab) => { tab.hidden = filter.dataset.filter !== 'all' && tab.dataset.category !== filter.dataset.filter; });
    const visible = tabs.filter((tab) => !tab.hidden);
    if (visible.length && !visible.some((tab) => tab.dataset.case === activeCase.id)) selectCase(visible[0]);
    $('#sample-count').textContent = `${visible.length} of ${examples.length} selected examples`;
  }));

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
