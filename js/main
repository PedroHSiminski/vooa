// ════════════════════════════════
// main.js — Inicialização do app
// ════════════════════════════════

const SUPABASE_URL  = 'https://brpwyffpqipleayknlyb.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycHd5ZmZwcWlwbGVheWtubHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDc2OTAsImV4cCI6MjA5MDk4MzY5MH0.Xtma_-jTimHTcU6SZkvhdP4GkaC9oDAWRXEqAhHAgek';

let sb          = null;
let currentUser = null;

// ── Navegação ──
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

// ── Datas padrão ──
function setDefaultDates() {
  const fmt = d => d.toISOString().split('T')[0];
  const today = new Date();
  const d30   = new Date(today); d30.setDate(today.getDate() + 30);
  const d37   = new Date(today); d37.setDate(today.getDate() + 37);
  const idaEl   = document.getElementById('s-ida');
  const voltaEl = document.getElementById('s-volta');
  if (idaEl)   idaEl.value   = fmt(d30);
  if (voltaEl) voltaEl.value = fmt(d37);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa Supabase
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  // Eventos de auth
  document.getElementById('btn-login')?.addEventListener('click', handleLogin);
  document.getElementById('btn-register')?.addEventListener('click', handleRegister);
  document.getElementById('btn-recover')?.addEventListener('click', handleRecover);

  // Enter nos campos de senha
  document.getElementById('login-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('reg-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });

  setDefaultDates();

  // Verifica sessão ativa
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    const name = session.user.user_metadata?.name || session.user.email.split('@')[0];
    loginSuccess(session.user, name);
    return;
  }

  // Escuta mudanças de autenticação
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
