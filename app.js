// ════════════════════════════════
// AUTH — localStorage
// ════════════════════════════════
let currentUser = null;

function getUsers() {
  try { return JSON.parse(localStorage.getItem('vooa_users') || '{}'); }
  catch(e) { return {}; }
}
function saveUsers(u) { localStorage.setItem('vooa_users', JSON.stringify(u)); }
function getHistory(email) {
  try { return JSON.parse(localStorage.getItem('vooa_hist_' + email) || '[]'); }
  catch(e) { return []; }
}
function saveHistory(email, h) {
  localStorage.setItem('vooa_hist_' + email, JSON.stringify(h.slice(0, 20)));
}

// ════════════════════════════════
// NAVEGAÇÃO
// ════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(id);
  if (t) t.classList.add('active');
  window.scrollTo(0, 0);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}
function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

// ════════════════════════════════
// LOGIN
// ════════════════════════════════
function handleLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  hideError('login-error');

  if (!email || !pass) { showError('login-error', 'Preencha e-mail e senha.'); return; }

  const users = getUsers();
  if (!users[email]) { showError('login-error', 'E-mail não cadastrado. Crie uma conta primeiro.'); return; }
  if (users[email].pass !== btoa(unescape(encodeURIComponent(pass)))) {
    showError('login-error', 'Senha incorreta. Tente novamente.'); return;
  }
  loginSuccess(email, users[email].name);
}

// ════════════════════════════════
// REGISTRO
// ════════════════════════════════
function handleRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  hideError('reg-error'); hideError('reg-success');

  if (!name || !email || !pass) { showError('reg-error', 'Preencha todos os campos.'); return; }
  if (pass.length < 8) { showError('reg-error', 'A senha precisa ter ao menos 8 caracteres.'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { showError('reg-error', 'Informe um e-mail válido.'); return; }

  const users = getUsers();
  if (users[email]) { showError('reg-error', 'E-mail já cadastrado. Faça login.'); return; }

  users[email] = { name, pass: btoa(unescape(encodeURIComponent(pass))), createdAt: new Date().toISOString() };
  saveUsers(users);
  showSuccess('reg-success', 'Conta criada com sucesso! Redirecionando...');
  setTimeout(() => loginSuccess(email, name), 1200);
}

// ════════════════════════════════
// RECUPERAÇÃO
// ════════════════════════════════
function handleRecover() {
  const email = document.getElementById('rec-email').value.trim().toLowerCase();
  hideError('rec-error'); hideError('rec-success');
  if (!email || !/\S+@\S+\.\S+/.test(email)) { showError('rec-error', 'Informe um e-mail válido.'); return; }
  showSuccess('rec-success', `Se ${email} estiver cadastrado, você receberá as instruções em breve.`);
}

// ════════════════════════════════
// SESSION
// ════════════════════════════════
function loginSuccess(email, name) {
  currentUser = { email, name };
  localStorage.setItem('vooa_session', JSON.stringify(currentUser));

  const firstName = name.split(' ')[0];
  const initials  = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  showPage('page-app');

  // Header
  const avatarEl    = document.getElementById('user-avatar');
  const nameEl      = document.getElementById('user-name-display');
  const greetingEl  = document.getElementById('hero-greeting');
  if (avatarEl)   avatarEl.textContent   = initials;
  if (nameEl)     nameEl.textContent     = name;
  if (greetingEl) greetingEl.textContent = `Vooa, ${firstName}!`;

  // API notice — chave fica no servidor, não exposta aqui
  const notice = document.getElementById('api-notice');
  if (notice) notice.style.display = 'none';

  resetSearchUI();
  loadHistory();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('vooa_session');
  showPage('page-login');
  const e = document.getElementById('login-email');
  const p = document.getElementById('login-pass');
  if (e) e.value = '';
  if (p) p.value = '';
}

function resetSearchUI() {
  const empty   = document.getElementById('empty-state');
  const results = document.getElementById('results-container');
  const loading = document.getElementById('loading-wrap');
  const err     = document.getElementById('search-error');
  if (empty)   empty.style.display   = 'block';
  if (results) results.style.display = 'none';
  if (loading) loading.classList.remove('show');
  if (err)     err.classList.remove('show');
}

// ════════════════════════════════
// PÁGINA DE HISTÓRICO
// ════════════════════════════════
function showHistoryPage() {
  if (!currentUser) return;
  showPage('page-history');
  renderHistoryPage();
}

function renderHistoryPage() {
  const history = getHistory(currentUser.email);
  const list    = document.getElementById('history-page-list');
  const empty   = document.getElementById('history-page-empty');
  const firstName = currentUser.name.split(' ')[0];

  // Título personalizado
  const title = document.getElementById('history-page-title');
  if (title) title.textContent = `Viagens de ${firstName}`;

  if (!list) return;

  if (!history.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = history.map((item, i) => `
    <div class="hpage-card" onclick="replayFromHistory(${i})">
      <div class="hpage-icon">✈</div>
      <div class="hpage-info">
        <div class="hpage-route">${item.origem} → ${item.destino}</div>
        <div class="hpage-dates">
          Ida: ${formatDate(item.ida)}
          ${item.volta ? ' · Volta: ' + formatDate(item.volta) : ''}
        </div>
        <div class="hpage-when">Buscado em ${item.date}</div>
      </div>
      <div class="hpage-action">Buscar novamente →</div>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function replayFromHistory(i) {
  const history = getHistory(currentUser.email);
  const item = history[i];
  if (!item) return;
  showPage('page-app');
  document.getElementById('s-origem').value  = item.origem;
  document.getElementById('s-destino').value = item.destino;
  document.getElementById('s-ida').value     = item.ida;
  document.getElementById('s-volta').value   = item.volta || '';
  buscarPassagens();
}

// ════════════════════════════════
// HISTÓRICO (mini lista no app)
// ════════════════════════════════
function loadHistory() {
  if (!currentUser) return;
  const history = getHistory(currentUser.email);
  const section = document.getElementById('history-section');
  const list    = document.getElementById('history-list');
  if (!section || !list) return;

  if (!history.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = history.slice(0, 5).map((item, i) => `
    <div class="history-item" onclick="replaySearch(${i})">
      <div class="hi-left">
        <span class="hi-route">${item.origem} → ${item.destino}</span>
        <span class="hi-date">${formatDate(item.ida)}${item.volta ? ' · volta ' + formatDate(item.volta) : ''} · ${item.date}</span>
      </div>
      <span class="hi-arrow">→</span>
    </div>
  `).join('');
}

function replaySearch(i) {
  const history = getHistory(currentUser.email);
  const item = history[i];
  if (!item) return;
  document.getElementById('s-origem').value  = item.origem;
  document.getElementById('s-destino').value = item.destino;
  document.getElementById('s-ida').value     = item.ida;
  document.getElementById('s-volta').value   = item.volta || '';
  buscarPassagens();
}

function addToHistory(origem, destino, ida, volta) {
  if (!currentUser) return;
  const history = getHistory(currentUser.email);
  if (history[0]?.origem === origem && history[0]?.destino === destino && history[0]?.ida === ida) return;
  history.unshift({ origem, destino, ida, volta, date: new Date().toLocaleDateString('pt-BR') });
  saveHistory(currentUser.email, history);
  loadHistory();
}

// ════════════════════════════════
// BUSCA
// ════════════════════════════════
async function buscarPassagens() {
  const origem  = document.getElementById('s-origem').value.trim();
  const destino = document.getElementById('s-destino').value.trim();
  const ida     = document.getElementById('s-ida').value;
  const volta   = document.getElementById('s-volta').value;
  const errEl   = document.getElementById('search-error');

  // Esconde erro anterior
  if (errEl) errEl.classList.remove('show');

  // Validação visual — sem alert()
  if (!origem || !destino || !ida) {
    if (errEl) {
      errEl.textContent = 'Selecione uma Origem e Destino!';
      errEl.classList.add('show');
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  document.getElementById('empty-state').style.display   = 'none';
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('loading-wrap').classList.add('show');
  document.getElementById('btn-buscar').disabled = true;

  addToHistory(origem, destino, ida, volta);

  try {
    const prompt = buildPrompt(origem, destino, ida, volta);
    // Chama o servidor Vercel — a chave Gemini nunca fica exposta no browser
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    if (data.error) { renderFallback('Erro na API: ' + data.error.message, origem, destino); return; }

    const text = data.candidates?.[0]?.content?.parts
      ?.filter(p => p.text)?.map(p => p.text)?.join('\n') || '';

    const parsed = parseResponse(text);
    if (!parsed) { renderFallback('Não foi possível interpretar a resposta. Tente novamente.', origem, destino); return; }
    renderResults(parsed, origem, destino);

  } catch(e) {
    console.error(e);
    renderFallback('Erro de conexão. Verifique sua internet e tente novamente.', origem, destino);
  }
}

function buildPrompt(origem, destino, ida, volta) {
  const voltaStr = volta ? `com volta em ${volta}` : '(somente ida)';
  return `Você é um assistente de busca de passagens aéreas especializado no mercado brasileiro.

O usuário quer viajar de ${origem} para ${destino}, saindo em ${ida} ${voltaStr}.

Pesquise na web os melhores preços ATUAIS de passagens aéreas e hospedagem. Use o Google Search para encontrar preços reais de hoje.

Retorne APENAS um JSON válido neste formato exato, sem texto adicional, sem markdown, sem backticks:

{
  "analise": "2-3 frases com contexto da rota e dica principal de compra",
  "passagens": [
    {
      "site": "Nome do site",
      "url": "URL direta",
      "preco": "R$ X.XXX",
      "descricao": "Companhia, escalas, duração",
      "tipo": "melhor",
      "fonte": "Encontrado via Google Search em tempo real"
    }
  ],
  "hospedagem": [
    {
      "site": "Nome do site",
      "url": "URL direta",
      "preco": "R$ XXX/noite",
      "descricao": "Tipo e localização em ${destino}",
      "fonte": "Encontrado via Google Search em tempo real"
    }
  ]
}`;
}

function parseResponse(text) {
  try {
    let clean = text.replace(/```json|```/gi, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch(e) { return null; }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ════════════════════════════════
// RENDER
// ════════════════════════════════
function renderResults(data, origem, destino) {
  document.getElementById('loading-wrap').classList.remove('show');
  document.getElementById('btn-buscar').disabled = false;

  document.getElementById('analysis-box').innerHTML =
    `<strong>Análise:</strong> ${data.analise || 'Resultados encontrados.'}`;

  let html = '';

  if (data.passagens?.length) {
    html += `<div class="result-section">
      <div class="result-section-title">Passagens — ${origem} → ${destino}</div>`;
    data.passagens.forEach(p => {
      const isBest = p.tipo === 'melhor';
      html += `
        <a class="result-card ${isBest ? 'best' : ''}" href="${p.url || '#'}" target="_blank" rel="noopener noreferrer">
          <div>
            ${isBest ? '<span class="rc-badge">✓ Melhor opção</span>' : ''}
            <div class="rc-route">${p.site}</div>
            <div class="rc-details">${p.descricao}</div>
            <div class="rc-source">Fonte: ${p.fonte}</div>
          </div>
          <div class="rc-price-block">
            <div class="rc-price">${p.preco}</div>
            <div class="rc-price-label">por pessoa</div>
            <span class="rc-link">Ver oferta →</span>
          </div>
        </a>`;
    });
    html += '</div>';
  }

  if (data.hospedagem?.length) {
    html += `<div class="result-section" style="margin-top:1.5rem">
      <div class="result-section-title">Hospedagem em ${destino}</div>`;
    data.hospedagem.forEach(h => {
      html += `
        <a class="result-card" href="${h.url || '#'}" target="_blank" rel="noopener noreferrer">
          <div>
            <div class="rc-route">${h.site}</div>
            <div class="rc-details">${h.descricao}</div>
            <div class="rc-source">Fonte: ${h.fonte}</div>
          </div>
          <div class="rc-price-block">
            <div class="rc-price">${h.preco}</div>
            <div class="rc-price-label">por noite</div>
            <span class="rc-link">Ver oferta →</span>
          </div>
        </a>`;
    });
    html += '</div>';
  }

  document.getElementById('results-grid').innerHTML = html;
  document.getElementById('results-container').style.display = 'block';
}

function renderFallback(msg, origem, destino) {
  document.getElementById('loading-wrap').classList.remove('show');
  document.getElementById('btn-buscar').disabled = false;
  document.getElementById('analysis-box').innerHTML = `<strong>Atenção:</strong> ${msg}`;
  const o = encodeURIComponent(origem), d = encodeURIComponent(destino);
  document.getElementById('results-grid').innerHTML = `
    <div class="result-section">
      <div class="result-section-title">Pesquise diretamente nos sites</div>
      <a class="result-card" href="https://www.google.com/travel/flights?q=voos+${o}+${d}" target="_blank" rel="noopener">
        <div><div class="rc-route">Google Flights</div><div class="rc-details">Comparador com múltiplas companhias</div><div class="rc-source">Link direto</div></div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
      <a class="result-card" href="https://www.decolar.com" target="_blank" rel="noopener">
        <div><div class="rc-route">Decolar</div><div class="rc-details">Principal OTA da América Latina</div><div class="rc-source">Link direto</div></div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
      <a class="result-card" href="https://www.latam.com" target="_blank" rel="noopener">
        <div><div class="rc-route">Latam Airlines</div><div class="rc-details">Compra direta na companhia</div><div class="rc-source">Link direto</div></div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
    </div>`;
  document.getElementById('results-container').style.display = 'block';
}

function renderDemo(origem, destino) {
  renderResults({
    analise: `Modo demonstração — ${origem} → ${destino}. Insira sua chave Gemini no arquivo app.js para ver preços reais em tempo real.`,
    passagens: [
      { site: 'Latam Airlines', url: 'https://www.latam.com', preco: 'R$ 2.890', descricao: 'Voo direto GRU–LIS, 10h20. Inclui bagagem despachada.', tipo: 'melhor', fonte: 'Demonstração' },
      { site: 'Decolar', url: 'https://www.decolar.com', preco: 'R$ 3.120', descricao: '1 escala em GRU, total ~14h. Tap Air Portugal.', tipo: 'alternativa', fonte: 'Demonstração' }
    ],
    hospedagem: [
      { site: 'Booking.com', url: 'https://www.booking.com', preco: 'R$ 380', descricao: 'Hotel no centro histórico. Avaliação 8.7/10.', fonte: 'Demonstração' }
    ]
  }, origem, destino);
}

// ════════════════════════════════
// INIT
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-login')?.addEventListener('click', handleLogin);
  document.getElementById('btn-register')?.addEventListener('click', handleRegister);
  document.getElementById('btn-recover')?.addEventListener('click', handleRecover);
  document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('reg-pass')?.addEventListener('keydown',   e => { if (e.key === 'Enter') handleRegister(); });

  // Datas padrão
  const today = new Date();
  const fmt   = d => d.toISOString().split('T')[0];
  const d30   = new Date(today); d30.setDate(today.getDate() + 30);
  const d37   = new Date(today); d37.setDate(today.getDate() + 37);
  const idaEl   = document.getElementById('s-ida');
  const voltaEl = document.getElementById('s-volta');
  if (idaEl)   idaEl.value   = fmt(d30);
  if (voltaEl) voltaEl.value = fmt(d37);

  // Restaura sessão
  try {
    const sess = localStorage.getItem('vooa_session');
    if (sess) {
      const u = JSON.parse(sess);
      const users = getUsers();
      if (users[u.email]) { loginSuccess(u.email, u.name); return; }
      else localStorage.removeItem('vooa_session');
    }
  } catch(e) { localStorage.removeItem('vooa_session'); }

  showPage('page-login');
});
