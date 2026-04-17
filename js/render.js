// ════════════════════════════════
// render.js — Exibição dos resultados
// ════════════════════════════════

function renderResults(data, origem, destino) {
  document.getElementById('loading-wrap').classList.remove('show');
  document.getElementById('btn-buscar').disabled = false;

  const ida   = document.getElementById('s-ida').value;
  const volta = document.getElementById('s-volta').value;

  document.getElementById('analysis-box').innerHTML =
    `<strong>Análise:</strong> ${data.analise || 'Resultados encontrados.'}`;

  let html = '';

  // ── Mini mapa de rota ──
  html += renderMiniMap(origem, destino);

  if (data.passagens?.length) {
    html += `<div class="result-section">
      <div class="result-section-title">Passagens — ${origem} → ${destino}</div>`;

    data.passagens.forEach((p, i) => {
      const isBest = p.tipo === 'melhor';
      const link   = gerarLink(p.site, origem, destino, ida, volta);
      const airline = detectAirline(p.site, p.descricao);
      html += `
        <a class="result-card ${isBest ? 'best' : ''}" href="${link}" target="_blank" rel="noopener noreferrer">
          <div class="rc-left">
            <div class="rc-airline-logo" style="background:${airline.color}">${airline.initials}</div>
            <div class="rc-info">
              ${isBest ? '<span class="rc-badge">✓ Melhor opção</span>' : ''}
              <div class="rc-route">${p.site}</div>
              <div class="rc-details">${p.descricao}</div>
              <div class="rc-tags">
                ${detectStops(p.descricao)}
                ${detectDuration(p.descricao)}
              </div>
              <div class="rc-source">Fonte: ${p.fonte}</div>
              <div class="rc-disclaimer">⚠ Preço estimado pela IA — confirme no site</div>
            </div>
          </div>
          <div class="rc-price-block">
            <div class="rc-price">${p.preco}</div>
            <div class="rc-price-label">referência</div>
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
      const link = gerarLink(h.site, origem, destino, ida, volta);
      const icon = h.site.toLowerCase().includes('airbnb') ? '🏠' : '🏨';
      html += `
        <a class="result-card" href="${link}" target="_blank" rel="noopener noreferrer">
          <div class="rc-left">
            <div class="rc-airline-logo" style="background:#1a3a5c;font-size:1.4rem">${icon}</div>
            <div class="rc-info">
              <div class="rc-route">${h.site}</div>
              <div class="rc-details">${h.descricao}</div>
              <div class="rc-source">Fonte: ${h.fonte}</div>
              <div class="rc-disclaimer">⚠ Preço estimado pela IA — confirme no site</div>
            </div>
          </div>
          <div class="rc-price-block">
            <div class="rc-price">${h.preco}</div>
            <div class="rc-price-label">referência/noite</div>
            <span class="rc-link">Ver oferta →</span>
          </div>
        </a>`;
    });
    html += '</div>';
  }

  // ── Botão compartilhar ──
  html += renderShareButton(origem, destino, ida, volta);

  document.getElementById('results-grid').innerHTML = html;
  document.getElementById('results-container').style.display = 'block';
}

// ── Mini mapa SVG de rota ──
function renderMiniMap(origem, destino) {
  const o = origem.substring(0, 3).toUpperCase();
  const d = destino.substring(0, 3).toUpperCase();
  return `
    <div class="mini-map">
      <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100px">
        <!-- Linha pontilhada da rota -->
        <path d="M60,50 Q200,10 340,50" fill="none" stroke="#C0623A" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.7"/>
        <!-- Arco sólido sobreposto -->
        <path d="M60,50 Q200,10 340,50" fill="none" stroke="#C0623A" stroke-width="2" stroke-dasharray="0" opacity="0.15"/>
        <!-- Ponto origem -->
        <circle cx="60" cy="50" r="6" fill="#1a2b4a" stroke="#C0623A" stroke-width="2"/>
        <!-- Ponto destino -->
        <circle cx="340" cy="50" r="6" fill="#C0623A"/>
        <!-- Avião no meio do arco -->
        <g transform="translate(200,18) rotate(0)">
          <text font-size="16" text-anchor="middle" fill="#C0623A">✈</text>
        </g>
        <!-- Labels -->
        <text x="60" y="75" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="11" font-weight="500" fill="#1a2b4a">${o}</text>
        <text x="60" y="87" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="#888">${origem.substring(0,12)}</text>
        <text x="340" y="75" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="11" font-weight="500" fill="#C0623A">${d}</text>
        <text x="340" y="87" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="#888">${destino.substring(0,12)}</text>
      </svg>
    </div>`;
}

// ── Botão de compartilhar ──
function renderShareButton(origem, destino, ida, volta) {
  return `
    <div class="share-wrap">
      <button class="btn-share" onclick="compartilharBusca('${origem}', '${destino}', '${ida}', '${volta}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Compartilhar esta busca
      </button>
      <div class="share-feedback" id="share-feedback"></div>
    </div>`;
}

// ── Compartilhar busca ──
function compartilharBusca(origem, destino, ida, volta) {
  const texto = `✈ Busquei passagens no Vooa!\n\n📍 ${origem} → ${destino}\n📅 Ida: ${formatarData(ida)}${volta ? '\n🔄 Volta: ' + formatarData(volta) : ''}\n\n🔗 Busque também em vooa.vercel.app`;
  const feedback = document.getElementById('share-feedback');

  if (navigator.share) {
    navigator.share({ title: 'Vooa — Busca de passagens', text: texto })
      .catch(() => {});
  } else {
    navigator.clipboard.writeText(texto).then(() => {
      feedback.textContent = '✓ Copiado para a área de transferência!';
      feedback.classList.add('show');
      setTimeout(() => feedback.classList.remove('show'), 3000);
    });
  }
}

function formatarData(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ── Detecta companhia aérea para o logo ──
function detectAirline(site, descricao) {
  const text = (site + ' ' + descricao).toLowerCase();
  if (text.includes('latam'))    return { initials: 'LA', color: '#d4002a' };
  if (text.includes('gol'))      return { initials: 'G3', color: '#f77f00' };
  if (text.includes('azul'))     return { initials: 'AD', color: '#003087' };
  if (text.includes('avianca')) return { initials: 'AV', color: '#b71234' };
  if (text.includes('american')) return { initials: 'AA', color: '#0078d2' };
  if (text.includes('tap'))      return { initials: 'TP', color: '#009e3f' };
  if (text.includes('iberia'))   return { initials: 'IB', color: '#d4002a' };
  if (text.includes('decolar'))  return { initials: 'DC', color: '#1a2b4a' };
  if (text.includes('kayak'))    return { initials: 'KY', color: '#ff690f' };
  if (text.includes('google'))   return { initials: 'GF', color: '#1a73e8' };
  if (text.includes('sky'))      return { initials: 'SK', color: '#0770e3' };
  return { initials: site.substring(0, 2).toUpperCase(), color: '#1a2b4a' };
}

// ── Detecta número de escalas ──
function detectStops(descricao) {
  const text = descricao.toLowerCase();
  if (text.includes('direto') || text.includes('sem escala') || text.includes('nonstop')) {
    return '<span class="rc-tag rc-tag-green">✓ Direto</span>';
  }
  if (text.includes('1 escala') || text.includes('uma escala')) {
    return '<span class="rc-tag">1 escala</span>';
  }
  if (text.includes('2 escala') || text.includes('duas escala')) {
    return '<span class="rc-tag rc-tag-warn">2 escalas</span>';
  }
  return '';
}

// ── Detecta duração do voo ──
function detectDuration(descricao) {
  const match = descricao.match(/(\d+)h\s*(\d+)?m?/i);
  if (match) return `<span class="rc-tag">⏱ ${match[0]}</span>`;
  return '';
}

function renderFallback(msg, origem, destino) {
  document.getElementById('loading-wrap').classList.remove('show');
  document.getElementById('btn-buscar').disabled = false;
  document.getElementById('analysis-box').innerHTML = `<strong>Atenção:</strong> ${msg}`;

  const oEnc = encodeURIComponent(origem);
  const dEnc = encodeURIComponent(destino);
  const ida  = document.getElementById('s-ida').value;

  document.getElementById('results-grid').innerHTML = `
    <div class="result-section">
      <div class="result-section-title">Pesquise diretamente nos sites</div>
      <a class="result-card" href="https://www.google.com/travel/flights?q=Flights+from+${oEnc}+to+${dEnc}+on+${ida}" target="_blank" rel="noopener">
        <div class="rc-left">
          <div class="rc-airline-logo" style="background:#1a73e8">GF</div>
          <div class="rc-info"><div class="rc-route">Google Flights</div><div class="rc-details">Comparador com múltiplas companhias — sempre atualizado</div></div>
        </div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
      <a class="result-card" href="https://www.decolar.com" target="_blank" rel="noopener">
        <div class="rc-left">
          <div class="rc-airline-logo" style="background:#1a2b4a">DC</div>
          <div class="rc-info"><div class="rc-route">Decolar</div><div class="rc-details">Principal OTA da América Latina</div></div>
        </div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
      <a class="result-card" href="https://www.latam.com" target="_blank" rel="noopener">
        <div class="rc-left">
          <div class="rc-airline-logo" style="background:#d4002a">LA</div>
          <div class="rc-info"><div class="rc-route">Latam Airlines</div><div class="rc-details">Compra direta na companhia aérea</div></div>
        </div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
    </div>`;

  document.getElementById('results-container').style.display = 'block';
}
