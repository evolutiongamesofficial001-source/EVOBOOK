/* 🔥 FIREBASE LIVROS */
const app1 = firebase.initializeApp({
  databaseURL: "https://livrosletingbook-default-rtdb.firebaseio.com/"
}, "db1");

const app2 = firebase.initializeApp({
  databaseURL: "https://livro-sever-2-default-rtdb.firebaseio.com/"
}, "db2");

const db1 = firebase.database(app1);
const db2 = firebase.database(app2);

/* 🔝 BOTÃO CONTA */
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const btnConta = document.getElementById("btnConta");

  if (!btnConta) return;

  if (user) {
    btnConta.textContent = "👤 Perfil";
    btnConta.onclick = () => location.href = "perfil.html";
  } else {
    btnConta.textContent = "🔐 Criar conta / Login";
    btnConta.onclick = () => location.href = "login.html";
  }
});

/* 📤 PUBLICAR LIVRO */
function enviarPDF() {
  const user = JSON.parse(localStorage.getItem("usuario"));
  if (!user) {
    alert("Faça login para publicar");
    location.href = "login.html";
    return;
  }

  const titulo = document.getElementById("titulo").value;
  const tagsInput = document.getElementById("tags").value;
  const publico = document.getElementById("publico").value;
  const file = document.getElementById("pdf").files[0];

  if (!titulo || !file) {
    alert("Preencha o título e selecione um PDF");
    return;
  }

  if (!publico) {
    alert("Selecione o público-alvo");
    return;
  }

  const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
  const reader = new FileReader();

  reader.onload = () => {
    const base64 = reader.result.split(",")[1];

    const livro = {
      titulo,
      autor: user.nome,
      publico,
      tags,
      pdfBase64: base64,
      criadoEm: Date.now()
    };

    db1.ref("livros").push(livro);
    db2.ref("livros").push(livro);

    alert("📘 Livro publicado!");
    document.querySelectorAll("input, select").forEach(e => e.value = "");
  };

  reader.readAsDataURL(file);
}

/* 📚 LISTAR LIVROS */
function carregarLivros() {
  db1.ref("livros").on("value", snap => {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    const user = JSON.parse(localStorage.getItem("usuario"));

    const livros = snap.val() || {};
    for (let id in livros) {
      const l = livros[id];
      const podeExcluir = user && user.nome === l.autor;

      lista.innerHTML += `
        <div class="card">
          <h3>${l.titulo}</h3>
          <p>✍️ ${l.autor} <span class="publico">(${l.publico})</span></p>
          <p>🏷️ ${l.tags.join(", ")}</p>
          <button onclick="baixarPDF('${l.pdfBase64}', '${l.titulo}')">📥 Baixar</button>
          ${podeExcluir ? `<button class="delete" onclick="excluirLivro('${id}')">🗑️ Excluir</button>` : ""}
        </div>
      `;
    }
  });
}

/* 📥 BAIXAR */
function baixarPDF(base64, nome) {
  const a = document.createElement("a");
  a.href = "data:application/pdf;base64," + base64;
  a.download = nome + ".pdf";
  a.click();
}

/* 🗑️ EXCLUIR */
function excluirLivro(id) {
  if (!confirm("Excluir este livro?")) return;
  db1.ref("livros/" + id).remove();
  db2.ref("livros/" + id).remove();
}

carregarLivros();
