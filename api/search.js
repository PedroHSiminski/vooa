const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(apiKey, body, attempt = 1) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  // Sobrecarga (503) ou rate limit (429) — tenta de novo até 3x
  const retryable = response.status === 503 || response.status === 429;
  if (retryable && attempt < 3) {
    const delay = attempt * 3000; // 3s, depois 6s
    console.log(`Gemini sobrecarregado (tentativa ${attempt}). Aguardando ${delay}ms...`);
    await wait(delay);
    return callGemini(apiKey, body, attempt + 1);
  }

  return { status: response.status, data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key não configurada no servidor.' });
  }

  try {
    const { status, data } = await callGemini(apiKey, req.body);
    return res.status(status).json(data);
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'Erro interno ao contatar a API.' });
  }
}
