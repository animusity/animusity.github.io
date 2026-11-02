'use strict';
const main = document.querySelector('main');
const motion = document.querySelector('#motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let database;
let motionEnabled = false;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const slug = value => encodeURIComponent(value);
const badge = (text, sample = false) => `<span class="badge${sample ? ' sample' : ''}">${escapeHTML(text)}</span>`;
const safeURL = value => {
  if (!value) return '';
  try { const url = new URL(value, location.href); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
};
const notice = () => database.site.preview ? '<aside class="notice"><strong>Interface preview / Sample content</strong>The archive is ready for your characters. These demonstration records are placeholders.</aside>' : '';
const header = (name, meta = 'ANIMUSITY / DATABASE') => `<div class="view-head"><span class="kicker">${escapeHTML(name)}</span><span class="record-label">${escapeHTML(meta)}</span></div>`;
const figure = `<svg viewBox="0 0 240 300" aria-hidden="true"><defs><linearGradient id="subject-fill" x2="1" y2="1"><stop stop-color="#9ba297" stop-opacity=".65"/><stop offset="1" stop-color="#e0e3da" stop-opacity=".3"/></linearGradient></defs><g fill="none" stroke="#9ba296" stroke-width=".7" opacity=".6"><path d="M10 60H230M10 150H230M10 240H230M60 20V285M120 20V285M180 20V285"/><circle cx="120" cy="115" r="77"/><circle cx="120" cy="115" r="90" stroke-dasharray="2 8"/></g><g fill="url(#subject-fill)" stroke="#8b9485" stroke-width=".8"><path d="M83 105C83 54 157 54 157 105L151 139Q145 157 134 163L134 178Q185 187 193 222L205 272H35L47 222Q55 187 106 178V163Q94 158 89 139Z"/><path d="M83 105L120 80L157 105L120 129ZM89 139L120 129L151 139L134 163H106ZM47 222L106 178L120 219L134 178L193 222L120 252Z" fill="none"/></g><path d="M20 26V14H32M208 14H220V26M20 274V286H32M208 286H220V274" stroke="#963c33" fill="none"/></svg>`;
function buildHelix() {
  const svg = document.querySelector('#helix');
  let markup = '';
  for (let i = 0; i < 86; i++) {
    const y = i * 11, wave = Math.sin(i / 10), x = 110 + wave * 63;
    const width = 38 + (Math.cos(i / 10) + 1) * 21;
    markup += `<path d="M${x-width} ${y}l${width} -12 ${width} 12 -${width} 12Z" fill="${i > 16 && i < 32 ? '#963c33' : '#93978e'}" fill-opacity="${.16 + Math.abs(wave) * .4}" stroke="#ffffff" stroke-opacity=".4" stroke-width=".6"/>`;
  }
  svg.innerHTML = markup;
}
function home() {
  return `${header('Archive initialized', 'EST. 2026 / PERSONAL CHARACTER ARCHIVE')}<div class="home-grid"><div class="home-copy"><div class="kicker">CHARACTERS. WORLDS. POSSIBILITIES.</div><h1>Every story<br>starts here.</h1><p class="intro">${escapeHTML(database.site.tagline)}</p><a class="button" href="#characters">Enter the database <span aria-hidden="true">→</span></a></div><figure class="archive-art"><span class="art-top">SUBJECT / UNDEFINED</span><span class="art-cross" aria-hidden="true">+</span>${figure}<figcaption class="art-tag">A CHARACTER WAITING TO BE KNOWN</figcaption></figure></div>${notice()}<div class="home-links"><a class="home-link" href="#worlds"><span>01 / CONNECTED STORIES</span><h2>Explore the worlds ↗</h2><p>The places that give each character a home.</p></a><a class="home-link" href="#development"><span>02 / WHAT COMES NEXT</span><h2>In development ↗</h2><p>Early ideas, future characters, and stories in progress.</p></a></div>`;
}
function characterRecord(item, index) {
  const world = database.worlds.find(world => world.id === item.world);
  return `<a class="record" href="#characters/${slug(item.id)}"><span class="record-index" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><div><span class="record-name">${escapeHTML(item.name)}</span><p class="record-text">${escapeHTML(item.subtitle)}</p>${badge(item.status)}${item.sample ? badge('Sample', true) : ''}<span class="record-text">${escapeHTML(world?.name || 'Independent character')}</span></div><span class="record-arrow" aria-hidden="true">›</span></a>`;
}
function characters(worldID = '') {
  const world = database.worlds.find(item => item.id === worldID);
  return `${header('People / Character records')}<h1>${world ? escapeHTML(world.name) : 'The characters'}</h1><p class="intro">Meet the people at the heart of each story.</p>${world ? '<a class="back-link" href="#characters">← All characters</a>' : ''}${notice()}<div class="tools"><label><span class="field-label">Search the archive</span><input id="search" type="search" placeholder="Name, world, or keyword…" autocomplete="off"></label><label><span class="field-label">Profile status</span><select id="status"><option value="">All statuses</option><option>Published</option><option>Draft</option><option>Planned</option></select></label></div><p class="result-count" id="count" role="status" aria-live="polite"></p><div class="record-list" id="records" data-world="${escapeHTML(worldID)}"></div>`;
}
function filterCharacters() {
  const query = document.querySelector('#search').value.trim().toLowerCase();
  const status = document.querySelector('#status').value;
  const worldID = document.querySelector('#records').dataset.world;
  const filtered = database.characters.filter(item => {
    const world = database.worlds.find(world => world.id === item.world);
    return (!status || item.status === status) && (!worldID || item.world === worldID) && [item.name,item.subtitle,item.summary,world?.name,...(item.tags || [])].join(' ').toLowerCase().includes(query);
  });
  document.querySelector('#count').textContent = `${filtered.length} ${filtered.length === 1 ? 'record' : 'records'} found`;
  document.querySelector('#records').innerHTML = filtered.length ? filtered.map(characterRecord).join('') : '<div class="empty"><h2>No matching records</h2><p>Try another keyword or choose a different status.</p><button id="reset" class="button secondary" type="button">Clear filters</button></div>';
  document.querySelector('#reset')?.addEventListener('click', () => { document.querySelector('#search').value = ''; document.querySelector('#status').value = ''; filterCharacters(); document.querySelector('#search').focus(); });
}
function detail(item) {
  const world = database.worlds.find(world => world.id === item.world);
  const portrait = safeURL(item.portrait);
  const gallery = (item.gallery || []).filter(image => safeURL(image.src));
  const links = (item.links || []).filter(link => safeURL(link.url));
  return `${header('People / Subject record')}<a class="back-link" href="#characters">← Back to characters</a><h1>${escapeHTML(item.name)}</h1>${badge(item.status)}${item.sample ? badge('Demonstration profile',true) : ''}<div class="detail-layout"><aside><div class="portrait">${portrait ? `<img src="${escapeHTML(portrait)}" alt="${escapeHTML(item.portraitAlt || item.name)}">` : figure}</div>${!portrait ? '<p class="portrait-note">PORTRAIT / TO BE ADDED</p>' : ''}<dl class="facts">${Object.entries(item.facts || {}).map(([label,value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}${world ? `<div><dt>World</dt><dd><a href="#worlds/${slug(world.id)}">${escapeHTML(world.name)}</a></dd></div>` : ''}</dl></aside><div class="prose"><div class="kicker">${escapeHTML(item.subtitle)}</div><h2>Overview</h2><p>${escapeHTML(item.summary)}</p><h2>The story so far</h2><p>${escapeHTML(item.bio)}</p>${(item.tags || []).map(tag => badge(tag)).join('')}${links.length ? `<h2>Explore more</h2><ul>${links.map(link => `<li><a href="${escapeHTML(safeURL(link.url))}" rel="noopener noreferrer" target="_blank">${escapeHTML(link.label)} ↗</a></li>`).join('')}</ul>` : ''}</div></div>${gallery.length ? `<h2>Visual archive</h2><div class="gallery">${gallery.map(image => `<figure><a href="${escapeHTML(safeURL(image.src))}" target="_blank" rel="noopener noreferrer"><img src="${escapeHTML(safeURL(image.src))}" alt="${escapeHTML(image.alt)}" loading="lazy"></a><figcaption>${escapeHTML(image.caption || '')}</figcaption></figure>`).join('')}</div>` : ''}`;
}
function worlds(id) {
  const world = database.worlds.find(item => item.id === id);
  if (id && !world) return missing();
  if (world) return `${header('Worlds / Setting record')}<a class="back-link" href="#worlds">← Back to worlds</a><h1>${escapeHTML(world.name)}</h1>${world.sample ? badge('Sample setting',true) : ''}<p class="intro">${escapeHTML(world.summary)}</p><div class="prose"><p>${escapeHTML(world.description)}</p></div><h2>Characters in this world</h2><div class="record-list">${database.characters.filter(item => item.world === id).map(characterRecord).join('') || '<p>No characters have been added to this setting yet.</p>'}</div>`;
  return `${header('Settings / Connected stories')}<h1>The worlds</h1><p class="intro">Different places. Different possibilities. Each with a story of its own.</p>${notice()}<div class="record-list">${database.worlds.map((world,index) => `<a class="record" href="#worlds/${slug(world.id)}"><span class="record-index" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><div><span class="record-name">${escapeHTML(world.name)}</span><p class="record-text">${escapeHTML(world.summary)}</p>${world.sample ? badge('Sample setting',true) : ''}</div><span class="record-arrow" aria-hidden="true">›</span></a>`).join('') || '<p>New worlds are waiting to be added.</p>'}</div>`;
}
function development() {
  return `${header('Future records / Work in progress')}<h1>Still taking<br>shape.</h1><p class="intro">A glimpse of the characters and stories on the horizon.</p>${notice()}${database.plans.map((plan,index) => `<article class="plan"><div class="kicker">${String(index+1).padStart(2,'0')} / ${escapeHTML(plan.stage)}</div><h2>${escapeHTML(plan.title)}</h2>${plan.sample ? badge('Sample plan',true) : ''}<p>${escapeHTML(plan.description)}</p></article>`).join('') || '<p>Future plans will appear here as they take shape.</p>'}`;
}
function about() {
  return `${header('About / The archive')}<h1>Home base for<br>the goblins.</h1><p class="intro">${escapeHTML(database.site.about)}</p><div class="about-panel prose"><h2>A living collection</h2><p>Browse character profiles, follow the connections between worlds, or take a look at what's coming next.</p><p>Published profiles introduce completed characters. Drafts are still being developed. Planned records offer a first glimpse of future ideas.</p></div><p class="record-text">An original character archive with an interface inspired by the Animus 2.0 aesthetic. Not affiliated with Ubisoft or Assassin’s Creed.</p>${notice()}`;
}
function missing() { return `${header('Record not found')}<h1>Outside the archive.</h1><p>This record may have moved, or hasn't been added yet.</p><a class="button" href="#overview">Return to overview →</a>`; }
function route(moveFocus = false) {
  if (!database) return;
  const [section = 'overview', rawID = ''] = location.hash.replace(/^#/, '').split('/');
  let id; try { id = decodeURIComponent(rawID); } catch { id = ''; }
  let content;
  if (section === 'overview' || section === '') content = home();
  else if (section === 'characters') { const item = database.characters.find(item => item.id === id); content = id ? (item ? detail(item) : missing()) : characters(); }
  else if (section === 'worlds') content = worlds(id);
  else if (section === 'development') content = development();
  else if (section === 'about') content = about();
  else content = missing();
  main.innerHTML = `<div class="view">${content}</div>`;
  document.querySelectorAll('nav a').forEach(link => { if (link.dataset.section === (section || 'overview')) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  const nav = document.querySelector('nav a[aria-current]');
  document.querySelector('#location').textContent = nav ? nav.querySelector('span:last-child').textContent.toUpperCase() : 'DATABASE';
  document.title = `${id && section === 'characters' ? database.characters.find(item => item.id === id)?.name || 'Record not found' : nav?.querySelector('span:last-child').textContent || 'Archive'} / Animusity`;
  if (document.querySelector('#search')) { filterCharacters(); document.querySelector('#search').addEventListener('input',filterCharacters); document.querySelector('#status').addEventListener('change',filterCharacters); }
  if (moveFocus) { main.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
}
function updateMotion() {
  const active = motionEnabled && !reducedMotion.matches;
  document.body.classList.toggle('motion-on',active);
  motion.textContent = reducedMotion.matches ? 'Motion: reduced' : `Motion: ${active ? 'on' : 'off'}`;
  motion.setAttribute('aria-pressed',String(active));
  motion.disabled = reducedMotion.matches;
}
motion.addEventListener('click', () => { motionEnabled = !motionEnabled; updateMotion(); try { localStorage.setItem('animusity-motion',String(motionEnabled)); } catch {} });
reducedMotion.addEventListener('change',updateMotion);
try { motionEnabled = localStorage.getItem('animusity-motion') === 'true'; } catch {}
updateMotion();
buildHelix();
document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); main.focus(); main.scrollIntoView(); });
window.addEventListener('hashchange',() => route(true));
document.querySelector('nav').addEventListener('keydown', event => {
  if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
  const links = [...document.querySelectorAll('nav a')];
  const index = links.indexOf(document.activeElement);
  if (index < 0) return;
  event.preventDefault(); links[(index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus();
});
fetch('data.json').then(response => { if (!response.ok) throw new Error('Archive data could not be loaded'); return response.json(); }).then(data => { database = data; route(); }).catch(() => { main.innerHTML = '<div class="empty"><h1>Connection interrupted.</h1><p>The archive data could not be loaded. Please reload to try again.</p><button class="button" type="button" id="reload">Reload archive</button></div>'; document.querySelector('#reload').addEventListener('click', () => location.reload()); });
