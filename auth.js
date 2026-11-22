let authMode = "login";

const modal = document.getElementById("auth-modal");

function showAuth(mode) {
  authMode = mode;
  modal.hidden = false;

  document.getElementById("auth-title").textContent =
    mode === "login" ? "Entrar" : "Criar conta";

  document.getElementById("auth-description").textContent =
    mode === "login"
      ? "Entra na tua conta para jogar."
      : "Escolhe um nome de jogador e uma palavra-passe.";

  document.getElementById("auth-submit").textContent =
    mode === "login" ? "Entrar" : "Criar conta";

  const area = document.getElementById("auth-switch");
  area.textContent = mode === "login"
    ? "Ainda não tens conta? "
    : "Já tens conta? ";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = mode === "login" ? "Registar" : "Entrar";
  button.addEventListener("click", () => {
    showAuth(mode === "login" ? "register" : "login");
  });

  area.appendChild(button);
  document.getElementById("auth-message").textContent = "";
}

function hideAuth() {
  modal.hidden = true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

async function refreshAccount() {
  try {
    const response = await fetch("/api/me");
    const data = await response.json();
    const area = document.getElementById("account-area");

    if (data.logged_in) {
      area.innerHTML =
        `<span class="welcome-user">Olá, ${escapeHtml(data.username)}</span>`;

      const button = document.createElement("button");
      button.className = "register-btn";
      button.textContent = "Sair";
      button.addEventListener("click", logout);
      area.appendChild(button);
    }
  } catch (e) {
    console.log("Erro ao verificar conta:", e);
  }
}

document.getElementById("auth-form").addEventListener("submit", async event => {
  event.preventDefault();

  const message = document.getElementById("auth-message");
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const endpoint = authMode === "login"
    ? "/api/login"
    : "/api/register";

  message.textContent = "A processar...";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password})
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || "Não foi possível concluir.";
      return;
    }

    message.textContent = data.message;
    await refreshAccount();
    setTimeout(hideAuth, 700);

  } catch (e) {
    message.textContent =
      "Não foi possível ligar ao servidor. Confirma se está iniciado.";
  }
});

async function logout() {
  await fetch("/api/logout", {method: "POST"});
  location.reload();
}

modal.addEventListener("click", event => {
  if (event.target === modal) hideAuth();
});

refreshAccount();
