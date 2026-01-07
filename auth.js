firebase.initializeApp({
  databaseURL: "https://conta-site-livro-default-rtdb.firebaseio.com/"
});

const db = firebase.database();

function registrar() {
  const nome = nomeInput().value;
  const email = emailInput().value;
  const senha = senhaInput().value;

  db.ref("usuarios").once("value", snap => {
    const users = snap.val() || {};
    for (let id in users) {
      if (users[id].nome === nome) return alert("Nome já existe");
      if (users[id].email === email) return alert("Email já existe");
    }
    db.ref("usuarios").push({ nome, email, senha });
    alert("Conta criada");
    location.href = "login.html";
  });
}

function login() {
  const email = emailInput().value;
  const senha = senhaInput().value;

  db.ref("usuarios").once("value", snap => {
    const users = snap.val() || {};
    for (let id in users) {
      if (users[id].email === email && users[id].senha === senha) {
        localStorage.setItem("usuario", JSON.stringify(users[id]));
        location.href = "index.html";
        return;
      }
    }
    alert("Login inválido");
  });
}

const nomeInput = () => document.getElementById("nome");
const emailInput = () => document.getElementById("email");
const senhaInput = () => document.getElementById("senha");
