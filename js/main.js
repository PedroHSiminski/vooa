// ════════════════════════════════
// main.js — Inicialização do app
// ════════════════════════════════

const SUPABASE_URL  = 'https://brpwyffpqipleayknlyb.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycHd5ZmZwcWlwbGVheWtubHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDc2OTAsImV4cCI6MjA5MDk4MzY5MH0.Xtma_-jTimHTcU6SZkvhdP4GkaC9oDAWRXEqAhHAgek';

let sb          = null;
let currentUser = null;

// ── Captura o evento de instalação o mais cedo possível ──
// Deve ficar FORA do DOMContentLoaded para não perder o evento
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  // Tenta mostrar o botão imediatamente se o DOM já estiver pronto
  _tryShowInstallBtn();
});

function _tryShowInstallBtn() {
  const btn = document.getElementById('btn-install-app');
  if (btn && _installPrompt) {
    btn.style.display = 'flex';
  }
}

// Quando o app já está instalado, esconde o botão
window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  const btn = document.getElementById('btn-install-app');
  if (btn) btn.style.display = 'none';
});

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

// ── Detecta token de redefinição de senha na URL ──
function detectPasswordReset() {
  const hash = window.location.hash;
  if (!hash) return false;

  // O Supabase coloca os parâmetros no hash como query string
  // Ex: #access_token=...&type=recovery&...
  const params = new URLSearchParams(hash.substring(1));
  const type   = params.get('type');
  const token  = params.get('access_token');

  if (type === 'recovery' && token) {
    // Limpa o hash da URL sem recarregar a página
    history.replaceState(null, '', window.location.pathname);
    return true;
  }

  return false;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa Supabase
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  // Eventos de auth
  document.getElementById('btn-login')?.addEventListener('click', handleLogin);
  document.getElementById('btn-register')?.addEventListener('click', handleRegister);
  document.getElementById('btn-recover')?.addEventListener('click', handleRecover);
  document.getElementById('btn-reset-pass')?.addEventListener('click', handleResetPassword);

  // Enter nos campos de senha
  document.getElementById('login-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('reg-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });
  document.getElementById('reset-pass-confirm')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleResetPassword();
  });

  setDefaultDates();

  // Caso o beforeinstallprompt já tenha disparado antes do DOM estar pronto
  _tryShowInstallBtn();

  // ── Verifica se é um link de redefinição de senha ──
  // Deve ser checado ANTES de getSession, pois o Supabase
  // processa o token do hash e cria uma sessão temporária
  if (detectPasswordReset()) {
    // O onAuthStateChange abaixo vai capturar o evento PASSWORD_RECOVERY
    // e chamar showPage('page-reset-pass') automaticamente
  } else {
    // Verifica sessão ativa normalmente
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      const name = session.user.user_metadata?.name || session.user.email.split('@')[0];
      loginSuccess(session.user, name);
      return;
    }

    showPage('page-login');
  }

  // Escuta mudanças de autenticação
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      // Usuário clicou no link do e-mail — mostra tela de nova senha
      showPage('page-reset-pass');
      return;
    }

    if (event === 'SIGNED_IN' && session?.user) {
      // Só redireciona para o app se NÃO estiver na tela de nova senha
      const resetPage = document.getElementById('page-reset-pass');
      if (resetPage?.classList.contains('active')) return;

      const name = session.user.user_metadata?.name || session.user.email.split('@')[0];
      loginSuccess(session.user, name);
    }

    if (event === 'SIGNED_OUT') {
      showPage('page-login');
    }
  });
});
