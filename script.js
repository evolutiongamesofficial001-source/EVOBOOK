const lista = document.getElementById("lista");
const btnPublicar = document.getElementById("btnPublicar");
const busca = document.getElementById("busca");

let livros = JSON.parse(localStorage.getItem("livros")) || [];
let livrosVisiveis = [...livros];

/* PUBLICAR */
btnPublicar.addEventListener("click", () => {

  const autor = document.getElementById("autor").value.trim();
  const titulo = document.getElementById("titulo").value.trim();
  const tags = document.getElementById("tags").value.trim();
  const publico = document.getElementById("publico").value;
  const pdfInput = document.getElementById("pdf");

  if (!autor || !titulo || !publico || pdfInput.files.length === 0) {
    alert("Preencha todos os campos");
    return;
  }

  const pdf = pdfInput.files[0];

  const reader = new FileReader();

  reader.onload = () => {

    const novoLivro = {
      id: Date.now(),
      autor,
      titulo,
      tags,
      publico,
      pdf: reader.result,
      downloads: 0
    };

    livros.push(novoLivro);

    salvar();
    limparFormulario();

    alert("Livro publicado!");

  };

  reader.readAsDataURL(pdf);

});

/* SALVAR */
function salvar(){
  localStorage.setItem("livros", JSON.stringify(livros));
  atualizarBusca();
}

/* LIMPAR FORM */
function limparFormulario(){

  document.getElementById("autor").value = "";
  document.getElementById("titulo").value = "";
  document.getElementById("tags").value = "";
  document.getElementById("publico").value = "";
  document.getElementById("pdf").value = "";

}

/* RENDER */
function renderizar(listaLivros){

  lista.innerHTML = "";

  if(listaLivros.length === 0){
    lista.innerHTML = "<p>Nenhum livro encontrado</p>";
    return;
  }

  listaLivros.forEach((livro) => {

    const div = document.createElement("div");

    div.className = "card";

    div.innerHTML = `
      <h3>${livro.titulo}</h3>

      <div>✍️ ${livro.autor}</div>

      <div class="publico">🎯 ${livro.publico}</div>

      <div class="downloads">
        ⬇️ ${livro.downloads} downloads
      </div>

      <button onclick="baixar('${livro.id}')">
        📥 Baixar
      </button>
    `;

    lista.appendChild(div);

  });

}

/* DOWNLOAD */
function baixar(id){

  const livro = livros.find(l => l.id == id);

  if(!livro) return;

  const a = document.createElement("a");

  a.href = livro.pdf;
  a.download = livro.titulo + ".pdf";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  livro.downloads++;

  salvar();

}

/* BUSCA */
function atualizarBusca(){

  const texto = busca.value.toLowerCase();

  livrosVisiveis = livros.filter(l =>

    (l.titulo +
     l.autor +
     l.tags +
     l.publico)

    .toLowerCase()
    .includes(texto)

  );

  renderizar(livrosVisiveis);

}

busca.addEventListener("input", atualizarBusca);

/* INIT */
renderizar(livros);
