const lista = document.getElementById("lista");
const btnPublicar = document.getElementById("btnPublicar");
const busca = document.getElementById("busca");

let livros = JSON.parse(localStorage.getItem("livros")) || [];

/* PUBLICAR */
btnPublicar.addEventListener("click", () => {
  const autor = document.getElementById("autor").value.trim();
  const titulo = document.getElementById("titulo").value.trim();
  const tags = document.getElementById("tags").value;
  const publico = document.getElementById("publico").value;
  const pdf = document.getElementById("pdf").files[0];

  if (!autor || !titulo || !publico || !pdf) {
    alert("Preencha todos os campos");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    livros.push({
      autor,
      titulo,
      tags,
      publico,
      pdf: reader.result,
      downloads: 0
    });

    localStorage.setItem("livros", JSON.stringify(livros));
    renderizar(livros);
    alert("Livro publicado!");
  };

  reader.readAsDataURL(pdf);
});

/* RENDER */
function renderizar(listaLivros){
  lista.innerHTML = "";
  listaLivros.forEach((l, i) => {
    lista.innerHTML += `
      <div class="card">
        <h3>${l.titulo}</h3>
        <div class="info">✍️ ${l.autor}</div>
        <div class="publico">🎯 ${l.publico}</div>
        <div class="downloads">⬇️ ${l.downloads} downloads</div>
        <button onclick="baixar(${i})">📥 Baixar</button>
      </div>
    `;
  });
}

/* DOWNLOAD */
function baixar(i){
  const l = livros[i];
  const a = document.createElement("a");
  a.href = l.pdf;
  a.download = l.titulo + ".pdf";
  a.click();
  l.downloads++;
  localStorage.setItem("livros", JSON.stringify(livros));
  renderizar(livros);
}

/* BUSCA */
busca.addEventListener("input", () => {
  const t = busca.value.toLowerCase();
  const filtrado = livros.filter(l =>
    (l.titulo + l.autor + l.tags).toLowerCase().includes(t)
  );
  renderizar(filtrado);
});

/* INIT */
renderizar(livros);
