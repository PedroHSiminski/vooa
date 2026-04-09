// ════════════════════════════════
// search.js — Busca com IA
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

  document.getElementById('empty-state').style.display      = 'none';
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('loading-wrap').classList.add('show');
  document.getElementById('btn-buscar').disabled = true;

  await addToHistory(origem, destino, ida, volta);

  try {
    const prompt   = buildPrompt(origem, destino, ida, volta);
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

    if (data.error) {
      renderFallback('Erro na API: ' + data.error.message, origem, destino);
      return;
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.filter(p => p.text)?.map(p => p.text)?.join('\n') || '';

    const parsed = parseResponse(text);

    if (!parsed) {
      renderFallback('Não foi possível interpretar a resposta. Tente novamente.', origem, destino);
      return;
    }

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

Pesquise na web os melhores preços ATUAIS de passagens aéreas e hospedagem. Use o Google Search.

IMPORTANTE: Sugira apenas sites desta lista: Latam, Gol, Azul, Decolar, Google Flights, Kayak, Skyscanner, Booking.com, Airbnb. Não sugira outros sites.

Retorne APENAS um JSON válido neste formato, sem texto adicional, sem markdown, sem backticks:

{
  "analise": "2-3 frases com contexto da rota e dica principal de compra",
  "passagens": [
    {
      "site": "Nome do site (apenas da lista acima)",
      "preco": "R$ X.XXX",
      "descricao": "Companhia aérea, número de escalas e duração estimada",
      "tipo": "melhor",
      "fonte": "Encontrado via Google Search em tempo real"
    }
  ],
  "hospedagem": [
    {
      "site": "Booking.com ou Airbnb",
      "preco": "R$ XXX/noite",
      "descricao": "Tipo de acomodação e localização em ${destino}",
      "fonte": "Encontrado via Google Search em tempo real"
    }
  ]
}`;
}

function parseResponse(text) {
  try {
    const clean = text.replace(/```json|```/gi, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch(e) {
    return null;
  }
}
