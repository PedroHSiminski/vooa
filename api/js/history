// ════════════════════════════════
// history.js — Histórico de buscas
// ════════════════════════════════

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

async function loadHistory() {
  if (!currentUser) return;

  const { data, error } = await sb
    .from('historico')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) { console.error('Erro ao carregar histórico:', error); return; }

  window._historyData = data || [];

  const section = document.getElementById('history-section');
  const list    = document.getElementById('history-list');
  if (!section || !list) return;

  if (!data?.length) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  list.innerHTML = data.slice(0, 5).map((item, i) => `
    <div class="history-item" onclick="replaySearch(${i})">
      <div class="hi-left">
        <span class="hi-route">${item.origem} → ${item.destino}</span>
        <span class="hi-date">
          ${formatDate(item.ida)}${item.volta ? ' · volta ' + formatDate(item.volta) : ''}
        </span>
      </div>
      <span class="hi-arrow">→</span>
    </div>
  `).join('');
}

function replaySearch(i) {
  const item = window._historyData?.[i];
  if (!item) return;
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

// ── Página completa de histórico ──
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
          Ida: ${formatDate(item.ida)}
          ${item.volta ? ' · Volta: ' + formatDate(item.volta) : ''}
        </div>
        <div class="hpage-when">
          Buscado em ${new Date(item.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>
      <div class="hpage-action">Buscar novamente →</div>
    </div>
  `).join('');
}

function replayFromHistory(i) {
  const item = window._historyData?.[i];
  if (!item) return;
  showPage('page-app');
  document.getElementById('s-origem').value  = item.origem;
  document.getElementById('s-destino').value = item.destino;
  document.getElementById('s-ida').value     = item.ida;
  document.getElementById('s-volta').value   = item.volta || '';
  buscarPassagens();
}
