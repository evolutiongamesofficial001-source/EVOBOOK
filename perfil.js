firebase.initializeApp({
  databaseURL: "https://livrosletingbook-default-rtdb.firebaseio.com/"
});

const db = firebase.database();
const user = JSON.parse(localStorage.getItem("usuario"));

if (!user) location.href = "login.html";

document.getElementById("dados").innerText =
  `Nome: ${user.nome}\nEmail: ${user.email}`;

db.ref("livros").on("value", snap => {
  const div = document.getElementById("meusLivros");
  div.innerHTML = "";
  const livros = snap.val() || {};

  for (let id in livros) {
    const l = livros[id];
    if (l.autor === user.nome) {
      div.innerHTML += `
        <div class="card">
          <h4>${l.titulo}</h4>
          <p>🎯 ${l.publico}</p>
          <p>🏷️ ${l.tags.join(", ")}</p>
        </div>
      `;
    }
  }
});

function logout() {
  localStorage.removeItem("usuario");
  location.href = "login.html";
}
