// Interface e navegação da loja. As regras financeiras ficam em carrinho.js.
import {
  exemploCliente,
  dadosIniciaisCheckout,
  metodosPagamento,
  estados,
  restaurarCheckout,
  validarCliente,
  validarCartao,
  criarCodigoPix,
} from "./pagamentos.js";
import {
  formatarPreco,
  normalizarCarrinho,
  adicionarAoCarrinho,
  alterarQuantidade,
  removerDoCarrinho,
  calcularResumo,
  restaurarPedido,
  descreverParcelas,
} from "./carrinho.js";
import { produtos, categorias, textosLegais } from "./produtos.js";
const selecionar = (s) => document.querySelector(s);
const precoFormatado = formatarPreco;
const escaparHtml = (s) =>
  String(s ?? "").replace(
    /[&<>']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
      })[c],
  );
const lerLocal = (k, f) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? f;
  } catch {
    return f;
  }
};
const salvarLocal = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
const imagem = (name, alt, cls = "", lazy = true) =>
  `<img src='img/${name.includes(".") ? name : name + ".png"}' alt='${escaparHtml(alt)}' class='${cls}' ${lazy ? `loading='lazy'` : ""} width='1122' height='1402'>`;
const buscarProduto = (id) => produtos.find((p) => p.id === id);
let carrinho = normalizarCarrinho(lerLocal("le_cart", []), produtos);
let favoritos = lerLocal("le_favorites", []);
if (!Array.isArray(favoritos)) favoritos = [];
let rotina = lerLocal("le_routine", []);
if (!Array.isArray(rotina)) rotina = [];
let usuario = null;
try {
  usuario = JSON.parse(sessionStorage.getItem("le_demo_user") || "null");
} catch {}
let rascunhoCheckout = null;
try {
  rascunhoCheckout = JSON.parse(
    sessionStorage.getItem("le_checkout") || "null",
  );
} catch {}
let compra = restaurarCheckout(rascunhoCheckout);
let ultimoPedido = restaurarPedido(
    lerLocal("le_last_order_v2", lerLocal("le_last_order", null)),
    produtos,
  ),
  cupomAtivo = lerLocal("le_cupom", false) === true,
  quantidadeSelecionada = 1,
  tamanhoSelecionado = "",
  abaConta = "perfil",
  perguntaAtual = 0,
  respostasQuiz = [];
// Consulte um único resumo para manter sacola, checkout e confirmação consistentes.
const resumoAtual = () => calcularResumo(carrinho, produtos, cupomAtivo);
const contarItens = () => resumoAtual().quantidade;
const subtotalCentavos = () => resumoAtual().subtotalCentavos;
const freteCentavos = () => resumoAtual().freteCentavos;
const descontoCentavos = () => resumoAtual().descontoCentavos;
const totalCentavos = () => resumoAtual().totalCentavos;
const caminhosIcones = {
  home: "M3 10 12 3l9 7v11h-7v-7h-4v7H3Z",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  products: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
  user: "M20 21v-2a7 7 0 0 0-14 0v2ZM12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z",
  bag: "m5 7-1 14h16L19 7ZM8 7V6a4 4 0 0 1 8 0v1",
  search: "M21 21l-5-5M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  moon: "M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z",
  sun: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2",
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "m5 5 14 14M5 19 19 5",
  arrow: "M4 12h16m-6-6 6 6-6 6",
};
const icone = (n) => `<svg class='icon' viewBox='0 0 24 24' aria-hidden='true'>
<path d='${caminhosIcones[n] || caminhosIcones.arrow}'/>
</svg>`;
function botaoTema(cls = "") {
  const dark = document.documentElement.dataset.theme === "dark";
  return `<button class='icon-button ${cls}' data-action='theme' aria-label='Ativar modo ${dark ? "claro" : "escuro"}' title='Alternar tema'>${icone(dark ? "sun" : "moon")}<span class='theme-label'>MODO ${dark ? "CLARO" : "ESCURO"}</span>
</button>`;
}
/* Atualiza cabeçalho, contador da sacola, rodapé e navegação mobile. */
function renderizarEstrutura() {
  const route = location.hash.slice(1) || "/";
  selecionar("#header").innerHTML =
    `<div class='announcement'>FRETE GRÁTIS ACIMA DE R$450 · AMOSTRAS EXCLUSIVAS EM TODOS OS PEDIDOS</div>
<header class='header'>
<div class='header-inner'>
<button class='icon-button mobile-only' data-action='menu' aria-label='Abrir menu'>${icone("menu")}</button>
<a href='#/' class='wordmark' aria-label='Lumière Élevée — Início'>LUMIÈRE ÉLEVÉE</a>
<nav class='desktop-nav' aria-label='Categorias'>${categorias.map((c) => `<a href='#/categoria/${c.id}' class='${route.includes(c.id) ? "active" : ""}'>${c.name}</a>`).join("")}<a href='#/catalogo?ordem=novidades'>Novidades</a>
</nav>
<div class='header-actions'>
<button class='icon-button' data-action='search' aria-label='Pesquisar'>${icone("search")}</button>
<a href='#/conta'>Conta</a>
<a href='#/favoritos' aria-label='Favoritos'>${icone("heart")}</a>
<a href='#/sacola'>Sacola (<span data-cart-count>${contarItens()}</span>)</a>${botaoTema()}</div>
<a class='icon-button mobile-only' href='#/sacola' aria-label='Sacola, ${contarItens()} itens'>${icone("bag")}<small data-cart-count>${contarItens()}</small>
</a>
</div>
</header>
<div class='mobile-only'>${botaoTema("theme-float btn outline")}</div>`;
  selecionar("#mobile-nav").innerHTML = [
    ["/", "home", "Início"],
    ["/colecoes", "grid", "Coleções"],
    ["/catalogo", "products", "Produtos"],
    ["/conta", "user", "Conta"],
  ]
    .map(
      ([url, i, label]) =>
        `<a href='#${url}' class='${route.split("?")[0] === url ? "active" : ""}' ${route.split("?")[0] === url ? `aria-current='page'` : ""}>${icone(i)}${label}</a>`,
    )
    .join("");
  selecionar("#footer").innerHTML = `<footer class='footer'>
<div class='footer-grid'>
<div class='footer-brand'>
<a href='#/' class='wordmark'>LUMIÈRE ÉLEVÉE</a>
<p>Elevando o cuidado diário a uma forma de arte, através da ciência botânica.</p>
<p>Projeto demonstrativo privado.<br>Sem vendas ou cobranças reais.</p>
</div>
<div>
<h3>A MAISON</h3>
<a href='#/maison'>Nossa História</a>
<a href='#/maison?secao=sustentabilidade'>Sustentabilidade</a>
<a href='#/artigo/ativos'>Glossário de Ingredientes</a>
<a href='#/quiz'>Descubra seu ritual</a>
</div>
<div>
<h3>ATENDIMENTO</h3>
<a href='#/ajuda'>Envio e Trocas</a>
<a href='#/ajuda'>Fale Conosco</a>
<a href='#/ajuda'>Perguntas Frequentes</a>
<a href='#/conta'>Minha Conta</a>
</div>
<div>
<h3>INSTITUCIONAL</h3>
<a href='#/privacidade'>Política de Privacidade</a>
<a href='#/termos'>Termos de Uso</a>
<a href='#/ajuda'>Formas de Pagamento</a>
<button class='text-link' style='color:#d9d6ce;font-size:12px;margin-top:10px' data-action='reset'>Redefinir demonstração</button>
</div>
</div>
<div class='footer-bottom'>
<span>© 2026 Lumière Élevée. Todos os direitos reservados.</span>
<span>
<a href='#/privacidade'>Privacidade</a> · <a href='#/termos'>Termos</a> · <button class='text-link' style='color:inherit;font-size:11px' data-action='theme'>Alternar tema</button>
</span>
</div>
</footer>`;
}
function avisar(text) {
  selecionar("#toast").textContent = text;
  selecionar("#toast").classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => selecionar("#toast").classList.remove("show"),
    3600,
  );
}
/* Grava sacola, favoritos, rotina e cupom no armazenamento deste navegador. */
function salvarEstado() {
  salvarLocal("le_cart", carrinho);
  salvarLocal("le_cupom", cupomAtivo);
  salvarLocal("le_favorites", favoritos);
  salvarLocal("le_routine", rotina);
  renderizarEstrutura();
}
function abrirModal(title, body) {
  const m = selecionar("#modal");
  m.innerHTML = `<button class='icon-button modal-close' data-action='close-modal' aria-label='Fechar janela'>${icone("close")}</button>
<div class='modal-body'>
<h2 id='modal-title'>${title}</h2>${body}</div>`;
  m.showModal();
  document.body.classList.add("locked");
}
function fecharModal() {
  if (selecionar("#modal").open) selecionar("#modal").close();
  document.body.classList.remove("locked");
}
selecionar("#modal").addEventListener("close", () =>
  document.body.classList.remove("locked"),
);
selecionar("#modal").addEventListener("click", (e) => {
  if (e.target === selecionar("#modal")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      fecharModal();
  }
});
function caminhoPagina(label, category = "") {
  return `<nav class='breadcrumb' aria-label='Caminho da página'>
<a href='#/'>Início</a>
<span>/</span>${
    category
      ? `<a href='#/categoria/${category.id}'>${category.name}</a>
<span>/</span>`
      : ""
  }<span>${escaparHtml(label)}</span>
</nav>`;
}
function botaoFavorito(p) {
  return `<button class='icon-button favorite ${favoritos.includes(p.id) ? "selected" : ""}' data-action='favorite' data-id='${p.id}' aria-pressed='${favoritos.includes(p.id)}' aria-label='${favoritos.includes(p.id) ? "Remover dos" : "Adicionar aos"} favoritos: ${p.name}'>${icone("heart")}</button>`;
}
/* Reutiliza a mesma apresentação dos produtos na home, catálogo e favoritos. */
function cartaoProduto(p) {
  return `<article class='product-card'>${botaoFavorito(p)}<a class='product-photo' href='#/produto/${p.id}'>${imagem(p.image, p.name + (p.ilustrativo ? " — imagem conceitual" : " — imagem original do projeto"))}</a>
<a href='#/produto/${p.id}'>
<h3>${p.name}</h3>
</a>
<p>${p.subtitle}</p>
<span class='chip'>ATIVO: ${p.active}</span>${
    p.reviews
      ? `<span class='rating' aria-label='Avaliação ilustrativa ${p.rating} de 5'>★★★★★ <small>(${p.reviews})</small>
</span>`
      : `<span class='fine'>Produto demonstrativo</span>`
  }<span class='price'>${p.precoAnteriorCentavos ? `<span class='old-price'>${precoFormatado(p.precoAnteriorCentavos)}</span>` : ""}${precoFormatado(p.precoCentavos)}</span>
<p class='fine'>${descreverParcelas(p.precoCentavos, p.precoCentavos < 40000 ? 3 : 6)}</p>
<button class='btn' data-action='add' data-id='${p.id}'>ADICIONAR À SACOLA</button>
</article>`;
}
function cartaoCategoria(c) {
  return `<a class='category-card' href='#/categoria/${c.id}'>
<div class='category-photo'>${imagem(c.image, "Coleção " + c.name)}</div>
<h3>${c.name}</h3>
</a>`;
}
/* Preserva o banner, a identidade visual e as seções originais da loja. */
function telaInicial() {
  return `<section class='hero'>
<div class='hero-content'>
<span class='eyebrow'>
<span class='desktop-only'>A ARTE DO AUTOCUIDADO</span>
<span class='mobile-only'>BELEZA COM PROPÓSITO</span>
</span>
<h1>A luminosidade<br>começa aqui.</h1>
<p>
<span class='desktop-only'>Ciência e sensorialidade em fórmulas que elevam o seu ritual diário de autocuidado.</span>
<span class='mobile-only'>Ciência e sensorialidade<br>em cada cuidado.</span>
</p>
<a class='btn' href='#/colecoes'>
<span class='desktop-only'>CONHEÇA A COLEÇÃO</span>
<span class='mobile-only'>EXPLORAR COLEÇÕES</span>
</a>
</div>${imagem("ritual", "Ritual Lumière Élevée com sérum, creme e bálsamo", "hero-image", false)}</section>
<section class='section home-categories'>
<div class='section-inner'>
<div class='section-heading'>
<div>
<h2>Explore por Categoria</h2>
<p>Seis caminhos para uma pele visivelmente mais saudável.</p>
</div>
<a class='arrow-link' href='#/catalogo'>VER TUDO →</a>
</div>
<div class='category-grid'>${categorias.map(cartaoCategoria).join("")}</div>
</div>
</section>
<section class='section white-section home-products'>
<div class='section-inner'>
<div class='section-heading'>
<div>
<h2>
<span class='desktop-only'>Mais Desejados</span>
<span class='mobile-only'>Os favoritos da coleção</span>
</h2>
<p>Os favoritos da nossa comunidade, validados por resultados.</p>
</div>
<a class='arrow-link' href='#/catalogo'>VER TODOS →</a>
</div>
<div class='product-grid'>${[produtos[1], produtos[0], produtos[2], produtos[3]].map(cartaoProduto).join("")}</div>
</div>
</section>
<div class='home-desktop-content'>
<section class='science'>
<h2>Ciência que Você Pode Ver na Pele</h2>
<p>Cada fórmula nasce da seleção rigorosa de ativos comprovados.</p>
<div class='ingredient-grid'>${[
    ["Niacinamida", "Regula a oleosidade e uniformiza o tom da pele."],
    [
      "Ácido Hialurônico",
      "Hidratação profunda e efeito replenishing imediato.",
    ],
    [
      "Biofermentação",
      "Tecnologia exclusiva para firmeza e luminosidade contínua.",
    ],
  ]
    .map(
      ([n, t]) => `<a href='#/artigo/ativos' class='ingredient'>
<span class='orb'>
</span>
<h3>${n}</h3>
<p>${t}</p>
</a>`,
    )
    .join("")}</div>
</section>
<section class='section'>
<div class='section-inner'>
<div class='section-heading'>
<div>
<h2>Rotinas Assinadas</h2>
<p>Sequências completas para cada necessidade da sua pele.</p>
</div>
</div>
<div class='routine-grid'>${[
    ["Hidratação Profunda", "creme", "5"],
    ["Luminosidade Radiante", "serum", "4"],
    ["Controle de Oleosidade", "balsamo", "4"],
    ["Rotina Anti-idade", "ampola", "6"],
  ]
    .map(
      ([
        name,
        img,
        n,
      ]) => `<a class='routine-card' href='#/quiz'>${imagem(img, name)}<span class='chip'>${n} PASSOS</span>
<h3>${name}</h3>
<span class='arrow-link'>MONTAR ROTINA →</span>
</a>`,
    )
    .join("")}</div>
</div>
</section>
<section class='quiz-banner'>
<h2>Não sabe por onde começar?</h2>
<p>Responda 5 perguntas rápidas e explore um ritual para o seu tipo de pele.</p>
<a class='btn' href='#/quiz'>FAZER O QUIZ DE PELE</a>
</section>
<section class='section white-section'>
<div class='section-inner'>
<div class='center'>
<h2>Avaliado por Quem Confia</h2>
<p style='margin-top:14px'>
<span style='font:500 30px var(--serif);color:var(--ink)'>4.9</span> <span class='rating'>★★★★★</span>
</p>
<p class='fine'>Avaliações ilustrativas preservadas do protótipo.</p>
</div>
<div class='review-grid'>${[
    [
      "A textura mais luxuosa que já experimentei. Minha pele ficou visivelmente mais firme e iluminada em poucas semanas.",
      "Isabella M.",
    ],
    [
      "Atendimento impecável e embalagem belíssima. Parece presente toda vez que chega.",
      "Camila R.",
    ],
    [
      "O sérum entregou exatamente o que prometia. Já é parte fixa da minha rotina noturna.",
      "Fernanda T.",
    ],
  ]
    .map(
      ([q, n]) => `<blockquote class='review' style='margin:0'>
<span class='rating'>★★★★★</span>
<p>“${q}”</p>
<cite>${n}</cite>
</blockquote>`,
    )
    .join("")}</div>
</div>
</section>
<section class='section'>
<div class='section-inner'>
<div class='section-heading'>
<div>
<h2>The Beauty Lab</h2>
<p>Conteúdo para elevar o seu conhecimento sobre a própria pele.</p>
</div>
</div>
<div class='lab-grid'>${[
    ["rotina", "creme", "CUIDADOS", "Como Montar sua Rotina em 5 Passos"],
    ["ordem", "serum", "ATIVOS", "A Ordem Correta dos Produtos"],
    ["serum", "balsamo", "GUIA", "Como Escolher o Sérum Ideal"],
  ]
    .map(
      ([
        id,
        img,
        tag,
        title,
      ]) => `<a class='lab-card' href='#/artigo/${id}'>${imagem(img, title)}<span class='eyebrow'>${tag}</span>
<h3>${title}</h3>
<span class='arrow-link'>LER MAIS →</span>
</a>`,
    )
    .join("")}</div>
</div>
</section>
<section class='newsletter'>
<h2>Junte-se ao Nosso Círculo</h2>
<p>Receba lançamentos exclusivos, guias de rituais e convites para eventos privados.</p>
<form id='newsletter-form'>
<label class='sr-only' for='newsletter-email' style='position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden'>Seu melhor e-mail</label>
<input id='newsletter-email' type='email' placeholder='Seu melhor e-mail' required autocomplete='off'>
<button class='btn gold' type='submit'>INSCREVER-SE</button>
</form>
<p class='fine' style='font-size:10px'>Inscrição demonstrativa. Nenhum e-mail será enviado ou armazenado.</p>
</section>
</div>`;
}
function telaColecoes() {
  return `<div class='container'>${caminhoPagina("Coleções")}<div class='page-intro'>
<span class='eyebrow'>A CURADORIA LUMIÈRE</span>
<h1>Encontre o seu ritual.</h1>
<p>Seis caminhos para explorar o universo Lumière Élevée.</p>
</div>
<div class='category-grid' style='padding-bottom:60px'>${categorias.map(cartaoCategoria).join("")}</div>
<div class='quiz-banner' style='margin-bottom:55px'>
<h2>Um momento para você.</h2>
<p>Descubra por onde começar com o nosso quiz de pele.</p>
<a class='btn' href='#/quiz'>DESCOBRIR MEU RITUAL</a>
</div>
</div>`;
}
/* Filtra por coleção, busca sem acentos, faixa de preço e ordenação. */
function telaCatalogo(categoryId = "", params = new URLSearchParams()) {
  const c = categorias.find((c) => c.id === categoryId),
    search = params.get("q") || "",
    order = params.get("ordem") || "destaques",
    price = params.get("preco") || "todos";
  let list = produtos.filter(
    (p) =>
      (!c || p.category === c.id) &&
      (!search ||
        normalizarBusca(p.name + " " + p.subtitle + " " + p.active).includes(
          normalizarBusca(search),
        )) &&
      (price === "todos" ||
        (price === "ate400"
          ? p.precoCentavos <= 40000
          : p.precoCentavos > 40000)),
  );
  if (order === "menor") list.sort((a, b) => a.precoCentavos - b.precoCentavos);
  else if (order === "maior")
    list.sort((a, b) => b.precoCentavos - a.precoCentavos);
  else if (order === "novidades") list.reverse();
  return `${
    c
      ? `<section class='collection-banner'>
<div class='copy'>
<span class='eyebrow'>COLEÇÃO / ${c.name.toUpperCase()}</span>
<h1>${c.title}</h1>
<p>${c.description}</p>
</div>${imagem(c.image, "Coleção " + c.name, "", false)}</section>`
      : ""
  }<section class='container'>${caminhoPagina(c?.name || "Catálogo")}<div class='page-intro'>
<h1>${c?.name || "Nossa coleção"}</h1>
<p>${c ? "Explore os cuidados desta coleção e componha o seu ritual." : "Dezoito cuidados, seis caminhos de autocuidado. Conheça a coleção Lumière Élevée."}</p>
</div>
<form class='filters' id='filters'>
<label class='search-field' for='filter-search'>PESQUISAR<input id='filter-search' name='q' type='search' value='${escaparHtml(search)}' placeholder='Nome ou ativo do produto'>
</label>
<label for='filter-price'>FAIXA DE PREÇO<select id='filter-price' name='preco'>
<option value='todos'>Todos os preços</option>
<option value='ate400' ${price === "ate400" ? "selected" : ""}>Até R$ 400</option>
<option value='acima400' ${price === "acima400" ? "selected" : ""}>Acima de R$ 400</option>
</select>
</label>
<label for='filter-sort'>ORDENAR POR<select id='filter-sort' name='ordem'>${[
    ["destaques", "Destaques"],
    ["menor", "Menor preço"],
    ["maior", "Maior preço"],
    ["novidades", "Novidades"],
  ]
    .map(
      ([v, l]) =>
        `<option value='${v}' ${order === v ? "selected" : ""}>${l}</option>`,
    )
    .join("")}</select>
</label>
<button type='submit' class='btn small'>APLICAR</button>
</form>
<div class='result-count'>
<span>${list.length} ${list.length === 1 ? "produto" : "produtos"}${search ? ` para “${escaparHtml(search)}”` : ""}</span>
<a href='#/catalogo' class='text-link'>Ver toda a coleção</a>
</div>${
    list.length
      ? `<div class='product-grid' style='padding-bottom:60px'>${list.map(cartaoProduto).join("")}</div>${c?.id === "kits" ? `<button class='btn outline' style='margin-bottom:40px' data-action='add-kit'>ADICIONAR OS 3 ESSENCIAIS SEPARADAMENTE</button>` : ""}`
      : `<div class='empty'>
<h2>Nenhum produto encontrado.</h2>
<p>Experimente outro nome, ativo ou faixa de preço.</p>
<a class='btn outline' href='#/catalogo'>LIMPAR FILTROS</a>
</div>`
  }</section>`;
}
function normalizarBusca(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
/* Busca um produto pelo id da URL e permite escolher tamanho e quantidade. */
function telaProduto(id) {
  const p = buscarProduto(id);
  if (!p) return paginaNaoEncontrada();
  quantidadeSelecionada = 1;
  tamanhoSelecionado = p.size;
  const c = categorias.find((c) => c.id === p.category);
  return `<div class='container'>${caminhoPagina(p.name, c)}<div class='product-layout'>
<div>${imagem(p.image, p.name + (p.ilustrativo ? " — imagem conceitual" : " — embalagem original do projeto"), "product-main-image", false)}<div class='gallery-thumbs'>
<button data-action='zoom' data-id='${p.id}' aria-label='Ampliar imagem de ${p.name}'>${imagem(p.image, p.name)}</button>
<button data-action='ritual-image' aria-label='Ver o ritual completo'>${imagem("ritual", "Ritual completo")}</button>
</div>
<p class='fine' style='margin-top:10px'>${p.ilustrativo ? "Imagem local ilustrativa" : "Imagem original do projeto"} · produto conceitual.</p>
</div>
<div class='product-info'>
<span class='stock'>EM ESTOQUE · DEMONSTRAÇÃO</span>
<h1>${p.name}</h1>
<p>${p.subtitle}</p>${
    p.reviews
      ? `<div class='rating'>★★★★★ <small>${p.rating} · ${p.reviews} avaliações ilustrativas</small>
</div>`
      : `<p class='fine'>Produto demonstrativo · visual conceitual</p>`
  }<div class='price-block'>${p.precoAnteriorCentavos ? `<span class='old-price'>${precoFormatado(p.precoAnteriorCentavos)}</span>` : ""}<strong>${precoFormatado(p.precoCentavos)}</strong>
<p>${descreverParcelas(p.precoCentavos, p.precoCentavos < 40000 ? 3 : 6)}</p>
</div>
<p class='options-label'>SELECIONE ${p.id.includes("ampola") ? "A OPÇÃO" : "O TAMANHO"}</p>
<div class='options' role='group' aria-label='Tamanho do produto'>${p.options.map((s) => `<button class='option ${s === p.size ? "selected" : ""}' aria-pressed='${s === p.size}' data-action='size' data-size='${s}'>${s}</button>`).join("")}</div>
<p class='fine' style='margin-top:8px'>Opções visuais do protótipo; preço demonstrativo mantido.</p>
<div class='purchase'>
<div class='quantity'>
<button data-action='product-minus' aria-label='Diminuir quantidade'>−</button>
<output id='product-quantity' aria-live='polite'>1</output>
<button data-action='product-plus' aria-label='Aumentar quantidade'>+</button>
</div>
<button class='btn' data-action='add-selected' data-id='${p.id}'>ADICIONAR À SACOLA</button>
</div>
<button class='text-link' data-action='routine' data-id='${p.id}'>${rotina.includes(p.id) ? "✓ Na Minha Rotina" : "+ Adicionar à Minha Rotina"}</button>
<ul class='service-list'>
<li>Frete grátis em compras acima de R$450</li>
<li>Embalagens e fórmulas conceituais da coleção</li>
<li>Compra demonstrativa, sem cobrança ou envio</li>
</ul>
<p class='options-label'>ATIVOS PRINCIPAIS</p>
<div class='active-chips'>${p.actives.map((a) => `<span class='chip'>${a}</span>`).join("")}</div>
<p class='fine'>Conteúdo de produto reproduzido do projeto. Não representa uma oferta comercial.</p>
</div>
</div>
<div class='product-details'>
<section class='detail-section'>
<h2>Descrição</h2>
<p>${p.description}</p>
</section>
<section class='detail-section'>
<h2>Benefícios propostos</h2>
<ul>${p.benefits.map((t) => `<li>${t}</li>`).join("")}</ul>
</section>
<section class='detail-section'>
<h2>Como Usar</h2>
<ol>${p.usage.map((t) => `<li>${t}</li>`).join("")}</ol>
</section>
<section class='detail-section'>
<h2>Ingredientes</h2>
<p>${p.ingredients}</p>
</section>
</div>
</div>
<section class='section white-section'>
<div class='faq'>
<h2>Perguntas Frequentes</h2>
<details>
<summary>Como funciona esta experiência?</summary>
<p>Você pode explorar os produtos, salvar favoritos, montar sua rotina e simular um pedido. Nenhuma compra, cobrança ou entrega é realizada.</p>
</details>
<details>
<summary>Os produtos e as avaliações são reais?</summary>
<p>São conteúdos conceituais e ilustrativos do projeto Lumière Élevée. As informações de fórmulas e resultados precisam de validação antes de uso comercial.</p>
</details>
<details>
<summary>Posso alterar o tamanho na sacola?</summary>
<p>Escolha uma opção de tamanho nesta página antes de adicionar. Na sacola, você pode ajustar a quantidade ou remover um item.</p>
</details>
</div>
</section>
<section class='section'>
<div class='section-inner'>
<div class='section-heading'>
<h2>Complete Sua Rotina</h2>
<a class='arrow-link' href='#/catalogo'>VER TODOS →</a>
</div>
<div class='product-grid'>${produtos
    .filter((x) => x.id !== p.id)
    .slice(0, 4)
    .map(cartaoProduto)
    .join("")}</div>
</div>
</section>`;
}
function telaSalvos(type) {
  const ids = type === "rotina" ? rotina : favoritos;
  return `<section class='container'>${caminhoPagina(type === "rotina" ? "Minha Rotina" : "Favoritos")}<div class='page-intro'>
<span class='eyebrow'>SEUS ESCOLHIDOS</span>
<h1>${type === "rotina" ? "Minha Rotina" : "Meus favoritos"}</h1>
<p>Um espaço para guardar os cuidados que fazem sentido para você.</p>
</div>${
    ids.length
      ? `<div class='product-grid' style='padding-bottom:65px'>${produtos
          .filter((p) => ids.includes(p.id))
          .map(cartaoProduto)
          .join(
            "",
          )}</div>${type === "rotina" ? `<button class='btn outline' style='margin-bottom:40px' data-action='clear-routine'>LIMPAR MINHA ROTINA</button>` : ""}`
      : `<div class='empty'>
<h2>Seu ritual começa com uma escolha.</h2>
<p>${type === "rotina" ? "Abra um produto e selecione “Adicionar à Minha Rotina”." : "Toque no coração de um produto para guardá-lo aqui."}</p>
<a class='btn' href='#/catalogo'>EXPLORAR A COLEÇÃO</a>
</div>`
  }</section>`;
}
function telaDocumento(type) {
  const l = textosLegais[type];
  return `<div class='container'>
<article class='legal'>${caminhoPagina(l.title)}<span class='eyebrow'>INFORMAÇÕES / LUMIÈRE ÉLEVÉE</span>
<h1>${l.title}</h1>
<p class='lead'>${l.lead}</p>
<div class='notice'>
<strong>Sobre esta versão privada</strong>
<br>Textos institucionais do protótipo. Esta demonstração não vende produtos, não processa pagamentos nem envia e-mails. O login é simulado. ${type === "privacidade" ? "Tema, sacola, favoritos, rotina e último pedido de exemplo ficam neste navegador. Nome de exibição, e-mail demo e rascunho do checkout ficam apenas na sessão. Número, validade e CVV dos cartões não são armazenados; senhas também não são armazenadas. Não há ferramentas de análise ou rastreamento no código do site. A hospedagem privada controla o acesso pela conta ChatGPT." : ""}</div>
<nav class='legal-nav' aria-label='Seções do documento'>${l.sections.map(([t], i) => `<a href='#/${type}?secao=${i + 1}' class='text-link'>${t.split(". ")[1]}</a>`).join("")}</nav>${l.sections
    .map(
      ([t, p], i) => `<section class='legal-section' id='legal-${i + 1}'>
<h2>${t}</h2>
<p>${p}</p>
</section>`,
    )
    .join(
      "",
    )}<p class='fine' style='margin-top:25px'>Versão do projeto · 28 de outubro de 2026 · Texto sujeito a revisão antes da operação comercial.</p>
<div style='margin-top:25px'>
<a class='text-link' href='#/${type === "termos" ? "privacidade" : "termos"}'>${type === "termos" ? "Política de Privacidade" : "Termos de Uso"} →</a>
</div>${type === "privacidade" ? `<button class='btn outline' style='margin-top:24px' data-action='reset'>LIMPAR DADOS DESTA DEMONSTRAÇÃO</button>` : ""}</article>
</div>`;
}
/* Conta demonstrativa: não autentica em um servidor e não armazena senhas. */
function telaLogin(signup = false) {
  return `<div class='login-layout'>
<aside class='brand-panel'>
<a class='wordmark' href='#/'>LUMIÈRE ÉLEVÉE</a>
<div>
<span class='eyebrow'>A ARTE DO AUTOCUIDADO</span>
<h2>Seu ritual,<br>sua pele, seu tempo.</h2>
<p>Acesse sua conta para acompanhar pedidos, salvar sua rotina e receber recomendações personalizadas.</p>
</div>
</aside>
<section class='login-panel'>
<form id='login-form' autocomplete='off'>
<div class='tabs'>
<button type='button' data-action='login-tab' data-tab='entrar' class='${!signup ? "selected" : ""}'>Entrar</button>
<button type='button' data-action='login-tab' data-tab='cadastro' class='${signup ? "selected" : ""}'>Conta demo</button>
</div>
<p class='fine'>Acesso demonstrativo. Não utilize dados reais.</p>${
    signup
      ? `<div class='field'>
<label for='demo-name'>NOME DE EXIBIÇÃO</label>
<input id='demo-name' name='name' placeholder='Isabella' required minlength='2' maxlength='40' autocomplete='off'>
</div>`
      : ""
  }<div class='field'>
<label for='demo-email'>E-MAIL DE EXEMPLO</label>
<input id='demo-email' name='email' type='email' value='isabella@example.com' required autocomplete='off'>
</div>
<div class='field'>
<label for='demo-password'>SENHA DEMONSTRATIVA</label>
<div style='position:relative'>
<input id='demo-password' name='password' type='password' placeholder='Use uma senha fictícia' required minlength='6' autocomplete='off' style='padding-right:70px'>
<button type='button' class='text-link' data-action='password' style='position:absolute;right:13px;top:15px;font-size:10px' aria-label='Mostrar senha'>Mostrar</button>
</div>
<small class='fine'>Use “lumiere” para testar.</small>
</div>
<div class='form-inline'>
<label class='checkbox'>
<input type='checkbox' name='remember'>Manter nesta sessão</label>
<button type='button' class='text-link' data-action='recover'>Esqueci minha senha</button>
</div>${
    signup
      ? `<label class='checkbox' style='margin-bottom:22px'>
<input type='checkbox' required>Li os <a class='text-link' href='#/termos'>Termos de Uso</a>.</label>`
      : ""
  }<button class='btn full' type='submit'>${signup ? "CRIAR CONTA DEMO" : "ENTRAR NA CONTA DEMO"}</button>
<div class='or'>ou</div>
<div class='social'>
<button type='button' class='btn outline' data-action='social' data-provider='Google'>Simular Google</button>
<button type='button' class='btn outline' data-action='social' data-provider='Apple'>Simular Apple</button>
</div>
<p class='fine' style='margin-top:22px;font-size:10px'>Ao entrar, você concorda com os <a class='text-link' href='#/termos'>Termos de Uso</a> e a <a class='text-link' href='#/privacidade'>Política de Privacidade</a>.</p>
</form>
</section>
</div>`;
}
/* Mostra o perfil de exemplo, o último pedido simulado e os cuidados salvos. */
function telaConta() {
  if (!usuario) return telaLogin();
  return `<section class='container'>${caminhoPagina("Minha Conta")}<div class='page-intro'>
<span class='eyebrow'>SEU UNIVERSO LUMIÈRE</span>
<h1>Bonjour, ${escaparHtml(usuario.name)}.</h1>
<p>Seu ritual, sua pele, seu tempo.</p>
</div>
<div class='account-layout'>
<nav class='account-menu' aria-label='Minha Conta'>${[
    ["perfil", "Meus dados"],
    ["pedidos", "Meus pedidos"],
    ["rotina", "Minha rotina"],
    ["preferencias", "Preferências"],
  ]
    .map(
      ([id, label]) =>
        `<button data-action='account-tab' data-tab='${id}' class='${abaConta === id ? "selected" : ""}'>${label}</button>`,
    )
    .join("")}<a class='btn outline' href='#/favoritos'>Favoritos</a>
<button data-action='logout'>Sair da conta demo</button>
</nav>
<div class='account-content'>${
    abaConta === "perfil"
      ? `<h2>Meus dados</h2>
<div class='notice'>Você está em uma conta demonstrativa. Use somente informações fictícias.</div>
<form id='profile-form'>
<div class='field'>
<label for='profile-name'>NOME DE EXIBIÇÃO</label>
<input id='profile-name' name='name' value='${escaparHtml(usuario.name)}' minlength='2' maxlength='40' required>
</div>
<div class='field'>
<label for='profile-email'>E-MAIL DEMONSTRATIVO</label>
<input id='profile-email' type='email' value='${escaparHtml(usuario.email)}' readonly>
</div>
<button class='btn' type='submit'>SALVAR ALTERAÇÕES</button>
</form>`
      : abaConta === "pedidos"
        ? `<h2>Meus pedidos</h2>${
            ultimoPedido
              ? `<div class='notice'>Pedido ${ultimoPedido.id} · Simulação concluída<br>${ultimoPedido.items.length} produtos · ${precoFormatado(ultimoPedido.total)}</div>
<a href='#/confirmacao' class='btn outline'>VER SIMULAÇÃO</a>`
              : `<p>Nenhum pedido simulado por aqui.</p>
<a href='#/catalogo' class='btn' style='margin-top:24px'>EXPLORAR COLEÇÃO</a>`
          }`
        : abaConta === "rotina"
          ? `<h2>Minha rotina</h2>
<p>${rotina.length} ${rotina.length === 1 ? "produto salvo" : "produtos salvos"} no seu ritual.</p>
<a href='#/rotina' class='btn' style='margin-top:24px'>EXPLORAR MINHA ROTINA</a>`
          : `<h2>Preferências</h2>
<p>Escolha a atmosfera do seu ritual.</p>
<button class='btn outline' data-action='theme' style='margin-top:20px'>ALTERNAR MODO CLARO / ESCURO</button>
<div class='notice'>Suas preferências ficam neste navegador. Você pode redefinir os dados a qualquer momento.</div>
<button class='text-link' data-action='reset'>Redefinir demonstração</button>`
  }</div>
</div>
</section>`;
}
// A identificação fica na sessão. Os campos dos cartões nunca são salvos.
function salvarCheckout() {
  try {
    sessionStorage.setItem("le_checkout", JSON.stringify(compra));
  } catch {}
}
function guardarDadosCliente(formulario) {
  if (!formulario) return;
  for (const campo of Object.keys(exemploCliente)) {
    compra[campo] = formulario.elements[campo].value.trim();
  }
  compra.terms = formulario.elements.terms.checked;
}

// Uma mudança nos produtos ou no cupom exige nova revisão do pagamento.
function assinaturaDaSacola() {
  return JSON.stringify({
    itens: carrinho,
    cupom: cupomAtivo,
    totalCentavos: totalCentavos(),
  });
}
function mostrarErrosFormulario(formulario, erros) {
  formulario
    .querySelectorAll("[data-erro]")
    .forEach((aviso) => (aviso.textContent = ""));
  formulario
    .querySelectorAll("[aria-invalid]")
    .forEach((campo) => campo.removeAttribute("aria-invalid"));
  for (const [nome, mensagem] of Object.entries(erros)) {
    const campo = formulario.elements[nome];
    const aviso = formulario.querySelector(`[data-erro='${nome}']`);
    if (campo) campo.setAttribute("aria-invalid", "true");
    if (aviso) aviso.textContent = mensagem;
  }
  const resumo = formulario.querySelector(".form-errors");
  const mensagens = Object.values(erros);
  resumo.hidden = mensagens.length === 0;
  resumo.textContent = mensagens.length
    ? "Confira os campos: " + mensagens.join(" ")
    : "";
  const primeiroCampo = Object.keys(erros)[0];
  if (primeiroCampo) formulario.elements[primeiroCampo]?.focus();
  return mensagens.length === 0;
}
function campoCliente(nome, titulo, tipo = "text", placeholder = "") {
  return `<div class='field'>
    <label for='cliente-${nome}'>${titulo}</label>
    <input id='cliente-${nome}' name='${nome}' type='${tipo}' value='${escaparHtml(compra[nome])}'
      placeholder='${placeholder}' required maxlength='160' autocomplete='off'
      aria-describedby='cliente-${nome}-erro'>
    <small class='field-error' id='cliente-${nome}-erro' data-erro='${nome}'>
</small>
  </div>`;
}
/* Exibe os valores do mesmo resumo calculado pelo módulo carrinho.js. */
function resumoPedido(button = true, review = false) {
  return `<aside class='order-summary' aria-label='Resumo do pedido'>
    <h2>Resumo do Pedido</h2>
    ${
      !button
        ? carrinho
            .map(
              (item) => `<div class='summary-line'>
      <span>${buscarProduto(item.id).name}<br>
<small>${escaparHtml(item.size)} · Qtd ${item.qty}</small>
</span>
      <span>${precoFormatado(buscarProduto(item.id).precoCentavos * item.qty)}</span>
    </div>`,
            )
            .join("")
        : ""
    }
    <div class='summary-line'>
<span>Subtotal (${contarItens()} ${contarItens() === 1 ? "item" : "itens"})</span>
<span>${precoFormatado(subtotalCentavos())}</span>
</div>
    <div class='summary-line'>
<span>Frete demonstrativo</span>
<span>${freteCentavos() ? precoFormatado(freteCentavos()) : "Grátis"}</span>
</div>
    <div class='summary-line'>
<span>Desconto</span>
<span>− ${precoFormatado(descontoCentavos())}</span>
</div>
    <div class='summary-line total'>
<span>Total</span>
<span>${precoFormatado(totalCentavos())}</span>
</div>
    <p class='fine'>${compra.payment} · ${compra.payment === "Cartão de crédito" ? descreverParcelas(totalCentavos(), compra.parcelas) : precoFormatado(totalCentavos()) + " à vista"}</p>
    ${button ? `<a class='btn full' href='#/checkout'>CONTINUAR PARA CHECKOUT</a>` : ""}
    <p class='fine summary-warning'>Simulação acadêmica. Nenhuma cobrança ou entrega será realizada.</p>
    ${
      review
        ? ""
        : `<form id='coupon-form' class='coupon'>
      <label for='coupon-code' class='sr-only'>Cupom demonstrativo</label>
      <input id='coupon-code' placeholder='Cupom demonstrativo' value='${cupomAtivo ? "LUMIERE10" : ""}'>
      <button type='submit' class='btn small outline'>APLICAR</button>
    </form>
<button class='text-link' data-action='coupon-rules'>Ver regras de cupom</button>`
    }
  </aside>`;
}
/* Desenha os itens, preços unitários, quantidades, subtotais e estado vazio. */
function renderizarCarrinho() {
  return `<section class='container'>
    ${caminhoPagina("Sacola")}
    <div class='page-intro'>
<h1>Seu ritual, em uma sacola.</h1>
<p>Revise seus escolhidos antes de continuar.</p>
</div>
    <div class='notice'>SIMULAÇÃO ACADÊMICA · Utilize apenas dados fictícios. Nenhuma cobrança ou envio.</div>
    ${
      carrinho.length
        ? `<div class='cart-layout'>
<div>
      ${carrinho
        .map((item, indice) => {
          const produto = buscarProduto(item.id);
          return `<article class='cart-item'>
          <a href='#/produto/${produto.id}'>${imagem(produto.image, produto.name)}</a>
          <div>
            <a href='#/produto/${produto.id}'>
<h3>${produto.name}</h3>
</a>
            <p>${escaparHtml(item.size)}</p>
<p>Preço unitário: ${precoFormatado(produto.precoCentavos)}</p>
            <div class='quantity'>
              <button data-action='cart-minus' data-index='${indice}' aria-label='Diminuir quantidade de ${produto.name}' ${item.qty <= 1 ? "disabled" : ""}>−</button>
              <output aria-label='Quantidade de ${produto.name}'>${item.qty}</output>
              <button data-action='cart-plus' data-index='${indice}' aria-label='Aumentar quantidade de ${produto.name}' ${item.qty >= 20 ? "disabled" : ""}>+</button>
            </div>
            <button class='text-link remove' data-action='remove' data-index='${indice}' aria-label='Remover ${produto.name} da sacola'>Remover</button>
          </div>
          <div class='item-subtotal'>
<span class='fine'>Subtotal</span>
<strong>${precoFormatado(produto.precoCentavos * item.qty)}</strong>
</div>
        </article>`;
        })
        .join("")}
      <div class='free-shipping'>${subtotalCentavos() >= 45000 ? "Seu ritual tem frete grátis." : `Faltam ${precoFormatado(45000 - subtotalCentavos())} para frete grátis.`}
        <div class='shipping-bar'>
<span style='width:${Math.min(100, (subtotalCentavos() / 45000) * 100)}%'>
</span>
</div>
        <span class='fine'>Até 20 unidades por opção · condições demonstrativas.</span>
      </div>
      <a class='btn outline continue-shopping' href='#/catalogo'>CONTINUAR COMPRANDO</a>
    </div>${resumoPedido()}</div>`
        : `<div class='empty'>
      <h2>Sua sacola está vazia.</h2>
<p>Encontre os próximos passos do seu ritual.</p>
      <a class='btn' href='#/catalogo'>EXPLORAR COLEÇÃO</a>
      <button class='btn outline sample-cart' data-action='sample-cart'>CARREGAR ITENS DE EXEMPLO</button>
    </div>`
    }
  </section>`;
}
function etapasCompra(etapa) {
  return `<nav class='checkout-steps' aria-label='Etapas da compra'>
    ${["IDENTIFICAÇÃO", "PAGAMENTO", "REVISÃO", "CONFIRMAÇÃO"].map((titulo, indice) => `<span class='${etapa === indice + 1 ? "active" : ""}' ${etapa === indice + 1 ? `aria-current='step'` : ""}>${indice + 1} · ${titulo}</span>`).join("")}
  </nav>`;
}
/* Apresenta os oito dados fictícios do cliente e os avisos de validação. */
function telaCheckout() {
  if (!carrinho.length) return renderizarCarrinho();
  return `<section class='container'>${etapasCompra(1)}${caminhoPagina("Identificação e entrega")}
    <div class='page-intro'>
<h1>Um passo mais perto do seu ritual.</h1>
<p>Preencha os dados fictícios para continuar.</p>
</div>
    <div class='cart-layout'>
      <form id='checkout-form' class='checkout-content' novalidate autocomplete='off'>
        <div class='notice'>
<strong>SIMULAÇÃO · NÃO UTILIZE DADOS REAIS</strong>
<br>Use o botão abaixo para preencher informações de exemplo. O CPF aceito é 000.000.000-00.</div>
        <button type='button' class='btn outline' data-action='fill-example'>PREENCHER DADOS FICTÍCIOS</button>
        <div class='form-errors' role='alert' hidden>
</div>
        <h2>Identificação</h2>
        <div class='form-row'>${campoCliente("name", "NOME FICTÍCIO")}${campoCliente("email", "E-MAIL DE EXEMPLO", "email", "cliente@example.com")}</div>
        <div class='form-row'>${campoCliente("phone", "TELEFONE FICTÍCIO COM DDD", "tel", "(00) 00000-0000")}${campoCliente("cpf", "CPF FICTÍCIO", "text", "000.000.000-00")}</div>
        <h2>Entrega</h2>
        ${campoCliente("cep", "CEP FICTÍCIO", "text", "00000-000")}
        ${campoCliente("address", "ENDEREÇO DE EXEMPLO", "text", "Rua Exemplo, 100")}
        <div class='form-row'>${campoCliente("city", "CIDADE DE EXEMPLO")}
          <div class='field'>
<label for='cliente-state'>ESTADO</label>
            <select id='cliente-state' name='state' required aria-describedby='cliente-state-erro'>
              <option value=''>Selecione</option>${estados.map((uf) => `<option value='${uf}' ${compra.state === uf ? "selected" : ""}>${uf}</option>`).join("")}
            </select>
<small class='field-error' id='cliente-state-erro' data-erro='state'>
</small>
          </div>
        </div>
        <div class='notice'>Envio padrão demonstrativo · ${freteCentavos() ? precoFormatado(freteCentavos()) : "Grátis"}<br>Nenhuma entrega será realizada.</div>
        <label class='checkbox terms-label'>
<input name='terms' type='checkbox' required ${compra.terms ? "checked" : ""} aria-describedby='terms-erro'>
<span>Li os <a class='text-link' href='#/termos'>Termos de Uso</a> e entendi que esta compra é simulada.</span>
</label>
        <small class='field-error' id='terms-erro' data-erro='terms'>
</small>
        <button class='btn full form-next' type='submit'>CONTINUAR PARA PAGAMENTO</button>
      </form>${resumoPedido(false)}
    </div>
  </section>`;
}
function campoCartao(nome, titulo, exemplo, maximo) {
  return `<div class='field'>
<label for='cartao-${nome}'>${titulo}</label>
    <input id='cartao-${nome}' name='${nome}' value='' placeholder='${exemplo}' required maxlength='${maximo}' autocomplete='off' aria-describedby='cartao-${nome}-erro'>
    <small class='field-error' id='cartao-${nome}-erro' data-erro='${nome}'>
</small>
  </div>`;
}
/* Monta somente os campos da forma de pagamento selecionada. */
function camposPagamento() {
  if (compra.payment.startsWith("Cartão")) {
    const credito = compra.payment === "Cartão de crédito";
    return `<h3>${credito ? "Crédito" : "Débito"} demonstrativo</h3>
      <p class='fine'>Use somente o número 0000 0000 0000 0000 e o CVV 000. Não há validação bancária.</p>
      <button type='button' class='btn small outline' data-action='fill-card-example'>USAR CARTÃO FICTÍCIO</button>
      ${campoCartao("numero", "NÚMERO DO CARTÃO FICTÍCIO", "0000 0000 0000 0000", 19)}
      ${campoCartao("nome", "NOME FICTÍCIO NO CARTÃO", "CLIENTE DEMO", 60)}
      <div class='form-row'>${campoCartao("validade", "VALIDADE FICTÍCIA (MM/AA)", "12/30", 5)}${campoCartao("cvv", "CVV FICTÍCIO", "000", 3)}</div>
      ${
        credito
          ? `<div class='field'>
<label for='parcelas'>PARCELAMENTO SEM JUROS</label>
        <select id='parcelas' name='parcelas'>${Array.from(
          {
            length: 12,
          },
          (_, indice) => indice + 1,
        )
          .map(
            (qtd) =>
              `<option value='${qtd}' ${compra.parcelas === qtd ? "selected" : ""}>${descreverParcelas(totalCentavos(), qtd)}</option>`,
          )
          .join("")}</select>
        <p class='fine' id='valor-parcelas' aria-live='polite'>${descreverParcelas(totalCentavos(), compra.parcelas)}</p>
        <small class='fine'>Eventuais centavos de diferença são ajustados na última parcela. A soma corresponde ao total.</small>
      </div>`
          : `<p class='fine'>Pagamento à vista: ${precoFormatado(totalCentavos())} · simulação sem débito.</p>`
      }`;
  }
  if (compra.payment === "PIX") {
    return `<h3>PIX simulado</h3>
      <img src='img/qr-demo.svg' class='pix-qr' width='180' height='210' alt='Desenho ilustrativo de QR Code: demonstração sem valor de pagamento'>
      <label for='pix-code'>CÓDIGO COPIA E COLA FICTÍCIO</label>
      <textarea id='pix-code' rows='3' readonly>${criarCodigoPix(totalCentavos())}</textarea>
      <button type='button' class='btn outline full' data-action='copy-pix'>COPIAR CÓDIGO FICTÍCIO</button>
      <p class='fine'>O desenho e o código não fazem pagamentos. Não abra seu aplicativo bancário. Continue para revisar o pedido simulado.</p>`;
  }
  return `<h3>Boleto demonstrativo</h3>
<p class='fine'>Esta opção foi preservada do projeto original. Nenhum boleto é emitido e não há código de barras para pagamento.</p>`;
}
/* Apresenta radios de débito, crédito, PIX e a opção de boleto preservada. */
function telaPagamento() {
  if (!carrinho.length) return renderizarCarrinho();
  return `<section class='container'>${etapasCompra(2)}${caminhoPagina("Pagamento")}
    <div class='page-intro'>
<h1>Escolha como simular.</h1>
<p>Débito, crédito com parcelamento, PIX ou boleto demonstrativo.</p>
</div>
    <div class='cart-layout'>
<form id='payment-form' class='checkout-content' novalidate autocomplete='off'>
      <div class='notice'>
<strong>SIMULAÇÃO · NÃO DIGITE DADOS BANCÁRIOS REAIS</strong>
<br>Nenhum campo é enviado a um servidor. Os dados do cartão não são salvos.</div>
      <div class='form-errors' role='alert' hidden>
</div>
      <fieldset class='payment-methods'>
<legend>FORMA DE PAGAMENTO</legend>
        ${metodosPagamento
          .map(
            (metodo) => `<label class='payment-choice'>
<input type='radio' name='pagamento' value='${metodo}' ${compra.payment === metodo ? "checked" : ""}>
<span>${metodo}</span>
</label>`,
          )
          .join("")}
      </fieldset>
      <div class='payment-demo' id='payment-info'>${camposPagamento()}</div>
      <button class='btn full' type='submit'>REVISAR PEDIDO — ${precoFormatado(totalCentavos())}</button>
      <a class='text-link back-link' href='#/checkout'>← Voltar à identificação e entrega</a>
    </form>${resumoPedido(false)}</div>
  </section>`;
}
function atualizarResumoPagamento() {
  const resumo = selecionar(".order-summary");
  if (resumo) resumo.outerHTML = resumoPedido(false);
}
/* Permite conferir os dados fictícios antes de concluir a simulação. */
function telaRevisao() {
  if (!carrinho.length) return renderizarCarrinho();
  return `<section class='container'>${etapasCompra(3)}
    <div class='page-intro'>
<span class='eyebrow'>ÚLTIMA ETAPA</span>
<h1>Confira cada detalhe.</h1>
<p>Seu pedido está pronto para a simulação.</p>
</div>
    <div class='cart-layout'>
<div class='checkout-content'>
      <section class='detail-section'>
<h2>Identificação</h2>
<p>${escaparHtml(compra.name)}<br>${escaparHtml(compra.email)}<br>Telefone fictício: ${escaparHtml(compra.phone)}<br>CPF fictício: ${escaparHtml(compra.cpf)}</p>
<a class='text-link' href='#/checkout'>Editar identificação</a>
</section>
      <section class='detail-section'>
<h2>Entrega</h2>
<p>${escaparHtml(compra.address)}<br>${escaparHtml(compra.city)} / ${escaparHtml(compra.state)} · CEP ${escaparHtml(compra.cep)}<br>${compra.shipping}</p>
<a class='text-link' href='#/checkout'>Editar entrega</a>
</section>
      <section class='detail-section'>
<h2>Pagamento</h2>
<p>${compra.payment} · simulado<br>${compra.payment === "Cartão de crédito" ? descreverParcelas(totalCentavos(), compra.parcelas) : precoFormatado(totalCentavos()) + " à vista"}<br>Sem cobrança real.</p>
<a class='text-link' href='#/pagamento'>Alterar pagamento</a>
</section>
      <div class='notice'>Ao confirmar, você conclui uma demonstração acadêmica. Nenhum pagamento, pedido comercial ou envio será realizado.</div>
      <button class='btn full' data-action='confirm-order'>CONFIRMAR PEDIDO SIMULADO</button>
      <a href='#/sacola' class='text-link back-link'>← Voltar à sacola</a>
    </div>${resumoPedido(false, true)}</div>
  </section>`;
}
function confirmarPedido() {
  if (!carrinho.length) {
    location.hash = "/sacola";
    return;
  }
  if (Object.keys(validarCliente(compra)).length) {
    location.hash = "/checkout";
    return;
  }
  if (compra.assinaturaValidada !== assinaturaDaSacola()) {
    location.hash = "/pagamento";
    return;
  }
  // O pedido salva apenas produtos e valores. Não guarda contatos, endereço ou cartão.
  ultimoPedido = {
    id: "LE-DEMO-" + Date.now().toString().slice(-8),
    items: carrinho.map((item) => ({
      ...item,
      precoCentavos: buscarProduto(item.id).precoCentavos,
    })),
    subtotalCentavos: subtotalCentavos(),
    freteCentavos: freteCentavos(),
    descontoCentavos: descontoCentavos(),
    total: totalCentavos(),
    payment: compra.payment,
    parcelas: compra.payment === "Cartão de crédito" ? compra.parcelas : 1,
  };
  salvarLocal("le_last_order_v2", ultimoPedido);
  carrinho = [];
  cupomAtivo = false;
  compra.assinaturaValidada = "";
  salvarCheckout();
  salvarEstado();
  location.hash = "/confirmacao";
}
/* Recupera o último pedido demonstrativo e mostra forma de pagamento e valores. */
function telaConfirmacao() {
  if (!ultimoPedido)
    return `<div class='empty'>
<h1>Seu ritual está por começar.</h1>
<p>Simule um pedido para ver a confirmação aqui.</p>
<a class='btn' href='#/catalogo'>EXPLORAR COLEÇÃO</a>
</div>`;
  return `<div class='container'>${etapasCompra(4)}<section class='confirmation'>
    <div class='check'>✓</div>
<span class='eyebrow'>SIMULAÇÃO CONCLUÍDA</span>
    <h1>Seu ritual começa aqui.</h1>
<p>Obrigada por explorar o universo Lumière Élevée.</p>
    <p class='fine'>Pedido demonstrativo ${escaparHtml(ultimoPedido.id)}<br>Nenhuma cobrança, envio ou e-mail foi realizado.</p>
    <div class='order-summary'>
<h2>Seu ritual</h2>
      ${ultimoPedido.items
        .map(
          (item) => `<div class='summary-line'>
<span>${buscarProduto(item.id)?.name || "Produto"} × ${item.qty}</span>
<span>${precoFormatado(item.precoCentavos * item.qty)}</span>
</div>`,
        )
        .join("")}
      <div class='summary-line'>
<span>Frete</span>
<span>${ultimoPedido.freteCentavos ? precoFormatado(ultimoPedido.freteCentavos) : "Grátis"}</span>
</div>
      <div class='summary-line'>
<span>Desconto</span>
<span>− ${precoFormatado(ultimoPedido.descontoCentavos || 0)}</span>
</div>
      <div class='summary-line total'>
<span>Total simulado</span>
<span>${precoFormatado(ultimoPedido.total)}</span>
</div>
      <p class='fine'>${escaparHtml(ultimoPedido.payment)} · ${ultimoPedido.payment === "Cartão de crédito" ? descreverParcelas(ultimoPedido.total, ultimoPedido.parcelas) : "à vista"} · demonstrativo</p>
    </div>
    <a class='btn' href='#/catalogo'>CONTINUAR EXPLORANDO</a>
<a href='#/conta' class='text-link back-link'>Minha conta</a>
  </section>
</div>`;
}
async function copiarPix() {
  const campo = selecionar("#pix-code");
  try {
    await navigator.clipboard.writeText(campo.value);
    avisar("Código fictício copiado. Ele não permite pagamentos.");
  } catch {
    campo.focus();
    campo.select();
    avisar(
      "Código selecionado. Pressione Ctrl+C ou use a opção Copiar do celular.",
    );
  }
}
const perguntasQuiz = [
  [
    "Como você descreveria sua pele?",
    ["Seca", "Mista", "Oleosa", "Prefiro não definir"],
  ],
  [
    "Qual cuidado você quer explorar?",
    ["Hidratação", "Luminosidade", "Limpeza", "Rotina noturna"],
  ],
  [
    "Como prefere a textura?",
    ["Leve e fluida", "Cremosa e envolvente", "Quero descobrir"],
  ],
  [
    "Quanto tempo reserva para você?",
    [
      "Um ritual essencial",
      "Alguns minutos de pausa",
      "Gosto de explorar cada etapa",
    ],
  ],
  [
    "Quando acontece o seu ritual?",
    ["Pela manhã", "À noite", "Nos dois momentos"],
  ],
];
/* Quiz de navegação preservado: não faz diagnóstico da pele. */
function telaQuiz() {
  if (perguntaAtual >= perguntasQuiz.length) {
    const chosen =
      respostasQuiz[1] === "Hidratação"
        ? produtos[1]
        : respostasQuiz[1] === "Limpeza"
          ? produtos[2]
          : produtos[0];
    return `<section class='container quiz'>
<span class='eyebrow'>SEU MOMENTO LUMIÈRE</span>
<h1>Um ritual para explorar.</h1>
<p>Comece pela limpeza, explore ${chosen.name} e complete os cuidados da sua coleção.</p>
<div class='notice'>Sugestão de navegação baseada em suas preferências. Este quiz não analisa sua pele nem substitui orientação profissional.</div>
<div class='product-grid' style='grid-template-columns:1fr 1fr;margin:25px 0'>${[produtos[2], chosen.id === produtos[2].id ? produtos[1] : chosen].map(cartaoProduto).join("")}</div>
<a class='btn full' href='#/catalogo'>EXPLORAR TODA A COLEÇÃO</a>
<button class='text-link' data-action='quiz-restart' style='margin-top:24px'>Refazer o quiz</button>
</section>`;
  }
  const [q, options] = perguntasQuiz[perguntaAtual];
  return `<section class='container quiz'>${caminhoPagina("Descubra seu ritual")}<span class='eyebrow'>SEU QUIZ DE PELE</span>
<progress max='5' value='${perguntaAtual}' aria-label='Progresso do quiz'>
</progress>
<p class='fine'>PERGUNTA ${perguntaAtual + 1} DE 5</p>
<h1>${q}</h1>
<div class='quiz-options'>${options.map((t) => `<button data-action='quiz-answer' data-answer='${t}'>${t} →</button>`).join("")}</div>
<div class='quiz-actions'>
<button class='text-link' data-action='quiz-back' ${!perguntaAtual ? "disabled" : ""}>← Voltar</button>
<a class='text-link' href='#/catalogo'>Explorar coleção</a>
</div>
</section>`;
}
function telaArtigo(id) {
  const titles = {
    rotina: "Como Montar sua Rotina em 5 Passos",
    ordem: "A Ordem Correta dos Produtos",
    serum: "Como Escolher o Sérum Ideal",
    ativos: "Glossário de Ingredientes",
  };
  return `<article class='container article'>${caminhoPagina("The Beauty Lab")}<span class='eyebrow'>THE BEAUTY LAB / ${id === "ativos" ? "ATIVOS" : "CUIDADOS"}</span>
<h1>${titles[id] || titles.rotina}</h1>${imagem(id === "ativos" ? "creme" : "serum", "Detalhe de produto Lumière Élevée")}<p>O autocuidado começa com uma pausa. Conheça os passos e os ingredientes apresentados na coleção conceitual Lumière Élevée.</p>${
    id === "ativos"
      ? produtos
          .slice(0, 4)
          .map(
            (p) => `<h2>${p.actives[0]}</h2>
<p>Ativo apresentado no projeto de ${p.name}. Explore a página do produto para conhecer a proposta da fórmula.</p>
<a href='#/produto/${p.id}' class='text-link'>Conhecer ${p.name} →</a>`,
          )
          .join("")
      : `<h2>1. Comece pela limpeza</h2>
<p>Conheça o Bálsamo Opaline, o primeiro passo do ritual da coleção.</p>
<h2>2. Explore o seu sérum</h2>
<p>O Sérum Lumière é a proposta de luminosidade do projeto. Confira seus ativos na página do produto.</p>
<h2>3. Reserve um momento para hidratar</h2>
<p>Explore a textura nutritiva do Crème Absolue.</p>
<h2>4. Complete o cuidado diurno</h2>
<p>Conheça a proposta de proteção da linha Escudo Solar Invisível.</p>
<h2>5. Faça do cuidado um ritual</h2>
<p>Salve seus favoritos e organize sua seleção em “Minha Rotina”. As informações são ilustrativas do projeto; a rotina de cuidados pessoais deve considerar as orientações dos produtos e de um profissional.</p>`
  }<a class='btn' href='#/catalogo' style='margin-top:30px'>EXPLORAR COLEÇÃO</a>
</article>`;
}
function telaMaison() {
  return `<article class='container article'>${caminhoPagina("A Maison")}<span class='eyebrow'>NOSSA ESSÊNCIA</span>
<h1>O cuidado diário como uma forma de arte.</h1>
<p>Lumière Élevée é um projeto de skincare de luxo que aproxima ciência, sensorialidade e atenção aos detalhes.</p>${imagem("ritual", "A coleção Lumière Élevée")}<h2>Seu ritual, sua pele, seu tempo.</h2>
<p>Uma identidade em off-white, verde-sálvia e dourado. Texturas, tipografia e imagens convidam a desacelerar e transformar gestos cotidianos em um momento seu.</p>
<h2 id='sustentabilidade'>Cuidado com cada detalhe.</h2>
<p>Embalagens e fórmulas fazem parte do conceito visual da coleção. As propostas de sustentabilidade e composição deverão ser validadas no desenvolvimento dos produtos.</p>
<a class='btn' href='#/colecoes' style='margin-top:25px'>CONHEÇA A COLEÇÃO</a>
</article>`;
}
function telaAjuda() {
  return `<section class='container article'>${caminhoPagina("Atendimento")}<h1>Como podemos ajudar?</h1>
<p>Conheça os recursos desta experiência privada.</p>
<details open>
<summary>Posso comprar os produtos?</summary>
<p>Esta é uma demonstração do projeto. Você pode simular a compra, mas não há vendas, cobranças ou entregas reais.</p>
</details>
<details>
<summary>Como funciona o frete?</summary>
<p>Na simulação, compras a partir de R$ 450 têm frete grátis. Abaixo desse valor, o frete demonstrativo é de R$ 25.</p>
</details>
<details>
<summary>Quais são as formas de pagamento?</summary>
<p>Débito, crédito com 1 a 12 parcelas, PIX e boleto são simulações. Os campos dos cartões aceitam somente o número 0000 0000 0000 0000 e CVV 000. Nenhuma transação é processada.</p>
</details>
<details>
<summary>Como acessar minha conta?</summary>
<p>Use o e-mail de exemplo preenchido no login e uma senha fictícia com pelo menos seis caracteres, como “lumiere”. A conta existe apenas para explorar os recursos.</p>
</details>
<details>
<summary>Como faço uma troca ou entro em contato?</summary>
<p>Como não há pedidos comerciais, não há trocas ou atendimento operacional. Os canais oficiais deverão ser definidos antes da abertura comercial.</p>
</details>
<details>
<summary>O que fica salvo neste navegador?</summary>
<p>Seu tema, sacola, favoritos, rotina e último pedido de exemplo. Use “Redefinir demonstração” no rodapé para limpar esses dados.</p>
</details>
<a href='#/termos' class='btn outline' style='margin-top:30px'>LER TERMOS DE USO</a>
</section>`;
}
function paginaNaoEncontrada() {
  return `<section class='empty'>
<span class='eyebrow'>LUMIÈRE ÉLEVÉE</span>
<h1 style='margin-top:18px'>Página não encontrada.</h1>
<p>Vamos voltar ao seu ritual?</p>
<a class='btn' href='#/'>VOLTAR AO INÍCIO</a>
</section>`;
}
/* Lê o trecho após # na URL e abre a tela correspondente sem recarregar a página. */
function navegar(focus = true) {
  fecharModal();
  let raw = location.hash.slice(1) || "/";
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  const parts = path.split("/").filter(Boolean);
  if (
    !carrinho.length &&
    ["checkout", "pagamento", "revisao"].includes(parts[0])
  ) {
    location.hash = "/sacola";
    return;
  }
  if (
    carrinho.length &&
    ["pagamento", "revisao"].includes(parts[0]) &&
    Object.keys(validarCliente(compra)).length
  ) {
    location.hash = "/checkout";
    return;
  }
  if (
    carrinho.length &&
    parts[0] === "revisao" &&
    compra.assinaturaValidada !== assinaturaDaSacola()
  ) {
    location.hash = "/pagamento";
    return;
  }
  let html = "",
    title = "A arte do autocuidado";
  switch (parts[0]) {
    case undefined:
      html = telaInicial();
      break;
    case "colecoes":
      html = telaColecoes();
      title = "Coleções";
      break;
    case "catalogo":
      html = telaCatalogo("", params);
      title = "Catálogo";
      break;
    case "categoria":
      html = telaCatalogo(parts[1], params);
      title = categorias.find((c) => c.id === parts[1])?.name || "Coleção";
      break;
    case "produto":
      html = telaProduto(parts[1]);
      title = buscarProduto(parts[1])?.name || "Produto";
      break;
    case "favoritos":
      html = telaSalvos("favoritos");
      title = "Favoritos";
      break;
    case "rotina":
      html = telaSalvos("rotina");
      title = "Minha Rotina";
      break;
    case "login":
      html = telaLogin();
      title = "Entrar";
      break;
    case "cadastro":
      html = telaLogin(true);
      title = "Conta demo";
      break;
    case "conta":
      html = telaConta();
      title = "Minha Conta";
      break;
    case "sacola":
      html = renderizarCarrinho();
      title = "Sua Sacola";
      break;
    case "checkout":
      html = telaCheckout();
      title = "Identificação e entrega";
      break;
    case "pagamento":
      html = telaPagamento();
      title = "Pagamento";
      break;
    case "revisao":
      html = telaRevisao();
      title = "Revisão do Pedido";
      break;
    case "confirmacao":
      html = telaConfirmacao();
      title = "Confirmação";
      break;
    case "termos":
    case "privacidade":
      html = telaDocumento(parts[0]);
      title = textosLegais[parts[0]].title;
      break;
    case "quiz":
      html = telaQuiz();
      title = "Descubra seu ritual";
      break;
    case "artigo":
      html = telaArtigo(parts[1]);
      title = "The Beauty Lab";
      break;
    case "maison":
      html = telaMaison();
      title = "A Maison";
      break;
    case "ajuda":
      html = telaAjuda();
      title = "Atendimento";
      break;
    default:
      html = paginaNaoEncontrada();
      title = "Página não encontrada";
  }
  selecionar("#main").innerHTML = html;
  document.title = `${title} — Lumière Élevée`;
  document.body.dataset.page = parts[0] || "home";
  renderizarEstrutura();
  if (focus)
    selecionar("#main").focus({
      preventScroll: true,
    });
  if (params.get("secao")) {
    const target =
      parts[0] === "maison"
        ? "#sustentabilidade"
        : `#legal-${params.get("secao")}`;
    selecionar(target)?.scrollIntoView({
      behavior: "instant",
    });
  } else
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
}
// Adiciona um produto e salva a sacola; o módulo carrinho.js aplica os limites.
/* Usa a regra do carrinho, atualiza o contador e avisa que o item foi incluído. */
function incluirProduto(id, qty = 1, size) {
  const p = buscarProduto(id);
  if (!p) return;
  carrinho = adicionarAoCarrinho(carrinho, id, qty, size, produtos);
  salvarEstado();
  avisar(`${p.name} adicionado à sacola.`);
}
function entrarContaDemo(name = "Isabella", email = "isabella@example.com") {
  usuario = {
    name,
    email,
  };
  try {
    sessionStorage.setItem("le_demo_user", JSON.stringify(usuario));
  } catch {}
  location.hash = "/conta";
  if (location.hash === "#/conta") navegar();
  avisar("Você entrou na conta demonstrativa.");
}
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (link && link.getAttribute("href") === "#main") {
    e.preventDefault();
    selecionar("#main").focus();
    return;
  }
  if (
    link &&
    link.getAttribute("href").startsWith("#/") &&
    selecionar("#modal").open
  )
    fecharModal();
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const a = b.dataset.action,
    id = b.dataset.id,
    index = Number(b.dataset.index);
  if (a === "theme") {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("le_theme", theme);
    } catch {}
    document.querySelector("meta[name=theme-color]").content =
      theme === "dark" ? "#141210" : "#f7f5f1";
    renderizarEstrutura();
    avisar(`Modo ${theme === "dark" ? "escuro" : "claro"} ativado.`);
  } else if (a === "menu")
    abrirModal(
      "Explore Lumière",
      `<nav class='menu-panel' aria-label='Menu principal'>
<a href='#/'>Início</a>
<a href='#/colecoes'>Todas as coleções</a>${categorias.map((c) => `<a href='#/categoria/${c.id}'>${c.name}</a>`).join("")}<a href='#/catalogo'>Todos os produtos</a>
<a href='#/favoritos'>Meus favoritos</a>
<a href='#/rotina'>Minha rotina</a>
<a href='#/quiz'>Quiz de pele</a>
<button class='btn outline' data-action='search'>PESQUISAR</button>
</nav>`,
    );
  else if (a === "search") {
    fecharModal();
    abrirModal(
      "Encontre seu próximo cuidado.",
      `<form id='search-form' class='search-form'>
<label for='search-query' style='position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden'>Pesquisar produtos</label>
<input id='search-query' type='search' name='q' placeholder='Produto ou ativo' required>
<button class='btn small' type='submit'>BUSCAR</button>
</form>
<p class='fine'>Experimente “sérum”, “hidratação” ou “niacinamida”.</p>
<a class='text-link' href='#/catalogo'>Explorar todos os produtos →</a>`,
    );
  } else if (a === "close-modal") fecharModal();
  else if (a === "add") incluirProduto(id);
  else if (a === "add-selected")
    incluirProduto(id, quantidadeSelecionada, tamanhoSelecionado);
  else if (a === "product-minus" || a === "product-plus") {
    quantidadeSelecionada = Math.max(
      1,
      Math.min(20, quantidadeSelecionada + (a === "product-plus" ? 1 : -1)),
    );
    selecionar("#product-quantity").textContent = quantidadeSelecionada;
  } else if (a === "size") {
    tamanhoSelecionado = b.dataset.size;
    document.querySelectorAll("[data-action=size]").forEach((x) => {
      x.classList.toggle("selected", x === b);
      x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
  } else if (a === "favorite") {
    const selected = favoritos.includes(id);
    favoritos = selected
      ? favoritos.filter((x) => x !== id)
      : [...favoritos, id];
    salvarEstado();
    document
      .querySelectorAll(`[data-action=favorite][data-id='${id}']`)
      .forEach((x) => {
        x.classList.toggle("selected", !selected);
        x.setAttribute("aria-pressed", String(!selected));
        x.setAttribute(
          "aria-label",
          `${selected ? "Adicionar aos" : "Remover dos"} favoritos: ${buscarProduto(id).name}`,
        );
      });
    if (location.hash.startsWith("#/favoritos")) navegar(false);
    avisar(
      selected
        ? "Produto removido dos favoritos."
        : "Produto salvo nos favoritos.",
    );
  } else if (a === "routine") {
    if (!rotina.includes(id)) rotina.push(id);
    salvarEstado();
    b.textContent = "✓ Na Minha Rotina";
    avisar("Produto salvo na Minha Rotina.");
  } else if (a === "clear-routine") {
    rotina = [];
    salvarEstado();
    navegar(false);
    avisar("Sua rotina foi limpa.");
  } else if (a === "zoom") {
    const p = buscarProduto(id);
    abrirModal(p.name, imagem(p.image, p.name, "", false));
  } else if (a === "ritual-image")
    abrirModal(
      "O ritual Lumière",
      imagem("ritual", "Ritual completo", "", false),
    );
  else if (a === "cart-minus" || a === "cart-plus") {
    if (carrinho[index]) {
      carrinho = alterarQuantidade(carrinho, index, a === "cart-plus" ? 1 : -1);
      salvarEstado();
      const y = window.scrollY;
      navegar(false);
      window.scrollTo(0, y);
    }
  } else if (a === "remove") {
    carrinho = removerDoCarrinho(carrinho, index);
    salvarEstado();
    navegar(false);
    avisar("Produto removido da sacola.");
  } else if (a === "add-kit") {
    for (const p of produtos.slice(0, 3)) incluirProduto(p.id);
    avisar("Os 3 produtos do Ritual Essencial foram adicionados.");
  } else if (a === "login-tab")
    location.hash = b.dataset.tab === "cadastro" ? "/cadastro" : "/login";
  else if (a === "password") {
    const p = selecionar("#demo-password");
    p.type = p.type === "password" ? "text" : "password";
    b.textContent = p.type === "password" ? "Mostrar" : "Ocultar";
    b.setAttribute(
      "aria-label",
      `${p.type === "password" ? "Mostrar" : "Ocultar"} senha`,
    );
  } else if (a === "recover")
    abrirModal(
      "Recuperar acesso",
      `<p>Este login é demonstrativo. Não existe uma senha cadastrada ou envio de recuperação.</p>
<p class='fine'>Use o e-mail de exemplo e a senha fictícia “lumiere” para entrar.</p>
<button class='btn full' data-action='close-modal'>VOLTAR AO LOGIN</button>`,
    );
  else if (a === "social")
    entrarContaDemo(
      "Isabella",
      `${b.dataset.provider.toLowerCase()}-demo@example.com`,
    );
  else if (a === "logout") {
    usuario = null;
    sessionStorage.removeItem("le_demo_user");
    location.hash = "/login";
    avisar("Você saiu da conta demonstrativa.");
  } else if (a === "account-tab") {
    abaConta = b.dataset.tab;
    navegar(false);
  } else if (a === "coupon-rules")
    abrirModal(
      "Regras do cupom",
      `<p>Use <strong>LUMIERE10</strong> para simular 10% de desconto sobre os produtos.</p>
<p class='fine'>Cupom ilustrativo, sem valor comercial. Não altera o frete.</p>
<button class='btn full' data-action='close-modal'>ENTENDI</button>`,
    );
  else if (a === "confirm-order") confirmarPedido();
  else if (a === "quiz-answer") {
    respostasQuiz[perguntaAtual] = b.dataset.answer;
    perguntaAtual++;
    navegar(false);
  } else if (a === "quiz-back") {
    perguntaAtual = Math.max(0, perguntaAtual - 1);
    navegar(false);
  } else if (a === "quiz-restart") {
    perguntaAtual = 0;
    respostasQuiz = [];
    navegar(false);
  } else if (a === "reset")
    abrirModal(
      "Redefinir demonstração",
      `<p>Isso limpa sacola, favoritos, rotina, conta demo e último pedido salvo neste navegador. O tema escolhido será preservado.</p>
<button class='btn full' data-action='reset-confirm'>LIMPAR DADOS DEMONSTRATIVOS</button>
<button class='btn outline full' style='margin-top:10px' data-action='close-modal'>CANCELAR</button>`,
    );
  else if (a === "reset-confirm") {
    for (const k of [
      "le_cart",
      "le_favorites",
      "le_routine",
      "le_last_order",
      "le_last_order_v2",
      "le_cupom",
    ]) {
      try {
        localStorage.removeItem(k);
      } catch {}
    }
    try {
      sessionStorage.removeItem("le_demo_user");
      sessionStorage.removeItem("le_checkout");
    } catch {}
    compra = {
      ...dadosIniciaisCheckout,
    };
    carrinho = [];
    favoritos = [];
    rotina = [];
    ultimoPedido = null;
    usuario = null;
    cupomAtivo = false;
    salvarEstado();
    fecharModal();
    location.hash = "/";
    navegar();
    avisar("Dados demonstrativos removidos.");
  }
});
document.addEventListener("submit", (e) => {
  const f = e.target;
  if (f.id === "filters") {
    e.preventDefault();
    const p = new URLSearchParams(new FormData(f));
    location.hash = location.hash.split("?")[0] + "?" + p.toString();
  } else if (f.id === "search-form") {
    e.preventDefault();
    const q = new FormData(f).get("q");
    fecharModal();
    location.hash = "/catalogo?q=" + encodeURIComponent(q);
  } else if (f.id === "newsletter-form") {
    e.preventDefault();
    f.reset();
    avisar("Inscrição simulada. Nenhum e-mail foi salvo ou enviado.");
  } else if (f.id === "login-form") {
    e.preventDefault();
    const d = new FormData(f);
    entrarContaDemo(
      String(d.get("name") || "Isabella").trim() || "Isabella",
      String(d.get("email")),
    );
    f.reset();
  } else if (f.id === "profile-form") {
    e.preventDefault();
    usuario.name = String(new FormData(f).get("name")).trim() || "Isabella";
    sessionStorage.setItem("le_demo_user", JSON.stringify(usuario));
    navegar(false);
    avisar("Nome de exibição atualizado nesta sessão.");
  } else if (f.id === "checkout-form") {
    e.preventDefault();
    guardarDadosCliente(f);
    if (mostrarErrosFormulario(f, validarCliente(compra))) {
      salvarCheckout();
      location.hash = "/pagamento";
    }
  } else if (f.id === "payment-form") {
    e.preventDefault();
    const dados = new FormData(f);
    let erros = {};
    if (compra.payment.startsWith("Cartão"))
      erros = validarCartao({
        numero: String(dados.get("numero") || ""),
        nome: String(dados.get("nome") || ""),
        validade: String(dados.get("validade") || ""),
        cvv: String(dados.get("cvv") || ""),
      });
    if (mostrarErrosFormulario(f, erros)) {
      compra.assinaturaValidada = assinaturaDaSacola();
      salvarCheckout();
      location.hash = "/revisao";
    }
  } else if (f.id === "coupon-form") {
    e.preventDefault();
    const value = selecionar("#coupon-code").value.trim().toUpperCase();
    if (value === "LUMIERE10") {
      cupomAtivo = true;
      navegar(false);
      avisar("Cupom demonstrativo aplicado: 10% de desconto.");
    } else {
      cupomAtivo = false;
      navegar(false);
      avisar("Cupom não encontrado. Consulte as regras para testar.");
    }
  }
});
// Salve somente o rascunho do cliente na sessão, sem dados dos cartões.
document.addEventListener("input", (evento) => {
  if (evento.target.closest("#checkout-form")) {
    guardarDadosCliente(selecionar("#checkout-form"));
    salvarCheckout();
  }
});
document.addEventListener("change", (evento) => {
  const campo = evento.target;
  if (campo.name === "pagamento") {
    compra.payment = campo.value;
    compra.assinaturaValidada = "";
    salvarCheckout();
    selecionar("#payment-info").innerHTML = camposPagamento();
    mostrarErrosFormulario(selecionar("#payment-form"), {});
    atualizarResumoPagamento();
  } else if (campo.name === "parcelas") {
    compra.parcelas = Number(campo.value);
    compra.assinaturaValidada = "";
    salvarCheckout();
    selecionar("#valor-parcelas").textContent = descreverParcelas(
      totalCentavos(),
      compra.parcelas,
    );
    atualizarResumoPagamento();
  } else if (campo.closest("#checkout-form")) {
    guardarDadosCliente(selecionar("#checkout-form"));
    salvarCheckout();
  }
});
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-action]");
  if (!botao) return;
  if (botao.dataset.action === "fill-example") {
    for (const [nome, valor] of Object.entries(exemploCliente))
      selecionar("#checkout-form").elements[nome].value = valor;
    guardarDadosCliente(selecionar("#checkout-form"));
    salvarCheckout();
    mostrarErrosFormulario(selecionar("#checkout-form"), {});
    avisar(
      "Dados fictícios preenchidos. Leia e marque os termos para continuar.",
    );
  } else if (botao.dataset.action === "fill-card-example") {
    const form = selecionar("#payment-form");
    form.elements.numero.value = "0000 0000 0000 0000";
    form.elements.nome.value = "CLIENTE DEMO";
    form.elements.validade.value = "12/30";
    form.elements.cvv.value = "000";
    mostrarErrosFormulario(form, {});
    avisar("Cartão fictício preenchido. Nenhum dado será enviado.");
  } else if (botao.dataset.action === "copy-pix") copiarPix();
  else if (botao.dataset.action === "sample-cart") {
    for (const produto of produtos.slice(0, 3)) incluirProduto(produto.id);
    navegar(false);
  }
});
window.addEventListener("hashchange", () => navegar());
window.addEventListener("storage", (e) => {
  if (["le_cart", "le_favorites", "le_routine", "le_cupom"].includes(e.key)) {
    carrinho = normalizarCarrinho(lerLocal("le_cart", []), produtos);
    favoritos = lerLocal("le_favorites", []);
    rotina = lerLocal("le_routine", []);
    if (!Array.isArray(favoritos)) favoritos = [];
    if (!Array.isArray(rotina)) rotina = [];
    cupomAtivo = lerLocal("le_cupom", false) === true;
    navegar(false);
  }
});
salvarEstado();
navegar(false);
