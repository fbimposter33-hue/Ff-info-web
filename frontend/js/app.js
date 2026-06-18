/* ============================================
   FF Info - app.js
   ============================================ */

const API_BASE = 'https://YOUR-BACKEND-URL.onrender.com/api/player';
const STATS_URL = 'https://YOUR-BACKEND-URL.onrender.com/api/player/stats/overview';
const EXAMPLE_UIDS = ['2296094466', '1234567890', '9876543210'];
const HISTORY_KEY = 'ffinfo_history';

// ---- DOM refs ----
const uidInput      = document.getElementById('uidInput');
const searchBtn     = document.getElementById('searchBtn');
const exampleBtn    = document.getElementById('exampleBtn');
const clearBtn      = document.getElementById('clearBtn');
const inputHint     = document.getElementById('inputHint');
const loadingOverlay = document.getElementById('loadingOverlay');
const resultsSection = document.getElementById('resultsSection');
const toastContainer = document.getElementById('toastContainer');
const historyList   = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const navToggle     = document.getElementById('navToggle');
const navLinks      = document.getElementById('navLinks');

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ once: true, duration: 600, offset: 60 });
  initParticles();
  renderHistory();
  fetchStats();
  initCharts();

  searchBtn.addEventListener('click', handleSearch);
  exampleBtn.addEventListener('click', () => {
    uidInput.value = EXAMPLE_UIDS[Math.floor(Math.random() * EXAMPLE_UIDS.length)];
    toggleClearBtn();
  });
  clearBtn.addEventListener('click', () => {
    uidInput.value = '';
    toggleClearBtn();
    inputHint.textContent = '';
  });
  uidInput.addEventListener('input', () => {
    uidInput.value = uidInput.value.replace(/\D/g, '');
    toggleClearBtn();
    inputHint.textContent = '';
  });
  uidInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });

  document.getElementById('copyUidBtn')?.addEventListener('click', copyUID);
  document.getElementById('downloadPngBtn')?.addEventListener('click', downloadPNG);
  document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPDF);
  document.getElementById('shareBtn')?.addEventListener('click', shareResult);
  clearHistoryBtn?.addEventListener('click', clearHistory);

  navToggle?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
  });
});

// ---- Validation ----
function validateUID(uid) {
  if (!uid) return 'Please enter a UID.';
  if (!/^\d+$/.test(uid)) return 'UID must contain numbers only.';
  if (uid.length < 8) return 'UID must be at least 8 digits.';
  if (uid.length > 12) return 'UID must be at most 12 digits.';
  return null;
}

function toggleClearBtn() {
  clearBtn.classList.toggle('visible', uidInput.value.length > 0);
}

// ---- Search ----
async function handleSearch() {
  const uid = uidInput.value.trim();
  const err = validateUID(uid);
  if (err) {
    inputHint.textContent = err;
    return;
  }
  inputHint.textContent = '';
  showLoading(true);

  try {
    const res = await fetch(`${API_BASE}/${uid}`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.detail || 'Player not found.');
    }

    renderResults(json.data);
    saveHistory(uid);
    fetchStats();
    showToast('Player found!', 'success');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (e) {
    showToast(e.message || 'Something went wrong.', 'error');
  } finally {
    showLoading(false);
  }
}

// ---- Render Results ----
function renderResults(data) {
  resultsSection.hidden = false;

  const b = data.basic_info || {};
  const p = data.profile_info || {};
  const c = data.clan_info || {};
  const pet = data.pet_info || {};
  const s = data.social_info || {};
  const d = data.diamond_info || {};
  const pr = data.prime_info || {};
  const ei = data.external_icon || {};

  // Header
  setText('rNickname', b.nickname || 'Unknown');
  setText('rUid', `UID: ${b.uid || '—'}`);
  setText('rRegion', b.region || '—');
  setText('rLevel', `LVL ${b.level || '—'}`);
  setText('rLikes', fmt(b.likes));
  setText('rRank', b.rank || '—');
  setText('rCsRank', b.cs_rank || '—');
  setText('rDiamonds', fmt(d.diamond_cost));

  // Basic info grid
  buildGrid('basicGrid', [
    ['EXP', fmt(b.exp)],
    ['Ranking Points', fmt(b.ranking_points)],
    ['Max Rank', b.max_rank || '—'],
    ['Max CS Rank', b.max_cs_rank || '—'],
    ['Season ID', b.season_id || '—'],
    ['Badge ID', b.badge_id || '—'],
    ['Account Type', b.account_type || '—'],
    ['Created', b.created_at || '—'],
    ['Last Login', b.last_login || '—'],
  ]);

  // Profile
  buildGrid('profileGrid', [
    ['Avatar ID', p.avatar_id || '—'],
    ['Skin Color', p.skin_color || '—'],
    ['Character', p.character_selected || '—'],
    ['Awakening', p.awakening_status != null ? p.awakening_status : '—'],
  ]);
  buildTags('clothesTags', p.equipped_clothes || [], '👕', false);
  buildTags('skillsTags', p.equipped_skills || [], '⚡', true);

  // Guild
  const gc = document.getElementById('guildContent');
  if (gc) {
    if (c.name) {
      gc.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'info-grid';
      gc.appendChild(grid);
      buildGrid('guildContent', [
        ['Guild Name', c.name],
        ['Guild ID', c.id || '—'],
        ['Level', c.level || '—'],
        ['Members', c.members || '—'],
      ], grid);
    } else {
      gc.innerHTML = '<p class="no-data">No Guild Information Available</p>';
    }
  }

  // Pet
  buildGrid('petGrid', [
    ['Pet ID', pet.id || '—'],
    ['Level', pet.level || '—'],
    ['EXP', fmt(pet.exp)],
    ['Skin ID', pet.skin_id || '—'],
    ['Skill ID', pet.skill_id || '—'],
    ['Selected', pet.selected ? 'Yes' : 'No'],
  ]);

  // Social
  const sig = document.getElementById('rSignature');
  if (sig) sig.textContent = s.signature || 'No signature set.';
  buildGrid('socialGrid', [
    ['Language', s.language || '—'],
    ['Rank Show Mode', s.rank_show_mode || '—'],
  ]);

  // Prime
  const primeEl = document.getElementById('rPrime');
  if (primeEl) {
    if (pr.status != null) {
      primeEl.textContent = pr.status === 1 ? '👑 Active' : '❌ Inactive';
      primeEl.style.color = pr.status === 1 ? 'var(--gold)' : 'var(--muted)';
    } else {
      primeEl.textContent = 'Prime Information Not Available';
      primeEl.style.color = 'var(--muted)';
    }
  }

  // External icon
  buildGrid('iconGrid', [
    ['Status', ei.status != null ? ei.status : '—'],
    ['Show Type', ei.show_type != null ? ei.show_type : '—'],
  ]);
}

// ---- Helper renderers ----
function buildGrid(containerId, rows, existingEl = null) {
  const el = existingEl || document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = rows.map(([label, value]) => `
    <div class="info-item">
      <p class="info-label">${label}</p>
      <p class="info-value">${value}</p>
    </div>`).join('');
}

function buildTags(containerId, items, icon, isSkill) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!items.length) { el.innerHTML = ''; return; }
  el.innerHTML = items.map(item =>
    `<span class="tag${isSkill ? ' tag-skill' : ''}">${icon} ${typeof item === 'object' ? JSON.stringify(item) : item}</span>`
  ).join('');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function fmt(n) {
  if (n == null || n === '') return '—';
  return Number(n).toLocaleString();
}

// ---- Loading ----
function showLoading(show) {
  if (show) {
    loadingOverlay.hidden = false;
    loadingOverlay.style.display = 'flex';
  } else {
    loadingOverlay.hidden = true;
    loadingOverlay.style.display = '';
  }
}

// ---- Toast ----
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: '🔔' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '🔔'}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3200);
}

// ---- History ----
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(uid) {
  let h = getHistory().filter(i => i.uid !== uid);
  h.unshift({ uid, time: Date.now() });
  if (h.length > 20) h = h.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  renderHistory();
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  showToast('History cleared.', 'info');
}

function renderHistory() {
  const h = getHistory();
  if (!historyList) return;
  if (!h.length) {
    historyList.innerHTML = '<p class="empty-state"><i class="fas fa-clock"></i> No recent searches.</p>';
    return;
  }
  historyList.innerHTML = h.map(item => `
    <div class="history-item" data-uid="${item.uid}">
      <div>
        <div class="history-uid">${item.uid}</div>
        <div class="history-time">${new Date(item.time).toLocaleString()}</div>
      </div>
      <div class="history-actions">
        <button class="hist-btn" onclick="searchFromHistory('${item.uid}')">
          <i class="fas fa-search"></i> Search Again
        </button>
        <button class="hist-btn del" onclick="deleteHistoryItem('${item.uid}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>`).join('');
}

function searchFromHistory(uid) {
  uidInput.value = uid;
  toggleClearBtn();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(handleSearch, 400);
}

function deleteHistoryItem(uid) {
  let h = getHistory().filter(i => i.uid !== uid);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  renderHistory();
}

// ---- Stats fetch ----
async function fetchStats() {
  try {
    const res = await fetch(STATS_URL);
    if (!res.ok) return;
    const json = await res.json();
    const s = json.stats || {};
    animateCounter('statTotal', s.total_searches || 0);
    animateCounter('statSuccess', s.successful_searches || 0);
    animateCounter('statRequests', s.total_searches || 0);
  } catch (_) {}
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent.replace(/,/g, '')) || 0;
  const duration = 800;
  const startTime = performance.now();
  function step(now) {
    const p = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(start + (target - start) * easeOut(p)).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ---- Action buttons ----
function copyUID() {
  const uid = document.getElementById('rUid')?.textContent?.replace('UID: ', '').trim();
  if (!uid || uid === '—') { showToast('No UID to copy.', 'error'); return; }
  navigator.clipboard.writeText(uid).then(() => showToast('UID copied!', 'success'));
}

async function downloadPNG() {
  const target = document.getElementById('resultSnapshot');
  if (!target) return;
  showToast('Generating image…', 'info');
  const canvas = await html2canvas(target, { backgroundColor: '#0A0A0A', scale: 2 });
  const link = document.createElement('a');
  link.download = `ffinfo_${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
  showToast('PNG downloaded!', 'success');
}

async function downloadPDF() {
  const target = document.getElementById('resultSnapshot');
  if (!target) return;
  showToast('Generating PDF…', 'info');
  const canvas = await html2canvas(target, { backgroundColor: '#0A0A0A', scale: 2 });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`ffinfo_${Date.now()}.pdf`);
  showToast('PDF downloaded!', 'success');
}

function shareResult() {
  const uid = document.getElementById('rUid')?.textContent?.replace('UID: ', '').trim();
  const url = `${location.origin}?uid=${uid}`;
  if (navigator.share) {
    navigator.share({ title: 'FF Info', text: `Check out UID ${uid} on FF Info`, url });
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied!', 'success'));
  }
}

// ---- Charts ----
function initCharts() {
  const dailyLabels = ['00', '04', '08', '12', '16', '20', '23'];
  const dailyData   = [12, 8, 25, 42, 38, 55, 20];
  const weekLabels  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData    = [80, 120, 95, 200, 175, 260, 145];

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(22,22,30,0.95)',
        borderColor: 'rgba(255,107,0,0.3)',
        borderWidth: 1,
        titleColor: '#FF6B00',
        bodyColor: '#E8E8F0',
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8888AA', font: { family: 'Share Tech Mono' } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8888AA', font: { family: 'Share Tech Mono' } } }
    }
  };

  const dailyCtx = document.getElementById('dailyChart');
  if (dailyCtx) {
    new Chart(dailyCtx, {
      type: 'line',
      data: {
        labels: dailyLabels,
        datasets: [{
          label: 'Searches',
          data: dailyData,
          borderColor: '#FF6B00',
          backgroundColor: 'rgba(255,107,0,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FF6B00',
          pointRadius: 4,
        }]
      },
      options: chartDefaults
    });
  }

  const weeklyCtx = document.getElementById('weeklyChart');
  if (weeklyCtx) {
    new Chart(weeklyCtx, {
      type: 'bar',
      data: {
        labels: weekLabels,
        datasets: [{
          label: 'Searches',
          data: weekData,
          backgroundColor: 'rgba(123,46,255,0.5)',
          borderColor: '#7B2EFF',
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: chartDefaults
    });
  }
}

// ---- Particles ----
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  const count = Math.min(Math.floor(W / 18), 80);
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
    a: Math.random() * 0.5 + 0.1,
    color: ['#FF6B00','#7B2EFF','#00D4FF'][Math.floor(Math.random()*3)]
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.a;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });
}

// ---- URL auto-search ----
window.addEventListener('load', () => {
  const params = new URLSearchParams(location.search);
  const uid = params.get('uid');
  if (uid) {
    uidInput.value = uid;
    toggleClearBtn();
    setTimeout(handleSearch, 600);
  }
});
