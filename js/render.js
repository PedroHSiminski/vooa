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

  if (data.passagens?.length) {
    html += `<div class="result-section">
      <div class="result-section-title">Passagens — ${origem} → ${destino}</div>`;

    data.passagens.forEach(p => {
      const isBest = p.tipo === 'melhor';
      const link   = gerarLink(p.site, origem, destino, ida, volta);
      html += `
        <a class="result-card ${isBest ? 'best' : ''}" href="${link}" target="_blank" rel="noopener noreferrer">
          <div>
            ${isBest ? '<span class="rc-badge">✓ Melhor opção</span>' : ''}
            <div class="rc-route">${p.site}</div>
            <div class="rc-details">${p.descricao}</div>
            <div class="rc-source">Fonte: ${p.fonte}</div>
            <div class="rc-disclaimer">⚠ Preço estimado pela IA — confirme o valor no site antes de comprar</div>
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
      html += `
        <a class="result-card" href="${link}" target="_blank" rel="noopener noreferrer">
          <div>
            <div class="rc-route">${h.site}</div>
            <div class="rc-details">${h.descricao}</div>
            <div class="rc-source">Fonte: ${h.fonte}</div>
            <div class="rc-disclaimer">⚠ Preço estimado pela IA — confirme o valor no site antes de reservar</div>
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

  document.getElementById('results-grid').innerHTML = html;
  document.getElementById('results-container').style.display = 'block';
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
        <div><div class="rc-route">Google Flights</div><div class="rc-details">Comparador com múltiplas companhias — sempre atualizado</div></div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
      <a class="result-card" href="https://www.decolar.com" target="_blank" rel="noopener">
        <div><div class="rc-route">Decolar</div><div class="rc-details">Principal OTA da América Latina</div></div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
      <a class="result-card" href="https://www.latam.com" target="_blank" rel="noopener">
        <div><div class="rc-route">Latam Airlines</div><div class="rc-details">Compra direta na companhia aérea</div></div>
        <div class="rc-price-block"><span class="rc-link">Buscar →</span></div>
      </a>
    </div>`;

  document.getElementById('results-container').style.display = 'block';
}
