// ════════════════════════════════
// links.js — Gerador de links reais
// ════════════════════════════════

const IATA = {
  'porto alegre': 'POA', 'são paulo': 'GRU', 'sao paulo': 'GRU',
  'rio de janeiro': 'GIG', 'brasília': 'BSB', 'brasilia': 'BSB',
  'salvador': 'SSA', 'fortaleza': 'FOR', 'recife': 'REC',
  'manaus': 'MAO', 'belém': 'BEL', 'belem': 'BEL',
  'curitiba': 'CWB', 'florianópolis': 'FLN', 'florianopolis': 'FLN',
  'belo horizonte': 'CNF', 'goiânia': 'GYN', 'goiania': 'GYN',
  'natal': 'NAT', 'maceió': 'MCZ', 'maceio': 'MCZ',
  'vitória': 'VIX', 'vitoria': 'VIX', 'campo grande': 'CGR',
  'cuiabá': 'CGB', 'cuiaba': 'CGB', 'teresina': 'THE',
  'são luís': 'SLZ', 'sao luis': 'SLZ', 'aracaju': 'AJU',
  'joão pessoa': 'JPA', 'palmas': 'PMW', 'porto velho': 'PVH',
  'boa vista': 'BVB', 'rio branco': 'RBR', 'macapá': 'MCP',
  // Internacional
  'lisboa': 'LIS', 'london': 'LHR', 'londres': 'LHR',
  'paris': 'CDG', 'madrid': 'MAD', 'roma': 'FCO', 'rome': 'FCO',
  'miami': 'MIA', 'new york': 'JFK', 'nova york': 'JFK',
  'boston': 'BOS', 'orlando': 'MCO', 'los angeles': 'LAX',
  'cancún': 'CUN', 'cancun': 'CUN', 'buenos aires': 'EZE',
  'santiago': 'SCL', 'bogotá': 'BOG', 'bogota': 'BOG',
  'lima': 'LIM', 'amsterdam': 'AMS', 'frankfurt': 'FRA',
  'dubai': 'DXB', 'tokyo': 'NRT', 'tóquio': 'NRT',
  'bangkok': 'BKK', 'barcelona': 'BCN', 'milan': 'MXP',
  'milão': 'MXP', 'toronto': 'YYZ', 'mexico city': 'MEX',
  'cidade do méxico': 'MEX', 'chicago': 'ORD'
};

function getIATA(cidade) {
  return IATA[cidade.toLowerCase().trim()] || cidade.toUpperCase().slice(0, 3);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function fmtBR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function gerarLink(site, origem, destino, ida, volta) {
  const orig = getIATA(origem);
  const dest = getIATA(destino);
  const oEnc = encodeURIComponent(origem);
  const dEnc = encodeURIComponent(destino);
  const checkOut = volta || addDays(ida, 7);
  const nome = site.toLowerCase();

  if (nome.includes('google') || nome.includes('flights')) {
    return `https://www.google.com/travel/flights?q=Flights+from+${oEnc}+to+${dEnc}+on+${ida}`;
  }
  if (nome.includes('decolar')) {
    return volta
      ? `https://www.decolar.com/flights/${orig}/${dest}/${ida}/${volta}/1/0/0`
      : `https://www.decolar.com/flights/${orig}/${dest}/${ida}/1/0/0`;
  }
  if (nome.includes('latam')) {
    return `https://www.latam.com/pt_br/apps/personas/booking?fecha1_${orig}_${dest}=${fmtBR(ida)}&fecha2_${dest}_${orig}=${fmtBR(volta)}&from=${orig}&to=${dest}&adults=1&children=0&babies=0&trip=${volta ? 'RT' : 'OW'}`;
  }
  if (nome.includes('gol')) {
    return `https://www.voegol.com.br/pt/passagens-aereas?from=${orig}&to=${dest}&departure=${ida}&return=${volta || ''}&adults=1&children=0&infants=0&tripType=${volta ? 'roundtrip' : 'oneway'}`;
  }
  if (nome.includes('azul')) {
    return `https://www.voeazul.com.br/br/pt/home/selecionar-voo?c[0].ds=${orig}&c[0].std=${ida}&c[0].as=${dest}&c[1].ds=${dest}&c[1].std=${volta || ''}&c[1].as=${orig}&p[0].t=ADT&p[0].c=1`;
  }
  if (nome.includes('kayak')) {
    const rota = volta ? `${orig}-${dest}/${ida}/${dest}-${orig}/${volta}` : `${orig}-${dest}/${ida}`;
    return `https://www.kayak.com.br/flights/${rota}/1adults`;
  }
  if (nome.includes('skyscanner')) {
    return `https://www.skyscanner.com.br/passagens-aereas/${orig}/${dest}/${ida}/${volta || ''}/?adults=1`;
  }
  if (nome.includes('booking')) {
    return `https://www.booking.com/searchresults.pt-br.html?ss=${dEnc}&checkin=${ida}&checkout=${checkOut}&group_adults=1`;
  }
  if (nome.includes('airbnb')) {
    return `https://www.airbnb.com.br/s/${dEnc}/homes?checkin=${ida}&checkout=${checkOut}&adults=1`;
  }
  if (nome.includes('trivago')) {
    return `https://www.trivago.com.br/?aDateRange[arr]=${ida}&aDateRange[dep]=${checkOut}&sQuery=${dEnc}`;
  }

  // Fallback sempre funcional
  return `https://www.google.com/travel/flights?q=Flights+from+${oEnc}+to+${dEnc}+on+${ida}`;
}
