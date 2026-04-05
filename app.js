// ════════════════════════════════
// SUPABASE CONFIG
// ════════════════════════════════
const SUPABASE_URL  = 'https://brpwyffpqipleayknlyb.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycHd5ZmZwcWlwbGVheWtubHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDc2OTAsImV4cCI6MjA5MDk4MzY5MH0.Xtma_-jTimHTcU6SZkvhdP4GkaC9oDAWRXEqAhHAgek';

// Cliente Supabase (via CDN carregado no HTML)
let sb;

// ════════════════════════════════
// ESTADO
// ════════════════════════════════
let currentUser = null;

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
function hideMsg(id) {
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
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  hideMsg('login-error');

  if (!email || !pass) { showError('login-error', 'Preencha e-mail e senha.'); return; }

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  btn.disabled = false;
  btn.textContent = 'Entrar';

  if (error) {
    const msg = error.message.includes('Invalid') ? 'E-mail ou senha incorretos.' : error.message;
    showError('login-error', msg);
    return;
  }

  const name = data.user.user_metadata?.name || email.split('@')[0];
  loginSuccess(data.user, name);
}

// ════════════════════════════════
// REGISTRO
// ════════════════════════════════
async function handleRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  hideMsg('reg-error'); hideMsg('reg-success');

  if (!name || !email || !pass) { showError('reg-error', 'Preencha todos os campos.'); return; }
  if (pass.length < 8) { showError('reg-error', 'A senha precisa ter ao menos 8 caracteres.'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { showError('reg-error', 'Informe um e-mail válido.'); return; }

  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.textContent = 'Criando conta...';

  const { data, error } = await sb.auth.signUp({
    email,
    password: pass,
    options: { data: { name } }
  });

  btn.disabled = false;
  btn.textContent = 'Criar conta';

  if (error) { showError('reg-error', error.message); return; }

  // Supabase pode exigir confirmação de e-mail
  if (data.user && !data.session) {
    showSuccess('reg-success', 'Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    return;
  }

  showSuccess('reg-success', 'Conta criada com sucesso! Redirecionando...');
  setTimeout(() => loginSuccess(data.user, name), 1200);
}

// ════════════════════════════════
// RECUPERAÇÃO DE SENHA
// ════════════════════════════════
async function handleRecover() {
  const email = document.getElementById('rec-email').value.trim().toLowerCase();
  hideMsg('rec-error'); hideMsg('rec-success');

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    showError('rec-error', 'Informe um e-mail válido.');
    return;
  }

  const btn = document.getElementById('btn-recover');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });

  btn.disabled = false;
  btn.textContent = 'Enviar link de recuperação';

  if (error) { showError('rec-error', error.message); return; }

  showSuccess('rec-success', `Link de recuperação enviado para ${email}. Verifique sua caixa de entrada.`);
}

// ════════════════════════════════
// SESSION
// ════════════════════════════════
function loginSuccess(user, name) {
  const displayName = name || user.user_metadata?.name || user.email.split('@')[0];
  currentUser = { id: user.id, email: user.email, name: displayName };

  const firstName = displayName.split(' ')[0];
  const initials  = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  showPage('page-app');

  const avatarEl   = document.getElementById('user-avatar');
  const nameEl     = document.getElementById('user-name-display');
  const greetingEl = document.getElementById('hero-greeting');
  const avatarH    = document.getElementById('user-avatar-h');
  const nameH      = document.getElementById('user-name-h');

  if (avatarEl)   avatarEl.textContent   = initials;
  if (nameEl)     nameEl.textContent     = displayName;
  if (greetingEl) greetingEl.textContent = `Vooa, ${firstName}!`;
  if (avatarH)    avatarH.textContent    = initials;
  if (nameH)      nameH.textContent      = displayName;

  const notice = document.getElementById('api-notice');
  if (notice) notice.style.display = 'none';

  resetSearchUI();
  loadHistory();
}

async function logout() {
  await sb.auth.signOut();
  currentUser = null;
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
// HISTÓRICO — Supabase
// ════════════════════════════════
async function loadHistory() {
  if (!currentUser) return;

  const { data, error } = await sb
    .from('historico')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) { console.error('Erro ao carregar histórico:', error); return; }

  const section = document.getElementById('history-section');
  const list    = document.getElementById('history-list');
  if (!section || !list) return;

  if (!data?.length) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  list.innerHTML = data.slice(0, 5).map((item, i) => `
    <div class="history-item" onclick="replaySearch(${i})" data-id="${item.id}"
         data-origem="${item.origem}" data-destino="${item.destino}"
         data-ida="${item.ida}" data-volta="${item.volta || ''}">
      <div class="hi-left">
        <span class="hi-route">${item.origem} → ${item.destino}</span>
        <span class="hi-date">${formatDate(item.ida)}${item.volta ? ' · volta ' + formatDate(item.volta) : ''}</span>
      </div>
      <span class="hi-arrow">→</span>
    </div>
  `).join('');

  // Guarda lista completa para página de histórico
  window._historyData = data;
}

function replaySearch(i) {
  const data = window._historyData;
  if (!data?.[i]) return;
  const item = data[i];
  document.getElementById('s-origem').value  = item.origem;
  document.getElementById('s-destino').value = item.destino;
  document.getElementById('s-ida').value     = item.ida;
  document.getElementById('s-volta').value   = item.volta || '';
  buscarPassagens();
}

async function addToHistory(origem, destino, ida, volta) {
  if (!currentUser) return;
  const { error } = await sb.from('historico').insert({
    user_id: currentUser.id,
    origem,
    destino,
    ida,
    volta: volta || null
  });
  if (error) console.error('Erro ao salvar histórico:', error);
  else loadHistory();
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
  const data      = window._historyData || [];
  const list      = document.getElementById('history-page-list');
  const empty     = document.getElementById('history-page-empty');
  const title     = document.getElementById('history-page-title');
  const firstName = currentUser.name.split(' ')[0];

  if (title) title.textContent = `Viagens de ${firstName}`;
  if (!list) return;

  if (!data.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = data.map((item, i) => `
    <div class="hpage-card" onclick="replayFromHistory(${i})">
      <div class="hpage-icon">✈</div>
      <div class="hpage-info">
        <div class="hpage-route">${item.origem} → ${item.destino}</div>
        <div class="hpage-dates">
          Ida: ${formatDate(item.ida)}${item.volta ? ' · Volta: ' + formatDate(item.volta) : ''}
        </div>
        <div class="hpage-when">Buscado em ${new Date(item.created_at).toLocaleDateString('pt-BR')}</div>
      </div>
      <div class="hpage-action">Buscar novamente →</div>
    </div>
  `).join('');
}

function replayFromHistory(i) {
  const data = window._historyData;
  if (!data?.[i]) return;
  const item = data[i];
  showPage('page-app');
  document.getElementById('s-origem').value  = item.origem;
  document.getElementById('s-destino').value = item.destino;
  document.getElementById('s-ida').value     = item.ida;
  document.getElementById('s-volta').value   = item.volta || '';
  buscarPassagens();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
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

  if (errEl) errEl.classList.remove('show');

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

  await addToHistory(origem, destino, ida, volta);

  try {
    const prompt = buildPrompt(origem, destino, ida, volta);
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

// ════════════════════════════════
// INIT
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa Supabase
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  // Botões
  document.getElementById('btn-login')?.addEventListener('click', handleLogin);
  document.getElementById('btn-register')?.addEventListener('click', handleRegister);
  document.getElementById('btn-recover')?.addEventListener('click', handleRecover);
  document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('reg-pass')?.addEventListener('keydown',  e => { if (e.key === 'Enter') handleRegister(); });

  // Datas padrão
  const today = new Date();
  const fmt   = d => d.toISOString().split('T')[0];
  const d30   = new Date(today); d30.setDate(today.getDate() + 30);
  const d37   = new Date(today); d37.setDate(today.getDate() + 37);
  const idaEl   = document.getElementById('s-ida');
  const voltaEl = document.getElementById('s-volta');
  if (idaEl)   idaEl.value   = fmt(d30);
  if (voltaEl) voltaEl.value = fmt(d37);

  // Verifica sessão existente
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    const name = session.user.user_metadata?.name || session.user.email.split('@')[0];
    loginSuccess(session.user, name);
    return;
  }

  // Escuta mudanças de sessão (login/logout)
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const name = session.user.user_metadata?.name || session.user.email.split('@')[0];
      loginSuccess(session.user, name);
    }
    if (event === 'SIGNED_OUT') {
      showPage('page-login');
    }
  });

  showPage('page-login');
});
