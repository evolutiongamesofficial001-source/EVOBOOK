/* 🔥 FIREBASE */
const app1 = firebase.initializeApp({
  databaseURL: "https://livrosletingbook-default-rtdb.firebaseio.com/"
}, "db1");

const app2 = firebase.initializeApp({
  databaseURL: "https://livro-sever-2-default-rtdb.firebaseio.com/"
}, "db2");

const appUser = firebase.initializeApp({
  databaseURL: "https://conta-site-livro-default-rtdb.firebaseio.com/"
}, "users");

const db1 = firebase.database(app1);
const db2 = firebase.database(app2);
const dbUser = firebase.database(appUser);

let livrosCache = {};

/* 👤 BOTÃO CONTA */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnConta");
  const user = JSON.parse(localStorage.getItem("usuario"));
  if (!btn) return;

  btn.textContent = user ? "👤 Perfil" : "🔐 Criar conta / Login";
  btn.onclick = () => location.href = user ? "perfil.html" : "login.html";

  if (location.pathname.includes("perfil")) carregarPerfil();
  if (document.getElementById("lista")) carregarLivros();
});

/* 📤 PUBLICAR */
function enviarPDF() {
  const user = JSON.parse(localStorage.getItem("usuario"));
  if (!user) return alert("Faça login");

  const titulo = titulo.value;
  const publico = publico.value;
  const tags = tags.value.split(",").map(t => t.trim()).filter(Boolean);
  const file = pdf.files[0];

  if (!titulo || !file || !publico) return alert("Preencha tudo");

  const reader = new FileReader();
  reader.onload = () => {
    const livro = {
      titulo,
      autor: user.nome,
      publico,
      tags,
      pdfBase64: reader.result.split(",")[1],
      downloads: 0,
      criadoEm: Date.now()
    };

    db1.ref("livros").push(livro);
    db2.ref("livros").push(livro);
    alert("Livro publicado!");
  };
  reader.readAsDataURL(file);
}

/* 📚 CARREGAR */
function carregarLivros() {
  db1.ref("livros").on("value", s => {
    livrosCache = s.val() || {};
    renderizarLivros(livrosCache);
  });
}

/* 🖥️ RENDER */
function renderizarLivros(livros) {
  const lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = "";

  const user = JSON.parse(localStorage.getItem("usuario"));
  const nomes = { infantil:"Infantil", jovem:"Jovem", adulto:"Adulto", tecnico:"Técnico" };

  for (let id in livros) {
    const l = livros[id];
    lista.innerHTML += `
      <div class="card">
        <h3>${l.titulo}</h3>
        <div class="autor-publico">
          <span class="autor">✍️ ${l.autor}</span>
          <span class="publico publico-${l.publico}">
            🎯 ${nomes[l.publico]}
          </span>
        </div>
        <div class="downloads">⬇️ ${l.downloads || 0} downloads</div>
        <div class="tags">${(l.tags||[]).map(t=>`<span class="tag">#${t}</span>`).join("")}</div>
        <button onclick="baixarPDF('${id}','${l.pdfBase64}','${l.titulo}')">📥 Baixar</button>
        ${user && user.nome===l.autor ? `<button class="excluir" onclick="excluirLivro('${id}')">🗑️ Excluir</button>` : ""}
      </div>
    `;
  }
}

/* 🔎 BUSCA */
function buscarLivros() {
  const t = busca.value.toLowerCase();
  const f = {};
  for (let id in livrosCache) {
    const l = livrosCache[id];
    if ((l.titulo+l.autor+(l.tags||[]).join(" ")).toLowerCase().includes(t))
      f[id]=l;
  }
  renderizarLivros(f);
}

/* ⬇️ DOWNLOAD */
function baixarPDF(id,b,n) {
  const a=document.createElement("a");
  a.href="data:application/pdf;base64,"+b;
  a.download=n+".pdf";
  a.click();

  db1.ref("livros/"+id+"/downloads").transaction(x=>(x||0)+1);
  db2.ref("livros/"+id+"/downloads").transaction(x=>(x||0)+1);
}

/* 🗑️ EXCLUIR */
function excluirLivro(id){
  if(confirm("Excluir livro?")){
    db1.ref("livros/"+id).remove();
    db2.ref("livros/"+id).remove();
  }
}

/* 👤 CONTAS */
function criarConta(){
  const u={nome:nome.value,email:email.value,senha:senha.value};
  dbUser.ref("usuarios/"+u.nome).once("value",s=>{
    if(s.exists()) return alert("Nome já existe");
    dbUser.ref("usuarios/"+u.nome).set(u);
    localStorage.setItem("usuario",JSON.stringify(u));
    location.href="index.html";
  });
}

function login(){
  dbUser.ref("usuarios/"+nome.value).once("value",s=>{
    if(!s.exists()||s.val().senha!==senha.value) return alert("Erro");
    localStorage.setItem("usuario",JSON.stringify(s.val()));
    location.href="index.html";
  });
}

function logout(){
  localStorage.removeItem("usuario");
  location.href="index.html";
}

function carregarPerfil(){
  const u=JSON.parse(localStorage.getItem("usuario"));
  nomePerfil.textContent=u.nome;
  db1.ref("livros").once("value",s=>{
    const l={};
    for(let i in s.val()) if(s.val()[i].autor===u.nome) l[i]=s.val()[i];
    renderizarLivros(l);
  });
}
