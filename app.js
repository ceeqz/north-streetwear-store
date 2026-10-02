/* NORTH storefront logic. Data: products.js · Product renders: garments.js */
const $ = id => document.getElementById(id);
const money = n => '€' + n;
const byId = id => PRODUCTS.find(p => p.id === id);
const availSizes = p => p.sizes.filter(s => !p.soldOut.includes(s));
const isMobile = () => matchMedia('(max-width:800px)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
const MAX_QTY = 10;

/* ---------- product images (paths come from products.js only) ---------- */
const slotsOf = p => IMAGE_SLOTS.map(s => ({...s, src: p.images[s.key]})).filter(s => s.src);
function productImage(p, key = 'front') {
  if (!p.images[key]) key = 'front';
  const label = IMAGE_SLOTS.find(s => s.key === key).label;
  return `<img src="${p.images[key]}" data-fallback="${p.placeholders[key] || ''}" alt="${p.name} — ${label}" decoding="async" onerror="imageFallback(this)">`;
}
/* real file missing → temporary placeholder; if that fails too, hide the broken image */
function imageFallback(img) {
  img.onerror = () => img.remove();
  if (img.dataset.fallback) img.src = img.dataset.fallback; else img.remove();
}

/* ---------- filter definitions ---------- */
const CATEGORIES = ['All', 'T-shirts', 'Hoodies', 'Pants', 'Jackets'];
const TAGS = {new: 'New', bestseller: 'Bestsellers'};
const SIZE_SETS = [{key: 'tops', label: 'Tops', sizes: TOPS, categories: ['T-shirts', 'Hoodies', 'Jackets']},
                   {key: 'waist', label: 'Waist', sizes: WAIST, categories: ['Pants']}];
const PRICES = [['u50', 'Under €50', p => p < 50], ['50', '€50–99', p => p >= 50 && p < 100],
                ['100', '€100–129', p => p >= 100 && p < 130], ['130', '€130+', p => p >= 130]];
const COLORS = [...new Set(PRODUCTS.map(p => p.color))];
const SWATCH = {Black: '#1c1c1c', Grey: '#a5a5a1', Stone: '#cbc3b4', Washed: '#8c8f8e'};
const SORTS = {
  featured: () => 0,
  newest: (a, b) => b.released.localeCompare(a.released) || a.id - b.id,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name)
};
const TAG_TEST = {new: p => p.isNew, bestseller: p => p.isBestseller};

/* ---------- state ---------- */
const initial = () => ({cat: 'All', tag: null, size: null, price: null, color: null, query: ''});
const state = {...initial(), sort: 'featured'};
let lastFocus = null, cartMode = 'bag';

const storage = key => ({
  get(fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } },
  set(v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
});
const cartStore = storage('north-cart-v4'), wishStore = storage('north-wish');
let cart = cartStore.get([]).filter(l => byId(l.id) && byId(l.id).sizes.includes(l.size) && l.qty > 0);
let wish = wishStore.get([]);

/* ---------- catalog: filtering ---------- */
function matches(p) {
  const hay = `${p.name} ${p.category} ${p.color}`.toLowerCase();
  const tokens = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  const price = PRICES.find(x => x[0] === state.price);
  return (state.cat === 'All' || p.category === state.cat)
    && (!state.tag || TAG_TEST[state.tag](p))
    && (!state.size || availSizes(p).includes(state.size))
    && (!price || price[2](p.price))
    && (!state.color || p.color === state.color)
    && tokens.every(t => hay.includes(t));
}
const visibleSizeSets = () => SIZE_SETS.filter(s => state.cat === 'All' || s.categories.includes(state.cat));

/* ---------- catalog: rendering ---------- */
const chip = (cls, attr, val, label, on, extra = '') =>
  `<button class="${cls}${on ? ' active' : ''}" data-${attr}="${val}" aria-pressed="${on}">${extra}${label}</button>`;

const categoryChips = cls =>
  CATEGORIES.map(c => chip(cls, 'cat', c, c, state.cat === c)).join('') +
  Object.entries(TAGS).map(([k, l], i) => chip(cls + (i === 0 ? ' sep' : ''), 'tag', k, l, state.tag === k)).join('');

function renderControls() {
  $('cats').innerHTML = categoryChips('pill');
  $('fCat').innerHTML = categoryChips('chip');
  $('fSize').innerHTML = visibleSizeSets().map(set =>
    `<div class="sizeset"><span class="sublabel">${set.label}</span><div class="chips">${set.sizes.map(s => chip('chip', 'size', s, s, state.size === s)).join('')}</div></div>`).join('');
  $('fPrice').innerHTML = PRICES.map(([v, l]) => chip('chip', 'price', v, l, state.price === v)).join('');
  $('fColor').innerHTML = COLORS.map(c => chip('chip', 'color', c, c, state.color === c, `<i style="background:${SWATCH[c]}"></i>`)).join('');
  const n = ['size', 'price', 'color'].filter(k => state[k]).length;
  $('filterN').textContent = n ? ` (${n})` : '';
}

function cardHTML(p, i) {
  const free = availSizes(p);
  const flag = p.isNew ? 'NEW' : p.isBestseller ? 'BESTSELLER' : '';
  const quick = free.length
    ? `<div class="quick" data-quick="${p.id}"><span class="q-label">QUICK ADD</span><div class="q-sizes">${p.sizes.map(s => `<button data-qs="${s}"${p.soldOut.includes(s) ? ' disabled' : ''}>${s}</button>`).join('')}</div></div>` : '';
  return `<article class="card" style="--i:${Math.min(i, 11)}">
    <div class="media" data-pid="${p.id}">
      <button class="open" data-id="${p.id}" aria-label="View ${p.name}"><span class="photo"><span class="img a">${productImage(p, 'front')}</span><span class="img b"></span></span></button>
      ${flag ? `<span class="badge">${flag}</span>` : ''}${free.length ? '' : '<span class="soldtag">SOLD OUT</span>'}
      ${quick}
    </div>
    <button class="info open" data-id="${p.id}"><span class="name">${p.name}</span><span class="price">${money(p.price)}</span><span class="cat">${p.category} · ${p.color}</span></button>
  </article>`;
}

function renderGrid(animate = false) {
  const list = PRODUCTS.filter(matches).sort(SORTS[state.sort]);
  const n = String(list.length).padStart(2, '0');
  $('count').textContent = n + (list.length === 1 ? ' ITEM' : ' ITEMS');
  $('fShow').textContent = list.length ? `SHOW ${list.length} ${list.length === 1 ? 'ITEM' : 'ITEMS'}` : 'NO ITEMS';
  $('grid').hidden = !list.length;
  $('empty').hidden = !!list.length;
  $('grid').innerHTML = list.map(cardHTML).join('');
  if (animate && !reducedMotion) { $('grid').classList.remove('swap'); void $('grid').offsetWidth; $('grid').classList.add('swap'); }

  if (!list.length) {
    const q = state.query.trim();
    $('emptyText').innerHTML = q ? `We couldn’t find anything matching<br>“${q.replace(/</g, '&lt;')}”` : 'No products match your filters.';
    $('emptyBtn').textContent = q ? 'CLEAR SEARCH' : 'CLEAR ALL';
    $('emptyBtn').toggleAttribute('data-clear-search', !!q);
    $('emptyBtn').toggleAttribute('data-clear', !q);
  }
  renderActive();
}

function activeFilters() {
  const f = [];
  if (state.cat !== 'All') f.push(['cat', state.cat]);
  if (state.tag) f.push(['tag', TAGS[state.tag]]);
  if (state.size) f.push(['size', (SIZE_SETS[1].sizes.includes(state.size) ? 'Waist ' : '') + state.size]);
  if (state.color) f.push(['color', state.color]);
  if (state.price) f.push(['price', PRICES.find(x => x[0] === state.price)[1]]);
  if (state.query.trim()) f.push(['query', `“${state.query.trim()}”`]);
  return f;
}
function renderActive() {
  const f = activeFilters();
  $('activeBar').hidden = !f.length;
  $('activeChips').innerHTML = f.map(([k, l]) => `<button class="achip" data-rm="${k}" aria-label="Remove filter ${l}">${l}<span aria-hidden="true">×</span></button>`).join('');
}

function refresh(animate = true) {
  const set = visibleSizeSets();
  if (state.size && !set.some(s => s.sizes.includes(state.size))) state.size = null;
  renderControls();
  renderGrid(animate);
}
function toggle(key, val) { state[key] = state[key] === val ? null : val; refresh(); }
function removeFilter(key) {
  if (key === 'cat') state.cat = 'All';
  else if (key === 'query') { state.query = ''; $('search').value = ''; }
  else state[key] = null;
  refresh();
}
function clearAll() { Object.assign(state, initial()); $('search').value = ''; refresh(); }

function toggleFilters(force) {
  const open = force === undefined ? !$('filterPanel').classList.contains('open') : force;
  $('filterPanel').classList.toggle('open', open);
  $('filterBtn').setAttribute('aria-expanded', open);
  if (isMobile()) {
    $('overlay').classList.toggle('show', open);
    document.body.classList.toggle('locked', open);
    if (open) lastFocus = $('filterBtn');
  }
}

function goSearch() {
  closeMenu();
  $('shop').scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth'});
  setTimeout(() => $('search').focus({preventScroll: true}), reducedMotion ? 0 : 450);
}

/* ---------- layers (modal / cart / mobile filters) ---------- */
function openLayer(el) {
  lastFocus = document.activeElement;
  closeMenu();
  el.classList.add('show');
  $('overlay').classList.add('show');
  document.body.classList.add('locked');
  (el.querySelector('[data-close]') || el).focus({preventScroll: true});
}
function closeLayers() {
  ['modal', 'drawer'].forEach(i => $(i).classList.remove('show'));
  closeGuide(); closeLightbox();
  if (isMobile() && $('filterPanel').classList.contains('open')) {
    $('filterPanel').classList.remove('open');
    $('filterBtn').setAttribute('aria-expanded', 'false');
  }
  $('overlay').classList.remove('show');
  document.body.classList.remove('locked');
  if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll: true});
}

/* ---------- product detail ---------- */
const view = {p: null, size: null, qty: 1, busy: false, key: 'front'};

function setView(key) {
  view.key = key;
  const m = view.p.model;
  $('mMain').innerHTML = productImage(view.p, key) +
    (key === 'model' && m ? `<span class="m-cap">MODEL${m.height ? ` · ${m.height}` : ''}${m.size ? ` · WEARING SIZE ${m.size}` : ''}</span>` : '');
  $('mThumbs').querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view === key));
}

/* Size guide modal: the guide for the current product's type; the selected size is highlighted. */
function renderGuide() {
  const g = SIZE_GUIDES[view.p.guide];
  $('guideBody').innerHTML = `<h4>${g.title.toUpperCase()}</h4>
    <table><thead><tr>${g.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>` +
    g.rows.map(r => `<tr class="${r[0] === view.size ? 'sel' : ''}">${r.map((c, i) => `<td>${i ? `${c} ${g.unit}` : c}</td>`).join('')}</tr>`).join('') +
    `</tbody></table><ul>${g.notes.map(n => `<li>${n}</li>`).join('')}</ul>
    <p class="g-note">Measurements are garment measurements, not body measurements. Between sizes? Size up for a relaxed fit.</p>`;
}
function openGuide() { renderGuide(); $('guideModal').classList.add('show'); $('guideModal').querySelector('[data-close-guide]').focus({preventScroll: true}); }
function closeGuide() { $('guideModal').classList.remove('show'); }

/* Lightbox: click the main image to enlarge */
function renderLightbox() {
  const slots = slotsOf(view.p), pos = slots.findIndex(s => s.key === view.key) + 1;
  $('lbImg').innerHTML = productImage(view.p, view.key);
  $('lbCap').textContent = `${view.p.name} — ${IMAGE_SLOTS.find(s => s.key === view.key).label.toUpperCase()} (${pos}/${slots.length})`;
}
function openLightbox() { renderLightbox(); $('lightbox').classList.add('show'); $('lightbox').querySelector('[data-close-lightbox]').focus({preventScroll: true}); }
function closeLightbox() { $('lightbox').classList.remove('show'); }
function stepLightbox(d) {
  const slots = slotsOf(view.p), pos = slots.findIndex(s => s.key === view.key);
  setView(slots[(pos + d + slots.length) % slots.length].key);
  renderLightbox();
}

function renderWish() {
  const on = wish.includes(view.p.id);
  $('mWish').classList.toggle('on', on);
  $('mWish').setAttribute('aria-pressed', on);
  $('mWish').setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
}

function openProduct(id) {
  const p = view.p = byId(id);
  Object.assign(view, {size: null, qty: 1, busy: false});
  const free = availSizes(p);
  $('mCat').textContent = p.category;
  $('mBadge').textContent = p.isNew ? 'NEW' : p.isBestseller ? 'BESTSELLER' : '';
  $('mBadge').hidden = !(p.isNew || p.isBestseller);
  $('mName').textContent = p.name;
  $('mPrice').textContent = money(p.price);
  $('mColor').textContent = 'Colour: ' + p.color;
  $('mStatus').textContent = !free.length ? 'Sold out' : free.length <= 2 ? 'Low stock' : 'In stock';
  $('mDesc').textContent = p.description;
  $('mDetails').innerHTML = p.details.map(d => `<li>${d}</li>`).join('');
  $('mMaterials').textContent = p.materials;
  $('mShipping').textContent = SHIPPING_INFO;
  $('mSizeLabel').textContent = p.guide === 'pants' ? 'Waist' : 'Size';
  $('mSizes').classList.remove('invalid');
  $('mSizes').innerHTML = p.sizes.map(s => `<button data-size="${s}" aria-pressed="false"${p.soldOut.includes(s) ? ' disabled title="Sold out"' : ''}>${s}</button>`).join('');
  $('mErr').textContent = '';
  closeGuide();
  $('mQtyN').textContent = 1;
  $('mThumbs').innerHTML = slotsOf(p).map(s => `<button data-view="${s.key}" aria-label="${s.label} view"><span class="tb">${productImage(p, s.key)}</span><span class="tl">${s.label}</span></button>`).join('');
  $('mThumbs').hidden = slotsOf(p).length < 2;
  $('mAdd').disabled = !free.length;
  $('mAdd').classList.remove('done');
  $('mAdd').textContent = free.length ? 'ADD TO CART' : 'SOLD OUT';
  $('modal').querySelectorAll('.acc details').forEach((d, i) => d.open = i === 0);
  renderWish(); setView('front');
  $('modal').querySelector('.m-body').scrollTop = 0;
  openLayer($('modal'));
}

function addFromModal() {
  if (view.busy) return;
  if (!view.size) {
    $('mErr').textContent = view.p.guide === 'pants' ? 'Please select a waist size.' : 'Please select a size.';
    $('mSizes').classList.add('invalid');
    return;
  }
  view.busy = true;
  addToCart(view.p.id, view.size, view.qty);
  $('mAdd').classList.add('done');
  $('mAdd').textContent = 'ADDED ✓';
  setTimeout(() => { closeLayers(); openCart(); }, 600);
}

/* ---------- cart ---------- */
function addToCart(id, size, qty) {
  const line = cart.find(l => l.id === id && l.size === size);
  if (line) line.qty = Math.min(line.qty + qty, MAX_QTY);
  else cart.push({id, size, qty});
  saveCart();
  ['cartBtn'].forEach(b => { $(b).classList.remove('bump'); void $(b).offsetWidth; $(b).classList.add('bump'); });
}
function saveCart() { cartStore.set(cart); renderCart(); }

function renderCart() {
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.reduce((n, l) => n + l.qty * byId(l.id).price, 0);
  ['cartCount', 'cartCountM', 'drawerN'].forEach(id => $(id).textContent = count);
  $('subtotal').textContent = money(subtotal);
  $('drawerFoot').hidden = !cart.length || cartMode === 'demo';

  if (cartMode === 'demo') {
    $('items').innerHTML = `<div class="drawer-done"><h4>CHECKOUT DEMO</h4><p>Payment integration is not connected in this portfolio project.</p><button class="btn btn-line" data-back>BACK TO CART</button></div>`;
    return;
  }
  $('items').innerHTML = cart.length ? cart.map((l, i) => {
    const p = byId(l.id);
    return `<div class="item">
      <div class="photo">${productImage(p, 'front')}</div>
      <div class="item-info">
        <div class="item-top"><span>${p.name}</span><b>${money(p.price * l.qty)}</b></div>
        <span class="item-sub">${p.guide === 'pants' ? 'WAIST' : 'SIZE'} ${l.size} · ${money(p.price)}</span>
        <div class="item-row">
          <div class="qty"><button data-act="dec" data-i="${i}" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button data-act="inc" data-i="${i}" aria-label="Increase quantity">+</button></div>
          <button class="remove" data-act="del" data-i="${i}">Remove</button>
        </div>
      </div></div>`;
  }).join('') : `<div class="drawer-empty"><h4>YOUR CART IS EMPTY</h4><p>Nothing here yet. Start with the essentials.</p><button class="btn btn-line" data-close data-shop>CONTINUE SHOPPING</button></div>`;
}
function openCart() { cartMode = 'bag'; renderCart(); openLayer($('drawer')); }

/* ---------- mobile menu / header ---------- */
function closeMenu() {
  $('mobileMenu').classList.remove('show');
  $('burger').classList.remove('open');
  $('burger').setAttribute('aria-expanded', 'false');
}
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    $('nav').classList.toggle('scrolled', y > 40);
    if (!reducedMotion && y < innerHeight * 1.2) $('heroTitle').style.transform = `translate3d(0,${Math.min(24, Math.round(y * .06))}px,0)`;
    ticking = false;
  });
}

/* ---------- events ---------- */
const catHandler = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.cat) { state.cat = b.dataset.cat; refresh(); }
  else if (b.dataset.tag) toggle('tag', b.dataset.tag);
};
$('cats').addEventListener('click', catHandler);
$('fCat').addEventListener('click', catHandler);
['fSize', 'fPrice', 'fColor'].forEach(id => $(id).addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const key = ['size', 'price', 'color'].find(k => b.dataset[k] !== undefined);
  toggle(key, b.dataset[key]);
}));
$('activeChips').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) removeFilter(b.dataset.rm); });
$('filterBtn').addEventListener('click', () => toggleFilters());
$('search').addEventListener('input', e => { state.query = e.target.value; renderGrid(false); });
$('sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(true); });

document.addEventListener('click', e => {
  if (e.target.closest('[data-clear]')) clearAll();
  else if (e.target.closest('[data-clear-search]')) removeFilter('query');
  if (e.target.closest('[data-search]')) goSearch();
  if (e.target.closest('[data-cart]')) { cartMode = 'bag'; openCart(); }
  if (e.target.closest('[data-close]')) closeLayers();
});

/* grid: open product, quick add, hover image */
$('grid').addEventListener('click', e => {
  const q = e.target.closest('[data-qs]');
  if (q) {
    const box = q.closest('.quick'), id = +box.dataset.quick, saved = box.innerHTML;
    addToCart(id, q.dataset.qs, 1);
    box.classList.add('done'); box.innerHTML = '<span class="q-label">ADDED TO CART ✓</span>';
    setTimeout(() => { box.classList.remove('done'); box.innerHTML = saved; }, 1100);
    return;
  }
  const c = e.target.closest('[data-id]'); if (c) openProduct(+c.dataset.id);
});
$('grid').addEventListener('pointerover', e => {
  const m = e.target.closest('.media'); if (!m || m.dataset.b) return;
  const p = byId(+m.dataset.pid);
  if (p.images.model) m.querySelector('.img.b').innerHTML = productImage(p, 'model');
  m.dataset.b = 1;
});

/* detail modal */
$('mSizes').addEventListener('click', e => {
  const b = e.target.closest('[data-size]'); if (!b || b.disabled) return;
  view.size = b.dataset.size;
  $('mErr').textContent = '';
  $('mSizes').classList.remove('invalid');
  $('mSizes').querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
});
$('mGuideBtn').addEventListener('click', openGuide);
$('guideModal').addEventListener('click', e => { if (e.target.closest('[data-close-guide]') || e.target === $('guideModal')) closeGuide(); });
$('mMain').addEventListener('click', openLightbox);
$('lightbox').addEventListener('click', e => {
  const nav = e.target.closest('[data-lb]');
  if (nav) stepLightbox(+nav.dataset.lb);
  else if (!e.target.closest('.lb-img img, .lb-img svg') || e.target.closest('[data-close-lightbox]')) closeLightbox();
});
$('mThumbs').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) setView(b.dataset.view); });
$('mQty').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  view.qty = Math.max(1, Math.min(MAX_QTY, view.qty + +b.dataset.q));
  $('mQtyN').textContent = view.qty;
});
$('mWish').addEventListener('click', () => {
  const id = view.p.id;
  wish = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id];
  wishStore.set(wish);
  renderWish();
});
$('mAdd').addEventListener('click', addFromModal);

/* cart drawer */
$('items').addEventListener('click', e => {
  if (e.target.closest('[data-shop]')) { location.hash = '#shop'; return; }
  if (e.target.closest('[data-back]')) { cartMode = 'bag'; renderCart(); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const i = +b.dataset.i, l = cart[i];
  if (b.dataset.act === 'inc') l.qty = Math.min(l.qty + 1, MAX_QTY);
  else if (b.dataset.act === 'dec') { if (--l.qty <= 0) cart.splice(i, 1); }
  else cart.splice(i, 1);
  saveCart();
});
$('cartBtn').addEventListener('click', openCart);
$('checkout').addEventListener('click', () => { cartMode = 'demo'; renderCart(); });

/* global */
$('overlay').addEventListener('click', closeLayers);
document.addEventListener('keydown', e => {
  if ($('lightbox').classList.contains('show')) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
    else if (e.key === 'ArrowRight') stepLightbox(1);
    return;
  }
  if (e.key === 'Escape') {
    if ($('guideModal').classList.contains('show')) closeGuide();
    else { closeLayers(); closeMenu(); }
  }
});
$('burger').addEventListener('click', () => {
  const open = !$('mobileMenu').classList.contains('show');
  $('mobileMenu').classList.toggle('show', open);
  $('burger').classList.toggle('open', open);
  $('burger').setAttribute('aria-expanded', open);
});
$('mobileMenu').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
window.addEventListener('resize', () => {
  if (innerWidth > 800) {
    closeMenu();
    if (!$('modal').classList.contains('show') && !$('drawer').classList.contains('show')) {
      $('overlay').classList.remove('show'); document.body.classList.remove('locked');
    }
  }
});
addEventListener('scroll', onScroll, {passive: true});

/* scroll reveal */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reducedMotion) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), {threshold: .15, rootMargin: '0px 0px -5% 0px'});
  els.forEach(el => io.observe(el));
}

/* ---------- init ---------- */
refresh(false);
renderCart();
initReveal();
onScroll();
