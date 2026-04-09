// ════════════════════════════════
// auth.js — Autenticação com Supabase
// ════════════════════════════════

function showMsg(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function hideMsg(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// ── Login ──
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  hideMsg('login-error');

  if (!email || !pass) {
    showMsg('login-error', 'Preencha e-mail e senha.');
    return;
  }

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  btn.disabled = false;
  btn.textContent = 'Entrar';

  if (error) {
    const msg = error.message.includes('Invalid') ? 'E-mail ou senha incorretos.' : error.message;
    showMsg('login-error', msg);
    return;
  }

  const name = data.user.user_metadata?.name || email.split('@')[0];
  loginSuccess(data.user, name);
}

// ── Registro ──
async function handleRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  hideMsg('reg-error');
  hideMsg('reg-success');

  if (!name || !email || !pass) { showMsg('reg-error', 'Preencha todos os campos.'); return; }
  if (pass.length < 8)          { showMsg('reg-error', 'A senha precisa ter ao menos 8 caracteres.'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { showMsg('reg-error', 'Informe um e-mail válido.'); return; }

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

  if (error) { showMsg('reg-error', error.message); return; }

  if (data.user && !data.session) {
    showMsg('reg-success', 'Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    return;
  }

  showMsg('reg-success', 'Conta criada com sucesso! Redirecionando...');
  setTimeout(() => loginSuccess(data.user, name), 1200);
}

// ── Recuperação de senha ──
async function handleRecover() {
  const email = document.getElementById('rec-email').value.trim().toLowerCase();
  hideMsg('rec-error');
  hideMsg('rec-success');

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    showMsg('rec-error', 'Informe um e-mail válido.');
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

  if (error) { showMsg('rec-error', error.message); return; }

  showMsg('rec-success', `Link enviado para ${email}. Verifique sua caixa de entrada.`);
}

// ── Session ──
function loginSuccess(user, name) {
  const displayName = name || user.user_metadata?.name || user.email.split('@')[0];
  currentUser = { id: user.id, email: user.email, name: displayName };

  const firstName = displayName.split(' ')[0];
  const initials  = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  showPage('page-app');

  setEl('user-avatar',        initials);
  setEl('user-name-display',  displayName);
  setEl('hero-greeting',      `Vooa, ${firstName}!`);
  setEl('user-avatar-h',      initials);
  setEl('user-name-h',        displayName);

  const notice = document.getElementById('api-notice');
  if (notice) notice.style.display = 'none';

  resetSearchUI();
  loadHistory();
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
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
  const ids = ['empty-state', 'results-container', 'loading-wrap', 'search-error'];
  document.getElementById('empty-state')?.style && (document.getElementById('empty-state').style.display = 'block');
  document.getElementById('results-container')?.style && (document.getElementById('results-container').style.display = 'none');
  document.getElementById('loading-wrap')?.classList.remove('show');
  document.getElementById('search-error')?.classList.remove('show');
}
